'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Users, Share2 } from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import DiscoveryCard from '@/components/discover/DiscoveryCard';
import FilterSheet from '@/components/discover/FilterSheet';
import Button from '@/components/ui/Button';
import { getFilteredMockProfiles } from '@/lib/mockData';
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

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-rose/10 flex items-center justify-center mb-6">
        <Users className="w-10 h-10 text-rose" />
      </div>
      <h2 className="text-xl font-bold text-charcoal mb-2">
        No more profiles nearby
      </h2>
      <p className="text-textLight max-w-xs mb-6">
        Invite your Sindhi friends to MitiMaiti and grow the community!
      </p>
      <Button
        variant="outline"
        icon={<Share2 className="w-4 h-4" />}
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Join MitiMaiti',
              text: 'Join MitiMaiti - Where Sindhi Hearts Meet!',
              url: 'https://mitimaiti.com',
            });
          } else {
            showToast.info('Share link copied!');
          }
        }}
      >
        Invite Sindhi Friends
      </Button>
    </motion.div>
  );
}

function getFilteredProfiles() {
  return getFilteredMockProfiles();
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState(() => {
    // Triple the deck for continuous engagement
    const base = getFilteredProfiles();
    return [...base, ...base.map(p => ({...p, user: {...p.user, id: p.user.id + '_b'}})), ...base.map(p => ({...p, user: {...p.user, id: p.user.id + '_c'}}))];
  });
  const [likesUsed, setLikesUsed] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');

  const handleAction = useCallback(
    (profileId: string, action: 'like' | 'pass') => {
      const profile = profiles.find((p) => p.user.id === profileId);
      if (!profile) return;

      if (action === 'like') {
        if (likesUsed >= 50) {
          showToast.warning('You have used all 50 likes for today. Come back tomorrow!');
          return;
        }
        setLikesUsed((prev) => prev + 1);
        showToast.success(`You liked ${profile.user.first_name}!`);
      }

      // Set direction first, then remove card after a tick so AnimatePresence picks up the exit direction
      setExitDirection(action === 'like' ? 'right' : 'left');
      setTimeout(() => {
        setProfiles((prev) => {
          const remaining = prev.filter((p) => p.user.id !== profileId);
          if (remaining.length <= 3) {
            const fresh = getFilteredProfiles();
            const suffix = '_' + Date.now();
            return [...remaining, ...fresh.map(p => ({...p, user: {...p.user, id: p.user.id + suffix}}))];
          }
          return remaining;
        });
      }, 10);
    },
    [profiles, likesUsed]
  );

  // Show top 6 cards in the deck for a "many matches" illusion
  const visibleCards = profiles.slice(0, 6);

  return (
    <AppShell>
      <div className="flex gap-8 p-6">
        {/* Left Column - Card Deck */}
        <div className="flex-1 max-w-xl mx-auto lg:mx-0">
          {/* Filter bar */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-charcoal">Discover</h1>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-rose-light hover:bg-rose/5 transition-all text-sm font-medium text-charcoal shadow-soft touch-target"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-4 h-4 text-rose" />
              Filters
            </button>
          </div>

          {/* Card deck — padded right to show edge layers */}
          <div className="relative" style={{ marginRight: '48px' }}>
            {/* 5 stacked edge layers peeking from the right */}
            {profiles.length > 0 && [1, 2, 3, 4, 5].map((i) => (
              <div
                key={`edge-${i}`}
                className="absolute rounded-3xl shadow-sm"
                style={{
                  top: `${i * 3}px`,
                  bottom: `${i * 3}px`,
                  left: `${i * 4}px`,
                  right: `${-i * 8}px`,
                  backgroundColor: `hsl(0, 0%, ${100 - i * 5}%)`,
                  zIndex: 6 - i,
                }}
              />
            ))}

            {/* Active top card */}
            <div className="relative" style={{ zIndex: 10 }}>
              <AnimatePresence mode="wait">
                {profiles.length > 0 ? (
                  <motion.div
                    key={profiles[0].user.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      x: exitDirection === 'right' ? 300 : -300,
                      opacity: 0,
                      rotate: exitDirection === 'right' ? 15 : -15,
                      transition: { duration: 0.35, ease: 'easeInOut' },
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  >
                    <DiscoveryCard
                      card={profiles[0]}
                      onAction={(action) => handleAction(profiles[0].user.id, action)}
                      likesUsed={likesUsed}
                      likesMax={50}
                    />
                  </motion.div>
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Quick tip */}
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-semibold text-charcoal mb-2">Complete Your Profile</h3>
              <p className="text-sm text-textLight leading-relaxed">
                Profiles with Sindhi Identity and Chatti details get 3x more matches. Fill yours out today!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={() => showToast.success('Filters applied!')}
      />
    </AppShell>
  );
}
