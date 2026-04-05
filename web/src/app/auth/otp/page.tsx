'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';

export default function OtpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { verifyOtp, sendOtp } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [fullPhone, setFullPhone] = useState('');
  const fullPhoneRef = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const display = sessionStorage.getItem('auth_phone_display') || '+91 98XXX XXXXX';
      const phone = sessionStorage.getItem('auth_phone') || '';
      setPhoneDisplay(display);
      setFullPhone(phone);
      fullPhoneRef.current = phone;

      // If no phone stored, user navigated here directly — send back
      if (!phone) {
        router.replace('/auth/phone');
        return;
      }
    }
    inputRefs.current[0]?.focus();
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      // Auto-advance to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit on last digit
      if (value && index === 5) {
        const code = [...newOtp.slice(0, 5), value.slice(-1)].join('');
        if (code.length === 6) {
          handleVerify(code);
        }
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;

    const newOtp = Array(6).fill('');
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  }, []);

  const handleVerify = async (code: string) => {
    const phone = fullPhoneRef.current;
    if (!phone || code.length !== 6) return;
    setLoading(true);

    const result = await verifyOtp(phone, code);

    if (result.success) {
      showToast.success(t('auth.phoneVerified'));

      // Set lightweight cookie for middleware route guard
      document.cookie = 'mm_authenticated=1; path=/; max-age=604800; SameSite=Lax';

      // Clean up sessionStorage auth flow data
      sessionStorage.removeItem('auth_phone');
      sessionStorage.removeItem('auth_phone_display');

      if (result.isNew) {
        // New user — go to onboarding
        router.replace('/onboarding/name');
      } else {
        // Returning user — go to discover
        router.replace('/discover');
      }
    } else {
      if (result.error?.includes('expired')) {
        showToast.error('Code expired. Please request a new one.');
      } else {
        showToast.error(result.error || t('auth.invalidCode'));
      }
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }

    setLoading(false);
  };

  const handleResend = async () => {
    if (countdown > 0 || resendCount >= 3 || !fullPhone) return;

    const result = await sendOtp(fullPhone);
    if (result.success) {
      setResendCount((prev) => prev + 1);
      setCountdown(30);
      showToast.info(t('auth.newCodeSent'));
    } else {
      showToast.error(result.error || 'Failed to resend code.');
    }
  };

  const otpComplete = otp.every((d) => d !== '');

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
          <div className="w-9" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-charcoal mb-2">
            {t('auth.enterCode')}
          </h1>
          <p className="text-textLight mb-5">
            {t('auth.codeSentTo')}{' '}
            <span className="font-medium text-charcoal">{phoneDisplay}</span>
          </p>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-5">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`otp-input ${
                  digit ? 'border-rose bg-rose/5' : ''
                }`}
              />
            ))}
          </div>

          {/* Resend */}
          <div className="text-center space-y-3">
            {countdown > 0 ? (
              <p className="text-sm text-textLight">
                {t('auth.resendCodeIn')}{' '}
                <span className="font-semibold text-charcoal">
                  {countdown}s
                </span>
              </p>
            ) : resendCount >= 3 ? (
              <div>
                <p className="text-sm text-red-500 mb-2">
                  {t('auth.maxResendReached')}
                </p>
                <a
                  href="mailto:support@mitimaiti.com"
                  className="text-sm font-semibold text-rose hover:text-rose-dark transition-colors"
                >
                  {t('auth.contactSupport')}
                </a>
              </div>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-semibold text-rose hover:text-rose-dark transition-colors"
              >
                {t('auth.resendOtp')}
              </button>
            )}

            {resendCount >= 2 && resendCount < 3 && (
              <p className="text-xs text-textLight">
                {t('auth.stillNotReceived')}{' '}
                <a
                  href="mailto:support@mitimaiti.com"
                  className="text-rose font-medium hover:underline"
                >
                  {t('auth.getHelp')}
                </a>
              </p>
            )}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-5">
          <Button
            fullWidth
            size="lg"
            disabled={!otpComplete}
            loading={loading}
            onClick={() => handleVerify(otp.join(''))}
          >
            {t('auth.verify')}
          </Button>
        </div>
      </div>
    </div>
  );
}
