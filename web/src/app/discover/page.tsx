'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Users, Share2 } from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import DiscoveryCard from '@/components/discover/DiscoveryCard';
import FilterSheet from '@/components/discover/FilterSheet';
import Button from '@/components/ui/Button';
import { mockProfiles } from '@/lib/mockData';
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

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [loading, setLoading] = useState(false);
  const [likesUsed, setLikesUsed] = useState(7);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const prefetchTriggered = useRef(false);

  // Pre-fetch trigger at card 15
  useEffect(() => {
    if (profiles.length <= 5 && !prefetchTriggered.current && !loading) {
      prefetchTriggered.current = true;
      setLoading(true);
      setTimeout(() => {
        setProfiles((prev) => [...prev, ...mockProfiles]);
        setLoading(false);
        prefetchTriggered.current = false;
      }, 1500);
    }
  }, [profiles.length, loading]);

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

      setProfiles((prev) => prev.filter((p) => p.user.id !== profileId));
    },
    [profiles, likesUsed]
  );

  return (
    <AppShell>
      <div className="flex gap-8 p-6">
        {/* Left Column - Profile Cards Feed */}
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

          <AnimatePresence>
            {profiles.length > 0 ? (
              profiles.map((card) => (
                <DiscoveryCard
                  key={card.user.id}
                  card={card}
                  onAction={(action) => handleAction(card.user.id, action)}
                  likesUsed={likesUsed}
                  likesMax={50}
                />
              ))
            ) : !loading ? (
              <EmptyState />
            ) : null}
          </AnimatePresence>

          {/* Loading shimmer */}
          {loading && (
            <div>
              <ShimmerCard />
              <ShimmerCard />
            </div>
          )}

          <div ref={observerRef} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-semibold text-charcoal mb-3">Today&apos;s Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-textLight">Likes Used</span>
                  <span className="font-medium text-charcoal">{likesUsed} / 50</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose rounded-full transition-all duration-300"
                    style={{ width: `${(likesUsed / 50) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-textLight">Profile Views</span>
                  <span className="font-medium text-charcoal">47</span>
                </div>
              </div>
            </div>

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
