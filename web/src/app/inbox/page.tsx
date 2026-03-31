'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, Eye, Star } from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import { getFilteredMockLikes, getDisplayName } from '@/lib/mockData';
import { useTranslation } from '@/lib/i18n';
import { CulturalBadge } from '@/types';

function CulturalScoreBadge({ score, badge }: { score: number; badge: CulturalBadge }) {
  const colorMap: Record<CulturalBadge, string> = {
    gold: 'bg-amber-500 text-white',
    green: 'bg-emerald-500 text-white',
    orange: 'bg-orange-500 text-white',
    none: 'bg-gray-400 text-white',
  };
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
      className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full ${colorMap[badge]} shadow-md backdrop-blur-sm`}
    >
      <Star className="w-3 h-3 fill-current" />
      <span className="text-[11px] font-bold">{score}%</span>
    </motion.div>
  );
}

export default function InboxPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const allLikes = getFilteredMockLikes();
  const [likes, setLikes] = useState(allLikes);
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');

  const LIKED_LABELS = [
    t('inbox.likedYourPhoto'),
    t('inbox.likedYourAnswer'),
    t('inbox.likedYourProfile'),
    t('inbox.likedYourBio'),
    t('inbox.likedYourInterests'),
    t('inbox.likedYourVibe'),
  ];

  const current = likes[0];
  const upNext = likes.slice(1, 4);

  const handleAction = (action: 'like' | 'pass') => {
    setExitDirection(action === 'like' ? 'right' : 'left');
    setTimeout(() => {
      setLikes((prev) => prev.slice(1));
    }, 10);
  };

  return (
    <AppShell>
      <div className="flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-charcoal">{t('inbox.likesYou')}</h1>
            <span className="text-sm text-textLight font-medium">{likes.length} {t('inbox.pending')}</span>
          </div>

          {likes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-rose/10 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-rose" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2">{t('inbox.allCaughtUp')}</h3>
              <p className="text-textLight text-sm max-w-sm">
                {t('inbox.noPendingLikes')}
              </p>
            </div>
          ) : (
            <>
              {/* What they liked */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose/10 text-rose text-sm font-medium rounded-full">
                  <Heart className="w-3.5 h-3.5 fill-rose" />
                  {LIKED_LABELS[likes.indexOf(current) % LIKED_LABELS.length]}
                </span>
              </div>

              {/* Main card */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      x: exitDirection === 'right' ? 300 : -300,
                      opacity: 0,
                      rotate: exitDirection === 'right' ? 12 : -12,
                      transition: { duration: 0.3, ease: 'easeInOut' },
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-card">
                      {/* Photo */}
                      <div className="relative aspect-[4/5]">
                        <img
                          src={current.from_photos[0]?.url}
                          alt={current.from_user.first_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Cultural score badge */}
                        {current.culturalScore != null && current.culturalBadge && (
                          <CulturalScoreBadge score={current.culturalScore} badge={current.culturalBadge} />
                        )}

                        {/* Name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h2 className="text-2xl font-bold text-white">
                            {getDisplayName(current.from_user)}, {current.from_user.age}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-white/80" />
                            <span className="text-white/85 text-sm">{current.from_user.city}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-center gap-5 py-5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAction('pass')}
                          className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors shadow-md"
                          aria-label={t('discover.pass')}
                        >
                          <X className="w-7 h-7 text-gray-400" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAction('like')}
                          className="w-14 h-14 rounded-full bg-rose flex items-center justify-center hover:bg-rose-dark transition-colors shadow-lg"
                          aria-label={t('discover.like')}
                        >
                          <Heart className="w-7 h-7 text-white fill-white" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Up next */}
              {upNext.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-charcoal">{t('inbox.upNext')}</h3>
                      <p className="text-xs text-textLight mt-0.5">{t('inbox.seeAllLikes')}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {upNext.map((like) => (
                      <motion.button
                        key={like.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          // Skip to this profile by moving it to the front
                          setLikes((prev) => {
                            const idx = prev.findIndex((l) => l.id === like.id);
                            if (idx <= 0) return prev;
                            const updated = [...prev];
                            const [target] = updated.splice(idx, 1);
                            updated.unshift(target);
                            return updated;
                          });
                        }}
                        className="flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 relative cursor-pointer"
                      >
                        <img
                          src={like.from_photos[0]?.url}
                          alt={getDisplayName(like.from_user)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white font-semibold text-sm truncate">
                            {getDisplayName(like.from_user)}
                          </p>
                        </div>
                        {/* Cultural score badge on thumbnail */}
                        {like.culturalScore != null && like.culturalBadge && (
                          <CulturalScoreBadge score={like.culturalScore} badge={like.culturalBadge} />
                        )}
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 rounded-full bg-rose/90 flex items-center justify-center">
                            <Heart className="w-3 h-3 text-white fill-white" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
