'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';

const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
];

export default function PhoneAuthPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Format as groups for display
    if (digits.length <= 5) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  };

  const rawPhone = phone.replace(/\s/g, '');
  const isValid = rawPhone.length >= 7 && rawPhone.length <= 15;

  const handleContinue = useCallback(async () => {
    if (!isValid) return;
    setLoading(true);

    // For demo, skip actual OTP sending
    const fullPhone = `${selectedCountry.code}${rawPhone}`;

    // Store phone for OTP page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_phone', fullPhone);
      sessionStorage.setItem('auth_phone_display', `${selectedCountry.code} ${formatPhone(rawPhone)}`);
    }

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push('/auth/otp');
  }, [isValid, selectedCountry.code, rawPhone, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center mb-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </button>
          <div className="flex-1 flex justify-center">
            <span className="text-lg font-bold text-rose tracking-tight">
              MitiMaiti
            </span>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-charcoal mb-2">
            {t('auth.whatsYourPhone')}
          </h1>
          <p className="text-textLight mb-5">
            {t('auth.sendVerificationCode')}
          </p>

          {/* Phone Input */}
          <div className="flex gap-3">
            {/* Country Code Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 h-14 px-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="text-xl">{selectedCountry.flag}</span>
                <span className="text-sm font-medium text-charcoal">
                  {selectedCountry.code}
                </span>
                <ChevronDown className="w-4 h-4 text-textLight" />
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-16 left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20 max-h-60 overflow-y-auto"
                >
                  {countryCodes.map((cc, i) => (
                    <button
                      key={`${cc.code}-${i}`}
                      onClick={() => {
                        setSelectedCountry(cc);
                        setShowDropdown(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-xl">{cc.flag}</span>
                      <span className="text-sm text-charcoal font-medium">
                        {cc.country}
                      </span>
                      <span className="text-sm text-textLight ml-auto">
                        {cc.code}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Phone Number Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                autoFocus
                value={phone}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(formatPhone(raw));
                }}
                placeholder="98765 43210"
                className="w-full h-14 px-4 bg-gray-50 rounded-xl border border-gray-200 text-lg font-medium text-charcoal placeholder:text-textLight/40 focus:border-rose focus:ring-2 focus:ring-rose-light transition-all"
              />
              {phone && (
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose" />
              )}
            </div>
          </div>

          <p className="text-sm text-textLight mt-4 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t('auth.verificationCodeNote')}
          </p>
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-5">
          <Button
            fullWidth
            size="lg"
            disabled={!isValid}
            loading={loading}
            onClick={handleContinue}
          >
            {t('auth.continue')}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-textLight text-sm font-medium">{t('auth.orContinueWith')}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social sign-in buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {}}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 active:bg-gray-150 transition-colors"
            aria-label="Continue with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-semibold text-gray-700">Google</span>
          </button>
          <button
            onClick={() => {}}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-black rounded-xl hover:bg-gray-900 active:bg-gray-800 transition-colors"
            aria-label="Continue with Apple"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-sm font-semibold text-white">Apple</span>
          </button>
          <button
            onClick={() => {}}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 active:bg-gray-150 transition-colors"
            aria-label="Continue with Email"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <span className="text-sm font-semibold text-gray-700">Email</span>
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
