import { FeedCard, Match, Message, Like, Icebreaker, City, KundliTier } from '@/types';

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

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
];

const futureDate = (hoursFromNow: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d.toISOString();
};

export const mockMatches: Match[] = [
  // State: New match, no messages yet, 24h timer running
  {
    id: 'm1',
    user: mockProfiles[0].user,  // Tanya (woman)
    photos: mockProfiles[0].photos,
    matched_at: futureDate(-2), // matched 2 hours ago
    unread_count: 0, is_online: true, first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(22),
  },
  // State: I sent first message, chat locked (waiting for reply), timer still running
  {
    id: 'm2',
    user: mockProfiles[5].user,  // Sahil (man)
    photos: mockProfiles[5].photos,
    matched_at: futureDate(-10), // matched 10 hours ago
    last_message: { id: 'msg2', match_id: 'm2', sender_id: 'me', content: 'Your AI research sounds fascinating! Do you work on LLMs?', type: 'text', read: true, created_at: futureDate(-8) },
    unread_count: 0, is_online: false, first_msg_by: 'me', first_msg_locked: true, is_dissolved: false, extended_once: false, expires_at: futureDate(14),
  },
  // State: New match, no messages, 24h timer running
  {
    id: 'm3',
    user: mockProfiles[2].user,  // Roshni (woman)
    photos: mockProfiles[2].photos,
    matched_at: futureDate(-6), // matched 6 hours ago
    unread_count: 0, is_online: true, first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(18),
  },
  // State: Both messaged, chat unlocked, timer gone (active conversation)
  {
    id: 'm4',
    user: mockProfiles[8].user,  // Aryan (man)
    photos: mockProfiles[8].photos,
    matched_at: '2025-03-13T11:00:00Z',
    last_message: { id: 'msg4', match_id: 'm4', sender_id: '204', content: 'I just made the best dal pakwan of my life. Wish I could share!', type: 'text', read: false, created_at: futureDate(-1) },
    unread_count: 1, is_online: true, first_msg_by: 'them', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-1), // expired = conversation unlocked
  },
  // State: They sent first message, I haven't replied yet, timer running
  {
    id: 'm5',
    user: mockProfiles[4].user,  // Anika (woman)
    photos: mockProfiles[4].photos,
    matched_at: futureDate(-18), // matched 18 hours ago
    last_message: { id: 'msg5', match_id: 'm5', sender_id: '105', content: 'Hey! Love that we both work in finance. What markets do you follow?', type: 'text', read: false, created_at: futureDate(-16) },
    unread_count: 1, is_online: false, first_msg_by: 'them', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(6),
  },
  // State: Active conversation, both replied, no timer
  {
    id: 'm6',
    user: mockProfiles[6].user,  // Dev (man)
    photos: mockProfiles[6].photos,
    matched_at: '2025-03-10T11:00:00Z',
    last_message: { id: 'msg6', match_id: 'm6', sender_id: 'me', content: 'That mandap design story is hilarious! Your family must love you.', type: 'text', read: true, created_at: futureDate(-3) },
    unread_count: 0, is_online: true, first_msg_by: 'me', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-48),
  },
  // State: Active conversation (woman) — both replied, timer expired
  {
    id: 'm7',
    user: mockProfiles[1].user,  // Isha (woman)
    photos: mockProfiles[1].photos,
    matched_at: '2025-03-08T14:00:00Z',
    last_message: { id: 'msg7', match_id: 'm7', sender_id: '102', content: 'You should see my latest Ajrak collection! Sending pics soon.', type: 'text', read: false, created_at: futureDate(-2) },
    unread_count: 1, is_online: true, first_msg_by: 'me', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-72),
  },
  // State: Active conversation (woman) — ongoing chat
  {
    id: 'm8',
    user: mockProfiles[3].user,  // Diya (woman)
    photos: mockProfiles[3].photos,
    matched_at: '2025-03-06T10:00:00Z',
    last_message: { id: 'msg8', match_id: 'm8', sender_id: 'me', content: 'The textile factory tour sounds amazing. When can we go?', type: 'text', read: true, created_at: futureDate(-5) },
    unread_count: 0, is_online: false, first_msg_by: 'them', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-96),
  },
  // State: Active conversation (man) — ongoing chat
  {
    id: 'm9',
    user: mockProfiles[7].user,  // Nikhil (man)
    photos: mockProfiles[7].photos,
    matched_at: '2025-03-09T16:00:00Z',
    last_message: { id: 'msg9', match_id: 'm9', sender_id: '203', content: 'Just finished a marathon! 4:12 personal best. Celebrating with biryani.', type: 'text', read: false, created_at: futureDate(-4) },
    unread_count: 1, is_online: false, first_msg_by: 'them', first_msg_locked: false, is_dissolved: false, extended_once: false, expires_at: futureDate(-60),
  },
];

export const mockLikes: Like[] = [
  // Women
  { id: 'l1', from_user: mockProfiles[0].user, from_photos: mockProfiles[0].photos, type: 'like', created_at: '2025-03-18T08:00:00Z' },   // Tanya (woman)
  { id: 'l2', from_user: mockProfiles[1].user, from_photos: mockProfiles[1].photos, type: 'like', created_at: '2025-03-17T20:00:00Z' },   // Isha (woman)
  { id: 'l3', from_user: mockProfiles[2].user, from_photos: mockProfiles[2].photos, type: 'like', created_at: '2025-03-17T14:00:00Z' },   // Roshni (woman)
  { id: 'l4', from_user: mockProfiles[3].user, from_photos: mockProfiles[3].photos, type: 'like', created_at: '2025-03-16T15:00:00Z' },   // Diya (woman)
  { id: 'l5', from_user: mockProfiles[4].user, from_photos: mockProfiles[4].photos, type: 'like', created_at: '2025-03-16T10:00:00Z' },   // Anika (woman)
  { id: 'l6', from_user: { ...mockProfiles[0].user, id: '101_like2' }, from_photos: mockProfiles[0].photos, type: 'like', created_at: '2025-03-15T18:00:00Z' },  // Tanya again (woman)
  // Men
  { id: 'l7', from_user: mockProfiles[5].user, from_photos: mockProfiles[5].photos, type: 'like', created_at: '2025-03-15T12:00:00Z' },   // Sahil (man)
  { id: 'l8', from_user: mockProfiles[6].user, from_photos: mockProfiles[6].photos, type: 'like', created_at: '2025-03-14T20:00:00Z' },   // Dev (man)
  { id: 'l9', from_user: mockProfiles[7].user, from_photos: mockProfiles[7].photos, type: 'like', created_at: '2025-03-14T14:00:00Z' },   // Nikhil (man)
  { id: 'l10', from_user: mockProfiles[8].user, from_photos: mockProfiles[8].photos, type: 'like', created_at: '2025-03-13T15:00:00Z' },  // Aryan (man)
  { id: 'l11', from_user: mockProfiles[9].user, from_photos: mockProfiles[9].photos, type: 'like', created_at: '2025-03-13T10:00:00Z' },  // Veer (man)
  { id: 'l12', from_user: { ...mockProfiles[5].user, id: '201_like2' }, from_photos: mockProfiles[5].photos, type: 'like', created_at: '2025-03-12T12:00:00Z' }, // Sahil again (man)
];

export const mockMessages: Message[] = [
  { id: 'msg-1', match_id: 'm1', sender_id: 'me', content: 'Hi Tanya! A pilot who makes dal pakwan? That is next level multitasking.', type: 'text', read: true, created_at: '2025-03-16T15:00:00Z' },
  { id: 'msg-2', match_id: 'm1', sender_id: '101', content: 'Haha! You should see me handle turbulence and a rolling pin at the same time.', type: 'text', read: true, created_at: '2025-03-16T15:05:00Z' },
  { id: 'msg-3', match_id: 'm1', sender_id: 'me', content: 'I am impressed already. What route do you fly most?', type: 'text', read: true, created_at: '2025-03-16T15:10:00Z' },
  { id: 'msg-4', match_id: 'm1', sender_id: '101', content: 'Hyderabad to Dubai mostly. The Sindhi uncle ratio on that flight is always 80%.', type: 'text', read: true, created_at: '2025-03-16T16:00:00Z' },
  { id: 'msg-5', match_id: 'm1', sender_id: 'me', content: 'That is hilarious. Do they ever recognize you from the community?', type: 'text', read: true, created_at: '2025-03-17T09:00:00Z' },
  { id: 'msg-6', match_id: 'm1', sender_id: '101', content: 'Once an aunty asked if I was "Advani wali Tanya" and tried to set me up with her son. In the cockpit.', type: 'text', read: true, created_at: '2025-03-17T09:30:00Z' },
  { id: 'msg-7', match_id: 'm1', sender_id: '101', content: 'So you also love sunrise flights? I thought I was the only early bird here!', type: 'text', read: false, created_at: '2025-03-18T10:15:00Z' },
];

export const mockIcebreakers: Icebreaker[] = [
  { id: 'ice1', text: 'What Sindhi dish reminds you of home?', category: 'culture' },
  { id: 'ice2', text: 'What is your favorite festival memory?', category: 'culture' },
  { id: 'ice3', text: 'If you could live in any city, where would it be?', category: 'lifestyle' },
  { id: 'ice4', text: 'What is the most Sindhi thing about you?', category: 'fun' },
];

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
