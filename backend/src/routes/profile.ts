import { Router, Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest } from '../types';
import { invalidateCulturalScoreCache } from '../services/scoring';

const router = Router();

// Multer config for photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 6,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'Only JPEG, PNG, WebP, and HEIC images are allowed', 'INVALID_FILE_TYPE'));
    }
  },
});

// ─── Profile tables that map to different DB tables ─────────────────────────────

const PROFILE_TABLE_MAP: Record<string, string> = {
  // basic_profiles fields
  display_name: 'basic_profiles',
  date_of_birth: 'basic_profiles',
  gender: 'basic_profiles',
  bio: 'basic_profiles',
  height_cm: 'basic_profiles',
  city: 'basic_profiles',
  state: 'basic_profiles',
  country: 'basic_profiles',
  latitude: 'basic_profiles',
  longitude: 'basic_profiles',
  education: 'basic_profiles',
  occupation: 'basic_profiles',
  company: 'basic_profiles',
  religion: 'basic_profiles',
  intent: 'basic_profiles',

  // sindhi_profiles fields
  mother_tongue: 'sindhi_profiles',
  sindhi_dialect: 'sindhi_profiles',
  sindhi_fluency: 'sindhi_profiles',
  community_sub_group: 'sindhi_profiles',
  gotra: 'sindhi_profiles',
  family_origin_city: 'sindhi_profiles',
  family_origin_country: 'sindhi_profiles',
  generation: 'sindhi_profiles',

  // chatti_profiles fields
  family_values: 'chatti_profiles',
  joint_family_preference: 'chatti_profiles',
  festivals_celebrated: 'chatti_profiles',
  food_preference: 'chatti_profiles',
  cuisine_preferences: 'chatti_profiles',
  cultural_activities: 'chatti_profiles',
  traditional_attire: 'chatti_profiles',

  // personality fields
  interests: 'personality_profiles',
  music_preferences: 'personality_profiles',
  movie_genres: 'personality_profiles',
  travel_style: 'personality_profiles',
  pet_preference: 'personality_profiles',
  smoking: 'personality_profiles',
  drinking: 'personality_profiles',
  workout: 'personality_profiles',

  // user_settings fields
  discovery_enabled: 'user_settings',
  show_online_status: 'user_settings',
  show_distance: 'user_settings',
  push_notifications: 'user_settings',
  email_notifications: 'user_settings',
  age_min: 'user_settings',
  age_max: 'user_settings',
  distance_km: 'user_settings',
  gender_preference: 'user_settings',
  quiet_hours_start: 'user_settings',
  quiet_hours_end: 'user_settings',
};

// ─── Completeness Calculator ────────────────────────────────────────────────────

interface CompletenessFields {
  basic: Record<string, any> | null;
  sindhi: Record<string, any> | null;
  chatti: Record<string, any> | null;
  personality: Record<string, any> | null;
  photos: number;
}

function calculateCompleteness(fields: CompletenessFields): number {
  let filled = 0;
  let total = 0;

  // Basic profile (40% weight = 40 points)
  const basicRequired = [
    'display_name', 'date_of_birth', 'gender', 'bio', 'city',
    'country', 'intent',
  ];
  const basicOptional = [
    'height_cm', 'state', 'education', 'occupation', 'company', 'religion',
  ];

  for (const field of basicRequired) {
    total += 4;
    if (fields.basic && fields.basic[field]) filled += 4;
  }
  for (const field of basicOptional) {
    total += 2;
    if (fields.basic && fields.basic[field]) filled += 2;
  }

  // Sindhi profile (20% weight)
  const sindhiFields = [
    'mother_tongue', 'sindhi_dialect', 'sindhi_fluency',
    'community_sub_group', 'family_origin_city',
  ];
  for (const field of sindhiFields) {
    total += 4;
    if (fields.sindhi && fields.sindhi[field]) filled += 4;
  }

  // Chatti profile (15% weight)
  const chattiFields = [
    'family_values', 'festivals_celebrated', 'food_preference', 'cuisine_preferences',
  ];
  for (const field of chattiFields) {
    total += 3;
    if (fields.chatti && fields.chatti[field]) {
      const val = fields.chatti[field];
      if (Array.isArray(val) ? val.length > 0 : true) filled += 3;
    }
  }

  // Personality (10% weight)
  const personalityFields = ['interests', 'travel_style', 'music_preferences'];
  for (const field of personalityFields) {
    total += 3;
    if (fields.personality && fields.personality[field]) {
      const val = fields.personality[field];
      if (Array.isArray(val) ? val.length > 0 : true) filled += 3;
    }
  }

  // Photos (15% weight)
  total += 15;
  filled += Math.min(fields.photos * 5, 15); // Up to 3 photos count

  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
}

// ─── GET /v1/me ─────────────────────────────────────────────────────────────────

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    const [
      { data: userData },
      { data: basic },
      { data: sindhi },
      { data: chatti },
      { data: personality },
      { data: photos },
      { data: settings },
      { data: privileges },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('basic_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('sindhi_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('chatti_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('personality_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('photos').select('*').eq('user_id', user.id).order('sort_order'),
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('user_privileges').select('*').eq('user_id', user.id).single(),
    ]);

    res.json({
      success: true,
      data: {
        user: userData,
        basic,
        sindhi,
        chatti,
        personality,
        photos: photos || [],
        settings,
        privileges,
      },
    });
  })
);

// ─── PATCH /v1/me ───────────────────────────────────────────────────────────────

router.patch(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      throw new AppError(400, 'No fields to update', 'EMPTY_UPDATE');
    }

    // Group updates by target table
    const tableUpdates: Record<string, Record<string, any>> = {};

    for (const [field, value] of Object.entries(updates)) {
      const table = PROFILE_TABLE_MAP[field];
      if (!table) {
        // Skip unknown fields silently
        continue;
      }

      if (!tableUpdates[table]) {
        tableUpdates[table] = {};
      }
      tableUpdates[table][field] = value;
    }

    // Execute updates per table
    const results: Record<string, any> = {};

    for (const [table, fields] of Object.entries(tableUpdates)) {
      // Check if row exists; upsert if needed
      const { data: existing } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from(table)
          .update(fields)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          throw new AppError(500, `Failed to update ${table}: ${error.message}`, 'UPDATE_FAILED');
        }
        results[table] = data;
      } else {
        const { data, error } = await supabase
          .from(table)
          .insert({ user_id: user.id, ...fields })
          .select()
          .single();

        if (error) {
          throw new AppError(500, `Failed to create ${table}: ${error.message}`, 'INSERT_FAILED');
        }
        results[table] = data;
      }
    }

    // Recalculate profile completeness
    const [
      { data: basic },
      { data: sindhi },
      { data: chatti },
      { data: personality },
      { data: photos },
    ] = await Promise.all([
      supabase.from('basic_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('sindhi_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('chatti_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('personality_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('photos').select('id').eq('user_id', user.id),
    ]);

    const completeness = calculateCompleteness({
      basic,
      sindhi,
      chatti,
      personality,
      photos: photos?.length || 0,
    });

    await supabase
      .from('users')
      .update({ profile_completeness: completeness, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    // Invalidate cultural score cache if relevant fields changed
    const culturalTables = ['sindhi_profiles', 'chatti_profiles', 'basic_profiles'];
    if (Object.keys(tableUpdates).some((t) => culturalTables.includes(t))) {
      await invalidateCulturalScoreCache(user.id);
    }

    res.json({
      success: true,
      data: {
        updated: results,
        profileCompleteness: completeness,
      },
    });
  })
);

// ─── POST /v1/me/media ──────────────────────────────────────────────────────────

router.post(
  '/media',
  authenticate,
  rateLimit({ maxRequests: 20, windowSeconds: 60, keyPrefix: 'rl_media' }),
  upload.array('photos', 6),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError(400, 'No files uploaded', 'NO_FILES');
    }

    // Check existing photo count
    const { data: existingPhotos } = await supabase
      .from('photos')
      .select('id')
      .eq('user_id', user.id);

    const currentCount = existingPhotos?.length || 0;
    if (currentCount + files.length > 6) {
      throw new AppError(400, `Maximum 6 photos allowed. You have ${currentCount}.`, 'MAX_PHOTOS');
    }

    const uploadedPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = uuidv4();
      const basePath = `users/${user.id}/photos/${photoId}`;

      // Resize to 3 sizes using sharp
      const [original, medium, thumb] = await Promise.all([
        sharp(file.buffer)
          .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer(),
        sharp(file.buffer)
          .resize(600, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer(),
        sharp(file.buffer)
          .resize(200, 200, { fit: 'cover' })
          .jpeg({ quality: 70 })
          .toBuffer(),
      ]);

      // Upload to Supabase Storage
      const [origRes, medRes, thumbRes] = await Promise.all([
        supabase.storage
          .from('photos')
          .upload(`${basePath}/original.jpg`, original, {
            contentType: 'image/jpeg',
            upsert: true,
          }),
        supabase.storage
          .from('photos')
          .upload(`${basePath}/medium.jpg`, medium, {
            contentType: 'image/jpeg',
            upsert: true,
          }),
        supabase.storage
          .from('photos')
          .upload(`${basePath}/thumb.jpg`, thumb, {
            contentType: 'image/jpeg',
            upsert: true,
          }),
      ]);

      if (origRes.error || medRes.error || thumbRes.error) {
        throw new AppError(500, 'Failed to upload photos to storage', 'UPLOAD_FAILED');
      }

      // Get public URLs
      const { data: origUrl } = supabase.storage
        .from('photos')
        .getPublicUrl(`${basePath}/original.jpg`);
      const { data: medUrl } = supabase.storage
        .from('photos')
        .getPublicUrl(`${basePath}/medium.jpg`);
      const { data: thumbUrl } = supabase.storage
        .from('photos')
        .getPublicUrl(`${basePath}/thumb.jpg`);

      // Insert photo record
      const { data: photoRecord, error: insertError } = await supabase
        .from('photos')
        .insert({
          id: photoId,
          user_id: user.id,
          url_original: origUrl.publicUrl,
          url_medium: medUrl.publicUrl,
          url_thumb: thumbUrl.publicUrl,
          is_primary: currentCount === 0 && i === 0, // First photo is primary
          sort_order: currentCount + i,
        })
        .select()
        .single();

      if (insertError) {
        throw new AppError(500, 'Failed to save photo record', 'PHOTO_SAVE_FAILED');
      }

      uploadedPhotos.push(photoRecord);
    }

    // Recalculate completeness
    const { data: allPhotos } = await supabase
      .from('photos')
      .select('id')
      .eq('user_id', user.id);

    const [{ data: basic }, { data: sindhi }, { data: chatti }, { data: personality }] =
      await Promise.all([
        supabase.from('basic_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('sindhi_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('chatti_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('personality_profiles').select('*').eq('user_id', user.id).single(),
      ]);

    const completeness = calculateCompleteness({
      basic,
      sindhi,
      chatti,
      personality,
      photos: allPhotos?.length || 0,
    });

    await supabase
      .from('users')
      .update({ profile_completeness: completeness })
      .eq('id', user.id);

    res.status(201).json({
      success: true,
      data: {
        photos: uploadedPhotos,
        profileCompleteness: completeness,
      },
    });
  })
);

// ─── DELETE /v1/me/media/:photoId ───────────────────────────────────────────────

router.delete(
  '/media/:photoId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { photoId } = req.params;

    // Verify ownership
    const { data: photo, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single();

    if (error || !photo) {
      throw new AppError(404, 'Photo not found', 'PHOTO_NOT_FOUND');
    }

    // Check minimum 1 photo
    const { data: allPhotos } = await supabase
      .from('photos')
      .select('id')
      .eq('user_id', user.id);

    if (allPhotos && allPhotos.length <= 1) {
      throw new AppError(400, 'Cannot delete your only photo. Upload another first.', 'MIN_PHOTOS');
    }

    // Delete from storage
    const basePath = `users/${user.id}/photos/${photoId}`;
    await supabase.storage.from('photos').remove([
      `${basePath}/original.jpg`,
      `${basePath}/medium.jpg`,
      `${basePath}/thumb.jpg`,
    ]);

    // Delete record
    await supabase.from('photos').delete().eq('id', photoId);

    // If deleted photo was primary, make the next one primary
    if (photo.is_primary) {
      const { data: nextPhoto } = await supabase
        .from('photos')
        .select('id')
        .eq('user_id', user.id)
        .order('sort_order')
        .limit(1)
        .single();

      if (nextPhoto) {
        await supabase
          .from('photos')
          .update({ is_primary: true })
          .eq('id', nextPhoto.id);
      }
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  })
);

// ─── POST /v1/me/verify ─────────────────────────────────────────────────────────

router.post(
  '/verify',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    // Stub: In production, this would trigger a verification flow
    // (selfie comparison, ID check, etc.)
    await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', user.id);

    res.json({
      success: true,
      message: 'Profile verification complete',
      data: {
        isVerified: true,
      },
    });
  })
);

// ─── GET /v1/me/export ──────────────────────────────────────────────────────────

router.get(
  '/export',
  authenticate,
  rateLimit({ maxRequests: 2, windowSeconds: 3600, keyPrefix: 'rl_export' }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    // GDPR data export stub
    // In production, this would generate a downloadable archive
    const [
      { data: userData },
      { data: basic },
      { data: sindhi },
      { data: chatti },
      { data: personality },
      { data: photos },
      { data: settings },
      { data: actions },
      { data: matches },
      { data: messages },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('basic_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('sindhi_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('chatti_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('personality_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('photos').select('*').eq('user_id', user.id),
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('actions').select('*').eq('actor_id', user.id),
      supabase
        .from('matches')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`),
      supabase.from('messages').select('*').eq('sender_id', user.id),
    ]);

    res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        user: userData,
        profile: { basic, sindhi, chatti, personality },
        photos: photos || [],
        settings,
        actions: actions || [],
        matches: matches || [],
        messages: messages || [],
      },
    });
  })
);

export default router;
