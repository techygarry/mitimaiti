import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { supabase } from './config/supabase';
import { redis } from './config/redis';
import { SocketSendMessage, SocketTypingEvent, SocketEnterChat } from './types';

const SOCKET_PORT = parseInt(process.env.SOCKET_PORT || '4001', 10);

// ─── Respect-First Content Rules ────────────────────────────────────────────────

const BLOCKED_PATTERNS = [
  // Phone numbers (various formats)
  /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Social media handles
  /@[a-zA-Z0-9_]{3,}/g,
  // URLs
  /https?:\/\/[^\s]+/g,
  // Common offensive words (basic filter)
];

function respectFirstFilter(content: string): { clean: string; flagged: boolean } {
  let clean = content;
  let flagged = false;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(clean)) {
      flagged = true;
      clean = clean.replace(pattern, '[removed]');
    }
    // Reset regex lastIndex
    pattern.lastIndex = 0;
  }

  return { clean, flagged };
}

// ─── Socket Server ──────────────────────────────────────────────────────────────

let io: Server;

export function createSocketServer(httpServer?: HttpServer): Server {
  io = new Server(httpServer || SOCKET_PORT, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ['websocket', 'polling'],
  });

  // ─── JWT Auth Handshake ─────────────────────────────────────────────────────

  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify with Supabase
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !authUser) {
        return next(new Error('Invalid or expired token'));
      }

      // Check blacklist
      const blacklisted = await redis.get(`jwt_blacklist:${authUser.id}`);
      if (blacklisted) {
        return next(new Error('Token has been revoked'));
      }

      // Get user from DB
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, auth_id, is_active, is_banned, is_suspended')
        .eq('auth_id', authUser.id)
        .single();

      if (!dbUser || !dbUser.is_active || dbUser.is_banned || dbUser.is_suspended) {
        return next(new Error('Account is not active'));
      }

      // Attach user info to socket
      (socket as any).userId = dbUser.id;
      (socket as any).authId = dbUser.auth_id;

      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  // ─── Connection Handler ───────────────────────────────────────────────────────

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;

    console.log(`[Socket] Connected: ${userId} (${socket.id})`);

    // Join user's personal room for targeted messages
    socket.join(`user:${userId}`);

    // Set online presence in Redis
    redis.set(`presence:${userId}`, 'online', 'EX', 300).catch(() => {});

    // ─── send_msg ─────────────────────────────────────────────────────────────

    socket.on('send_msg', async (data: SocketSendMessage, ack?: Function) => {
      try {
        const { matchId, content, mediaUrl, mediaType } = data;

        if (!matchId) {
          ack?.({ error: 'matchId is required' });
          return;
        }

        if (!content && !mediaUrl) {
          ack?.({ error: 'Message content or media is required' });
          return;
        }

        // Verify match access
        const { data: match } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();

        if (!match) {
          ack?.({ error: 'Match not found' });
          return;
        }

        if (match.user_a_id !== userId && match.user_b_id !== userId) {
          ack?.({ error: 'Not authorized' });
          return;
        }

        if (match.status !== 'active') {
          ack?.({ error: 'Match is no longer active' });
          return;
        }

        const otherId =
          match.user_a_id === userId ? match.user_b_id : match.user_a_id;

        // Apply Respect-First filter to text content
        let cleanContent = content || null;
        let wasFlagged = false;

        if (cleanContent) {
          const filtered = respectFirstFilter(cleanContent);
          cleanContent = filtered.clean;
          wasFlagged = filtered.flagged;
        }

        // Save message to database
        const { data: message, error: msgError } = await supabase
          .from('messages')
          .insert({
            match_id: matchId,
            sender_id: userId,
            content: cleanContent,
            media_url: mediaUrl || null,
            media_type: mediaType || null,
            is_read: false,
          })
          .select()
          .single();

        if (msgError) {
          ack?.({ error: 'Failed to save message' });
          return;
        }

        const messagePayload = {
          id: message.id,
          matchId,
          senderId: userId,
          content: cleanContent,
          mediaUrl: message.media_url,
          mediaType: message.media_type,
          isRead: false,
          createdAt: message.created_at,
          flagged: wasFlagged,
        };

        // Send to the other user's room
        io.to(`user:${otherId}`).emit('new_msg', messagePayload);

        // Also send to the match room if both are in it
        io.to(`match:${matchId}`).emit('new_msg', messagePayload);

        // Send push notification if the other user is not in the chat
        const otherInChat = await redis.get(`in_chat:${otherId}:${matchId}`);
        if (!otherInChat) {
          const { sendTemplateNotification } = await import('./services/notifications');
          const { data: senderBasic } = await supabase
            .from('basic_profiles')
            .select('display_name')
            .eq('user_id', userId)
            .single();

          await sendTemplateNotification('new_message', otherId, {
            name: senderBasic?.display_name || 'Someone',
          });
        }

        ack?.({ success: true, messageId: message.id });
      } catch (err) {
        console.error('[Socket] send_msg error:', err);
        ack?.({ error: 'Failed to send message' });
      }
    });

    // ─── typing ───────────────────────────────────────────────────────────────

    socket.on('typing', async (data: SocketTypingEvent) => {
      try {
        const { matchId, isTyping } = data;

        // Verify match access
        const { data: match } = await supabase
          .from('matches')
          .select('user_a_id, user_b_id')
          .eq('id', matchId)
          .single();

        if (!match) return;

        if (match.user_a_id !== userId && match.user_b_id !== userId) return;

        const otherId =
          match.user_a_id === userId ? match.user_b_id : match.user_a_id;

        io.to(`user:${otherId}`).emit('typing', {
          matchId,
          userId,
          isTyping,
        });
      } catch (err) {
        console.error('[Socket] typing error:', err);
      }
    });

    // ─── enter_chat ───────────────────────────────────────────────────────────

    socket.on('enter_chat', async (data: SocketEnterChat) => {
      try {
        const { matchId } = data;

        // Join the match room
        socket.join(`match:${matchId}`);

        // Mark user as in this chat (for notification suppression)
        await redis.set(`in_chat:${userId}:${matchId}`, '1', 'EX', 3600);

        // Mark all unread messages as read
        const { data: match } = await supabase
          .from('matches')
          .select('user_a_id, user_b_id')
          .eq('id', matchId)
          .single();

        if (!match) return;

        if (match.user_a_id !== userId && match.user_b_id !== userId) return;

        const otherId =
          match.user_a_id === userId ? match.user_b_id : match.user_a_id;

        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('match_id', matchId)
          .eq('sender_id', otherId)
          .eq('is_read', false);

        // Notify other user that messages were read
        io.to(`user:${otherId}`).emit('messages_read', {
          matchId,
          readBy: userId,
        });
      } catch (err) {
        console.error('[Socket] enter_chat error:', err);
      }
    });

    // ─── leave_chat ───────────────────────────────────────────────────────────

    socket.on('leave_chat', async (data: { matchId: string }) => {
      try {
        const { matchId } = data;
        socket.leave(`match:${matchId}`);
        await redis.del(`in_chat:${userId}:${matchId}`);
      } catch (err) {
        console.error('[Socket] leave_chat error:', err);
      }
    });

    // ─── presence (heartbeat) ─────────────────────────────────────────────────

    socket.on('heartbeat', async () => {
      try {
        await redis.set(`presence:${userId}`, 'online', 'EX', 300);
      } catch (err) {
        // Silently fail
      }
    });

    socket.on('presence', async (data: { status: 'online' | 'away' }) => {
      try {
        await redis.set(`presence:${userId}`, data.status, 'EX', 300);
      } catch (err) {
        // Silently fail
      }
    });

    // ─── disconnect ───────────────────────────────────────────────────────────

    socket.on('disconnect', async (reason) => {
      console.log(`[Socket] Disconnected: ${userId} (${socket.id}) - ${reason}`);

      // Set offline presence after a grace period (user might reconnect)
      await redis.set(`presence:${userId}`, 'offline', 'EX', 300);

      // Clean up in-chat markers
      let cursor = '0';
      do {
        const [newCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          `in_chat:${userId}:*`,
          'COUNT',
          100
        );
        cursor = newCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== '0');
    });
  });

  console.log(`[Socket] Server initialized`);

  return io;
}

/**
 * Get the Socket.io server instance.
 */
export function getSocketServer(): Server | null {
  return io || null;
}

/**
 * Emit an event to a specific user.
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export default { createSocketServer, getSocketServer, emitToUser };
