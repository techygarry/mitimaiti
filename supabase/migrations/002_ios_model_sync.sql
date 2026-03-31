-- ============================================================================
-- MitiMaiti - Migration 002: Sync database with iOS app models
-- Renames tables/columns, adds missing fields, expands enums
-- ============================================================================

-- ---------------------------------------------------------------------------
-- RENAME TABLES: Align with backend route expectations
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS user_basics RENAME TO basic_profiles;
ALTER TABLE IF EXISTS user_sindhi RENAME TO sindhi_profiles;
ALTER TABLE IF EXISTS user_chatti RENAME TO chatti_profiles;
ALTER TABLE IF EXISTS user_personality RENAME TO personality_profiles;
ALTER TABLE IF EXISTS likes RENAME TO actions;

-- Rename the sindhi fluency column for clarity
ALTER TABLE sindhi_profiles RENAME COLUMN fluency TO sindhi_fluency;

-- Rename the sindhi dietary column
ALTER TABLE sindhi_profiles RENAME COLUMN dietary TO food_preference;

-- Rename family_involvement → family_values (different enum values handled below)
ALTER TABLE sindhi_profiles RENAME COLUMN family_involvement TO family_values_legacy;

-- Rename likes unique index
ALTER INDEX IF EXISTS idx_likes_unique RENAME TO idx_actions_unique;
ALTER INDEX IF EXISTS idx_likes_received RENAME TO idx_actions_received;

-- ---------------------------------------------------------------------------
-- PHOTOS: Rename columns to match backend code
-- ---------------------------------------------------------------------------
ALTER TABLE photos RENAME COLUMN url_200 TO url_thumb;
ALTER TABLE photos RENAME COLUMN url_600 TO url_medium;
ALTER TABLE photos RENAME COLUMN url_1200 TO url_original;
ALTER TABLE photos RENAME COLUMN "order" TO sort_order;

-- Add is_verified flag for photos
ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- ---------------------------------------------------------------------------
-- ACTIONS TABLE: Rename columns to match backend code
-- ---------------------------------------------------------------------------
ALTER TABLE actions RENAME COLUMN from_user_id TO actor_id;
ALTER TABLE actions RENAME COLUMN to_user_id TO target_id;
ALTER TABLE actions RENAME COLUMN type TO kind;

-- Update CHECK constraint for actions.kind
ALTER TABLE actions DROP CONSTRAINT IF EXISTS likes_type_check;
ALTER TABLE actions ADD CONSTRAINT actions_kind_check
  CHECK (kind IN ('like','pass'));

-- ---------------------------------------------------------------------------
-- USERS TABLE: Add display_name, state, country, bio, is_online
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strikes INT DEFAULT 0;

-- Backfill display_name from first_name
UPDATE users SET display_name = first_name WHERE display_name IS NULL AND first_name IS NOT NULL;

-- ---------------------------------------------------------------------------
-- SINDHI_PROFILES: Expand fluency enum, add new identity fields
-- ---------------------------------------------------------------------------
-- Drop and recreate fluency CHECK to add 'conversational' and 'learning'
ALTER TABLE sindhi_profiles DROP CONSTRAINT IF EXISTS user_sindhi_fluency_check;
ALTER TABLE sindhi_profiles ADD CONSTRAINT sindhi_profiles_fluency_check
  CHECK (sindhi_fluency IN ('native','fluent','conversational','basic','learning','none'));

-- Drop and recreate food_preference CHECK to include iOS values
ALTER TABLE sindhi_profiles DROP CONSTRAINT IF EXISTS user_sindhi_dietary_check;
ALTER TABLE sindhi_profiles ADD CONSTRAINT sindhi_profiles_food_check
  CHECK (food_preference IN ('veg','non-veg','vegan','jain','eggetarian','vegetarian','non_vegetarian'));

-- Drop old family_involvement CHECK
ALTER TABLE sindhi_profiles DROP CONSTRAINT IF EXISTS user_sindhi_family_involvement_check;

-- Add new Sindhi identity columns
ALTER TABLE sindhi_profiles ADD COLUMN IF NOT EXISTS mother_tongue TEXT;
ALTER TABLE sindhi_profiles ADD COLUMN IF NOT EXISTS sindhi_dialect TEXT;
ALTER TABLE sindhi_profiles ADD COLUMN IF NOT EXISTS community_sub_group TEXT;
ALTER TABLE sindhi_profiles ADD COLUMN IF NOT EXISTS family_origin_city TEXT;
ALTER TABLE sindhi_profiles ADD COLUMN IF NOT EXISTS family_origin_country TEXT;

-- ---------------------------------------------------------------------------
-- CHATTI_PROFILES: Add cultural/family fields iOS expects
-- ---------------------------------------------------------------------------
ALTER TABLE chatti_profiles ADD COLUMN IF NOT EXISTS family_values TEXT
  CHECK (family_values IN ('traditional','moderate','liberal'));
ALTER TABLE chatti_profiles ADD COLUMN IF NOT EXISTS joint_family_preference BOOLEAN;
ALTER TABLE chatti_profiles ADD COLUMN IF NOT EXISTS festivals_celebrated TEXT[] DEFAULT '{}';
ALTER TABLE chatti_profiles ADD COLUMN IF NOT EXISTS food_preference TEXT
  CHECK (food_preference IN ('vegetarian','non_vegetarian','vegan','jain','eggetarian'));
ALTER TABLE chatti_profiles ADD COLUMN IF NOT EXISTS cuisine_preferences TEXT[] DEFAULT '{}';
ALTER TABLE chatti_profiles ADD COLUMN IF NOT EXISTS cultural_activities TEXT[] DEFAULT '{}';
ALTER TABLE chatti_profiles ADD COLUMN IF NOT EXISTS traditional_attire TEXT;

-- ---------------------------------------------------------------------------
-- BASIC_PROFILES: Add company, religion, want_kids, occupation
-- ---------------------------------------------------------------------------
ALTER TABLE basic_profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE basic_profiles ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE basic_profiles ADD COLUMN IF NOT EXISTS want_kids TEXT;
ALTER TABLE basic_profiles ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Rename 'work' to 'occupation' if it exists (old schema had 'work')
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'basic_profiles' AND column_name = 'work'
  ) THEN
    ALTER TABLE basic_profiles RENAME COLUMN work TO occupation_legacy;
    UPDATE basic_profiles SET occupation = occupation_legacy WHERE occupation IS NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- PERSONALITY_PROFILES: Add music, movies, travel, pets
-- ---------------------------------------------------------------------------
ALTER TABLE personality_profiles ADD COLUMN IF NOT EXISTS music_preferences TEXT[] DEFAULT '{}';
ALTER TABLE personality_profiles ADD COLUMN IF NOT EXISTS movie_genres TEXT[] DEFAULT '{}';
ALTER TABLE personality_profiles ADD COLUMN IF NOT EXISTS travel_style TEXT;
ALTER TABLE personality_profiles ADD COLUMN IF NOT EXISTS pet_preference TEXT;

-- ---------------------------------------------------------------------------
-- MATCHES: Add status enum column for iOS compatibility
-- ---------------------------------------------------------------------------
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_first_message'
  CHECK (status IN ('pending_first_message','active','expired','unmatched','dissolved'));

-- Add matched_at alias (routes use matched_at, DB has created_at)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ;
UPDATE matches SET matched_at = created_at WHERE matched_at IS NULL;

-- Backfill status from existing boolean fields
UPDATE matches SET status = 'dissolved' WHERE is_dissolved = true AND status = 'pending_first_message';
UPDATE matches SET status = 'active'
  WHERE is_dissolved = false AND first_msg_by IS NOT NULL AND first_msg_locked = false AND status = 'pending_first_message';

-- Index on match status for efficient queries
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches (status)
  WHERE status IN ('pending_first_message', 'active');

-- ---------------------------------------------------------------------------
-- FAMILY_ACCESS: Update default permissions to match iOS model
-- ---------------------------------------------------------------------------
-- Rename user_id → owner_id for clarity (matches route code)
ALTER TABLE family_access RENAME COLUMN user_id TO owner_id;
DROP INDEX IF EXISTS idx_family_user;
CREATE INDEX IF NOT EXISTS idx_family_owner ON family_access (owner_id) WHERE is_revoked = false;

ALTER TABLE family_access ALTER COLUMN permissions
  SET DEFAULT '{"canViewProfile":true,"canViewPhotos":true,"canViewBasics":true,"canViewSindhi":true,"canViewMatches":false,"canSuggest":true,"canViewCulturalScore":true,"canViewKundli":true}';

-- Migrate existing permission JSONB from old to new format
UPDATE family_access SET permissions = jsonb_build_object(
  'canViewProfile', COALESCE((permissions->>'bio')::boolean, true),
  'canViewPhotos', COALESCE((permissions->>'photos')::boolean, true),
  'canViewBasics', COALESCE((permissions->>'education')::boolean, true),
  'canViewSindhi', COALESCE((permissions->>'chatti')::boolean, true),
  'canViewMatches', false,
  'canSuggest', true,
  'canViewCulturalScore', COALESCE((permissions->>'cultural_badges')::boolean, true),
  'canViewKundli', COALESCE((permissions->>'kundli')::boolean, true)
)
WHERE permissions ? 'bio'; -- Only migrate records with old format

-- ---------------------------------------------------------------------------
-- ICEBREAKERS: Expand type enum to include 'fun' and 'deep' categories
-- ---------------------------------------------------------------------------
ALTER TABLE icebreakers DROP CONSTRAINT IF EXISTS icebreakers_type_check;
ALTER TABLE icebreakers ADD CONSTRAINT icebreakers_type_check
  CHECK (type IN ('sindhi','general','fun','deep'));

-- ---------------------------------------------------------------------------
-- MESSAGES: Add 'system' message type
-- ---------------------------------------------------------------------------
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_msg_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_msg_type_check
  CHECK (msg_type IN ('text','photo','voice','gif','icebreaker','system'));

-- ---------------------------------------------------------------------------
-- USER_SETTINGS: Add missing notification toggles and discovery filters
-- ---------------------------------------------------------------------------
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notif_daily_prompt BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notif_new_features BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notif_safety BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS show_full_name BOOLEAN DEFAULT false;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY: Update policies for renamed tables
-- ---------------------------------------------------------------------------
ALTER TABLE basic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sindhi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatti_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- Recreate service role policies for renamed tables
DO $$
BEGIN
  -- basic_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'basic_profiles' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON basic_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- sindhi_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sindhi_profiles' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON sindhi_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- chatti_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chatti_profiles' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON chatti_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- personality_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personality_profiles' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON personality_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- actions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'actions' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON actions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
