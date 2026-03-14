import { Router, Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest, Icebreaker } from '../types';
import icebreakers from '../data/icebreakers.json';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB for chat media
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'audio/mpeg',
      'audio/mp4',
      'audio/ogg',
      'video/mp4',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(400, 'Unsupported media type', 'INVALID_MEDIA_TYPE')
      );
    }
  },
});

// ─── Helper: Verify match access ────────────────────────────────────────────────

async function verifyMatchAccess(
  matchId: string,
  userId: string
): Promise<{ match: any; otherId: string }> {
  const { data: match, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (error || !match) {
    throw new AppError(404, 'Match not found', 'MATCH_NOT_FOUND');
  }

  if (match.user_a_id !== userId && match.user_b_id !== userId) {
    throw new AppError(403, 'Not authorized to access this conversation', 'MATCH_UNAUTHORIZED');
  }

  if (match.status !== 'active') {
    throw new AppError(403, 'This match is no longer active', 'MATCH_INACTIVE');
  }

  const otherId =
    match.user_a_id === userId ? match.user_b_id : match.user_a_id;

  return { match, otherId };
}

// ─── Helper: Get random icebreakers ─────────────────────────────────────────────

function getRandomIcebreakers(count: number = 3): Icebreaker[] {
  const allIcebreakers = icebreakers as Icebreaker[];
  const shuffled = [...allIcebreakers].sort(() => Math.random() - 0.5);

  // Try to include at least 1 Sindhi and 1 general
  const sindhi = shuffled.filter((i) => i.category === 'sindhi');
  const general = shuffled.filter((i) => i.category === 'general');

  const selected: Icebreaker[] = [];
  if (sindhi.length > 0) selected.push(sindhi[0]);
  if (general.length > 0) selected.push(general[0]);

  // Fill remaining slots
  const remaining = shuffled.filter((i) => !selected.includes(i));
  while (selected.length < count && remaining.length > 0) {
    selected.push(remaining.shift()!);
  }

  return selected;
}

// ─── GET /v1/chat/:matchId ──────────────────────────────────────────────────────

router.get(
  '/:matchId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { matchId } = req.params;
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);

    const { match, otherId } = await verifyMatchAccess(matchId, user.id);

    // Fetch messages with cursor pagination
    let query = supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: messages, error: msgError } = await query;

    if (msgError) {
      throw new AppError(500, 'Failed to fetch messages', 'MESSAGES_FETCH_FAILED');
    }

    // Mark unread messages from other user as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('match_id', matchId)
      .eq('sender_id', otherId)
      .eq('is_read', false);

    // Get other user's profile for the chat header
    const [{ data: otherBasic }, { data: otherPhoto }, { data: otherUser }] =
      await Promise.all([
        supabase
          .from('basic_profiles')
          .select('display_name, city, country')
          .eq('user_id', otherId)
          .single(),
        supabase
          .from('photos')
          .select('url_thumb')
          .eq('user_id', otherId)
          .eq('is_primary', true)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('users')
          .select('is_verified, last_active_at')
          .eq('id', otherId)
          .single(),
      ]);

    // Get icebreakers if no messages exist
    const hasMessages = messages && messages.length > 0;
    const suggestedIcebreakers = hasMessages ? [] : getRandomIcebreakers(3);

    // Get cultural score for this match
    let culturalScore = match.cultural_score;
    if (culturalScore === null) {
      try {
        const { getCulturalScore } = await import('../services/scoring');
        const cs = await getCulturalScore(user.id, otherId);
        culturalScore = cs.total;
      } catch {
        culturalScore = null;
      }
    }

    // Format messages (reverse to chronological order)
    const formattedMessages = (messages || []).reverse().map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      isYou: m.sender_id === user.id,
      content: m.content,
      mediaUrl: m.media_url,
      mediaType: m.media_type,
      isRead: m.is_read,
      createdAt: m.created_at,
    }));

    const lastMessage = messages?.[messages.length - 1];

    res.json({
      success: true,
      data: {
        matchId,
        matchedAt: match.matched_at,
        culturalScore,
        otherUser: {
          id: otherId,
          displayName: otherBasic?.display_name || 'Unknown',
          city: otherBasic?.city,
          country: otherBasic?.country,
          photo: otherPhoto?.url_thumb || null,
          isVerified: otherUser?.is_verified || false,
          lastActiveAt: otherUser?.last_active_at || null,
        },
        messages: formattedMessages,
        icebreakers: suggestedIcebreakers,
        cursor: lastMessage?.created_at || null,
        hasMore: (messages?.length || 0) >= limit,
      },
    });
  })
);

// ─── POST /v1/chat/:matchId/media ───────────────────────────────────────────────

router.post(
  '/:matchId/media',
  authenticate,
  rateLimit({ maxRequests: 30, windowSeconds: 60, keyPrefix: 'rl_chat_media' }),
  upload.single('media'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { matchId } = req.params;
    const file = req.file;

    if (!file) {
      throw new AppError(400, 'No media file uploaded', 'NO_FILE');
    }

    const { otherId } = await verifyMatchAccess(matchId, user.id);

    const mediaId = uuidv4();
    const basePath = `chat/${matchId}/${mediaId}`;
    let processedBuffer = file.buffer;
    let contentType = file.mimetype;

    // Process images with sharp
    if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/gif') {
      processedBuffer = await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      contentType = 'image/jpeg';
    }

    // Determine file extension
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/ogg': 'ogg',
      'video/mp4': 'mp4',
    };
    const ext = extMap[file.mimetype] || 'bin';

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(`${basePath}.${ext}`, processedBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new AppError(500, 'Failed to upload media', 'UPLOAD_FAILED');
    }

    const { data: urlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(`${basePath}.${ext}`);

    // Determine media type category
    let mediaType = 'file';
    if (file.mimetype.startsWith('image/')) mediaType = 'image';
    else if (file.mimetype.startsWith('audio/')) mediaType = 'audio';
    else if (file.mimetype.startsWith('video/')) mediaType = 'video';

    // Create message record
    const caption = req.body?.caption || null;

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content: caption,
        media_url: urlData.publicUrl,
        media_type: mediaType,
        is_read: false,
      })
      .select()
      .single();

    if (msgError) {
      throw new AppError(500, 'Failed to save message', 'MESSAGE_SAVE_FAILED');
    }

    // Send notification to the other user
    const { sendTemplateNotification } = await import('../services/notifications');
    const { data: myBasic } = await supabase
      .from('basic_profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    await sendTemplateNotification('new_message', otherId, {
      name: myBasic?.display_name || 'Someone',
    });

    res.status(201).json({
      success: true,
      data: {
        messageId: message.id,
        mediaUrl: urlData.publicUrl,
        mediaType,
        createdAt: message.created_at,
      },
    });
  })
);

export default router;
