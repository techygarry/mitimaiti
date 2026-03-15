'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CulturalBreakdown, KundliBreakdown } from '@/types';

interface ScoreBreakdownSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'cultural' | 'kundli';
  score: number;
  badge?: string;
  culturalBreakdown?: CulturalBreakdown;
  kundliBreakdown?: KundliBreakdown;
}

const culturalDimensions = [
  { key: 'fluency', label: 'Sindhi Fluency', max: 20, icon: '🗣' },
  { key: 'religion', label: 'Religious Alignment', max: 18, icon: '🕉' },
  { key: 'dietary', label: 'Dietary Compatibility', max: 16, icon: '🥗' },
  { key: 'festivals', label: 'Festival Traditions', max: 18, icon: '🎉' },
  { key: 'family_values', label: 'Family Values', max: 16, icon: '👨‍👩‍👧‍👦' },
  { key: 'generation', label: 'Generation Match', max: 14, icon: '🌍' },
];

const kundliGunas = [
  { key: 'varna', label: 'Varna', max: 1, description: 'Spiritual compatibility' },
  { key: 'vashya', label: 'Vashya', max: 2, description: 'Mutual attraction' },
  { key: 'tara', label: 'Tara', max: 3, description: 'Health & well-being' },
  { key: 'yoni', label: 'Yoni', max: 4, description: 'Intimacy & nature' },
  { key: 'graha_maitri', label: 'Graha Maitri', max: 5, description: 'Mental compatibility' },
  { key: 'gana', label: 'Gana', max: 6, description: 'Temperament match' },
  { key: 'bhakut', label: 'Bhakut', max: 7, description: 'Love & prosperity' },
  { key: 'nadi', label: 'Nadi', max: 8, description: 'Health of offspring' },
];

function BarChart({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-charcoal w-10 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

export default function ScoreBreakdownSheet({
  isOpen,
  onClose,
  type,
  score,
  badge,
  culturalBreakdown,
  kundliBreakdown,
}: ScoreBreakdownSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bottom-sheet-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bottom-sheet-content"
            role="dialog"
            aria-modal="true"
            aria-label={type === 'cultural' ? 'Cultural score breakdown' : 'Kundli score breakdown'}
          >
            <div className="bottom-sheet-handle" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 pt-2">
              <div>
                <h2 className="text-lg font-bold text-charcoal">
                  {type === 'cultural' ? 'Cultural Compatibility' : 'Kundli Matching'}
                </h2>
                <p className="text-sm text-textLight mt-0.5">
                  {type === 'cultural'
                    ? `${score}% - ${badge}`
                    : `${score}/36 Gunas - ${badge}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
                aria-label="Close breakdown"
              >
                <X className="w-5 h-5 text-textLight" />
              </button>
            </div>

            {/* Score circle */}
            <div className="flex justify-center pb-6">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none" stroke="#e5e7eb" strokeWidth="8"
                  />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={type === 'cultural' ? '#D4A853' : '#8b5cf6'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(type === 'cultural' ? score / 100 : score / 36) * 326.7} 326.7`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-charcoal">
                    {type === 'cultural' ? `${score}%` : `${score}/36`}
                  </span>
                  <span className="text-[10px] font-semibold text-textLight uppercase tracking-wide">
                    {badge}
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="px-6 pb-8 space-y-4">
              {type === 'cultural' && culturalBreakdown
                ? culturalDimensions.map((dim) => (
                    <div key={dim.key}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base">{dim.icon}</span>
                        <span className="text-sm font-medium text-charcoal">{dim.label}</span>
                      </div>
                      <BarChart
                        value={culturalBreakdown[dim.key as keyof CulturalBreakdown]}
                        max={dim.max}
                        color="#D4A853"
                      />
                    </div>
                  ))
                : type === 'kundli' && kundliBreakdown
                ? kundliGunas.map((guna) => (
                    <div key={guna.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-charcoal">{guna.label}</span>
                        <span className="text-xs text-textLight">{guna.description}</span>
                      </div>
                      <BarChart
                        value={kundliBreakdown[guna.key as keyof KundliBreakdown]}
                        max={guna.max}
                        color="#8b5cf6"
                      />
                    </div>
                  ))
                : (
                  <p className="text-sm text-textLight text-center py-8">
                    Detailed breakdown not available for this profile.
                  </p>
                )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
