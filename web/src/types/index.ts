export interface User {
  id: string;
  phone: string;
  first_name: string;
  last_name?: string;
  show_full_name?: boolean;
  date_of_birth: string;
  age: number;
  gender: 'man' | 'woman' | 'nonbinary';
  city: string;
  country: string;
  intent: 'casual' | 'open' | 'marriage';
  show_me: 'men' | 'women' | 'everyone';
  bio?: string;
  verified: boolean;
  profile_completeness: number;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  is_primary: boolean;
  order: number;
  verified: boolean;
  created_at: string;
}

export interface UserBasics {
  user_id: string;
  height_cm?: number;
  education?: string;
  work_title?: string;
  company?: string;
  drinking?: 'never' | 'socially' | 'regularly';
  smoking?: 'never' | 'socially' | 'regularly';
  wants_kids?: 'want' | 'dont_want' | 'have_and_want_more' | 'have_and_done' | 'open';
  settling_timeline?: 'asap' | '1_2_years' | '3_5_years' | 'not_sure';
  exercise?: 'daily' | 'often' | 'sometimes' | 'never';
}

export interface UserSindhi {
  user_id: string;
  sindhi_fluency?: 'fluent' | 'conversational' | 'basic' | 'learning' | 'none';
  religion?: 'hindu' | 'sikh' | 'muslim' | 'christian' | 'spiritual' | 'other';
  gotra?: string;
  generation?: 'sindhi_born' | '2nd_gen' | '3rd_gen' | 'mixed';
  dietary?: 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan' | 'jain';
  festivals?: string[];
  family_involvement?: 'very_involved' | 'somewhat' | 'minimal' | 'independent';
}

export interface UserChatti {
  user_id: string;
  chatti_name?: string;
  chatti_dob?: string;
  time_of_birth?: string;
  place_of_birth?: string;
  nakshatra?: string;
  rashi?: string;
  manglik?: boolean;
}

export interface UserCulture {
  user_id: string;
  mother_tongue?: string;
  community_org?: string;
  cultural_events?: string[];
}

export interface UserPersonality {
  user_id: string;
  prompts?: PromptAnswer[];
  interests?: string[];
  voice_intro_url?: string;
  bio?: string;
  languages?: string[];
}

export interface PromptAnswer {
  prompt_id: string;
  prompt_text: string;
  answer: string;
}

export interface UserSettings {
  user_id: string;
  discovery_city?: string;
  age_range_min: number;
  age_range_max: number;
  intent_filter?: string;
  religion_filter?: string;
  height_range_min?: number;
  height_range_max?: number;
  gender_filter?: string;
  dietary_filter?: string;
  fluency_filter?: string;
  generation_filter?: string;
  gotra_filter?: string;
  education_filter?: string;
  smoking_filter?: string;
  drinking_filter?: string;
  exercise_filter?: string;
  wants_kids_filter?: string;
  show_in_discovery: boolean;
  incognito: boolean;
  snoozed_until?: string;
  notification_matches: boolean;
  notification_messages: boolean;
  notification_likes: boolean;
  notification_family: boolean;
  notification_family_suggestions: boolean;
  notification_chat_expiry: boolean;
  notification_profile_views: boolean;
  notification_daily_prompt: boolean;
  notification_new_features: boolean;
  notification_icebreakers: boolean;
  notification_match_expiry_4h: boolean;
  notification_match_expiry_12h: boolean;
  notification_match_expiry_24h: boolean;
  notification_weekly_summary: boolean;
  notification_cultural_tips: boolean;
  notification_safety_alerts: boolean;
  notification_voice_note: boolean;
  notification_photo_message: boolean;
  notification_read_receipts: boolean;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

export type KundliTier = 'Ideal' | 'Good' | 'Fair' | 'Low';

export interface CulturalBreakdown {
  fluency: number;
  religion: number;
  dietary: number;
  festivals: number;
  family_values: number;
  generation: number;
}

export interface KundliBreakdown {
  varna: number;
  vashya: number;
  tara: number;
  yoni: number;
  graha_maitri: number;
  gana: number;
  bhakut: number;
  nadi: number;
}

export interface FeedCard {
  user: User;
  photos: Photo[];
  basics?: UserBasics;
  sindhi?: UserSindhi;
  personality?: UserPersonality;
  cultural_score: number;
  cultural_badge: 'Excellent' | 'Good' | 'Fair';
  cultural_breakdown?: CulturalBreakdown;
  kundli_score?: number;
  kundli_tier?: KundliTier;
  kundli_breakdown?: KundliBreakdown;
  common_interests: string[];
  distance_km?: number;
  daily_prompt_answer?: string;
}

export interface Match {
  id: string;
  user: User;
  photos: Photo[];
  matched_at: string;
  last_message?: Message;
  unread_count: number;
  is_online: boolean;
  first_msg_by?: string;
  first_msg_locked: boolean;
  is_dissolved: boolean;
  extended_once: boolean;
  expires_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'gif' | 'icebreaker';
  read: boolean;
  created_at: string;
}

export interface Like {
  id: string;
  from_user: User;
  from_photos: Photo[];
  type: 'like' | 'pass';
  created_at: string;
}

export interface FamilyPermissions {
  can_view_profile: boolean;
  can_view_photos: boolean;
  can_view_basics: boolean;
  can_view_sindhi: boolean;
  can_view_matches: boolean;
  can_suggest: boolean;
  can_view_cultural_score: boolean;
  can_view_kundli: boolean;
}

export interface FamilyAccess {
  id: string;
  user: User;
  relationship: string;
  status: 'pending' | 'active' | 'revoked';
  permissions: FamilyPermissions;
  invite_code: string;
  joined_at?: string;
}

export interface FamilySuggestion {
  id: string;
  from_member: FamilyAccess;
  suggested_user: User;
  suggested_photos: Photo[];
  note?: string;
  status: 'pending' | 'liked' | 'passed' | 'saved';
  created_at: string;
}

export interface Icebreaker {
  id: string;
  text: string;
  category: string;
}

export interface City {
  name: string;
  country: string;
  display: string;
}
