'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingShell from '@/components/onboarding/OnboardingShell';

export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [nonSindhi, setNonSindhi] = useState(false);

  const isValid = name.trim().length >= 2 && name.trim().length <= 50;

  const handleContinue = () => {
    if (!isValid) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_name', name.trim());
      localStorage.setItem('onboarding_name', name.trim());
      sessionStorage.setItem('onboarding_non_sindhi', String(nonSindhi));
      localStorage.setItem('onboarding_non_sindhi', String(nonSindhi));
    }
    router.push('/onboarding/birthday');
  };

  return (
    <OnboardingShell
      step={1}
      title="What's your first name?"
      subtitle="This is how it appears on your profile."
      canContinue={isValid}
      onContinue={handleContinue}
    >
      <div className="mt-4">
        <input
          type="text"
          autoFocus
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your first name"
          className="w-full text-3xl font-semibold text-charcoal border-b-2 border-gray-200 pb-3 focus:border-rose outline-none transition-colors bg-transparent placeholder:text-textLight/30"
        />
        <div className="flex justify-between mt-2">
          <p className="text-xs text-textLight">
            Only your first name will be visible
          </p>
          <p className="text-xs text-textLight">{name.length}/50</p>
        </div>

        {/* Non-Sindhi toggle */}
        <div className="mt-6 relative">
          <div className="flex items-center justify-between gap-4 p-4 pr-16 bg-rose/5 border border-rose/10 rounded-2xl">
            <div>
              <p className="text-sm font-semibold text-charcoal">Not Sindhi? No worries!</p>
              <p className="text-xs text-textLight mt-0.5">Open to vibing with the Sindhi community</p>
            </div>
          </div>
          <div
            onClick={() => setNonSindhi(!nonSindhi)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
            style={{ width: 52, height: 52 }}
          >
            <div
              className="absolute inset-0 rounded-full transition-colors duration-200"
              style={{ backgroundColor: nonSindhi ? '#B5336A' : '#D9DCE2' }}
            />
            <div
              className="absolute rounded-full transition-all duration-200 z-30"
              style={{
                width: 18,
                height: 18,
                top: nonSindhi ? 6 : 6,
                left: nonSindhi ? 20 : 6,
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
