'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Heart,
  MapPin,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Ruler,
} from 'lucide-react';
import ScoreTag from './ScoreTag';
import ScoreBreakdownSheet from './ScoreBreakdownSheet';
import { FeedCard } from '@/types';
import { getDisplayName } from '@/lib/mockData';
import { useTranslation } from '@/lib/i18n';


// ── Hinge-style profile section with optional like button ────────────

function ProfilePhoto({ url, children }: { url: string; children?: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
        <img src={url} alt="Profile photo" className="w-full h-full object-cover" />
      </div>
      {children && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16">
          {children}
        </div>
      )}
    </div>
  );
}

function PromptCard({ prompt, answer }: { prompt: string; answer: string }) {
  return (
    <div className="px-5 py-6 bg-gray-50">
      <p className="text-xs font-bold text-rose uppercase tracking-wider mb-2">{prompt}</p>
      <p className="text-lg font-semibold text-charcoal leading-snug">{answer}</p>
    </div>
  );
}

function InfoSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 bg-white">
      {children}
    </div>
  );
}

function InfoPill({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 rounded-xl">
      <Icon className="w-4 h-4 text-textLight shrink-0" />
      <span className="text-sm text-charcoal">{text}</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

interface DiscoveryCardProps {
  card: FeedCard;
  onAction: (action: 'like' | 'pass') => void;
  likesUsed: number;
  likesMax: number;
}

export default function DiscoveryCard({ card, onAction }: DiscoveryCardProps) {
  const { user, photos, basics, personality, cultural_score, cultural_badge, cultural_breakdown, kundli_score, kundli_tier, kundli_breakdown, common_interests } = card;
  const [sheetType, setSheetType] = useState<'cultural' | 'kundli' | null>(null);
  const { t } = useTranslation();

  const intentLabel = user.intent === 'marriage' ? 'Marriage' : user.intent === 'casual' ? 'Casual' : 'Open';

  const prompts = personality?.prompts || [];
  const secondPhoto = photos.length > 1 ? photos[1] : null;
  const thirdPhoto = photos.length > 2 ? photos[2] : null;

  return (
    <>
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white rounded-3xl overflow-hidden shadow-card group relative"
        aria-label={`Profile of ${user.first_name}, ${user.age}`}
      >
        {/* Scrollable profile content */}
        <div className="max-h-[calc(100vh-18rem)] overflow-y-auto no-scrollbar">

          {/* Hero photo with name overlay */}
          <ProfilePhoto url={photos[0].url}>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-white">{getDisplayName(user)}, {user.age}</h2>
              {user.verified && <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-400" />}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-white/80" />
              <span className="text-white/90 text-sm">{user.city}</span>
              <span className="text-white/50 mx-1">·</span>
              <span className="text-white/90 text-sm">{intentLabel}</span>
            </div>
          </ProfilePhoto>

          {/* Bio */}
          {user.bio && (
            <InfoSection>
              <p className="text-base text-charcoal leading-relaxed">{user.bio}</p>
            </InfoSection>
          )}

          {/* Basics row */}
          {basics && (
            <InfoSection>
              <div className="flex flex-wrap gap-2">
                {basics.work_title && basics.company && (
                  <InfoPill icon={Briefcase} text={`${basics.work_title}, ${basics.company}`} />
                )}
                {basics.education && (
                  <InfoPill icon={GraduationCap} text={basics.education} />
                )}
                {basics.height_cm && (
                  <InfoPill icon={Ruler} text={`${basics.height_cm} cm`} />
                )}
              </div>
            </InfoSection>
          )}

          {/* First prompt */}
          {prompts[0] && (
            <PromptCard prompt={prompts[0].prompt_text} answer={prompts[0].answer} />
          )}

          {/* Second photo */}
          {secondPhoto && (
            <ProfilePhoto url={secondPhoto.url} />
          )}

          {/* Score tags */}
          <InfoSection>
            <div className="flex flex-wrap gap-2">
              <ScoreTag
                label={t('discoveryCard.cultural')}
                value={`${cultural_score}%`}
                variant="cultural"
                badge={cultural_badge}
                onClick={() => setSheetType('cultural')}
              />
              {kundli_score !== undefined && kundli_tier && (
                <ScoreTag
                  label={t('discoveryCard.kundli')}
                  value={`${kundli_score}/36`}
                  variant="kundli"
                  badge={kundli_tier}
                  onClick={() => setSheetType('kundli')}
                />
              )}
              {common_interests.length > 0 && (
                <ScoreTag
                  label={t('discoveryCard.common')}
                  value={`${common_interests.length}`}
                  variant="interests"
                  badge={common_interests.length === 1 ? t('discoveryCard.interest') : t('discoveryCard.interestsLabel')}
                />
              )}
            </div>
          </InfoSection>

          {/* Second prompt */}
          {prompts[1] && (
            <PromptCard prompt={prompts[1].prompt_text} answer={prompts[1].answer} />
          )}

          {/* Third photo */}
          {thirdPhoto && (
            <ProfilePhoto url={thirdPhoto.url} />
          )}

          {/* Interests */}
          {personality?.interests && personality.interests.length > 0 && (
            <InfoSection>
              <p className="text-xs font-bold text-textLight uppercase tracking-wider mb-3">{t('discoveryCard.interests')}</p>
              <div className="flex flex-wrap gap-2">
                {personality.interests.map((interest) => {
                  const isCommon = common_interests.includes(interest);
                  return (
                    <span
                      key={interest}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        isCommon
                          ? 'bg-rose/10 text-rose border border-rose/20'
                          : 'bg-gray-100 text-charcoal'
                      }`}
                    >
                      {isCommon && '★ '}{interest}
                    </span>
                  );
                })}
              </div>
            </InfoSection>
          )}

          {/* Languages */}
          {personality?.languages && personality.languages.length > 0 && (
            <InfoSection>
              <p className="text-xs font-bold text-textLight uppercase tracking-wider mb-3">{t('discoveryCard.languages')}</p>
              <div className="flex flex-wrap gap-2">
                {personality.languages.map((lang) => (
                  <span key={lang} className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-charcoal">
                    {lang}
                  </span>
                ))}
              </div>
            </InfoSection>
          )}

          {/* Bottom spacer for floating buttons */}
          <div className="h-24" />
        </div>

        {/* Floating action buttons — pinned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-12 px-6">
          <div className="flex items-center justify-center gap-5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAction('pass')}
              className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors shadow-md"
              aria-label="Pass"
            >
              <X className="w-7 h-7 text-gray-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAction('like')}
              className="w-14 h-14 rounded-full bg-rose flex items-center justify-center hover:bg-rose-dark transition-colors shadow-lg"
              aria-label="Like"
            >
              <Heart className="w-7 h-7 text-white fill-white" />
            </motion.button>

          </div>
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
