export type IceBreakerCategory = 'Fun' | 'Deep' | 'Flirty';

export interface IceBreakerPrompt {
  id: number;
  text: string;
  category: IceBreakerCategory;
  emoji: string;
}

const CATEGORY_EMOJI: Record<IceBreakerCategory, string> = {
  Fun: '🎉',
  Deep: '💭',
  Flirty: '😏',
};

const ALL_PROMPTS: Omit<IceBreakerPrompt, 'emoji'>[] = [
  // ── Fun (17) ────────────────────────────────────────────────────────
  { id: 1,  text: "What's your go-to Sindhi comfort food?",                    category: 'Fun' },
  { id: 2,  text: "Bollywood or Hollywood — pick one forever?",                category: 'Fun' },
  { id: 3,  text: "What's the last thing that made you laugh out loud?",       category: 'Fun' },
  { id: 4,  text: "If you could travel anywhere tomorrow, where would you go?", category: 'Fun' },
  { id: 5,  text: "What's your unpopular food opinion?",                       category: 'Fun' },
  { id: 6,  text: "What's the most spontaneous thing you've ever done?",       category: 'Fun' },
  { id: 7,  text: "Dal pakwan or sai bhaji — and why?",                        category: 'Fun' },
  { id: 8,  text: "What's your karaoke go-to song?",                           category: 'Fun' },
  { id: 9,  text: "If you could have dinner with anyone, dead or alive?",      category: 'Fun' },
  { id: 10, text: "What's your hidden talent nobody knows about?",             category: 'Fun' },
  { id: 11, text: "Morning person or night owl?",                              category: 'Fun' },
  { id: 12, text: "What show are you binge-watching right now?",               category: 'Fun' },
  { id: 13, text: "Tea, coffee, or chai specifically?",                        category: 'Fun' },
  { id: 14, text: "What's the weirdest food combo you secretly love?",         category: 'Fun' },
  { id: 15, text: "If your life was a movie, what genre would it be?",         category: 'Fun' },
  { id: 16, text: "What's your favorite festival memory growing up?",          category: 'Fun' },
  { id: 17, text: "Dogs or cats — and this might be a dealbreaker?",           category: 'Fun' },

  // ── Deep (17) ───────────────────────────────────────────────────────
  { id: 18, text: "What does being Sindhi mean to you?",                              category: 'Deep' },
  { id: 19, text: "What's a life goal you're working toward right now?",              category: 'Deep' },
  { id: 20, text: "What's the best advice you've ever received?",                     category: 'Deep' },
  { id: 21, text: "What's something you wish more people understood about you?",      category: 'Deep' },
  { id: 22, text: "How do you stay connected to your Sindhi roots?",                  category: 'Deep' },
  { id: 23, text: "What's a value you'd never compromise on?",                        category: 'Deep' },
  { id: 24, text: "What does your ideal weekend look like?",                          category: 'Deep' },
  { id: 25, text: "What's the most important lesson your family taught you?",         category: 'Deep' },
  { id: 26, text: "Where do you see yourself in 5 years?",                            category: 'Deep' },
  { id: 27, text: "What's a tradition you want to pass on to your kids?",             category: 'Deep' },
  { id: 28, text: "What's the bravest thing you've ever done?",                       category: 'Deep' },
  { id: 29, text: "How do you handle conflict in relationships?",                     category: 'Deep' },
  { id: 30, text: "What's something you're really proud of?",                         category: 'Deep' },
  { id: 31, text: "What role does spirituality play in your life?",                   category: 'Deep' },
  { id: 32, text: "What's a cause you care deeply about?",                            category: 'Deep' },
  { id: 33, text: "What's the hardest thing you've overcome?",                        category: 'Deep' },
  { id: 34, text: "What makes a house feel like home to you?",                        category: 'Deep' },

  // ── Flirty (16) ─────────────────────────────────────────────────────
  { id: 35, text: "What made you swipe right on me?",                                          category: 'Flirty' },
  { id: 36, text: "What's your idea of a perfect first date?",                                 category: 'Flirty' },
  { id: 37, text: "What's the most romantic thing someone's done for you?",                    category: 'Flirty' },
  { id: 38, text: "Do you believe in love at first sight, or should I walk by again?",         category: 'Flirty' },
  { id: 39, text: "What's your love language?",                                                category: 'Flirty' },
  { id: 40, text: "If we matched, where would you take me on our first date?",                 category: 'Flirty' },
  { id: 41, text: "What's the quality you find most attractive in someone?",                   category: 'Flirty' },
  { id: 42, text: "Beach sunset or city rooftop for a date night?",                            category: 'Flirty' },
  { id: 43, text: "What song would you play to set the mood?",                                 category: 'Flirty' },
  { id: 44, text: "Truth or dare — which do you usually pick?",                                category: 'Flirty' },
  { id: 45, text: "What's your signature move to impress someone?",                            category: 'Flirty' },
  { id: 46, text: "Candlelight dinner or spontaneous adventure?",                              category: 'Flirty' },
  { id: 47, text: "What's the cheesiest pickup line that actually worked on you?",             category: 'Flirty' },
  { id: 48, text: "If you had to describe yourself in 3 emojis, which ones?",                  category: 'Flirty' },
  { id: 49, text: "What's your definition of chemistry?",                                      category: 'Flirty' },
  { id: 50, text: "Would you rather have a long phone call or a late-night walk?",             category: 'Flirty' },
];

export const iceBreakerPrompts: IceBreakerPrompt[] = ALL_PROMPTS.map((p) => ({
  ...p,
  emoji: CATEGORY_EMOJI[p.category],
}));

/**
 * Returns `count` random prompts, attempting to spread across categories.
 * Falls back to fully random if fewer than `count` categories are available.
 */
export function getRandomIceBreakers(count: 2 | 3 = 3): IceBreakerPrompt[] {
  const categories: IceBreakerCategory[] = ['Fun', 'Deep', 'Flirty'];
  // Shuffle categories and pick one prompt from each until we reach `count`
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
  const picked: IceBreakerPrompt[] = [];

  for (const cat of shuffledCategories) {
    if (picked.length >= count) break;
    const pool = iceBreakerPrompts.filter((p) => p.category === cat);
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (random) picked.push(random);
  }

  // Top up if we somehow have fewer than count (shouldn't happen with 3 categories)
  if (picked.length < count) {
    const remaining = iceBreakerPrompts.filter((p) => !picked.includes(p));
    const extra = remaining.sort(() => Math.random() - 0.5).slice(0, count - picked.length);
    picked.push(...extra);
  }

  return picked;
}
