'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { useTranslation } from '@/lib/i18n';

interface OnboardingShellProps {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  canContinue?: boolean;
  loading?: boolean;
  onContinue: () => void;
  continueLabel?: string;
  showBack?: boolean;
}

export default function OnboardingShell({
  step,
  totalSteps = 8,
  title,
  subtitle,
  children,
  canContinue = true,
  loading = false,
  onContinue,
  continueLabel,
  showBack = true,
}: OnboardingShellProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Progress bar inside the card */}
        <div className="px-0">
          <ProgressBar progress={progress} size="sm" animated />
        </div>

        {/* Header */}
        <div className="flex items-center px-6 pt-4 pb-2">
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-charcoal" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <div className="flex-1 text-center">
            <span className="text-xs font-medium text-textLight">
              {t('onboarding.stepOf').replace('{{step}}', String(step)).replace('{{total}}', String(totalSteps))}
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="px-6 pt-3 pb-3 overflow-y-auto max-h-[70vh]"
        >
          <h1 className="text-2xl font-bold text-charcoal mb-1">{title}</h1>
          {subtitle && (
            <p className="text-textLight text-sm mb-4">{subtitle}</p>
          )}
          <div className="mt-4">{children}</div>
        </motion.div>

        {/* Bottom CTA */}
        <div className="px-6 pb-4 pt-3">
          <Button
            fullWidth
            size="lg"
            disabled={!canContinue}
            loading={loading}
            onClick={onContinue}
          >
            {continueLabel || t('onboarding.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
