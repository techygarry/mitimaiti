'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInYears } from 'date-fns';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthAbbrevs = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

/** Returns the 1-based month number string if the input is valid, otherwise ''. */
function parseMonthInput(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  // Numeric: 1–12
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num >= 1 && num <= 12 && String(num) === trimmed) {
    return String(num);
  }
  // 3-letter abbreviation
  const abbrevIdx = monthAbbrevs.indexOf(trimmed.slice(0, 3));
  if (abbrevIdx !== -1 && (trimmed.length === 3 || trimmed === monthAbbrevs[abbrevIdx])) {
    return String(abbrevIdx + 1);
  }
  return '';
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function BirthdayPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');        // stored as numeric string "1"–"12"
  const [monthDisplay, setMonthDisplay] = useState(''); // text shown in the input
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
      localStorage.setItem('onboarding_dob', dob);
      localStorage.setItem('onboarding_age', String(age));
    }
    router.push('/onboarding/gender');
  };

  const inputClass =
    'flex-1 min-w-0 h-14 px-3 bg-gray-50 rounded-xl border border-gray-200 text-charcoal font-medium focus:border-rose focus:ring-2 focus:ring-rose-light outline-none transition-all';

  return (
    <OnboardingShell
      step={2}
      title={t('onboarding.birthdayTitle')}
      subtitle={t('onboarding.birthdaySubtitle')}
      canContinue={isValid}
      onContinue={handleContinue}
    >
      <div className="space-y-4 mt-4">
        {/* Date selectors */}
        <div className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={day}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 2);
              const num = parseInt(val, 10);
              if (val === '' || (num >= 1 && num <= 31)) {
                setDay(val);
              }
            }}
            placeholder={t('onboarding.day')}
            className={inputClass}
          />

          <input
            type="text"
            value={monthDisplay}
            onChange={(e) => {
              const raw = e.target.value;
              setMonthDisplay(raw);
              // Only set month value for 2-digit numbers or abbreviations, not single digits (so user can type 11, 12)
              const trimmed = raw.trim().toLowerCase();
              const num = parseInt(trimmed, 10);
              if (!isNaN(num) && num >= 1 && num <= 12 && trimmed.length === 2) {
                setMonth(String(num));
              } else {
                const parsed = parseMonthInput(raw);
                if (parsed && isNaN(parseInt(trimmed, 10))) {
                  setMonth(parsed);
                } else if (trimmed.length === 0) {
                  setMonth('');
                }
              }
            }}
            onBlur={() => {
              // Convert to abbreviation on blur
              const parsed = parseMonthInput(monthDisplay);
              if (parsed) {
                setMonth(parsed);
                setMonthDisplay(monthAbbrevs[parseInt(parsed, 10) - 1].replace(/^\w/, (c) => c.toUpperCase()));
              }
            }}
            placeholder={t('onboarding.month')}
            className={inputClass}
          />

          <input
            type="text"
            inputMode="numeric"
            value={year}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setYear(val);
            }}
            placeholder={t('onboarding.year')}
            className={inputClass}
          />
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
                  {t('onboarding.mustBe18')}
                </p>
                <p className="text-red-500 text-sm mt-1">
                  {t('onboarding.needToBe18')}
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
