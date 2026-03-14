'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInYears } from 'date-fns';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { motion } from 'framer-motion';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function BirthdayPage() {
  const router = useRouter();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const age = useMemo(() => {
    if (!day || !month || !year) return null;
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return differenceInYears(new Date(), birthDate);
  }, [day, month, year]);

  const isUnder18 = age !== null && age < 18;
  const isValid = day !== '' && month !== '' && year !== '' && !isUnder18;

  const handleContinue = () => {
    if (!isValid) return;
    const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_dob', dob);
      sessionStorage.setItem('onboarding_age', String(age));
    }
    router.push('/onboarding/gender');
  };

  const selectClass =
    'flex-1 h-14 px-3 bg-gray-50 rounded-xl border border-gray-200 text-charcoal font-medium focus:border-rose focus:ring-2 focus:ring-rose-light outline-none transition-all appearance-none cursor-pointer';

  return (
    <OnboardingShell
      step={2}
      title="When's your birthday?"
      subtitle="Your age shows on your profile. Birthday won't be shared."
      canContinue={isValid}
      onContinue={handleContinue}
    >
      <div className="space-y-6 mt-4">
        {/* Date selectors */}
        <div className="flex gap-3">
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className={selectClass}
          >
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={String(d)}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={selectClass}
          >
            <option value="">Month</option>
            {months.map((m, i) => (
              <option key={m} value={String(i + 1)}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={selectClass}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Age display */}
        {age !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-center ${
              isUnder18
                ? 'bg-red-50 border border-red-200'
                : 'bg-rose/5 border border-rose-light/30'
            }`}
          >
            {isUnder18 ? (
              <div>
                <p className="text-red-600 font-semibold text-lg">
                  You must be 18 or older
                </p>
                <p className="text-red-500 text-sm mt-1">
                  You need to be at least 18 years old to use MitiMaiti.
                </p>
              </div>
            ) : (
              <p className="text-rose font-semibold text-lg">
                You&apos;re {age} years old
              </p>
            )}
          </motion.div>
        )}
      </div>
    </OnboardingShell>
  );
}
