import { Request } from 'express';

// ─── User & Auth ──────────────────────────────────────────────────────────────

export type AccountType = 'self' | 'family';
export type Plan = 'free' | 'gold' | 'platinum';
export type Gender = 'male' | 'female' | 'non_binary';
export type Intent = 'marriage' | 'dating' | 'friendship' | 'networking';
export type ActionKind = 'like' | 'super_like' | 'pass' | 'comment';
export type MatchStatus = 'active' | 'expired' | 'unmatched';
export type ReportReason =
  | 'fake_profile'
  | 'inappropriate_content'
  | 'harassment'
  | 'spam'
  | 'underage'
  | 'other';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type ModerationAction = 'dismiss' | 'remove_content' | 'suspend' | 'ban';
export type StrikeStatus = 'active' | 'appealed' | 'overturned' | 'expired';
export type CulturalBadge = 'gold' | 'green' | 'orange' | 'none';
export type KundliTier = 'excellent' | 'good' | 'challenging';

export interface AuthUser {
  id: string;
  authId: string;
  plan: Plan;
  accountType: AccountType;
  phone: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// ─── Database Row Types ────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  auth_id: string;
  phone: string;
  account_type: AccountType;
  plan: Plan;
  plan_expires: string | null;
  is_verified: boolean;
  is_active: boolean;
  is_suspended: boolean;
  is_banned: boolean;
  ban_expires: string | null;
  strikes: number;
  profile_completeness: number;
  fcm_token: string | null;
  last_active_at: string;
  delete_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BasicProfileRow {
  id: string;
  user_id: string;
  display_name: string;
  date_of_birth: string;
  gender: Gender;
  bio: string | null;
  height_cm: number | null;
  city: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  education: string | null;
  occupation: string | null;
  company: string | null;
  religion: string | null;
  intent: Intent;
}

export interface SindhiProfileRow {
  id: string;
  user_id: string;
  mother_tongue: string;
  sindhi_dialect: string | null;
  sindhi_fluency: 'native' | 'fluent' | 'conversational' | 'basic' | 'learning';
  community_sub_group: string | null;
  gotra: string | null;
  family_origin_city: string | null;
  family_origin_country: string | null;
  generation: string | null;
}

export interface ChattiProfileRow {
  id: string;
  user_id: string;
  family_values: 'traditional' | 'moderate' | 'liberal';
  joint_family_preference: boolean | null;
  festivals_celebrated: string[];
  food_preference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'jain';
  cuisine_preferences: string[];
  cultural_activities: string[];
  traditional_attire: boolean | null;
}

export interface PersonalityRow {
  id: string;
  user_id: string;
  interests: string[];
  music_preferences: string[];
  movie_genres: string[];
  travel_style: string | null;
  pet_preference: string | null;
  smoking: 'never' | 'occasionally' | 'regularly' | null;
  drinking: 'never' | 'socially' | 'regularly' | null;
  workout: 'daily' | 'regularly' | 'occasionally' | 'never' | null;
}

export interface PhotoRow {
  id: string;
  user_id: string;
  url_original: string;
  url_medium: string;
  url_thumb: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserSettingsRow {
  id: string;
  user_id: string;
  discovery_enabled: boolean;
  show_online_status: boolean;
  show_distance: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  age_min: number;
  age_max: number;
  distance_km: number;
  gender_preference: Gender | 'any';
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

export interface UserPrivilegesRow {
  id: string;
  user_id: string;
  daily_likes: number;
  daily_super_likes: number;
  daily_rewinds: number;
  daily_comments: number;
  likes_used: number;
  super_likes_used: number;
  rewinds_used: number;
  comments_used: number;
  boost_active_until: string | null;
  passport_city: string | null;
  passport_expires: string | null;
  last_reset_at: string;
}

export interface ActionRow {
  id: string;
  actor_id: string;
  target_id: string;
  kind: ActionKind;
  comment_text: string | null;
  prompt_question: string | null;
  created_at: string;
}

export interface MatchRow {
  id: string;
  user_a_id: string;
  user_b_id: string;
  status: MatchStatus;
  matched_at: string;
  expires_at: string | null;
  cultural_score: number | null;
}

export interface MessageRow {
  id: string;
  match_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  is_read: boolean;
  created_at: string;
}

export interface FamilyInviteRow {
  id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  family_account_id: string | null;
  created_at: string;
  expires_at: string;
}

export interface FamilyMemberRow {
  id: string;
  user_id: string;
  family_account_id: string;
  role: 'owner' | 'member';
  can_view_matches: boolean;
  can_suggest: boolean;
  can_chat: boolean;
  is_paused: boolean;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: ReportReason;
  description: string | null;
  priority: ReportPriority;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  moderator_id: string | null;
  resolution_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface BlockRow {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface PremiumPlanConfig {
  id: string;
  name: string;
  tier: Plan;
  duration_days: number;
  price_inr: number;
  price_usd: number;
  features: string[];
}

export interface DailyPromptRow {
  id: string;
  question: string;
  category: string;
  is_active: boolean;
  date: string;
  created_at: string;
}

export interface PromptAnswerRow {
  id: string;
  user_id: string;
  prompt_id: string;
  answer: string;
  created_at: string;
}

// ─── Notification Types ────────────────────────────────────────────────────────

export type NotificationType =
  | 'new_like'
  | 'new_super_like'
  | 'new_match'
  | 'new_message'
  | 'match_expiring'
  | 'match_expired'
  | 'profile_boost_started'
  | 'profile_boost_ended'
  | 'daily_prompt'
  | 'profile_incomplete'
  | 'verification_approved'
  | 'verification_rejected'
  | 'premium_activated'
  | 'premium_expiring'
  | 'premium_expired'
  | 'family_invite_received'
  | 'family_suggestion'
  | 'strike_received';

export interface NotificationPayload {
  type: NotificationType;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// ─── Cultural Scoring ──────────────────────────────────────────────────────────

export interface CulturalScoreResult {
  total: number;
  badge: CulturalBadge;
  breakdown: {
    familyValues: number;
    language: number;
    festivals: number;
    food: number;
    diaspora: number;
    intent: number;
  };
}

// ─── Kundli ────────────────────────────────────────────────────────────────────

export interface KundliResult {
  totalPoints: number;
  maxPoints: 36;
  tier: KundliTier;
  gunas: {
    varna: number;
    vashya: number;
    tara: number;
    yoni: number;
    grahaMaitri: number;
    gana: number;
    bhakoot: number;
    nadi: number;
  };
}

export interface NakshatraInfo {
  name: string;
  index: number;
  rashi: string;
}

// ─── Socket Events ─────────────────────────────────────────────────────────────

export interface SocketSendMessage {
  matchId: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface SocketTypingEvent {
  matchId: string;
  isTyping: boolean;
}

export interface SocketEnterChat {
  matchId: string;
}

// ─── Icebreakers ───────────────────────────────────────────────────────────────

export interface Icebreaker {
  id: number;
  category: 'sindhi' | 'general';
  question: string;
}
