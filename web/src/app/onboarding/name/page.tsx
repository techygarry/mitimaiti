'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingShell from '@/components/onboarding/OnboardingShell';

export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState('');

  const isValid = name.trim().length >= 2 && name.trim().length <= 50;

  const handleContinue = () => {
    if (!isValid) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_name', name.trim());
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
      </div>
    </OnboardingShell>
  );
}
