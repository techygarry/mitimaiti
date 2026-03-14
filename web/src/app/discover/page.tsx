'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  Star,
  MessageCircle,
  Heart,
  MapPin,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Gem,
  Sparkles,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Badge, { CulturalScoreBadge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { mockProfiles } from '@/lib/mockData';
import { FeedCard } from '@/types';
import { showToast } from '@/components/ui/Toast';

function ShimmerCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-card mb-6">
      <div className="aspect-[4/5] max-h-[500px] shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-6 w-40 shimmer rounded-lg" />
        <div className="h-4 w-24 shimmer rounded-lg" />
        <div className="h-20 w-full shimmer rounded-lg" />
      </div>
    </div>
  );
}

function PhotoCarousel({ photos }: { photos: { url: string }[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrent((prev) => (prev + 1) % photos.length);
    },
    [photos.length]
  );

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrent((prev) => (prev - 1 + photos.length) % photos.length);
    },
    [photos.length]
  );

  return (
    <div className="relative aspect-[4/5] max-h-[500px] bg-gray-100 overflow-hidden">
      {/* Photo */}
      <img
        src={photos[current].url}
        alt="Profile photo"
        className="w-full h-full object-cover"
      />

      {/* Navigation areas */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
          />
          <button
            onClick={next}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
          />

          {/* Arrows on hover */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20">
            <div className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <ChevronLeft className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20">
            <div className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </>
      )}

      {/* Dots indicator */}
      {photos.length > 1 && (
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-20">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 bg-white'
                  : 'w-8 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay */}
      <div className="gradient-overlay absolute inset-0 pointer-events-none" />
    </div>
  );
}

function CulturalScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#D4A853' : score >= 60 ? '#22c55e' : '#f97316';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair';

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
          <circle
            cx="28" cy="28" r="24"
            fill="none" stroke="#e5e7eb" strokeWidth="5"
          />
          <circle
            cx="28" cy="28" r="24"
            fill="none" stroke={color} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 150.8} 150.8`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-charcoal">{score}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-charcoal">Cultural Match</p>
        <p className="text-xs text-textLight">{label} compatibility</p>
      </div>
    </div>
  );
}

function ProfileCard({
  card,
  onAction,
}: {
  card: FeedCard;
  onAction: (action: string) => void;
}) {
  const { user, photos, basics, personality, cultural_score, distance_km, daily_prompt_answer } = card;

  const intentEmoji = user.intent === 'marriage' ? '💍' : user.intent === 'casual' ? '☕' : '✨';
  const intentLabel = user.intent === 'marriage' ? 'Marriage' : user.intent === 'casual' ? 'Casual' : 'Open to Anything';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl overflow-hidden shadow-card mb-6"
    >
      {/* Photo carousel */}
      <div className="relative">
        <PhotoCarousel photos={photos} />

        {/* Info overlay on photo */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-white">
              {user.first_name}, {user.age}
            </h2>
            {user.verified && (
              <BadgeCheck className="w-7 h-7 text-blue-400 fill-blue-400" />
            )}
            {user.premium && (
              <Gem className="w-6 h-6 text-gold" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="glass-pill">
              <MapPin className="w-3.5 h-3.5" />
              {user.city}
              {distance_km && distance_km < 100 && (
                <span className="text-textLight"> · {distance_km}km</span>
              )}
            </span>
            <span className="glass-pill">
              {intentEmoji} {intentLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Content below photo */}
      <div className="p-6 space-y-5">
        {/* Cultural Score Gauge */}
        <CulturalScoreGauge score={cultural_score} />

        {/* Bio */}
        {user.bio && (
          <p className="text-textMain leading-relaxed text-base">{user.bio}</p>
        )}

        {/* Work & Education */}
        {basics && (
          <div className="flex flex-wrap gap-2">
            {basics.work_title && basics.company && (
              <Badge variant="gray" size="sm">
                💼 {basics.work_title} at {basics.company}
              </Badge>
            )}
            {basics.education && (
              <Badge variant="gray" size="sm">
                🎓 {basics.education}
              </Badge>
            )}
            {basics.height_cm && (
              <Badge variant="gray" size="sm">
                📏 {Math.floor(basics.height_cm / 30.48)}&apos;{Math.round((basics.height_cm / 2.54) % 12)}&quot;
              </Badge>
            )}
          </div>
        )}

        {/* Prompts */}
        {personality?.prompts && personality.prompts.length > 0 && (
          <div className="space-y-3">
            {personality.prompts.slice(0, 2).map((prompt) => (
              <Card key={prompt.prompt_id} variant="filled" padding="md">
                <p className="text-xs font-semibold text-rose uppercase tracking-wide mb-1">
                  {prompt.prompt_text}
                </p>
                <p className="text-textMain font-medium">{prompt.answer}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Daily prompt */}
        {daily_prompt_answer && (
          <Card variant="outlined" padding="md" className="border-gold/30 bg-amber-50/30">
            <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">
              Today&apos;s Thought
            </p>
            <p className="text-textMain">{daily_prompt_answer}</p>
          </Card>
        )}

        {/* Interests */}
        {personality?.interests && (
          <div className="flex flex-wrap gap-2">
            {personality.interests.map((interest) => (
              <Badge key={interest} variant="rose" size="sm">
                {interest}
              </Badge>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-5 pt-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction('pass')}
            className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-soft"
          >
            <X className="w-8 h-8 text-gray-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction('super_like')}
            className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors shadow-soft border border-gold/20"
          >
            <Star className="w-7 h-7 text-gold fill-gold" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction('comment')}
            className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-soft border border-blue-100"
          >
            <MessageCircle className="w-7 h-7 text-blue-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction('like')}
            className="w-16 h-16 rounded-full bg-rose flex items-center justify-center hover:bg-rose-dark transition-colors shadow-md"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function FiltersSidebar() {
  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5 text-rose" />
          <h3 className="font-semibold text-charcoal">Filters</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-textMain mb-1 block">Age Range</label>
            <div className="flex items-center gap-2 text-sm text-textLight">
              <span className="px-3 py-1.5 bg-gray-50 rounded-lg">21</span>
              <span>to</span>
              <span className="px-3 py-1.5 bg-gray-50 rounded-lg">35</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-textMain mb-1 block">Intent</label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="rose" size="sm">💍 Marriage</Badge>
              <Badge variant="gray" size="sm">☕ Casual</Badge>
              <Badge variant="gray" size="sm">✨ Open</Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-textMain mb-1 block">Location</label>
            <p className="text-sm text-textLight">Mumbai, India</p>
          </div>
          <div>
            <label className="text-sm font-medium text-textMain mb-1 block">Religion</label>
            <p className="text-sm text-textLight">All</p>
          </div>
        </div>
      </div>

      {/* Daily Prompt */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-gold" />
          <h3 className="font-semibold text-charcoal">Daily Prompt</h3>
        </div>
        <p className="text-sm text-textLight mb-3">
          Answer today&apos;s prompt to appear in more feeds:
        </p>
        <Card variant="filled" padding="md" className="bg-amber-50/50 border border-gold/20">
          <p className="text-sm font-medium text-charcoal">
            &quot;What is the most Sindhi thing about your family?&quot;
          </p>
        </Card>
        <button className="mt-3 text-sm font-semibold text-rose hover:text-rose-dark transition-colors">
          Answer Now
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h3 className="font-semibold text-charcoal mb-3">Your Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-textLight">Likes Today</span>
            <span className="font-medium text-charcoal">7 / 10</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-textLight">Super Likes</span>
            <span className="font-medium text-charcoal">2 / 5</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-textLight">Profile Views</span>
            <span className="font-medium text-charcoal">47</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(
    (profileId: string, action: string) => {
      const profile = profiles.find((p) => p.user.id === profileId);
      if (!profile) return;

      switch (action) {
        case 'like':
          showToast.success(`You liked ${profile.user.first_name}!`);
          break;
        case 'super_like':
          showToast.success(`Super Like sent to ${profile.user.first_name}!`);
          break;
        case 'comment':
          showToast.info('Comments coming soon!');
          break;
        case 'pass':
          break;
      }

      setProfiles((prev) => prev.filter((p) => p.user.id !== profileId));

      // If running low, simulate loading more
      if (profiles.length <= 3) {
        setLoading(true);
        setTimeout(() => {
          setProfiles(mockProfiles);
          setLoading(false);
        }, 1500);
      }
    },
    [profiles]
  );

  return (
    <AppShell>
      <div className="flex gap-8 p-6">
        {/* Left Column - Profile Cards Feed */}
        <div className="flex-1 max-w-xl mx-auto lg:mx-0">
          <AnimatePresence>
            {profiles.length > 0 ? (
              profiles.map((card) => (
                <ProfileCard
                  key={card.user.id}
                  card={card}
                  onAction={(action) => handleAction(card.user.id, action)}
                />
              ))
            ) : !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-charcoal mb-2">
                  No more profiles
                </h2>
                <p className="text-textLight max-w-xs">
                  You&apos;ve seen everyone nearby. Check back later or expand your
                  filters to see more people.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Loading shimmer */}
          {loading && (
            <div>
              <ShimmerCard />
              <ShimmerCard />
            </div>
          )}
        </div>

        {/* Right Column - Sidebar with Filters & Daily Prompt */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24">
            <FiltersSidebar />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
