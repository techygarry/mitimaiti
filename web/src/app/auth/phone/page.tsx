'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';

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
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
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
            What&apos;s your phone number?
          </h1>
          <p className="text-textLight mb-8">
            We&apos;ll send you a verification code to get started.
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
            We&apos;ll send you a verification code. Standard SMS rates may apply.
          </p>
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-8">
          <Button
            fullWidth
            size="lg"
            disabled={!isValid}
            loading={loading}
            onClick={handleContinue}
          >
            Continue
          </Button>
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
