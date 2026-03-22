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
import { useProfileCompleteness } from '@/lib/useProfileCompleteness';
import { useTranslation } from '@/lib/i18n';

function ShimmerCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-card mb-3">
      <div className="aspect-[3/4] shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-6 w-40 shimmer rounded-lg" />
        <div className="h-4 w-24 shimmer rounded-lg" />
        <div className="h-20 w-full shimmer rounded-lg" />
      </div>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-rose/10 flex items-center justify-center mb-3">
        <Users className="w-10 h-10 text-rose" />
      </div>
      <h2 className="text-xl font-bold text-charcoal mb-2">
        {t('discover.noMoreProfiles')}
      </h2>
      <p className="text-textLight max-w-xs mb-3">
        {t('discover.inviteFriendsText')}
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
            showToast.info(t('discover.shareLinkCopied'));
          }
        }}
      >
        {t('discover.inviteFriends')}
      </Button>
    </motion.div>
  );
}

function getFilteredProfiles() {
  return getFilteredMockProfiles();
}

export default function DiscoverPage() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState(() => {
    // Triple the deck for continuous engagement
    const base = getFilteredProfiles();
    return [...base, ...base.map(p => ({...p, user: {...p.user, id: p.user.id + '_b'}})), ...base.map(p => ({...p, user: {...p.user, id: p.user.id + '_c'}}))];
  });
  const [likesUsed, setLikesUsed] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');
  const completeness = useProfileCompleteness();

  const handleAction = useCallback(
    (profileId: string, action: 'like' | 'pass') => {
      const profile = profiles.find((p) => p.user.id === profileId);
      if (!profile) return;

      if (action === 'like') {
        if (likesUsed >= 50) {
          showToast.warning(t('discover.likesUsedUp'));
          return;
        }
        setLikesUsed((prev) => prev + 1);
        showToast.success(`${t('discover.like')} ${profile.user.first_name}!`);
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
    [profiles, likesUsed, t]
  );

  // Show top 6 cards in the deck for a "many matches" illusion
  const visibleCards = profiles.slice(0, 6);

  return (
    <AppShell>
      <div className="flex justify-center px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
        <div className="w-full max-w-md">
          {/* Filter bar */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-charcoal">{t('discover.title')}</h1>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-rose-light hover:bg-rose/5 transition-all text-sm font-medium text-charcoal shadow-soft touch-target"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-4 h-4 text-rose" />
              {t('discover.filters')}
            </button>
          </div>

          {/* Card deck — padded right to show edge layers */}
          <div className="relative" style={{ marginRight: '48px' }}>
            {/* Stacked edge layers peeking from the right */}
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
      </div>

      {/* Complete profile annotation — fixed above bottom nav */}
      {completeness < 90 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 flex justify-center px-4 mb-1">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-card px-5 py-3.5 flex items-center gap-3 max-w-md w-full border border-rose-light/20">
            <div className="w-3 h-3 rounded-full bg-rose shrink-0" />
            <p className="text-sm text-textLight">
              <span className="font-semibold text-charcoal">{t('discover.completeProfile')}</span> — {t('discover.completeProfileHint')}
            </p>
          </div>
        </div>
      )}

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={() => showToast.success(t('discover.filtersApplied'))}
      />
    </AppShell>
  );
}
