'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { SlidersHorizontal, Users, Share2 } from 'lucide-react';
import Link from 'next/link';
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

/** Returns badge color class based on cultural score percentage */
function getCulturalBadgeColor(score: number): string {
  if (score >= 90) return 'bg-amber-400 text-white'; // gold
  if (score >= 75) return 'bg-green-500 text-white';  // green
  if (score >= 60) return 'bg-orange-400 text-white';  // orange
  return 'bg-gray-400 text-white';
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

  // Swipe drag state via Framer Motion
  const dragX = useMotionValue(0);
  const swipeThreshold = 150;

  // Derived values for LIKE/NOPE overlay opacity
  const likeOpacity = useTransform(dragX, [0, swipeThreshold], [0, 1]);
  const nopeOpacity = useTransform(dragX, [-swipeThreshold, 0], [1, 0]);
  // Card rotation during drag
  const cardRotate = useTransform(dragX, [-300, 0, 300], [-15, 0, 15]);

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

  /** Handle drag end — commit swipe or snap back */
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!profiles[0]) return;
      const id = profiles[0].user.id;
      if (info.offset.x > swipeThreshold) {
        handleAction(id, 'like');
      } else if (info.offset.x < -swipeThreshold) {
        handleAction(id, 'pass');
      }
      // Reset drag value (spring back handled by Framer Motion dragSnapToOrigin)
      dragX.set(0);
    },
    [profiles, handleAction, dragX, swipeThreshold]
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
            {/* Deck-of-cards: 3-5 card edges peeking behind active card */}
            {profiles.length > 0 && [1, 2, 3, 4, 5].map((i) => (
              <div
                key={`edge-${i}`}
                className="absolute rounded-3xl shadow-sm border border-gray-100"
                style={{
                  top: `${i * 3}px`,
                  bottom: `${i * 3}px`,
                  left: `${i * 4}px`,
                  right: `${-i * 8}px`,
                  backgroundColor: `hsl(0, 0%, ${100 - i * 4}%)`,
                  zIndex: 6 - i,
                }}
              />
            ))}

            {/* Active top card with swipe gestures */}
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
                    style={{ x: dragX, rotate: cardRotate }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.9}
                    dragSnapToOrigin
                    onDragEnd={handleDragEnd}
                    className="relative cursor-grab active:cursor-grabbing"
                  >
                    {/* LIKE / NOPE swipe overlay text */}
                    <motion.div
                      className="absolute top-10 left-8 z-20 pointer-events-none select-none"
                      style={{ opacity: likeOpacity, rotate: -15 }}
                    >
                      <span className="text-5xl font-black text-green-500 border-4 border-green-500 rounded-lg px-4 py-1 tracking-wider">
                        LIKE
                      </span>
                    </motion.div>
                    <motion.div
                      className="absolute top-10 right-8 z-20 pointer-events-none select-none"
                      style={{ opacity: nopeOpacity, rotate: 15 }}
                    >
                      <span className="text-5xl font-black text-red-500 border-4 border-red-500 rounded-lg px-4 py-1 tracking-wider">
                        NOPE
                      </span>
                    </motion.div>

                    {/* Cultural score badge */}
                    <div
                      className={`absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${getCulturalBadgeColor(profiles[0].cultural_score)}`}
                    >
                      {profiles[0].cultural_score}%
                    </div>

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

          {/* Profile completeness warning (below 50%) */}
          {completeness < 50 && (
            <div className="mt-4">
              <Link
                href="/profile/edit"
                className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 hover:bg-amber-100 transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <p className="text-sm text-charcoal">
                  <span className="font-semibold">Complete your profile</span>{' '}
                  <span className="text-textLight">for better matches</span>
                </p>
                <svg className="w-4 h-4 text-amber-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Complete profile annotation — fixed above bottom nav (shown when 50-89%) */}
      {completeness >= 50 && completeness < 90 && (
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
