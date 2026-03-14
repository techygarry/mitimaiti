'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingShell from '@/components/onboarding/OnboardingShell';

const genderOptions = [
  { value: 'man', label: 'Man', emoji: '👨' },
  { value: 'woman', label: 'Woman', emoji: '👩' },
  { value: 'nonbinary', label: 'Non-binary', emoji: '🧑' },
];

export default function GenderPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    if (!selected) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_gender', selected);
    }
    router.push('/onboarding/photos');
  };

  return (
    <OnboardingShell
      step={3}
      title="How do you identify?"
      canContinue={!!selected}
      onContinue={handleContinue}
    >
      <div className="space-y-3 mt-4">
        {genderOptions.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelected(option.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
              selected === option.value
                ? 'border-rose bg-rose/5 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{option.emoji}</span>
            <span
              className={`text-lg font-semibold ${
                selected === option.value ? 'text-rose' : 'text-charcoal'
              }`}
            >
              {option.label}
            </span>
            {/* Radio indicator */}
            <div className="ml-auto">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
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
