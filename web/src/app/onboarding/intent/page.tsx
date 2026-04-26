'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { useTranslation } from '@/lib/i18n';

export default function IntentPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');

  const intentOptions = [
    { value: 'casual', label: t('onboarding.somethingCasual'), emoji: '☕', description: t('onboarding.casualDesc') },
    { value: 'serious', label: t('onboarding.somethingSerious'), emoji: '🌹', description: t('onboarding.seriousDesc') },
    { value: 'open', label: t('onboarding.openToAnything'), emoji: '✨', description: t('onboarding.openDesc') },
  ];

  const handleContinue = () => {
    if (!selected) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_intent', selected);
      localStorage.setItem('onboarding_intent', selected);
    }
    router.push('/onboarding/showme');
  };

  return (
    <OnboardingShell
      step={5}
      title={t('onboarding.lookingFor')}
      canContinue={!!selected}
      onContinue={handleContinue}
    >
      <div className="space-y-3 mt-4">
        {intentOptions.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelected(option.value)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
              selected === option.value
                ? 'border-rose bg-rose/5 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl mt-0.5">{option.emoji}</span>
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold ${
                    selected === option.value ? 'text-rose' : 'text-charcoal'
                  }`}
                >
                  {option.label}
                </h3>
                <p className="text-sm text-textLight mt-0.5">
                  {option.description}
                </p>
              </div>
              {/* Radio indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                  selected === option.value
                    ? 'border-rose'
                    : 'border-gray-300'
                }`}
              >
                {selected === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3.5 h-3.5 rounded-full bg-rose"
                  />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </OnboardingShell>
  );
}
