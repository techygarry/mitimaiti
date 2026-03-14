export interface User {
  id: string;
  phone: string;
  first_name: string;
  date_of_birth: string;
  age: number;
  gender: 'man' | 'woman' | 'nonbinary';
  city: string;
  country: string;
  intent: 'casual' | 'open' | 'marriage';
  show_me: 'men' | 'women' | 'everyone';
  bio?: string;
  verified: boolean;
  premium: boolean;
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
  show_in_discovery: boolean;
  incognito: boolean;
  snoozed_until?: string;
  notification_matches: boolean;
  notification_messages: boolean;
  notification_likes: boolean;
  notification_family: boolean;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserPrivileges {
  user_id: string;
  plan: 'free' | 'premium' | 'premium_plus';
  daily_likes_remaining: number;
  daily_super_likes_remaining: number;
  weekly_comments_remaining: number;
  can_see_who_liked: boolean;
  can_use_advanced_filters: boolean;
  can_use_passport: boolean;
  can_use_incognito: boolean;
  can_use_read_receipts: boolean;
  rewinds_remaining: number;
}

export interface FeedCard {
  user: User;
  photos: Photo[];
  basics?: UserBasics;
  sindhi?: UserSindhi;
  personality?: UserPersonality;
  cultural_score: number;
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
  reply_deadline?: string;
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
  type: 'like' | 'super_like' | 'comment';
  comment?: string;
  created_at: string;
}

export interface FamilyAccess {
  id: string;
  user: User;
  relationship: string;
  status: 'pending' | 'active' | 'revoked';
  can_view_profile: boolean;
  can_view_matches: boolean;
  can_suggest: boolean;
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
