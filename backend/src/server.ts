import dotenv from 'dotenv';
dotenv.config();

import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import http from 'http';

import { globalErrorHandler } from './utils/errors';
import { rateLimit } from './middleware/rateLimit';
import { startCronJobs } from './cron';
import { createSocketServer } from './socket';

// Route imports — NO premium routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import discoveryRoutes from './routes/discovery';
import actionRoutes from './routes/actions';
import chatRoutes from './routes/chat';
import familyRoutes from './routes/family';
import safetyRoutes from './routes/safety';
import adminRoutes from './routes/admin';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })
);

// Logging
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.url === '/health',
  })
);

// Body parsing + compression
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(compression());

// Global rate limiting: 60 req/min
app.use(rateLimit());

// Health check
app.get('/health', async (_req, res) => {
  const { supabase } = await import('./config/supabase');
  const { redis } = await import('./config/redis');

  let dbOk = false;
  let redisOk = false;

  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    dbOk = !error;
  } catch {}

  try {
    await redis.ping();
    redisOk = true;
  } catch {}

  res.json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'ok' : 'error',
    redis: redisOk ? 'ok' : 'error',
    uptime: process.uptime(),
  });
});

// API Routes — NO /v1/premium
app.use('/v1/auth', authRoutes);
app.use('/v1/me', profileRoutes);
app.use('/v1/feed', discoveryRoutes);
app.use('/v1/action', actionRoutes);
app.use('/v1/chat', chatRoutes);
app.use('/v1/family', familyRoutes);
app.use('/v1/safety', safetyRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/inbox', actionRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Error handler
app.use(globalErrorHandler);

// Start server
const server = http.createServer(app);
createSocketServer(server);
startCronJobs();

server.listen(PORT, () => {
  console.log(`[MitiMaiti] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

// Graceful shutdown
function gracefulShutdown(signal: string) {
  console.log(`[Server] ${signal} — shutting down...`);
  const { stopCronJobs } = require('./cron');
  stopCronJobs();

  server.close(() => {
    const { redis } = require('./config/redis');
    redis.quit().then(() => process.exit(0));
  });

  setTimeout(() => process.exit(1), 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason: any) => console.error('[Unhandled]', reason));
process.on('uncaughtException', (error: Error) => {
  console.error('[Uncaught]', error);
  gracefulShutdown('uncaughtException');
});

export default app;
