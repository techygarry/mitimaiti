-- ============================================================================
-- MitiMaiti - Initial Schema Migration
-- Sindhi Community Matrimony / Dating App
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- USERS TABLE (master record)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'user' CHECK (account_type IN ('user','family')),
  first_name TEXT,
  birthday DATE,
  gender TEXT CHECK (gender IN ('m','w','nb')),
  city TEXT,
  country TEXT,
  intent TEXT CHECK (intent IN ('casual','open','marriage')),
  show_me TEXT CHECK (show_me IN ('men','women','everyone')),
  bio TEXT CHECK (char_length(bio) <= 500),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_expires TIMESTAMPTZ,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','premium')),
  plan_expires TIMESTAMPTZ,
  plan_auto_renew BOOLEAN DEFAULT false,
  plan_via TEXT,
  plan_region TEXT,
  profile_completeness INT DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  needs_onboarding BOOLEAN DEFAULT true,
  onboarding_step INT DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  is_snoozed BOOLEAN DEFAULT false,
  show_in_discovery BOOLEAN DEFAULT true,
  incognito BOOLEAN DEFAULT false,
  lang TEXT DEFAULT 'en' CHECK (lang IN ('en','hi','sd')),
  daily_prompt_answer TEXT,
  daily_prompt_answered_at TIMESTAMPTZ,
  deletion_requested BOOLEAN DEFAULT false,
  deletion_scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_discovery ON users (gender, city, birthday, plan)
  WHERE is_banned = false AND show_in_discovery = true AND is_hidden = false AND is_snoozed = false;
CREATE INDEX idx_users_last_active ON users (last_active_at DESC);
CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_auth ON users (auth_id);

-- ---------------------------------------------------------------------------
-- PHOTOS
-- ---------------------------------------------------------------------------
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url_full TEXT NOT NULL,
  url_card TEXT NOT NULL,
  url_thumb TEXT NOT NULL,
  position INT NOT NULL,
  is_video BOOLEAN DEFAULT false,
  video_duration_ms INT,
  moderation_status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_user ON photos (user_id, position);

-- ---------------------------------------------------------------------------
-- FCM TOKENS
-- ---------------------------------------------------------------------------
CREATE TABLE user_fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios','android','web')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- ---------------------------------------------------------------------------
-- SINDHI IDENTITY
-- ---------------------------------------------------------------------------
CREATE TABLE user_sindhi (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  fluency TEXT,
  religion TEXT,
  gotra TEXT,
  generation TEXT,
  dietary TEXT,
  festivals TEXT[],
  family_involvement TEXT,
  fav_dish TEXT
);

-- ---------------------------------------------------------------------------
-- CHATTI / KUNDLI
-- ---------------------------------------------------------------------------
CREATE TABLE user_chatti (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  chatti_name TEXT,
  dob DATE,
  time_of_birth TEXT,
  place_of_birth TEXT,
  nakshatra TEXT,
  rashi TEXT,
  chatti_image_url TEXT
);

-- ---------------------------------------------------------------------------
-- BASICS
-- ---------------------------------------------------------------------------
CREATE TABLE user_basics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  height_cm INT,
  education TEXT,
  work TEXT,
  drinking TEXT,
  smoking TEXT,
  kids TEXT,
  settling TEXT,
  exercise TEXT
);

-- ---------------------------------------------------------------------------
-- PERSONALITY
-- ---------------------------------------------------------------------------
CREATE TABLE user_personality (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  prompts JSONB DEFAULT '[]',
  interests TEXT[] DEFAULT '{}',
  voice_intro_url TEXT,
  languages TEXT[] DEFAULT '{}'
);

-- ---------------------------------------------------------------------------
-- SETTINGS
-- ---------------------------------------------------------------------------
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  show_in_discovery BOOLEAN DEFAULT true,
  snooze_on BOOLEAN DEFAULT false,
  snooze_duration TEXT,
  snooze_until TIMESTAMPTZ,
  incognito BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'sys' CHECK (theme IN ('sys','light','dark')),
  disc_city TEXT,
  disc_passport TEXT,
  disc_passport_expires TIMESTAMPTZ,
  disc_age_min INT DEFAULT 18,
  disc_age_max INT DEFAULT 60,
  disc_intent TEXT[],
  disc_religion TEXT[],
  disc_verified_only BOOLEAN DEFAULT false,
  disc_height_min INT,
  disc_height_max INT,
  disc_education TEXT[],
  disc_drinking TEXT[],
  disc_smoking TEXT[],
  disc_kids TEXT[],
  disc_fluency TEXT[],
  disc_gotra TEXT[],
  disc_settling TEXT[],
  disc_exercise TEXT[],
  disc_dietary TEXT[],
  disc_kundli_min INT,
  notif_push BOOLEAN DEFAULT true,
  notif_matches BOOLEAN DEFAULT true,
  notif_likes BOOLEAN DEFAULT true,
  notif_messages BOOLEAN DEFAULT true,
  notif_calls BOOLEAN DEFAULT true,
  notif_family BOOLEAN DEFAULT true,
  notif_tips BOOLEAN DEFAULT false,
  notif_email BOOLEAN DEFAULT false,
  timezone TEXT
);

-- ---------------------------------------------------------------------------
-- PRIVILEGES
-- ---------------------------------------------------------------------------
CREATE TABLE user_privileges (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  likes_used_today INT DEFAULT 0,
  super_likes_left INT DEFAULT 1,
  comments_left INT DEFAULT 1,
  super_exhausted_at TIMESTAMPTZ,
  comment_exhausted_at TIMESTAMPTZ,
  rewinds_used_today INT DEFAULT 0,
  boost_available INT DEFAULT 0,
  boost_expires_at TIMESTAMPTZ,
  boost_week_reset TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- PAIR SCORES (Cultural + Kundli)
-- ---------------------------------------------------------------------------
CREATE TABLE pair_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cultural_total INT,
  family_score INT,
  language_score INT,
  festival_score INT,
  food_score INT,
  diaspora_score INT,
  intent_score INT,
  badge TEXT CHECK (badge IN ('gold','green','orange','none')),
  kundli_total INT,
  kundli_tier TEXT,
  varna INT,
  vashya INT,
  tara INT,
  yoni INT,
  graha INT,
  gana INT,
  bhakoot INT,
  nadi INT,
  common_interests INT DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_pair_canonical ON pair_scores (user_a_id, user_b_id);

-- ---------------------------------------------------------------------------
-- LIKES
-- ---------------------------------------------------------------------------
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like','super','pass','comment')),
  comment_text TEXT CHECK (char_length(comment_text) <= 150),
  comment_on TEXT,
  from_name TEXT,
  from_thumb TEXT,
  from_city TEXT,
  from_age INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_likes_unique ON likes (from_user_id, to_user_id) WHERE type != 'pass';
CREATE INDEX idx_likes_received ON likes (to_user_id, created_at DESC) WHERE type != 'pass';

-- ---------------------------------------------------------------------------
-- MATCHES
-- ---------------------------------------------------------------------------
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID REFERENCES users(id),
  user_b_id UUID REFERENCES users(id),
  user_a_name TEXT,
  user_a_thumb TEXT,
  user_b_name TEXT,
  user_b_thumb TEXT,
  first_msg_by UUID,
  first_msg_at TIMESTAMPTZ,
  reply_deadline TIMESTAMPTZ,
  deadline_extended BOOLEAN DEFAULT false,
  calls_unlocked BOOLEAN DEFAULT false,
  last_msg_text TEXT,
  last_msg_at TIMESTAMPTZ,
  last_msg_by UUID,
  unread_a INT DEFAULT 0,
  unread_b INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','unmatched','blocked')),
  ended_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_matches_pair ON matches (user_a_id, user_b_id);
CREATE INDEX idx_matches_user ON matches (user_a_id, status, last_msg_at DESC);
CREATE INDEX idx_matches_expiry ON matches (reply_deadline, status) WHERE status = 'active';

-- ---------------------------------------------------------------------------
-- MESSAGES
-- ---------------------------------------------------------------------------
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('text','photo','voice','gif','icebreaker')),
  body TEXT,
  voice_duration_ms INT,
  is_screened BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_match ON messages (match_id, created_at);

-- ---------------------------------------------------------------------------
-- ICEBREAKERS
-- ---------------------------------------------------------------------------
CREATE TABLE icebreakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT CHECK (category IN ('sindhi','general')),
  question TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- FAMILY ACCESS
-- ---------------------------------------------------------------------------
CREATE TABLE family_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES users(id),
  invite_code TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  relationship TEXT CHECK (relationship IN ('mom','dad','sibling','grandparent','uncle_aunt','other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','paused','revoked')),
  perm_photos BOOLEAN DEFAULT true,
  perm_bio BOOLEAN DEFAULT true,
  perm_education BOOLEAN DEFAULT true,
  perm_chatti BOOLEAN DEFAULT true,
  perm_kundli BOOLEAN DEFAULT true,
  perm_prompts BOOLEAN DEFAULT true,
  perm_voice BOOLEAN DEFAULT true,
  perm_location BOOLEAN DEFAULT true,
  suggestions_today INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- FAMILY SUGGESTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE family_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_access_id UUID REFERENCES family_access(id) ON DELETE CASCADE,
  suggested_user_id UUID REFERENCES users(id),
  note TEXT CHECK (char_length(note) <= 200),
  user_action TEXT CHECK (user_action IN ('liked','passed','saved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- REPORTS
-- ---------------------------------------------------------------------------
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id),
  reported_id UUID REFERENCES users(id),
  reason TEXT CHECK (reason IN ('fake','harassment','spam','photos','underage','safety')),
  details TEXT,
  source TEXT,
  priority TEXT DEFAULT 'P2',
  status TEXT DEFAULT 'pending',
  admin_action TEXT,
  admin_id UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- STRIKES
-- ---------------------------------------------------------------------------
CREATE TABLE strikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  strike_number INT,
  reason TEXT,
  action TEXT,
  ban_until TIMESTAMPTZ,
  appeal_text TEXT,
  appeal_status TEXT,
  appeal_admin_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- BLOCKED USERS
-- ---------------------------------------------------------------------------
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES users(id),
  blocked_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- ---------------------------------------------------------------------------
-- BLOCKED PHONES
-- ---------------------------------------------------------------------------
CREATE TABLE blocked_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  phone_hash TEXT,
  UNIQUE(user_id, phone_hash)
);

-- ---------------------------------------------------------------------------
-- NOTIFICATION LOG
-- ---------------------------------------------------------------------------
CREATE TABLE notif_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT,
  channel TEXT,
  title TEXT,
  body TEXT,
  data JSONB,
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMPTZ
);

CREATE INDEX idx_notif_user ON notif_log (user_id, sent_at DESC);

-- ---------------------------------------------------------------------------
-- DAILY PROMPTS
-- ---------------------------------------------------------------------------
CREATE TABLE daily_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  set_by TEXT DEFAULT 'system',
  set_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- SEASONAL EVENTS
-- ---------------------------------------------------------------------------
CREATE TABLE seasonal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  banner_url TEXT,
  special_prompts TEXT[],
  start_date DATE,
  end_date DATE
);


-- ===========================================================================
-- TRIGGER: auto-update updated_at on row modification
-- ===========================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();


-- ===========================================================================
-- SEED DATA: Icebreakers (50 Sindhi + 50 General)
-- ===========================================================================

-- 50 Sindhi icebreakers
INSERT INTO icebreakers (category, question) VALUES
('sindhi', 'What is your favourite Sindhi dish your mom or nani makes?'),
('sindhi', 'Do you speak Sindhi at home, or is it more of a "understand but reply in Hindi/English" situation?'),
('sindhi', 'Cheti Chand or Diwali -- which one does your family go bigger on?'),
('sindhi', 'What is one Sindhi tradition you would want to keep alive in your own family?'),
('sindhi', 'Sai bhaji or dal pakwan -- pick one for the rest of your life.'),
('sindhi', 'Have you ever attended a Sindhi panchayat or community event? How was it?'),
('sindhi', 'What is your gotra, and does your family actually care about matching it?'),
('sindhi', 'Do you know any Sindhi jokes or shayari? Share your best one!'),
('sindhi', 'Papad, paapri, or pickle -- which Sindhi snack can you not live without?'),
('sindhi', 'How involved is your family in your marriage decisions, on a scale of 1-10?'),
('sindhi', 'Do you celebrate Jhulelal Jayanti? What does it mean to you?'),
('sindhi', 'What is your favourite Sindhi sweet -- singhar ji mithai or gur wari tikki?'),
('sindhi', 'Has your family kept the tradition of a morning Jhulelal prayer?'),
('sindhi', 'If you could live in any Sindhi-heavy city, which would you pick and why?'),
('sindhi', 'What is the most "Sindhi uncle" or "Sindhi aunty" thing your parents do?'),
('sindhi', 'Koki for breakfast -- yay or nay?'),
('sindhi', 'What is the funniest misunderstanding someone had about Sindhis?'),
('sindhi', 'Do you observe Teejri? How does your family celebrate it?'),
('sindhi', 'What is the one thing about Sindhi culture you are most proud of?'),
('sindhi', 'Have you ever been to Sindh or thought about visiting the ancestral homeland?'),
('sindhi', 'Sindhi kadhi or regular kadhi -- which wins?'),
('sindhi', 'How important is it to you that your partner speaks or understands Sindhi?'),
('sindhi', 'What Sindhi value did your grandparents pass down that stuck with you?'),
('sindhi', 'Do you know the story of Jhulelal? Can you tell it in 3 sentences?'),
('sindhi', 'What is your take on the "Sindhis are great businesspeople" stereotype?'),
('sindhi', 'Have you been to Ulhasnagar? What was that experience like?'),
('sindhi', 'If you had to name a Sindhi role model, who comes to mind?'),
('sindhi', 'Thadal or solkadhi -- which is your summer drink?'),
('sindhi', 'What Sindhi festival do you think deserves more hype?'),
('sindhi', 'Does your family still do Bahraana Sahib readings at home?'),
('sindhi', 'What is the most elaborate Sindhi wedding you have ever attended?'),
('sindhi', 'How would you describe the Sindhi community in your city?'),
('sindhi', 'Do you prefer Sindhi music or Bollywood? Any favourite Sindhi artists?'),
('sindhi', 'What is one Sindhi word that has no translation in English?'),
('sindhi', 'Have you ever worn traditional Sindhi attire -- ajrak or topi?'),
('sindhi', 'What role does religion play in your daily life?'),
('sindhi', 'What is your family''s partition story? Has it been passed down?'),
('sindhi', 'Besan jo lolo or mitho lolo -- what is your pick?'),
('sindhi', 'How do you feel about kundli matching for marriage?'),
('sindhi', 'What is the best business advice you got from a Sindhi elder?'),
('sindhi', 'If you could bring back one lost Sindhi tradition, what would it be?'),
('sindhi', 'Do you know how to read or write in Sindhi script?'),
('sindhi', 'What is the most Sindhi thing about your household?'),
('sindhi', 'Have you joined any Sindhi youth groups or online communities?'),
('sindhi', 'Seyal mani or seyal pata -- which is comfort food for you?'),
('sindhi', 'Would you want a traditional Sindhi wedding or a modern one?'),
('sindhi', 'What Sindhi dish would you cook to impress someone?'),
('sindhi', 'How do you stay connected to Sindhi culture while living abroad or away from family?'),
('sindhi', 'What is the one thing you would tell someone who knows nothing about Sindhis?'),
('sindhi', 'Do you think the Sindhi community is getting better at preserving its language and culture?');

-- 50 General icebreakers
INSERT INTO icebreakers (category, question) VALUES
('general', 'What is something you are passionate about that most people do not know?'),
('general', 'If you could have dinner with anyone -- alive or dead -- who would it be?'),
('general', 'What does a perfect Sunday look like for you?'),
('general', 'What is the last show you binged and would recommend?'),
('general', 'Coffee or chai? And how do you take it?'),
('general', 'What is on your bucket list that you have not ticked off yet?'),
('general', 'Are you a morning person or a night owl?'),
('general', 'What is the best trip you have ever taken?'),
('general', 'What is a skill you would love to learn?'),
('general', 'What is your love language?'),
('general', 'Dog person or cat person?'),
('general', 'What is the most spontaneous thing you have ever done?'),
('general', 'What song is stuck in your head right now?'),
('general', 'If you won the lottery tomorrow, what is the first thing you would do?'),
('general', 'What is your go-to comfort food?'),
('general', 'What is the best advice anyone has ever given you?'),
('general', 'Mountains or beaches?'),
('general', 'What is a deal-breaker for you in a relationship?'),
('general', 'What are you looking for on this app?'),
('general', 'What is your most controversial food opinion?'),
('general', 'If you could live anywhere in the world, where would it be?'),
('general', 'What is the kindest thing a stranger has done for you?'),
('general', 'What is your hidden talent?'),
('general', 'What is the last book you read and loved?'),
('general', 'What does family mean to you?'),
('general', 'What is a hobby you picked up during lockdown?'),
('general', 'If you could time-travel, would you go to the past or the future?'),
('general', 'What is your favourite way to unwind after a long day?'),
('general', 'What is something that always makes you laugh?'),
('general', 'Are you the planner or the spontaneous one in your friend group?'),
('general', 'What is the most meaningful gift you have ever received?'),
('general', 'What is your favourite holiday and why?'),
('general', 'Do you believe in astrology?'),
('general', 'What is the most interesting fact you know?'),
('general', 'What would your best friend say is your best quality?'),
('general', 'What is a movie you can watch over and over?'),
('general', 'What does your ideal weekend look like?'),
('general', 'Cook at home or eat out?'),
('general', 'What is the last thing that genuinely surprised you?'),
('general', 'What are your top 3 non-negotiables in a partner?'),
('general', 'What is the bravest thing you have ever done?'),
('general', 'What is a small thing that brings you joy?'),
('general', 'If you had a podcast, what would it be about?'),
('general', 'What is your guilty pleasure?'),
('general', 'What is one thing you wish more people understood about you?'),
('general', 'How do you handle conflict in a relationship?'),
('general', 'What is a cause you care deeply about?'),
('general', 'What is the best concert or live event you have been to?'),
('general', 'What is your unpopular opinion?'),
('general', 'If you could describe yourself in three words, what would they be?');


-- ===========================================================================
-- SEED DATA: Daily Prompts (110 questions)
-- ===========================================================================
INSERT INTO daily_prompts (question) VALUES
('What does "home" mean to you?'),
('Describe your perfect date night in one sentence.'),
('What is one thing you cannot start your day without?'),
('What is the most romantic thing anyone has done for you?'),
('If your life was a movie, what genre would it be?'),
('What is one quality you admire most in others?'),
('What is the best compliment you have ever received?'),
('What tradition from your family do you hope to continue?'),
('What is the one thing that can instantly brighten your mood?'),
('What does a healthy relationship look like to you?'),
('What was the last thing you learned that changed your perspective?'),
('What is a fear you have overcome?'),
('If you could relive one day of your life, which would it be?'),
('What is the most important lesson love has taught you?'),
('What are you most grateful for today?'),
('What would you do if you knew you could not fail?'),
('What is the best piece of wisdom your parents gave you?'),
('How do you show someone you care?'),
('What is a dream you are actively working toward?'),
('What is the kindest thing you have done for someone recently?'),
('What is a relationship green flag for you?'),
('Describe yourself in a way that would make your best friend proud.'),
('What is one experience that shaped who you are today?'),
('What is your idea of a meaningful conversation?'),
('What does commitment mean to you?'),
('What is the most adventurous thing on your to-do list?'),
('How do you recharge after a tough week?'),
('What is one thing you wish you had learned earlier in life?'),
('What makes you feel truly alive?'),
('What is your favourite way to spend quality time with someone?'),
('If you could give your younger self one piece of advice, what would it be?'),
('What is the most underrated quality in a partner?'),
('What does trust look like in a relationship?'),
('What is the last risk you took, and was it worth it?'),
('What is one thing people misunderstand about you?'),
('What is the most meaningful conversation you have ever had?'),
('How do you define success outside of your career?'),
('What is the bravest decision you have ever made?'),
('What is one small act of kindness that made your day?'),
('What is the one place that feels most like you?'),
('What does "growing together" in a relationship mean to you?'),
('What is your favourite memory from childhood?'),
('How important is laughter in your relationships?'),
('What is the best meal you have ever had, and who were you with?'),
('What is one thing on your mind right now?'),
('If you could master any instrument overnight, which would it be?'),
('What is a book or film that changed how you see the world?'),
('What makes you feel most confident?'),
('What is one unpopular opinion you will defend to the end?'),
('What does your ideal morning routine look like?'),
('How do you handle disagreements with someone you love?'),
('What is one thing you are looking forward to this month?'),
('What does loyalty mean to you?'),
('What is the most thoughtful gift you have ever given?'),
('What is the one thing that always calms you down?'),
('If you could volunteer anywhere in the world, where would you go?'),
('What is a song that reminds you of a special moment?'),
('What is your favourite thing about the city you live in?'),
('What does "being yourself" actually look like for you?'),
('What is one goal you set this year, and how is it going?'),
('What is the last thing that made you cry happy tears?'),
('How do you celebrate small wins?'),
('What is something you believe in that you cannot prove?'),
('What is one habit that has made your life better?'),
('What is the most spontaneous decision you have ever made?'),
('What do you value more -- honesty or kindness?'),
('What is a tradition you have created for yourself?'),
('What is a compliment you would love to receive?'),
('What does a perfect lazy day look like to you?'),
('What is one thing you would change about how people date today?'),
('If you could have a conversation with your future self, what would you ask?'),
('What is one thing you do that makes you lose track of time?'),
('What is the most beautiful place you have ever seen?'),
('How do you stay positive during tough times?'),
('What is one non-negotiable value you live by?'),
('What is the last new food you tried, and did you like it?'),
('What does friendship mean to you?'),
('What is one thing you want your partner to know about you from the start?'),
('What makes a house feel like a home?'),
('What is something you are proud of that you do not talk about much?'),
('If you had one extra hour every day, how would you spend it?'),
('What is the most fun you have had this year?'),
('What is a fear that still holds you back?'),
('What was your biggest "aha" moment?'),
('What is one thing you would tell someone going through a heartbreak?'),
('How do you express love -- words, actions, gifts, time, or touch?'),
('What is the last thing you did that scared you?'),
('What is one thing about your culture that you want to share with the world?'),
('What makes you different from most people?'),
('What is the most important conversation you think couples should have?'),
('What is the last act of self-care you did for yourself?'),
('What is a memory that always makes you smile?'),
('What is one thing you wish people asked you about more?'),
('What does a balanced life look like for you?'),
('If you could create a holiday, what would it celebrate?'),
('What is the hardest thing about modern dating?'),
('What is a lesson you had to learn the hard way?'),
('What would you want to be remembered for?'),
('What is one word that describes where you are in life right now?'),
('What does patience look like in love?'),
('What is the most meaningful apology you have given or received?'),
('What is one thing you are curious about right now?'),
('If you could instantly become an expert in something, what would it be?'),
('What is the most "you" thing about your daily routine?'),
('What does forgiveness look like for you?'),
('What is one conversation topic that always gets you excited?'),
('What is the bravest thing you have said to someone?'),
('How do you know when you are falling for someone?'),
('What is the best part of being you?'),
('What would a perfect year look like for you?'),
('What is one question you wish this prompt had asked?'),
('What does growing old together look like in your imagination?');
