import { Request } from 'express';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type Gender = 'man' | 'woman' | 'non-binary';
export type Intent = 'casual' | 'open' | 'marriage';
export type ShowMe = 'men' | 'women' | 'everyone';
export type ActionType = 'like' | 'pass';
export type MsgType = 'text' | 'photo' | 'voice' | 'gif' | 'icebreaker';
export type ReportReason = 'fake' | 'harassment' | 'spam' | 'photos' | 'underage' | 'safety';
export type ReportPriority = 'P0' | 'P1' | 'P2';
export type AdminAction = 'dismiss' | 'warn' | 'suspend' | 'ban';
export type ModerationAction = AdminAction;
export type CulturalBadge = 'gold' | 'green' | 'orange' | 'none';
export type KundliTier = 'excellent' | 'good' | 'challenging';
export type FamilyRole = 'mom' | 'dad' | 'sibling' | 'grandparent' | 'uncle_aunt' | 'other';
export type SindhiFluency = 'native' | 'fluent' | 'basic' | 'none';
export type Dietary = 'veg' | 'non-veg' | 'vegan' | 'jain';
export type FamilyInvolvement = 'very' | 'moderate' | 'independent';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  authId: string;
  phone: string;
  role?: 'user' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// ─── Notification Types (18) ──────────────────────────────────────────────────

export type NotificationType =
  | 'like_received'
  | 'likes_batch'
  | 'match_created'
  | 'new_match'
  | 'message_received'
  | 'new_message'
  | 'voice_message'
  | 'photo_received'
  | 'expiry_warning'
  | 'match_expiring'
  | 'match_dissolved'
  | 'incoming_call'
  | 'family_joined'
  | 'family_suggestion'
  | 'suggestion_reviewed'
  | 'access_revoked'
  | 'profile_verified'
  | 'snooze_ended'
  | 'deletion_reminder'
  | 'profile_nudge'
  | 'strike_issued'
  | 'appeal_resolved';

export interface NotificationPayload {
  type: NotificationType;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Safety notification types that bypass throttle
export const SAFETY_NOTIFICATION_TYPES: NotificationType[] = [
  'strike_issued',
  'match_dissolved',
  'appeal_resolved',
];

// ─── Cultural Scoring ─────────────────────────────────────────────────────────

export interface CulturalBreakdown {
  family_values: number;
  language: number;
  festivals: number;
  food: number;
  diaspora: number;
  intent: number;
}

export interface CulturalScoreResult {
  total: number;
  badge: CulturalBadge;
  breakdown: CulturalBreakdown;
}

// ─── Kundli ───────────────────────────────────────────────────────────────────

export interface KundliBreakdown {
  varna: number;
  vashya: number;
  tara: number;
  yoni: number;
  graha_maitri: number;
  gana: number;
  bhakoot: number;
  nadi: number;
}

export interface KundliResult {
  total: number;
  max: 36;
  tier: KundliTier;
  breakdown: KundliBreakdown;
}

export interface NakshatraInfo {
  name: string;
  index: number;
  rashi: string;
}

// ─── Moderation ──────────────────────────────────────────────────────────────

export interface PhotoScreenResult {
  pass: boolean;
  score: number;
}

export interface TextScreenResult {
  pass: boolean;
  reason: string;
}

export interface ProfileTextScreenResult {
  pass: boolean;
  score: number;
}

// ─── Feed Card ────────────────────────────────────────────────────────────────

export interface FeedCard {
  id: string;
  first_name: string;
  age: number;
  city: string;
  intent: Intent;
  is_verified: boolean;
  photos: { url_600: string; url_1200: string; is_video: boolean }[];
  about_me: string | null;
  prompts: any[];
  interests: string[];
  cultural_score: number;
  cultural_badge: CulturalBadge;
  kundli_score: number | null;
  kundli_tier: KundliTier | null;
  common_interests: number;
  daily_prompt_answer: string | null;
}

// ─── Socket Events ────────────────────────────────────────────────────────────

export interface SocketSendMessage {
  matchId: string;
  content?: string;
  mediaUrl?: string;
  msgType: MsgType;
}

export interface SocketTypingEvent {
  matchId: string;
}

export interface SocketEnterChat {
  matchId: string;
}

// ─── Icebreaker ─────────────────────────────────────────────────────────

export interface Icebreaker {
  id: number;
  category: 'sindhi' | 'general' | 'fun' | 'deep';
  question: string;
}

// ─── Family Permissions ───────────────────────────────────────────────────────

export interface FamilyPermissions {
  photos: boolean;
  bio: boolean;
  education: boolean;
  chatti: boolean;
  kundli: boolean;
  prompts: boolean;
  voice: boolean;
  cultural_badges: boolean;
}
