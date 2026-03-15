'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Heart,
  MapPin,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ScoreTag from './ScoreTag';
import ScoreBreakdownSheet from './ScoreBreakdownSheet';
import { FeedCard } from '@/types';

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
      <img
        src={photos[current].url}
        alt="Profile photo"
        className="w-full h-full object-cover"
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10 touch-target"
            aria-label="Previous photo"
          />
          <button
            onClick={next}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10 touch-target"
            aria-label="Next photo"
          />

          <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <div className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <ChevronLeft className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <div className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </>
      )}

      {photos.length > 1 && (
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-20">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-white' : 'w-8 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      <div className="gradient-overlay absolute inset-0 pointer-events-none" />
    </div>
  );
}

interface DiscoveryCardProps {
  card: FeedCard;
  onAction: (action: 'like' | 'pass') => void;
  likesUsed: number;
  likesMax: number;
}

export default function DiscoveryCard({
  card,
  onAction,
  likesUsed,
  likesMax,
}: DiscoveryCardProps) {
  const { user, photos, basics, personality, cultural_score, cultural_badge, cultural_breakdown, kundli_score, kundli_tier, kundli_breakdown, common_interests } = card;
  const [sheetType, setSheetType] = useState<'cultural' | 'kundli' | null>(null);

  const intentEmoji = user.intent === 'marriage' ? '💍' : user.intent === 'casual' ? '☕' : '✨';
  const intentLabel = user.intent === 'marriage' ? 'Marriage' : user.intent === 'casual' ? 'Casual' : 'Open';

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl overflow-hidden shadow-card mb-6 group"
        aria-label={`Profile of ${user.first_name}, ${user.age}`}
      >
        {/* Photo carousel */}
        <div className="relative">
          <PhotoCarousel photos={photos} />

          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-white">
                {user.first_name}, {user.age}
              </h2>
              {user.verified && (
                <BadgeCheck className="w-7 h-7 text-blue-400 fill-blue-400" aria-label="Verified profile" />
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="glass-pill">
                <MapPin className="w-3.5 h-3.5" />
                {user.city}
              </span>
              <span className="glass-pill">
                {intentEmoji} {intentLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Content below photo */}
        <div className="p-6 space-y-5">
          {/* Score Tags row */}
          <div className="flex flex-wrap gap-2">
            <ScoreTag
              label="Cultural"
              value={`${cultural_score}%`}
              variant="cultural"
              badge={cultural_badge}
              onClick={() => setSheetType('cultural')}
            />
            {kundli_score !== undefined && kundli_tier && (
              <ScoreTag
                label="Kundli"
                value={`${kundli_score}/36`}
                variant="kundli"
                badge={kundli_tier}
                onClick={() => setSheetType('kundli')}
              />
            )}
            {common_interests.length > 0 && (
              <ScoreTag
                label="Common"
                value={`${common_interests.length}`}
                variant="interests"
                badge={common_interests.length === 1 ? 'interest' : 'interests'}
              />
            )}
          </div>

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

          {/* Interests */}
          {personality?.interests && (
            <div className="flex flex-wrap gap-2">
              {personality.interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={common_interests.includes(interest) ? 'rose' : 'gray'}
                  size="sm"
                >
                  {common_interests.includes(interest) && '✓ '}
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6 pt-3">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction('pass')}
              className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-soft touch-target"
              aria-label="Pass"
            >
              <X className="w-8 h-8 text-gray-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction('like')}
              className="w-16 h-16 rounded-full bg-rose flex items-center justify-center hover:bg-rose-dark transition-colors shadow-md touch-target"
              aria-label="Like"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.button>
          </div>

          {/* Likes counter */}
          <p className="text-center text-xs text-textLight">
            {likesUsed}/{likesMax} likes used today
          </p>
        </div>
      </motion.article>

      {/* Score breakdown sheet */}
      <ScoreBreakdownSheet
        isOpen={sheetType !== null}
        onClose={() => setSheetType(null)}
        type={sheetType || 'cultural'}
        score={sheetType === 'kundli' ? (kundli_score || 0) : cultural_score}
        badge={sheetType === 'kundli' ? (kundli_tier || '') : cultural_badge}
        culturalBreakdown={cultural_breakdown}
        kundliBreakdown={kundli_breakdown}
      />
    </>
  );
}
