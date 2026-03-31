import { FeedCard, Match, Message, Like, Icebreaker, City, KundliTier, FamilyAccess, FamilySuggestion, User, Photo } from '@/types';

const avatarUrl = (seed: string) =>
  `https://i.pravatar.cc/400?u=${seed}`;

function getCulturalBadge(score: number): 'Excellent' | 'Good' | 'Fair' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Fair';
}

function getKundliTier(score: number): KundliTier {
  if (score >= 28) return 'Ideal';
  if (score >= 20) return 'Good';
  if (score >= 14) return 'Fair';
  return 'Low';
}

// ── CURRENT USER (matches iOS MockData.swift currentUser) ─────────────
export const currentUser: User = {
  id: 'current-user-id',
  phone: '+919876543200',
  first_name: 'You',
  last_name: 'Advani',
  show_full_name: false,
  date_of_birth: '2000-03-15',
  age: 26,
  gender: 'man',
  city: 'Mumbai',
  country: 'India',
  intent: 'marriage',
  show_me: 'women',
  bio: 'Building cool things and exploring the world. Proud Sindhi, love music and good food.',
  verified: true,
  profile_completeness: 72,
  created_at: '2025-01-01',
  updated_at: '2025-03-19',
};

export const currentUserPhotos: Photo[] = [
  { id: 'pcu1', user_id: 'current-user-id', url: avatarUrl('CurrentUser'), is_primary: true, order: 0, verified: true, created_at: '2025-01-01' },
  { id: 'pcu2', user_id: 'current-user-id', url: avatarUrl('CurrentUserB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-01' },
  { id: 'pcu3', user_id: 'current-user-id', url: avatarUrl('CurrentUserC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-01' },
];

export const mockProfiles: FeedCard[] = [
  // ── WOMEN ──────────────────────────────────────────────────────────
  {
    user: {
      id: '101',
      phone: '+919900100101',
      first_name: 'Tanya',
      last_name: 'Advani',
      show_full_name: true,
      date_of_birth: '1998-02-14',
      age: 28,
      gender: 'woman',
      city: 'Hyderabad',
      country: 'India',
      intent: 'marriage',
      show_me: 'men',
      bio: 'Pilot who flies planes and cooks dal pakwan at 30,000 feet (okay, not literally). Proud Sindhi girl who loves sunrise landings and sunset chai.',
      verified: true,
      profile_completeness: 92,
      created_at: '2025-02-01',
      updated_at: '2025-03-18',
    },
    photos: [
      { id: 'p101', user_id: '101', url: avatarUrl('Tanya'), is_primary: true, order: 0, verified: true, created_at: '2025-02-01' },
      { id: 'p101b', user_id: '101', url: avatarUrl('TanyaB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-01' },
      { id: 'p101c', user_id: '101', url: avatarUrl('TanyaC'), is_primary: false, order: 2, verified: false, created_at: '2025-02-01' },
    ],
    basics: { user_id: '101', height_cm: 168, education: 'B.Sc Aviation, Rajiv Gandhi Academy', work_title: 'Commercial Pilot', company: 'IndiGo Airlines', drinking: 'never', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'daily' },
    sindhi: { user_id: '101', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Advani', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti'], family_involvement: 'very_involved' },
    personality: { user_id: '101', prompts: [{ prompt_id: '1', prompt_text: 'A life goal of mine', answer: 'To captain a Boeing 777 and still make it home for Thadri dinner' }, { prompt_id: '2', prompt_text: 'My Sindhi superpower', answer: 'I bargain at duty-free shops in every country I land in' }], interests: ['Aviation', 'Travel', 'Cooking', 'Yoga', 'Photography'], bio: 'Pilot with Sindhi roots and sky-high dreams.', languages: ['Sindhi', 'Hindi', 'English', 'Telugu'] },
    cultural_score: 94, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 16, festivals: 16, family_values: 14, generation: 14 }, kundli_score: 30, kundli_tier: 'Ideal', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 4, graha_maitri: 5, gana: 6, bhakut: 5, nadi: 4 }, common_interests: ['Travel', 'Cooking', 'Photography'], distance_km: 8, daily_prompt_answer: 'Grateful for clear skies and a full stomach of sai bhaji',
  },
  {
    user: {
      id: '102',
      phone: '+919900100102',
      first_name: 'Isha',
      last_name: 'Motwani',
      date_of_birth: '2000-09-05',
      age: 25,
      gender: 'woman',
      city: 'Indore',
      country: 'India',
      intent: 'open',
      show_me: 'men',
      bio: 'Fashion designer stitching modern silhouettes with Ajrak prints. My nani taught me embroidery, my degree taught me the rest.',
      verified: false,
      profile_completeness: 72,
      created_at: '2025-02-15',
      updated_at: '2025-03-10',
    },
    photos: [
      { id: 'p102', user_id: '102', url: avatarUrl('Isha'), is_primary: true, order: 0, verified: false, created_at: '2025-02-15' },
      { id: 'p102b', user_id: '102', url: avatarUrl('IshaB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-15' },
    ],
    basics: { user_id: '102', height_cm: 161, education: 'B.Des, NIFT Mumbai', work_title: 'Fashion Designer', company: 'Self-employed', drinking: 'socially', smoking: 'never', wants_kids: 'open', settling_timeline: '3_5_years', exercise: 'sometimes' },
    sindhi: { user_id: '102', sindhi_fluency: 'conversational', religion: 'hindu', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Diwali', 'Navratri', 'Chaliha Sahib'], family_involvement: 'somewhat' },
    personality: { user_id: '102', prompts: [{ prompt_id: '1', prompt_text: 'Together we could', answer: 'Launch a Sindhi-fusion fashion label and take it to Milan' }, { prompt_id: '2', prompt_text: 'My idea of a perfect day', answer: 'Fabric shopping in Jodhpur markets, sketching at a cafe, and poha for dinner' }], interests: ['Fashion', 'Art', 'Travel', 'Coffee', 'Vintage Shopping'], bio: 'Designing the future of Sindhi fashion.', languages: ['Sindhi', 'Hindi', 'English'] },
    cultural_score: 74, cultural_badge: 'Good', cultural_breakdown: { fluency: 14, religion: 14, dietary: 14, festivals: 12, family_values: 12, generation: 8 }, kundli_score: 20, kundli_tier: 'Good', common_interests: ['Art', 'Travel', 'Coffee'], distance_km: 450,
  },
  {
    user: {
      id: '103',
      phone: '+919900100103',
      first_name: 'Roshni',
      last_name: 'Kirpalani',
      show_full_name: true,
      date_of_birth: '1997-12-22',
      age: 28,
      gender: 'woman',
      city: 'Toronto',
      country: 'Canada',
      intent: 'marriage',
      show_me: 'men',
      bio: 'Dentist by day, stand-up comedy open-mic-er by night. I fix smiles professionally and recreationally.',
      verified: true,
      profile_completeness: 88,
      created_at: '2025-01-20',
      updated_at: '2025-03-12',
    },
    photos: [
      { id: 'p103', user_id: '103', url: avatarUrl('Roshni'), is_primary: true, order: 0, verified: true, created_at: '2025-01-20' },
      { id: 'p103b', user_id: '103', url: avatarUrl('RoshniB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-20' },
      { id: 'p103c', user_id: '103', url: avatarUrl('RoshniC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-20' },
    ],
    basics: { user_id: '103', height_cm: 164, education: 'DDS, University of Toronto', work_title: 'Dentist', company: 'Smile Clinic Toronto', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'often' },
    sindhi: { user_id: '103', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Kirpalani', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti', 'Holi'], family_involvement: 'very_involved' },
    personality: { user_id: '103', prompts: [{ prompt_id: '1', prompt_text: 'We will get along if', answer: 'You laugh at my puns and let me check your teeth' }, { prompt_id: '2', prompt_text: 'My Sindhi superpower', answer: 'Making papad in a Canadian winter with zero complaints' }], interests: ['Comedy', 'Medicine', 'Cooking', 'Skiing', 'Netflix'], bio: 'Fixing smiles and cracking jokes since 1997.', languages: ['Sindhi', 'Hindi', 'English', 'French'] },
    cultural_score: 90, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 12, festivals: 16, family_values: 14, generation: 14 }, kundli_score: 26, kundli_tier: 'Good', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 3, graha_maitri: 5, gana: 4, bhakut: 4, nadi: 4 }, common_interests: ['Cooking', 'Comedy', 'Netflix'], distance_km: 11500,
  },
  {
    user: {
      id: '104',
      phone: '+919900100104',
      first_name: 'Diya',
      last_name: 'Samtani',
      date_of_birth: '1999-07-30',
      age: 26,
      gender: 'woman',
      city: 'Surat',
      country: 'India',
      intent: 'casual',
      show_me: 'men',
      bio: 'Textile engineer in the diamond city. I know more about fabrics than relationships, but I am willing to learn both.',
      verified: true,
      profile_completeness: 78,
      created_at: '2025-03-01',
      updated_at: '2025-03-17',
    },
    photos: [
      { id: 'p104', user_id: '104', url: avatarUrl('Diya'), is_primary: true, order: 0, verified: true, created_at: '2025-03-01' },
      { id: 'p104b', user_id: '104', url: avatarUrl('DiyaB'), is_primary: false, order: 1, verified: false, created_at: '2025-03-01' },
    ],
    basics: { user_id: '104', height_cm: 157, education: 'B.Tech Textile, SVNIT', work_title: 'Textile Engineer', company: 'Arvind Ltd', drinking: 'never', smoking: 'never', wants_kids: 'open', settling_timeline: 'not_sure', exercise: 'sometimes' },
    sindhi: { user_id: '104', sindhi_fluency: 'conversational', religion: 'hindu', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Diwali', 'Thadri'], family_involvement: 'somewhat' },
    personality: { user_id: '104', prompts: [{ prompt_id: '1', prompt_text: 'I geek out on', answer: 'Thread counts, loom mechanisms, and really good koki' }], interests: ['Textiles', 'Dancing', 'Food', 'Movies', 'Gardening'], bio: 'Engineer who weaves dreams.', languages: ['Sindhi', 'Hindi', 'English', 'Gujarati'] },
    cultural_score: 70, cultural_badge: 'Good', cultural_breakdown: { fluency: 14, religion: 14, dietary: 14, festivals: 10, family_values: 10, generation: 8 }, kundli_score: 18, kundli_tier: 'Fair', common_interests: ['Food', 'Dancing', 'Movies'], distance_km: 260,
  },
  {
    user: {
      id: '105',
      phone: '+919900100105',
      first_name: 'Anika',
      last_name: 'Mirchandani',
      date_of_birth: '1996-04-11',
      age: 29,
      gender: 'woman',
      city: 'Singapore',
      country: 'Singapore',
      intent: 'marriage',
      show_me: 'men',
      bio: 'Investment analyst crunching numbers and crushing dance floors. My portfolio is balanced, my life needs a partner to be complete.',
      verified: true,
      profile_completeness: 95,
      created_at: '2025-01-05',
      updated_at: '2025-03-19',
    },
    photos: [
      { id: 'p105', user_id: '105', url: avatarUrl('Anika'), is_primary: true, order: 0, verified: true, created_at: '2025-01-05' },
      { id: 'p105b', user_id: '105', url: avatarUrl('AnikaB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-05' },
      { id: 'p105c', user_id: '105', url: avatarUrl('AnikaC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-05' },
    ],
    basics: { user_id: '105', height_cm: 170, education: 'MBA Finance, NUS Singapore', work_title: 'Investment Analyst', company: 'Temasek Holdings', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: 'asap', exercise: 'daily' },
    sindhi: { user_id: '105', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Mirchandani', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti', 'Holi', 'Navratri'], family_involvement: 'very_involved' },
    personality: { user_id: '105', prompts: [{ prompt_id: '1', prompt_text: 'The key to my heart is', answer: 'Someone who reads the annual report AND calls their mom daily' }, { prompt_id: '2', prompt_text: 'My non-negotiable', answer: 'Ambition with humility. And good taste in biryani.' }], interests: ['Finance', 'Dancing', 'Travel', 'Fine Dining', 'Fitness'], bio: 'Balancing portfolios and life in Singapore.', languages: ['Sindhi', 'Hindi', 'English', 'Mandarin'] },
    cultural_score: 96, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 14, festivals: 18, family_values: 16, generation: 14 }, kundli_score: 32, kundli_tier: 'Ideal', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 4, graha_maitri: 5, gana: 6, bhakut: 6, nadi: 5 }, common_interests: ['Finance', 'Travel', 'Fitness'], distance_km: 3800,
  },
  // ── MEN ────────────────────────────────────────────────────────────
  {
    user: {
      id: '201',
      phone: '+919900200201',
      first_name: 'Sahil',
      last_name: 'Lalwani',
      show_full_name: true,
      date_of_birth: '1995-11-08',
      age: 30,
      gender: 'man',
      city: 'Bangalore',
      country: 'India',
      intent: 'marriage',
      show_me: 'women',
      bio: 'AI researcher building the future one model at a time. My dadi still thinks I fix computers. Looking for someone who gets both worlds.',
      verified: true,
      profile_completeness: 91,
      created_at: '2025-01-12',
      updated_at: '2025-03-16',
    },
    photos: [
      { id: 'p201', user_id: '201', url: avatarUrl('Sahil'), is_primary: true, order: 0, verified: true, created_at: '2025-01-12' },
      { id: 'p201b', user_id: '201', url: avatarUrl('SahilB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-12' },
    ],
    basics: { user_id: '201', height_cm: 180, education: 'M.Tech AI, IISc Bangalore', work_title: 'AI Research Scientist', company: 'Google DeepMind', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'daily' },
    sindhi: { user_id: '201', sindhi_fluency: 'conversational', religion: 'hindu', gotra: 'Lalwani', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Holi'], family_involvement: 'very_involved' },
    personality: { user_id: '201', prompts: [{ prompt_id: '1', prompt_text: 'I geek out on', answer: 'Neural networks, old Kishore Kumar songs, and my mom\'s koki recipe' }, { prompt_id: '2', prompt_text: 'My typical Sunday', answer: 'Long run, filter coffee, paper reading, and a call to nani in Jodhpur' }], interests: ['AI', 'Running', 'Music', 'Cricket', 'Cooking'], bio: 'AI researcher with Sindhi soul.', languages: ['Sindhi', 'Hindi', 'English', 'Kannada'] },
    cultural_score: 85, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 14, religion: 16, dietary: 12, festivals: 15, family_values: 16, generation: 12 }, kundli_score: 24, kundli_tier: 'Good', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 3, graha_maitri: 5, gana: 4, bhakut: 3, nadi: 3 }, common_interests: ['Music', 'Cooking', 'Running'], distance_km: 15,
  },
  {
    user: {
      id: '202',
      phone: '+919900200202',
      first_name: 'Dev',
      last_name: 'Wadhwani',
      date_of_birth: '1994-03-17',
      age: 32,
      gender: 'man',
      city: 'Dubai',
      country: 'UAE',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Architect designing skylines in the Gulf. Born in Ulhasnagar, raised in Dubai, heart still in Sindh. Building homes and looking for a home.',
      verified: true,
      profile_completeness: 96,
      created_at: '2025-01-08',
      updated_at: '2025-03-18',
    },
    photos: [
      { id: 'p202', user_id: '202', url: avatarUrl('Dev'), is_primary: true, order: 0, verified: true, created_at: '2025-01-08' },
      { id: 'p202b', user_id: '202', url: avatarUrl('DevB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-08' },
      { id: 'p202c', user_id: '202', url: avatarUrl('DevC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-08' },
    ],
    basics: { user_id: '202', height_cm: 183, education: 'M.Arch, Bartlett UCL London', work_title: 'Principal Architect', company: 'Foster + Partners', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: 'asap', exercise: 'often' },
    sindhi: { user_id: '202', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Wadhwani', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti', 'Holi', 'Thadri'], family_involvement: 'very_involved' },
    personality: { user_id: '202', prompts: [{ prompt_id: '1', prompt_text: 'The key to my heart is', answer: 'Someone who appreciates both a Zaha Hadid building and a plate of pav bhaji from a Sindhi uncle\'s stall' }, { prompt_id: '2', prompt_text: 'My Sindhi superpower', answer: 'I designed my cousin\'s wedding mandap and saved the family 40%' }], interests: ['Architecture', 'Cricket', 'Cars', 'Fine Dining', 'Travel'], bio: 'Building skylines in Dubai, roots in Sindh.', languages: ['Sindhi', 'Hindi', 'English', 'Arabic'] },
    cultural_score: 97, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 14, festivals: 17, family_values: 16, generation: 16 }, kundli_score: 30, kundli_tier: 'Ideal', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 4, graha_maitri: 5, gana: 6, bhakut: 5, nadi: 4 }, common_interests: ['Architecture', 'Travel', 'Fine Dining'], distance_km: 2100,
  },
  {
    user: {
      id: '203',
      phone: '+919900200203',
      first_name: 'Nikhil',
      last_name: 'Gehani',
      date_of_birth: '1997-08-25',
      age: 28,
      gender: 'man',
      city: 'Pune',
      country: 'India',
      intent: 'open',
      show_me: 'women',
      bio: 'Physiotherapist and marathon runner. I fix bodies for a living and break personal records for fun. My Sindhi is shaky but my deadlift is not.',
      verified: false,
      profile_completeness: 70,
      created_at: '2025-02-20',
      updated_at: '2025-03-14',
    },
    photos: [
      { id: 'p203', user_id: '203', url: avatarUrl('Nikhil'), is_primary: true, order: 0, verified: false, created_at: '2025-02-20' },
      { id: 'p203b', user_id: '203', url: avatarUrl('NikhilB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-20' },
    ],
    basics: { user_id: '203', height_cm: 177, education: 'BPT, Symbiosis Pune', work_title: 'Sports Physiotherapist', company: 'IPL Team Physio', drinking: 'never', smoking: 'never', wants_kids: 'open', settling_timeline: '3_5_years', exercise: 'daily' },
    sindhi: { user_id: '203', sindhi_fluency: 'basic', religion: 'hindu', generation: '2nd_gen', dietary: 'non_vegetarian', festivals: ['Diwali', 'Holi'], family_involvement: 'somewhat' },
    personality: { user_id: '203', prompts: [{ prompt_id: '1', prompt_text: 'My most controversial opinion', answer: 'Running is better than meditation. Fight me.' }], interests: ['Running', 'Fitness', 'Cricket', 'Hiking', 'Podcasts'], bio: 'Fixing athletes, running marathons.', languages: ['Hindi', 'English', 'Marathi'] },
    cultural_score: 52, cultural_badge: 'Fair', cultural_breakdown: { fluency: 6, religion: 14, dietary: 8, festivals: 8, family_values: 10, generation: 6 }, kundli_score: 16, kundli_tier: 'Fair', common_interests: ['Fitness', 'Running', 'Cricket'], distance_km: 150,
  },
  {
    user: {
      id: '204',
      phone: '+919900200204',
      first_name: 'Aryan',
      last_name: 'Chandiramani',
      show_full_name: true,
      date_of_birth: '1996-01-02',
      age: 30,
      gender: 'man',
      city: 'Mumbai',
      country: 'India',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Surgeon with steady hands and a restless soul. When I am not in the OR, you will find me at a jazz club or cooking elaborate Sindhi meals for friends.',
      verified: true,
      profile_completeness: 87,
      created_at: '2025-01-15',
      updated_at: '2025-03-17',
    },
    photos: [
      { id: 'p204', user_id: '204', url: avatarUrl('Aryan'), is_primary: true, order: 0, verified: true, created_at: '2025-01-15' },
      { id: 'p204b', user_id: '204', url: avatarUrl('AryanB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-15' },
      { id: 'p204c', user_id: '204', url: avatarUrl('AryanC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-15' },
    ],
    basics: { user_id: '204', height_cm: 179, education: 'MS Ortho, KEM Hospital', work_title: 'Orthopedic Surgeon', company: 'Hinduja Hospital', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'often' },
    sindhi: { user_id: '204', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Chandiramani', generation: 'sindhi_born', dietary: 'eggetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti'], family_involvement: 'very_involved' },
    personality: { user_id: '204', prompts: [{ prompt_id: '1', prompt_text: 'The best way to ask me out', answer: 'Tell me your favorite Sindhi dish and I will cook it for our first date' }, { prompt_id: '2', prompt_text: 'I am looking for', answer: 'Someone who can handle a surgeon\'s schedule and still want to dance at 11pm' }], interests: ['Medicine', 'Jazz', 'Cooking', 'Movies', 'Gym'], bio: 'Surgeon, cook, jazz lover.', languages: ['Sindhi', 'Hindi', 'English'] },
    cultural_score: 91, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 13, festivals: 16, family_values: 14, generation: 14 }, kundli_score: 28, kundli_tier: 'Ideal', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 4, graha_maitri: 5, gana: 6, bhakut: 4, nadi: 3 }, common_interests: ['Cooking', 'Movies', 'Gym'], distance_km: 6,
  },
  {
    user: {
      id: '205',
      phone: '+919900200205',
      first_name: 'Veer',
      last_name: 'Vaswani',
      date_of_birth: '1993-06-14',
      age: 32,
      gender: 'man',
      city: 'London',
      country: 'UK',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Barrister at law, weekend chef, full-time Sindhi. I argue for a living and cook to apologize. My tikka masala has won more hearts than my closing statements.',
      verified: true,
      profile_completeness: 93,
      created_at: '2025-01-02',
      updated_at: '2025-03-19',
    },
    photos: [
      { id: 'p205', user_id: '205', url: avatarUrl('Veer'), is_primary: true, order: 0, verified: true, created_at: '2025-01-02' },
      { id: 'p205b', user_id: '205', url: avatarUrl('VeerB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-02' },
    ],
    basics: { user_id: '205', height_cm: 185, education: 'LLM, King\'s College London', work_title: 'Barrister', company: 'Lincoln\'s Inn Chambers', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: 'asap', exercise: 'often' },
    sindhi: { user_id: '205', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Vaswani', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti', 'Thadri'], family_involvement: 'very_involved' },
    personality: { user_id: '205', prompts: [{ prompt_id: '1', prompt_text: 'A life goal of mine', answer: 'To argue a case at the Supreme Court and then fly home for mom\'s sai bhaji' }, { prompt_id: '2', prompt_text: 'My Sindhi superpower', answer: 'I can switch from Queen\'s English to fluent Sindhi mid-sentence without blinking' }], interests: ['Law', 'Cooking', 'Cricket', 'Reading', 'Travel'], bio: 'Barrister in London, Sindhi at heart.', languages: ['Sindhi', 'Hindi', 'English'] },
    cultural_score: 93, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 14, festivals: 17, family_values: 14, generation: 14 }, kundli_score: 29, kundli_tier: 'Ideal', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 4, graha_maitri: 5, gana: 6, bhakut: 5, nadi: 3 }, common_interests: ['Cooking', 'Cricket', 'Travel'], distance_km: 7100,
  },

  // ── NEW PROFILES (matching iOS MockData.swift) ─────────────────────

  // 11. Nisha — 27, Mumbai, Pediatrician, Hinduja Hospital
  {
    user: {
      id: '106',
      phone: '+919900100106',
      first_name: 'Nisha',
      last_name: 'Chhabria',
      show_full_name: true,
      date_of_birth: '1999-01-10',
      age: 27,
      gender: 'woman',
      city: 'Mumbai',
      country: 'India',
      intent: 'marriage',
      show_me: 'men',
      bio: 'Pediatrician who loves kids more than adulting. Marathon runner, amateur baker, and obsessed with sunset hikes.',
      verified: true,
      profile_completeness: 89,
      created_at: '2025-02-05',
      updated_at: '2025-03-19',
    },
    photos: [
      { id: 'p106', user_id: '106', url: avatarUrl('Nisha'), is_primary: true, order: 0, verified: true, created_at: '2025-02-05' },
      { id: 'p106b', user_id: '106', url: avatarUrl('NishaB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-05' },
      { id: 'p106c', user_id: '106', url: avatarUrl('NishaC'), is_primary: false, order: 2, verified: false, created_at: '2025-02-05' },
    ],
    basics: { user_id: '106', height_cm: 162, education: 'MBBS, Grant Medical College', work_title: 'Pediatrician', company: 'Hinduja Hospital', drinking: 'never', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'daily' },
    sindhi: { user_id: '106', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Chhabria', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti', 'Thadri'], family_involvement: 'very_involved' },
    personality: { user_id: '106', prompts: [{ prompt_id: '1', prompt_text: 'A life goal of mine', answer: 'To open a free pediatric clinic in Ulhasnagar and run the Mumbai Marathon under 4 hours' }, { prompt_id: '2', prompt_text: 'My Sindhi superpower', answer: 'I can diagnose a kid and calm their Sindhi maa in the same breath' }], interests: ['Fitness', 'Cooking', 'Hiking', 'Yoga', 'Volunteering'], bio: 'Healing kids, running marathons, baking on weekends.', languages: ['Sindhi', 'Hindi', 'English', 'Marathi'] },
    cultural_score: 92, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 16, festivals: 16, family_values: 14, generation: 12 }, kundli_score: 27, kundli_tier: 'Good', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 4, graha_maitri: 5, gana: 5, bhakut: 4, nadi: 3 }, common_interests: ['Fitness', 'Cooking', 'Hiking'], distance_km: 5,
  },

  // 12. Rohan — 29, Bangalore, Product Designer, Razorpay
  {
    user: {
      id: '206',
      phone: '+919900200206',
      first_name: 'Rohan',
      last_name: 'Bhatia',
      date_of_birth: '1997-05-22',
      age: 29,
      gender: 'man',
      city: 'Bangalore',
      country: 'India',
      intent: 'open',
      show_me: 'women',
      bio: 'Product designer at a startup. I sketch ideas on napkins, brew pour-over coffee, and debate whether pineapple goes on pizza.',
      verified: true,
      profile_completeness: 84,
      created_at: '2025-01-28',
      updated_at: '2025-03-15',
    },
    photos: [
      { id: 'p206', user_id: '206', url: avatarUrl('Rohan'), is_primary: true, order: 0, verified: true, created_at: '2025-01-28' },
      { id: 'p206b', user_id: '206', url: avatarUrl('RohanB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-28' },
    ],
    basics: { user_id: '206', height_cm: 176, education: 'MDes, IIT Bombay', work_title: 'Lead Product Designer', company: 'Razorpay', drinking: 'socially', smoking: 'never', wants_kids: 'open', settling_timeline: '3_5_years', exercise: 'sometimes' },
    sindhi: { user_id: '206', sindhi_fluency: 'conversational', religion: 'hindu', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Diwali', 'Holi', 'Chaliha Sahib'], family_involvement: 'somewhat' },
    personality: { user_id: '206', prompts: [{ prompt_id: '1', prompt_text: 'I geek out on', answer: 'Typography, design systems, and the perfect pour-over ratio' }, { prompt_id: '2', prompt_text: 'My typical Sunday', answer: 'Farmers market, sketch session at a cafe, and calling mom for her koki recipe I still cannot nail' }], interests: ['Art', 'Coffee', 'Tech', 'Photography', 'Cycling'], bio: 'Designing products, sketching dreams.', languages: ['Sindhi', 'Hindi', 'English', 'Kannada'] },
    cultural_score: 72, cultural_badge: 'Good', cultural_breakdown: { fluency: 14, religion: 14, dietary: 10, festivals: 12, family_values: 12, generation: 10 }, kundli_score: 21, kundli_tier: 'Good', common_interests: ['Art', 'Coffee', 'Photography'], distance_km: 12,
  },

  // 13. Prerna — 24, Ahmedabad, CA, Deloitte
  {
    user: {
      id: '107',
      phone: '+919900100107',
      first_name: 'Prerna',
      last_name: 'Jethwani',
      date_of_birth: '2002-03-08',
      age: 24,
      gender: 'woman',
      city: 'Ahmedabad',
      country: 'India',
      intent: 'open',
      show_me: 'men',
      bio: 'CA by day, open mic poet by night. My spreadsheets are as balanced as my chai. Looking for someone who gets both sides.',
      verified: true,
      profile_completeness: 81,
      created_at: '2025-02-10',
      updated_at: '2025-03-16',
    },
    photos: [
      { id: 'p107', user_id: '107', url: avatarUrl('Prerna'), is_primary: true, order: 0, verified: true, created_at: '2025-02-10' },
      { id: 'p107b', user_id: '107', url: avatarUrl('PrernaB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-10' },
    ],
    basics: { user_id: '107', height_cm: 160, education: 'BCom, HL College + CA', work_title: 'Chartered Accountant', company: 'Deloitte', drinking: 'never', smoking: 'never', wants_kids: 'open', settling_timeline: '3_5_years', exercise: 'sometimes' },
    sindhi: { user_id: '107', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Jethwani', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Diwali', 'Navratri', 'Chaliha Sahib', 'Thadri'], family_involvement: 'very_involved' },
    personality: { user_id: '107', prompts: [{ prompt_id: '1', prompt_text: 'Together we could', answer: 'Write poetry about balance sheets and still make it romantic' }, { prompt_id: '2', prompt_text: 'My Sindhi superpower', answer: 'I calculated the ROI of every family wedding before anyone asked' }], interests: ['Writing', 'Coffee', 'Theatre', 'Bollywood', 'Travel'], bio: 'Numbers by day, words by night.', languages: ['Sindhi', 'Hindi', 'English', 'Gujarati'] },
    cultural_score: 88, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 14, festivals: 14, family_values: 14, generation: 12 }, kundli_score: 23, kundli_tier: 'Good', common_interests: ['Writing', 'Coffee', 'Travel'], distance_km: 530,
  },

  // 14. Arjun — 31, Dubai, Real Estate Developer, Emaar
  {
    user: {
      id: '207',
      phone: '+919900200207',
      first_name: 'Arjun',
      last_name: 'Keswani',
      show_full_name: true,
      date_of_birth: '1995-09-18',
      age: 31,
      gender: 'man',
      city: 'Dubai',
      country: 'UAE',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Real estate developer building communities. Weekend golfer, vinyl collector. The guy who always picks the restaurant.',
      verified: true,
      profile_completeness: 90,
      created_at: '2025-01-18',
      updated_at: '2025-03-18',
    },
    photos: [
      { id: 'p207', user_id: '207', url: avatarUrl('Arjun'), is_primary: true, order: 0, verified: true, created_at: '2025-01-18' },
      { id: 'p207b', user_id: '207', url: avatarUrl('ArjunB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-18' },
      { id: 'p207c', user_id: '207', url: avatarUrl('ArjunC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-18' },
    ],
    basics: { user_id: '207', height_cm: 181, education: 'MBA, ISB Hyderabad', work_title: 'Development Manager', company: 'Emaar Properties', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'often' },
    sindhi: { user_id: '207', sindhi_fluency: 'basic', religion: 'hindu', generation: '2nd_gen', dietary: 'non_vegetarian', festivals: ['Diwali', 'Holi'], family_involvement: 'somewhat' },
    personality: { user_id: '207', prompts: [{ prompt_id: '1', prompt_text: 'The key to my heart is', answer: 'Someone who can keep up on the golf course and at a family gathering' }, { prompt_id: '2', prompt_text: 'My most controversial opinion', answer: 'Dubai biryani is better than Hyderabad biryani. I said it.' }], interests: ['Travel', 'Food', 'Cricket', 'Music', 'Fashion'], bio: 'Building communities in the Gulf.', languages: ['Hindi', 'English', 'Arabic'] },
    cultural_score: 62, cultural_badge: 'Good', cultural_breakdown: { fluency: 8, religion: 14, dietary: 10, festivals: 10, family_values: 12, generation: 8 }, kundli_score: 19, kundli_tier: 'Fair', common_interests: ['Travel', 'Food', 'Cricket'], distance_km: 2100,
  },

  // 15. Meera — 26, Chennai, Climate Scientist, NIOT
  {
    user: {
      id: '108',
      phone: '+919900100108',
      first_name: 'Meera',
      last_name: 'Daswani',
      date_of_birth: '2000-06-15',
      age: 26,
      gender: 'woman',
      city: 'Chennai',
      country: 'India',
      intent: 'marriage',
      show_me: 'men',
      bio: 'Climate scientist working on ocean conservation. Scuba diver, vegan cook, and firm believer that small acts change the world.',
      verified: true,
      profile_completeness: 86,
      created_at: '2025-02-12',
      updated_at: '2025-03-17',
    },
    photos: [
      { id: 'p108', user_id: '108', url: avatarUrl('Meera'), is_primary: true, order: 0, verified: true, created_at: '2025-02-12' },
      { id: 'p108b', user_id: '108', url: avatarUrl('MeeraB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-12' },
    ],
    basics: { user_id: '108', height_cm: 165, education: 'MSc Environmental Science, IISc', work_title: 'Research Fellow', company: 'NIOT Chennai', drinking: 'never', smoking: 'never', wants_kids: 'open', settling_timeline: '3_5_years', exercise: 'often' },
    sindhi: { user_id: '108', sindhi_fluency: 'learning', religion: 'hindu', generation: '2nd_gen', dietary: 'vegan', festivals: ['Diwali', 'Jhulelal Jayanti'], family_involvement: 'somewhat' },
    personality: { user_id: '108', prompts: [{ prompt_id: '1', prompt_text: 'A life goal of mine', answer: 'To help restore coral reefs in the Indian Ocean and teach my future kids about Jhulelal and the sea' }, { prompt_id: '2', prompt_text: 'I geek out on', answer: 'Ocean currents, marine biology papers, and sustainable Sindhi recipes' }], interests: ['Swimming', 'Volunteering', 'Photography', 'Cooking', 'Reading'], bio: 'Saving oceans, one dive at a time.', languages: ['Hindi', 'English', 'Tamil'] },
    cultural_score: 64, cultural_badge: 'Good', cultural_breakdown: { fluency: 8, religion: 14, dietary: 12, festivals: 10, family_values: 12, generation: 8 }, kundli_score: 20, kundli_tier: 'Good', common_interests: ['Photography', 'Cooking', 'Reading'], distance_km: 1300,
  },

  // 16. Karan — 28, New York, Investment Banker, Goldman Sachs
  {
    user: {
      id: '208',
      phone: '+919900200208',
      first_name: 'Karan',
      last_name: 'Tolani',
      show_full_name: true,
      date_of_birth: '1998-02-28',
      age: 28,
      gender: 'man',
      city: 'New York',
      country: 'USA',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Investment banker who trades stocks by day and guitar chords by night. Homesick for mom\'s dal but NYC has its own magic.',
      verified: true,
      profile_completeness: 88,
      created_at: '2025-01-22',
      updated_at: '2025-03-18',
    },
    photos: [
      { id: 'p208', user_id: '208', url: avatarUrl('Karan'), is_primary: true, order: 0, verified: true, created_at: '2025-01-22' },
      { id: 'p208b', user_id: '208', url: avatarUrl('KaranB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-22' },
      { id: 'p208c', user_id: '208', url: avatarUrl('KaranC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-22' },
    ],
    basics: { user_id: '208', height_cm: 178, education: 'BSc Econ, Wharton', work_title: 'Associate', company: 'Goldman Sachs', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'daily' },
    sindhi: { user_id: '208', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Tolani', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti', 'Holi'], family_involvement: 'very_involved' },
    personality: { user_id: '208', prompts: [{ prompt_id: '1', prompt_text: 'My Sindhi superpower', answer: 'Finding Sindhi uncles in every Wall Street firm within a week of joining' }, { prompt_id: '2', prompt_text: 'The key to my heart is', answer: 'Someone who gets that a 2am work call and a 7am temple visit can coexist' }], interests: ['Music', 'Fitness', 'Travel', 'Food', 'Tech'], bio: 'Wall Street by day, guitar by night.', languages: ['Sindhi', 'Hindi', 'English'] },
    cultural_score: 89, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 12, festivals: 15, family_values: 14, generation: 14 }, kundli_score: 25, kundli_tier: 'Good', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 3, graha_maitri: 5, gana: 4, bhakut: 4, nadi: 3 }, common_interests: ['Music', 'Fitness', 'Travel'], distance_km: 12500,
  },

  // 17. Diya (Pune) — 25, UX Researcher, Google
  {
    user: {
      id: '109',
      phone: '+919900100109',
      first_name: 'Diya',
      last_name: 'Vaswani',
      date_of_birth: '2001-04-20',
      age: 25,
      gender: 'woman',
      city: 'Pune',
      country: 'India',
      intent: 'open',
      show_me: 'men',
      bio: 'UX researcher who asks too many questions for a living. Cat mom to two rescues. Will judge you lovingly by your bookshelf.',
      verified: true,
      profile_completeness: 83,
      created_at: '2025-02-08',
      updated_at: '2025-03-16',
    },
    photos: [
      { id: 'p109', user_id: '109', url: avatarUrl('DiyaP'), is_primary: true, order: 0, verified: true, created_at: '2025-02-08' },
      { id: 'p109b', user_id: '109', url: avatarUrl('DiyaPB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-08' },
    ],
    basics: { user_id: '109', height_cm: 163, education: 'MA Psychology, TISS', work_title: 'Senior UX Researcher', company: 'Google', drinking: 'socially', smoking: 'never', wants_kids: 'open', settling_timeline: 'not_sure', exercise: 'sometimes' },
    sindhi: { user_id: '109', sindhi_fluency: 'conversational', religion: 'hindu', gotra: 'Vaswani', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Diwali', 'Chaliha Sahib', 'Navratri'], family_involvement: 'somewhat' },
    personality: { user_id: '109', prompts: [{ prompt_id: '1', prompt_text: 'We will get along if', answer: 'You have a bookshelf that is not just for decoration and a cat that approves of you' }, { prompt_id: '2', prompt_text: 'My idea of a perfect day', answer: 'Usability testing in the morning, bookshop browsing, and mom\'s sai bhaji for dinner' }], interests: ['Reading', 'Coffee', 'Art', 'Movies', 'Meditation'], bio: 'Researching humans, befriending cats.', languages: ['Sindhi', 'Hindi', 'English', 'Marathi'] },
    cultural_score: 76, cultural_badge: 'Good', cultural_breakdown: { fluency: 14, religion: 14, dietary: 14, festivals: 12, family_values: 12, generation: 10 }, kundli_score: 22, kundli_tier: 'Good', common_interests: ['Reading', 'Coffee', 'Art'], distance_km: 150,
  },

  // 18. Sahil (London) — 30, Quant Analyst, Citadel
  {
    user: {
      id: '209',
      phone: '+919900200209',
      first_name: 'Sahil',
      last_name: 'Somani',
      date_of_birth: '1996-07-12',
      age: 30,
      gender: 'man',
      city: 'London',
      country: 'UK',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Hedge fund quant who speaks Python better than English. Weekend potter, terrible singer, excellent listener. Chai snob.',
      verified: true,
      profile_completeness: 91,
      created_at: '2025-01-10',
      updated_at: '2025-03-19',
    },
    photos: [
      { id: 'p209', user_id: '209', url: avatarUrl('SahilL'), is_primary: true, order: 0, verified: true, created_at: '2025-01-10' },
      { id: 'p209b', user_id: '209', url: avatarUrl('SahilLB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-10' },
      { id: 'p209c', user_id: '209', url: avatarUrl('SahilLC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-10' },
    ],
    basics: { user_id: '209', height_cm: 175, education: 'MFE, Oxford', work_title: 'Quantitative Analyst', company: 'Citadel', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'often' },
    sindhi: { user_id: '209', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Somani', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Jhulelal Jayanti', 'Thadri'], family_involvement: 'very_involved' },
    personality: { user_id: '209', prompts: [{ prompt_id: '1', prompt_text: 'My Sindhi superpower', answer: 'I can price a derivative and negotiate at Chor Bazaar with equal precision' }, { prompt_id: '2', prompt_text: 'My non-negotiable', answer: 'Sunday video call with the family. Non-negotiable. Even if the markets are crashing.' }], interests: ['Tech', 'Art', 'Music', 'Cricket', 'Cooking'], bio: 'Quant by trade, potter on weekends.', languages: ['Sindhi', 'Hindi', 'English'] },
    cultural_score: 91, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 14, festivals: 15, family_values: 14, generation: 14 }, kundli_score: 26, kundli_tier: 'Good', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 3, graha_maitri: 5, gana: 4, bhakut: 5, nadi: 3 }, common_interests: ['Music', 'Cricket', 'Cooking'], distance_km: 7100,
  },

  // 19. Ira — 23, Delhi, Fashion Designer, NIFT
  {
    user: {
      id: '110',
      phone: '+919900100110',
      first_name: 'Ira',
      last_name: 'Murjani',
      date_of_birth: '2003-08-01',
      age: 23,
      gender: 'woman',
      city: 'Delhi',
      country: 'India',
      intent: 'casual',
      show_me: 'men',
      bio: 'Fashion design student with a thing for sustainable textiles. My Instagram is 90% fabric swatches and 10% street food.',
      verified: false,
      profile_completeness: 74,
      created_at: '2025-03-01',
      updated_at: '2025-03-18',
    },
    photos: [
      { id: 'p110', user_id: '110', url: avatarUrl('Ira'), is_primary: true, order: 0, verified: false, created_at: '2025-03-01' },
      { id: 'p110b', user_id: '110', url: avatarUrl('IraB'), is_primary: false, order: 1, verified: false, created_at: '2025-03-01' },
    ],
    basics: { user_id: '110', height_cm: 158, education: 'BDes Fashion, NIFT', work_title: 'Fashion Designer', company: 'NIFT Delhi', drinking: 'socially', smoking: 'never', wants_kids: 'open', settling_timeline: 'not_sure', exercise: 'sometimes' },
    sindhi: { user_id: '110', sindhi_fluency: 'fluent', religion: 'hindu', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Diwali', 'Navratri', 'Chaliha Sahib'], family_involvement: 'somewhat' },
    personality: { user_id: '110', prompts: [{ prompt_id: '1', prompt_text: 'I geek out on', answer: 'Sustainable textiles, Ajrak block printing, and Chandni Chowk street food at midnight' }, { prompt_id: '2', prompt_text: 'Together we could', answer: 'Launch a Sindhi-heritage fashion label that makes it to Lakme Fashion Week' }], interests: ['Fashion', 'Art', 'Photography', 'Travel', 'Dancing'], bio: 'Sustainable fashion, Sindhi roots.', languages: ['Sindhi', 'Hindi', 'English'] },
    cultural_score: 78, cultural_badge: 'Good', cultural_breakdown: { fluency: 18, religion: 14, dietary: 14, festivals: 12, family_values: 10, generation: 10 }, kundli_score: 19, kundli_tier: 'Fair', common_interests: ['Art', 'Photography', 'Travel'], distance_km: 1400,
  },

  // 20. Dev (Singapore) — 27, Data Scientist, Grab
  {
    user: {
      id: '210',
      phone: '+919900200210',
      first_name: 'Dev',
      last_name: 'Hiranandani',
      date_of_birth: '1999-11-05',
      age: 27,
      gender: 'man',
      city: 'Singapore',
      country: 'Singapore',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Data scientist who found patterns in everything except love. Triathlon finisher, amateur chef, professional overthinker.',
      verified: true,
      profile_completeness: 85,
      created_at: '2025-02-01',
      updated_at: '2025-03-17',
    },
    photos: [
      { id: 'p210', user_id: '210', url: avatarUrl('DevS'), is_primary: true, order: 0, verified: true, created_at: '2025-02-01' },
      { id: 'p210b', user_id: '210', url: avatarUrl('DevSB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-01' },
    ],
    basics: { user_id: '210', height_cm: 174, education: 'MS Analytics, NUS', work_title: 'Senior Data Scientist', company: 'Grab', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'daily' },
    sindhi: { user_id: '210', sindhi_fluency: 'basic', religion: 'hindu', generation: '2nd_gen', dietary: 'non_vegetarian', festivals: ['Diwali', 'Holi'], family_involvement: 'somewhat' },
    personality: { user_id: '210', prompts: [{ prompt_id: '1', prompt_text: 'My most controversial opinion', answer: 'Machine learning cannot predict love, and I have the failed models to prove it' }, { prompt_id: '2', prompt_text: 'My typical Sunday', answer: 'Morning swim, hawker centre brunch, code side project, and video call the family in Mumbai' }], interests: ['Fitness', 'Cooking', 'Tech', 'Swimming', 'Cycling'], bio: 'Finding patterns, seeking connection.', languages: ['Hindi', 'English', 'Mandarin'] },
    cultural_score: 58, cultural_badge: 'Fair', cultural_breakdown: { fluency: 8, religion: 14, dietary: 10, festivals: 8, family_values: 10, generation: 8 }, kundli_score: 17, kundli_tier: 'Fair', common_interests: ['Fitness', 'Cooking', 'Tech'], distance_km: 3800,
  },

  // ── 5 MORE to reach 25 ────────────────────────────────────────────

  // 21. Anvi — 26, Jaipur, Textile Designer
  {
    user: {
      id: '111',
      phone: '+919900100111',
      first_name: 'Anvi',
      last_name: 'Lakhani',
      date_of_birth: '2000-02-14',
      age: 26,
      gender: 'woman',
      city: 'Jaipur',
      country: 'India',
      intent: 'open',
      show_me: 'men',
      bio: 'Textile designer preserving Sindhi craft traditions in modern fashion. My ajrak collection has its own room.',
      verified: true,
      profile_completeness: 82,
      created_at: '2025-02-18',
      updated_at: '2025-03-17',
    },
    photos: [
      { id: 'p111', user_id: '111', url: avatarUrl('Anvi'), is_primary: true, order: 0, verified: true, created_at: '2025-02-18' },
      { id: 'p111b', user_id: '111', url: avatarUrl('AnviB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-18' },
    ],
    basics: { user_id: '111', height_cm: 159, education: 'NID Ahmedabad', work_title: 'Textile Designer', company: 'Anvi Weaves', drinking: 'never', smoking: 'never', wants_kids: 'open', settling_timeline: '3_5_years', exercise: 'sometimes' },
    sindhi: { user_id: '111', sindhi_fluency: 'fluent', religion: 'hindu', gotra: 'Lakhani', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Diwali', 'Chaliha Sahib', 'Thadri', 'Jhulelal Jayanti'], family_involvement: 'very_involved' },
    personality: { user_id: '111', prompts: [{ prompt_id: '1', prompt_text: 'My Sindhi superpower', answer: 'I can tell if an ajrak is authentic from ten feet away' }, { prompt_id: '2', prompt_text: 'A life goal of mine', answer: 'To put Sindhi textile art on the global fashion map' }], interests: ['Fashion', 'Art', 'Travel', 'Photography', 'Music'], bio: 'Weaving Sindhi heritage into modern design.', languages: ['Sindhi', 'Hindi', 'English', 'Marwari'] },
    cultural_score: 90, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 18, religion: 16, dietary: 14, festivals: 16, family_values: 14, generation: 12 }, kundli_score: 24, kundli_tier: 'Good', common_interests: ['Art', 'Travel', 'Photography'], distance_km: 1100,
  },

  // 22. Yash — 32, Melbourne, Dentist
  {
    user: {
      id: '211',
      phone: '+919900200211',
      first_name: 'Yash',
      last_name: 'Mirpuri',
      show_full_name: true,
      date_of_birth: '1994-04-10',
      age: 32,
      gender: 'man',
      city: 'Melbourne',
      country: 'Australia',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Dentist who makes people smile — literally. Weekend surfer and terrible pun maker. Looking for someone who laughs at bad jokes.',
      verified: true,
      profile_completeness: 87,
      created_at: '2025-01-14',
      updated_at: '2025-03-16',
    },
    photos: [
      { id: 'p211', user_id: '211', url: avatarUrl('Yash'), is_primary: true, order: 0, verified: true, created_at: '2025-01-14' },
      { id: 'p211b', user_id: '211', url: avatarUrl('YashB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-14' },
    ],
    basics: { user_id: '211', height_cm: 182, education: 'BDS, Manipal + MDS Melbourne', work_title: 'Dentist', company: 'SmileCraft Dental', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'daily' },
    sindhi: { user_id: '211', sindhi_fluency: 'conversational', religion: 'hindu', gotra: 'Mirpuri', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Diwali', 'Holi', 'Chaliha Sahib'], family_involvement: 'very_involved' },
    personality: { user_id: '211', prompts: [{ prompt_id: '1', prompt_text: 'We will get along if', answer: 'You appreciate dental puns and don\'t mind sand in the car from weekend surf trips' }, { prompt_id: '2', prompt_text: 'My typical Sunday', answer: 'Dawn patrol surf, brunch at a cafe, then FaceTime with mom arguing about when I am coming home' }], interests: ['Fitness', 'Travel', 'Cooking', 'Swimming', 'Movies'], bio: 'Making smiles in Melbourne.', languages: ['Sindhi', 'Hindi', 'English'] },
    cultural_score: 80, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 14, religion: 16, dietary: 12, festivals: 12, family_values: 14, generation: 12 }, kundli_score: 23, kundli_tier: 'Good', common_interests: ['Fitness', 'Travel', 'Cooking'], distance_km: 10200,
  },

  // 23. Riya — 25, Kolkata, Kathak Dancer
  {
    user: {
      id: '112',
      phone: '+919900100112',
      first_name: 'Riya',
      last_name: 'Gidwani',
      date_of_birth: '2001-01-30',
      age: 25,
      gender: 'woman',
      city: 'Kolkata',
      country: 'India',
      intent: 'open',
      show_me: 'men',
      bio: 'Classical Kathak dancer turned contemporary choreographer. I express through movement what words can\'t say.',
      verified: true,
      profile_completeness: 79,
      created_at: '2025-02-22',
      updated_at: '2025-03-15',
    },
    photos: [
      { id: 'p112', user_id: '112', url: avatarUrl('Riya'), is_primary: true, order: 0, verified: true, created_at: '2025-02-22' },
      { id: 'p112b', user_id: '112', url: avatarUrl('RiyaB'), is_primary: false, order: 1, verified: false, created_at: '2025-02-22' },
    ],
    basics: { user_id: '112', height_cm: 166, education: 'MA Performing Arts', work_title: 'Choreographer', company: 'Nritya Academy', drinking: 'never', smoking: 'never', wants_kids: 'open', settling_timeline: 'not_sure', exercise: 'daily' },
    sindhi: { user_id: '112', sindhi_fluency: 'conversational', religion: 'hindu', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Diwali', 'Navratri', 'Chaliha Sahib'], family_involvement: 'somewhat' },
    personality: { user_id: '112', prompts: [{ prompt_id: '1', prompt_text: 'The key to my heart is', answer: 'Someone who can sit through a 3-hour Kathak recital and still want to take me dancing after' }, { prompt_id: '2', prompt_text: 'My simple pleasures', answer: 'Ghungroo practice at dawn, mom\'s sindhi curry for lunch, and stargazing on the terrace' }], interests: ['Dancing', 'Music', 'Yoga', 'Art', 'Meditation'], bio: 'Dancing through life with grace.', languages: ['Sindhi', 'Hindi', 'English', 'Bengali'] },
    cultural_score: 77, cultural_badge: 'Good', cultural_breakdown: { fluency: 14, religion: 14, dietary: 14, festivals: 12, family_values: 12, generation: 11 }, kundli_score: 21, kundli_tier: 'Good', common_interests: ['Music', 'Art', 'Yoga'], distance_km: 1900,
  },

  // 24. Dhruv — 29, San Francisco, Staff Engineer
  {
    user: {
      id: '212',
      phone: '+919900200212',
      first_name: 'Dhruv',
      last_name: 'Nagrani',
      date_of_birth: '1997-10-03',
      age: 29,
      gender: 'man',
      city: 'San Francisco',
      country: 'USA',
      intent: 'marriage',
      show_me: 'women',
      bio: 'Staff engineer at a Big Tech company. Weekend trail runner and home barista. Mastered mom\'s koki recipe — taste test available.',
      verified: true,
      profile_completeness: 90,
      created_at: '2025-01-25',
      updated_at: '2025-03-18',
    },
    photos: [
      { id: 'p212', user_id: '212', url: avatarUrl('Dhruv'), is_primary: true, order: 0, verified: true, created_at: '2025-01-25' },
      { id: 'p212b', user_id: '212', url: avatarUrl('DhruvB'), is_primary: false, order: 1, verified: false, created_at: '2025-01-25' },
      { id: 'p212c', user_id: '212', url: avatarUrl('DhruvC'), is_primary: false, order: 2, verified: false, created_at: '2025-01-25' },
    ],
    basics: { user_id: '212', height_cm: 180, education: 'MS CS, CMU', work_title: 'Staff Engineer', company: 'Meta', drinking: 'socially', smoking: 'never', wants_kids: 'want', settling_timeline: '1_2_years', exercise: 'daily' },
    sindhi: { user_id: '212', sindhi_fluency: 'conversational', religion: 'hindu', gotra: 'Nagrani', generation: 'sindhi_born', dietary: 'non_vegetarian', festivals: ['Chaliha Sahib', 'Diwali', 'Holi'], family_involvement: 'very_involved' },
    personality: { user_id: '212', prompts: [{ prompt_id: '1', prompt_text: 'My Sindhi superpower', answer: 'I finally nailed mom\'s koki recipe after 47 failed attempts. The secret? Call her mid-cooking.' }, { prompt_id: '2', prompt_text: 'I am looking for', answer: 'Someone who can debug my code AND my life choices with equal patience' }], interests: ['Tech', 'Cooking', 'Hiking', 'Photography', 'Coffee'], bio: 'Building tech, running trails, perfecting koki.', languages: ['Sindhi', 'Hindi', 'English'] },
    cultural_score: 82, cultural_badge: 'Excellent', cultural_breakdown: { fluency: 14, religion: 16, dietary: 12, festivals: 14, family_values: 14, generation: 12 }, kundli_score: 24, kundli_tier: 'Good', kundli_breakdown: { varna: 1, vashya: 2, tara: 3, yoni: 3, graha_maitri: 5, gana: 4, bhakut: 3, nadi: 3 }, common_interests: ['Tech', 'Cooking', 'Hiking'], distance_km: 13800,
  },

  // 25. Kiara — 23, Ahmedabad, Law Student
  {
    user: {
      id: '113',
      phone: '+919900100113',
      first_name: 'Kiara',
      last_name: 'Bulchandani',
      date_of_birth: '2003-05-22',
      age: 23,
      gender: 'woman',
      city: 'Ahmedabad',
      country: 'India',
      intent: 'casual',
      show_me: 'men',
      bio: 'Final year law student and moot court champion. Part-time garba instructor. Full-time believer in finding your person.',
      verified: true,
      profile_completeness: 76,
      created_at: '2025-03-05',
      updated_at: '2025-03-18',
    },
    photos: [
      { id: 'p113', user_id: '113', url: avatarUrl('Kiara'), is_primary: true, order: 0, verified: true, created_at: '2025-03-05' },
      { id: 'p113b', user_id: '113', url: avatarUrl('KiaraB'), is_primary: false, order: 1, verified: false, created_at: '2025-03-05' },
    ],
    basics: { user_id: '113', height_cm: 164, education: 'BA LLB (Hons), NLU Ahmedabad', work_title: 'Law Student', company: 'NLU Ahmedabad', drinking: 'never', smoking: 'never', wants_kids: 'open', settling_timeline: 'not_sure', exercise: 'often' },
    sindhi: { user_id: '113', sindhi_fluency: 'conversational', religion: 'hindu', generation: 'sindhi_born', dietary: 'vegetarian', festivals: ['Diwali', 'Navratri', 'Chaliha Sahib'], family_involvement: 'somewhat' },
    personality: { user_id: '113', prompts: [{ prompt_id: '1', prompt_text: 'My most controversial opinion', answer: 'Garba is better cardio than any gym workout. I will argue this in court.' }, { prompt_id: '2', prompt_text: 'My Sindhi superpower', answer: 'I can recite the Indian Constitution AND my nani\'s dal pakwan recipe from memory' }], interests: ['Dancing', 'Reading', 'Volunteering', 'Theatre', 'Coffee'], bio: 'Moot court queen, garba enthusiast.', languages: ['Sindhi', 'Hindi', 'English', 'Gujarati'] },
    cultural_score: 75, cultural_badge: 'Good', cultural_breakdown: { fluency: 14, religion: 14, dietary: 14, festivals: 12, family_values: 11, generation: 10 }, kundli_score: 20, kundli_tier: 'Good', common_interests: ['Dancing', 'Reading', 'Coffee'], distance_km: 530,
  },
];

const futureDate = (hoursFromNow: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d.toISOString();
};

// ── MATCHES (all 5 states from iOS) ─────────────────────────────────
export const mockMatches: Match[] = [
  // State 1: AWAITING FIRST MESSAGE — No one has sent anything. 24h timer ticking.
  {
    id: 'm1',
    user: mockProfiles[0].user,  // Tanya (woman)
    photos: mockProfiles[0].photos,
    matched_at: futureDate(-2), // matched 2 hours ago
    unread_count: 0, is_online: true, first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(22),
    status: 'pending_first_message',
  },
  // State 2: LOCKED — I sent first message, waiting for their reply. Input disabled for me.
  {
    id: 'm2',
    user: mockProfiles[5].user,  // Sahil Lalwani (man)
    photos: mockProfiles[5].photos,
    matched_at: futureDate(-10), // matched 10 hours ago
    last_message: { id: 'msg2', match_id: 'm2', sender_id: 'me', content: 'Your AI research sounds fascinating! Do you work on LLMs?', type: 'text', read: true, status: 'delivered', created_at: futureDate(-8) },
    unread_count: 0, is_online: false, first_msg_by: 'me', first_msg_locked: true, is_dissolved: false, extended_once: false, expires_at: futureDate(14),
    status: 'pending_first_message',
  },
  // State 3: AWAITING FIRST MESSAGE — No messages, 24h timer running
  {
    id: 'm3',
    user: mockProfiles[2].user,  // Roshni (woman)
    photos: mockProfiles[2].photos,
    matched_at: futureDate(-6), // matched 6 hours ago
    unread_count: 0, is_online: true, first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(18),
    status: 'pending_first_message',
  },
  // State 4: UNLOCKED ACTIVE — Both exchanged messages. Timer gone. Active conversation.
  {
    id: 'm4',
    user: mockProfiles[8].user,  // Aryan Chandiramani (man)
    photos: mockProfiles[8].photos,
    matched_at: '2025-03-13T11:00:00Z',
    last_message: { id: 'msg4', match_id: 'm4', sender_id: '204', content: 'I just made the best dal pakwan of my life. Wish I could share!', type: 'text', read: false, status: 'delivered', created_at: futureDate(-1) },
    unread_count: 1, is_online: true, first_msg_by: 'them', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-1),
    status: 'active',
  },
  // State 5: THEY SENT FIRST — They sent first message, I can reply. Input enabled for me.
  {
    id: 'm5',
    user: mockProfiles[4].user,  // Anika (woman)
    photos: mockProfiles[4].photos,
    matched_at: futureDate(-18), // matched 18 hours ago
    last_message: { id: 'msg5', match_id: 'm5', sender_id: '105', content: 'Hey! Love that we both work in finance. What markets do you follow?', type: 'text', read: false, status: 'delivered', created_at: futureDate(-16) },
    unread_count: 1, is_online: false, first_msg_by: 'them', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(6),
    status: 'pending_first_message',
  },
  // State 4 variant: UNLOCKED ACTIVE — Both replied, no timer
  {
    id: 'm6',
    user: mockProfiles[6].user,  // Dev Wadhwani (man)
    photos: mockProfiles[6].photos,
    matched_at: '2025-03-10T11:00:00Z',
    last_message: { id: 'msg6', match_id: 'm6', sender_id: 'me', content: 'That mandap design story is hilarious! Your family must love you.', type: 'text', read: true, status: 'read', created_at: futureDate(-3) },
    unread_count: 0, is_online: true, first_msg_by: 'me', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-48),
    status: 'active',
  },
  // Active conversation (woman) — both replied, timer expired
  {
    id: 'm7',
    user: mockProfiles[1].user,  // Isha (woman)
    photos: mockProfiles[1].photos,
    matched_at: '2025-03-08T14:00:00Z',
    last_message: { id: 'msg7', match_id: 'm7', sender_id: '102', content: 'You should see my latest Ajrak collection! Sending pics soon.', type: 'text', read: false, status: 'delivered', created_at: futureDate(-2) },
    unread_count: 1, is_online: true, first_msg_by: 'me', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-72),
    status: 'active',
  },
  // Active conversation (woman) — ongoing chat
  {
    id: 'm8',
    user: mockProfiles[3].user,  // Diya Samtani (woman)
    photos: mockProfiles[3].photos,
    matched_at: '2025-03-06T10:00:00Z',
    last_message: { id: 'msg8', match_id: 'm8', sender_id: 'me', content: 'The textile factory tour sounds amazing. When can we go?', type: 'text', read: true, status: 'read', created_at: futureDate(-5) },
    unread_count: 0, is_online: false, first_msg_by: 'them', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-96),
    status: 'active',
  },
  // Active conversation (man) — ongoing chat
  {
    id: 'm9',
    user: mockProfiles[7].user,  // Nikhil (man)
    photos: mockProfiles[7].photos,
    matched_at: '2025-03-09T16:00:00Z',
    last_message: { id: 'msg9', match_id: 'm9', sender_id: '203', content: 'Just finished a marathon! 4:12 personal best. Celebrating with biryani.', type: 'text', read: false, status: 'delivered', created_at: futureDate(-4) },
    unread_count: 1, is_online: false, first_msg_by: 'them', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-60),
    status: 'active',
  },
];

// ── LIKES (10 with culturalScore + culturalBadge) ───────────────────
export const mockLikes: Like[] = [
  { id: 'l1', from_user: mockProfiles[0].user, from_photos: mockProfiles[0].photos, type: 'like', culturalScore: 94, culturalBadge: 'gold', created_at: '2025-03-18T08:00:00Z' },
  { id: 'l2', from_user: mockProfiles[1].user, from_photos: mockProfiles[1].photos, type: 'like', culturalScore: 74, culturalBadge: 'green', created_at: '2025-03-17T20:00:00Z' },
  { id: 'l3', from_user: mockProfiles[2].user, from_photos: mockProfiles[2].photos, type: 'like', culturalScore: 90, culturalBadge: 'gold', created_at: '2025-03-17T14:00:00Z' },
  { id: 'l4', from_user: mockProfiles[3].user, from_photos: mockProfiles[3].photos, type: 'like', culturalScore: 70, culturalBadge: 'green', created_at: '2025-03-16T15:00:00Z' },
  { id: 'l5', from_user: mockProfiles[4].user, from_photos: mockProfiles[4].photos, type: 'like', culturalScore: 96, culturalBadge: 'gold', created_at: '2025-03-16T10:00:00Z' },
  { id: 'l6', from_user: mockProfiles[10].user, from_photos: mockProfiles[10].photos, type: 'like', culturalScore: 92, culturalBadge: 'gold', created_at: '2025-03-15T18:00:00Z' },   // Nisha
  { id: 'l7', from_user: mockProfiles[12].user, from_photos: mockProfiles[12].photos, type: 'like', culturalScore: 88, culturalBadge: 'gold', created_at: '2025-03-15T12:00:00Z' },   // Prerna
  { id: 'l8', from_user: mockProfiles[14].user, from_photos: mockProfiles[14].photos, type: 'like', culturalScore: 64, culturalBadge: 'orange', created_at: '2025-03-14T20:00:00Z' },  // Meera
  { id: 'l9', from_user: mockProfiles[18].user, from_photos: mockProfiles[18].photos, type: 'like', culturalScore: 78, culturalBadge: 'green', created_at: '2025-03-14T14:00:00Z' },   // Ira
  { id: 'l10', from_user: mockProfiles[22].user, from_photos: mockProfiles[22].photos, type: 'like', culturalScore: 77, culturalBadge: 'green', created_at: '2025-03-13T15:00:00Z' },  // Riya
];

// ── MESSAGES (11 messages spanning multiple days with Sindhi cultural references) ──
export const mockMessages: Message[] = [
  // Day 1 — first meeting
  { id: 'msg-1', match_id: 'm4', sender_id: 'me', content: 'Hi Aryan! A surgeon who makes Sindhi food? That is the best combo I have heard.', type: 'text', read: true, status: 'read', created_at: '2025-03-13T15:00:00Z' },
  { id: 'msg-2', match_id: 'm4', sender_id: '204', content: 'Haha sai bhaani! You should see me handle a scalpel and a rolling pin — both need steady hands.', type: 'text', read: true, status: 'read', created_at: '2025-03-13T15:05:00Z' },
  { id: 'msg-3', match_id: 'm4', sender_id: 'me', content: 'I am impressed already. What is your signature Sindhi dish?', type: 'text', read: true, status: 'read', created_at: '2025-03-13T15:10:00Z' },
  { id: 'msg-4', match_id: 'm4', sender_id: '204', content: 'Dal pakwan, obviously! My nani taught me and I have been perfecting it for years. The secret is in the tadka timing.', type: 'text', read: true, status: 'read', created_at: '2025-03-13T16:00:00Z' },
  // Day 2 — deeper conversation, Sindhi cultural refs
  { id: 'msg-5', match_id: 'm4', sender_id: 'me', content: 'That is exactly what my mom says! Do you celebrate Chaliha Sahib? My family does the full 40 days.', type: 'text', read: true, status: 'read', created_at: '2025-03-14T09:00:00Z' },
  { id: 'msg-6', match_id: 'm4', sender_id: '204', content: 'Every single year! Jhulelal\'s blessings first, then biryani at nani\'s house. It is my favorite time because the whole Sindhi community comes together.', type: 'text', read: true, status: 'read', created_at: '2025-03-14T09:30:00Z' },
  { id: 'msg-7', match_id: 'm4', sender_id: 'me', content: 'Same here! The bahrana sahib procession in Ulhasnagar is something else. Have you been?', type: 'text', read: true, status: 'read', created_at: '2025-03-14T10:15:00Z' },
  // Day 3 — planning and warmth
  { id: 'msg-8', match_id: 'm4', sender_id: '204', content: 'Not yet but it is on my list! My family is from the Sindhi colony in Mumbai. Thadri is the big one for us — mom makes sai bhaji and koki that could win awards.', type: 'text', read: true, status: 'read', created_at: '2025-03-15T11:00:00Z' },
  { id: 'msg-9', match_id: 'm4', sender_id: 'me', content: 'Now I am hungry! We should cook together sometime. A Sindhi cooking date sounds perfect.', type: 'text', read: true, status: 'read', created_at: '2025-03-15T11:30:00Z' },
  { id: 'msg-10', match_id: 'm4', sender_id: '204', content: 'That sounds like an amazing first date idea! I will bring the tadka, you bring the dal. Jai Jhulelal!', type: 'text', read: true, status: 'delivered', created_at: '2025-03-15T12:00:00Z' },
  // Day 4 — latest
  { id: 'msg-11', match_id: 'm4', sender_id: '204', content: 'I just made the best dal pakwan of my life. Wish I could share!', type: 'text', read: false, status: 'delivered', created_at: futureDate(-1) },
];

// ── ICEBREAKERS (8 with categories matching iOS) ────────────────────
export const mockIcebreakers: Icebreaker[] = [
  { id: 'ice1', text: 'What\'s your favorite Sindhi dish?', category: 'sindhi' },
  { id: 'ice2', text: 'Do you celebrate Cheti Chand?', category: 'sindhi' },
  { id: 'ice3', text: 'Sai bhaani! What does community mean to you?', category: 'sindhi' },
  { id: 'ice4', text: 'Tea or coffee for a first date?', category: 'fun' },
  { id: 'ice5', text: 'What\'s the last show you binged?', category: 'fun' },
  { id: 'ice6', text: 'Mountains or beaches?', category: 'fun' },
  { id: 'ice7', text: 'What\'s your idea of a perfect weekend?', category: 'general' },
  { id: 'ice8', text: 'What\'s the most important value in a relationship?', category: 'deep' },
];

// ── FAMILY ACCESS & SUGGESTIONS (3 suggestions matching iOS) ────────
export const mockFamilyAccess: FamilyAccess[] = [
  {
    id: 'fam1',
    user: {
      id: 'fam-maa',
      phone: '+919876543210',
      first_name: 'Maa',
      date_of_birth: '1970-05-12',
      age: 55,
      gender: 'woman',
      city: 'Mumbai',
      country: 'India',
      intent: 'marriage',
      show_me: 'everyone',
      verified: true,
      profile_completeness: 100,
      created_at: '2025-01-01',
      updated_at: '2025-03-01',
    },
    relationship: 'Mother',
    status: 'active',
    permissions: { can_view_profile: true, can_view_photos: true, can_view_basics: true, can_view_sindhi: true, can_view_matches: false, can_suggest: true, can_view_cultural_score: true, can_view_kundli: true },
    invite_code: 'SINDHI-MAA-2025',
    joined_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'fam2',
    user: {
      id: 'fam-papa',
      phone: '+919876543211',
      first_name: 'Papa',
      date_of_birth: '1968-11-20',
      age: 57,
      gender: 'man',
      city: 'Mumbai',
      country: 'India',
      intent: 'marriage',
      show_me: 'everyone',
      verified: true,
      profile_completeness: 100,
      created_at: '2025-01-01',
      updated_at: '2025-03-01',
    },
    relationship: 'Father',
    status: 'active',
    permissions: { can_view_profile: true, can_view_photos: true, can_view_basics: true, can_view_sindhi: true, can_view_matches: true, can_suggest: true, can_view_cultural_score: true, can_view_kundli: true },
    invite_code: 'SINDHI-PAPA-2025',
    joined_at: '2025-01-17T10:00:00Z',
  },
];

export const mockFamilySuggestions: FamilySuggestion[] = [
  {
    id: 'fs1',
    from_member: mockFamilyAccess[0], // Maa
    suggested_user: mockProfiles[9].user, // Veer Vaswani (London Barrister)
    suggested_photos: mockProfiles[9].photos,
    note: 'Lalwani family ka beta hai, bahut accha ladka hai. London mein settled hai.',
    status: 'pending',
    created_at: futureDate(-6),
  },
  {
    id: 'fs2',
    from_member: mockFamilyAccess[1], // Papa
    suggested_user: mockProfiles[10].user, // Nisha (Pediatrician)
    suggested_photos: mockProfiles[10].photos,
    note: 'Doctor hai, Hinduja hospital mein. Bahut sanskaari family hai.',
    status: 'pending',
    created_at: futureDate(-2),
  },
  {
    id: 'fs3',
    from_member: mockFamilyAccess[0], // Maa
    suggested_user: mockProfiles[16].user, // Diya Vaswani (UX Researcher, Google)
    suggested_photos: mockProfiles[16].photos,
    note: 'Vaswani uncle ki beti. Google mein kaam karti hai, Pune mein hai.',
    status: 'pending',
    created_at: futureDate(-12),
  },
];

// ── CITIES ───────────────────────────────────────────────────────────
export const cities: City[] = [
  { name: 'Mumbai', country: 'India', display: 'Mumbai, India' },
  { name: 'Delhi', country: 'India', display: 'Delhi, India' },
  { name: 'Bangalore', country: 'India', display: 'Bangalore, India' },
  { name: 'Pune', country: 'India', display: 'Pune, India' },
  { name: 'Ahmedabad', country: 'India', display: 'Ahmedabad, India' },
  { name: 'Hyderabad', country: 'India', display: 'Hyderabad, India' },
  { name: 'Chennai', country: 'India', display: 'Chennai, India' },
  { name: 'Kolkata', country: 'India', display: 'Kolkata, India' },
  { name: 'Jaipur', country: 'India', display: 'Jaipur, India' },
  { name: 'Indore', country: 'India', display: 'Indore, India' },
  { name: 'Jodhpur', country: 'India', display: 'Jodhpur, India' },
  { name: 'Udaipur', country: 'India', display: 'Udaipur, India' },
  { name: 'Surat', country: 'India', display: 'Surat, India' },
  { name: 'Vadodara', country: 'India', display: 'Vadodara, India' },
  { name: 'Nagpur', country: 'India', display: 'Nagpur, India' },
  { name: 'Lucknow', country: 'India', display: 'Lucknow, India' },
  { name: 'Chandigarh', country: 'India', display: 'Chandigarh, India' },
  { name: 'Bhopal', country: 'India', display: 'Bhopal, India' },
  { name: 'Thane', country: 'India', display: 'Thane, India' },
  { name: 'Rajkot', country: 'India', display: 'Rajkot, India' },
  { name: 'Dubai', country: 'UAE', display: 'Dubai, UAE' },
  { name: 'Abu Dhabi', country: 'UAE', display: 'Abu Dhabi, UAE' },
  { name: 'London', country: 'UK', display: 'London, UK' },
  { name: 'New York', country: 'USA', display: 'New York, USA' },
  { name: 'Toronto', country: 'Canada', display: 'Toronto, Canada' },
  { name: 'Singapore', country: 'Singapore', display: 'Singapore' },
  { name: 'Hong Kong', country: 'China', display: 'Hong Kong' },
  { name: 'Sydney', country: 'Australia', display: 'Sydney, Australia' },
  { name: 'Nairobi', country: 'Kenya', display: 'Nairobi, Kenya' },
  { name: 'Lagos', country: 'Nigeria', display: 'Lagos, Nigeria' },
];

// ── HELPERS ──────────────────────────────────────────────────────────

/** Return display name — shows full name only if that user enabled it */
export function getDisplayName(user: { first_name: string; last_name?: string; show_full_name?: boolean }): string {
  return user.show_full_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
}

/** Return the gender value the current user wants to see, or null for 'everyone'. */
export function getPreferredGender(): 'man' | 'woman' | null {
  if (typeof window === 'undefined') return null;
  // Check both localStorage (persistent) and sessionStorage (onboarding flow)
  const showMe = localStorage.getItem('onboarding_showme') || sessionStorage.getItem('onboarding_showme');
  if (showMe === 'men') return 'man';
  if (showMe === 'women') return 'woman';
  return null; // 'everyone' or not set
}

export function getFilteredMockProfiles() {
  const g = getPreferredGender();
  if (!g) return mockProfiles;
  return mockProfiles.filter((p) => p.user.gender === g);
}

export function getFilteredMockLikes() {
  const g = getPreferredGender();
  if (!g) return mockLikes;
  return mockLikes.filter((l) => l.from_user.gender === g);
}

export function getFilteredMockMatches() {
  const g = getPreferredGender();
  if (!g) return mockMatches;
  return mockMatches.filter((m) => m.user.gender === g);
}

export const promptOptions = [
  'A life goal of mine',
  'The way to my heart is',
  'My Sindhi superpower',
  'My simple pleasures',
  'I geek out on',
  'My most controversial opinion',
  'Together we could',
  'I am convinced that',
  'My non-negotiable',
  'My typical Sunday',
  'The best way to ask me out',
  'I am looking for',
  'We will get along if',
  'I want someone who',
  'My idea of a perfect day',
];

export const interestOptions = [
  'Reading', 'Travel', 'Cooking', 'Yoga', 'Photography',
  'Music', 'Cricket', 'Coding', 'Fitness', 'Dancing',
  'Art', 'Design', 'Coffee', 'Food', 'Movies',
  'Hiking', 'Podcasts', 'Meditation', 'Gaming', 'Writing',
  'Fashion', 'Gardening', 'Running', 'Swimming', 'Tennis',
  'Volunteering', 'Entrepreneurship', 'Finance', 'Medicine', 'Law',
  'Spirituality', 'Board Games', 'Karaoke', 'Dogs', 'Cats',
];
