import dotenv from 'dotenv';
dotenv.config();

// Must import express-async-errors before any route handlers
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

// Route imports
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import discoveryRoutes from './routes/discovery';
import actionRoutes from './routes/actions';
import chatRoutes from './routes/chat';
import familyRoutes from './routes/family';
import safetyRoutes from './routes/safety';
import premiumRoutes from './routes/premium';
import adminRoutes from './routes/admin';

// ─── App Setup ──────────────────────────────────────────────────────────────────

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// ─── Global Middleware ──────────────────────────────────────────────────────────

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
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

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Compression
app.use(compression());

// Global rate limiting
app.use(rateLimit());

// ─── Health Check ───────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────────

app.use('/v1/auth', authRoutes);
app.use('/v1/me', profileRoutes);
app.use('/v1/feed', discoveryRoutes);
app.use('/v1/action', actionRoutes);
app.use('/v1/chat', chatRoutes);
app.use('/v1/family', familyRoutes);
app.use('/v1/safety', safetyRoutes);
app.use('/v1/premium', premiumRoutes);
app.use('/v1/admin', adminRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────────

app.use(globalErrorHandler);

// ─── Server Start ───────────────────────────────────────────────────────────────

const server = http.createServer(app);

// Start Socket.io server
createSocketServer(server);

// Start cron jobs
startCronJobs();

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   MitiMaiti Backend Server                       ║
║   ────────────────────────                       ║
║   HTTP:   http://localhost:${PORT}                 ║
║   Socket: ws://localhost:${PORT}                   ║
║   Env:    ${(process.env.NODE_ENV || 'development').padEnd(14)}                 ║
║                                                  ║
╚══════════════════════════════════════════════════╝
  `);
});

// ─── Graceful Shutdown ──────────────────────────────────────────────────────────

function gracefulShutdown(signal: string) {
  console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);

  const { stopCronJobs } = require('./cron');
  stopCronJobs();

  server.close(() => {
    console.log('[Server] HTTP server closed');

    // Close Redis connection
    const { redis } = require('./config/redis');
    redis.quit().then(() => {
      console.log('[Server] Redis connection closed');
      process.exit(0);
    });
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('[Server] Unhandled Promise Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('[Server] Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

export default app;
