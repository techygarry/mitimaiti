'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [phoneDisplay, setPhoneDisplay] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const display = sessionStorage.getItem('auth_phone_display') || '+91 98XXX XXXXX';
      setPhoneDisplay(display);
    }
    // Focus first input
    inputRefs.current[0]?.focus();
  }, []);

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
    setLoading(true);

    // Demo: accept any 6-digit code
    await new Promise((r) => setTimeout(r, 1000));

    if (code.length === 6) {
      showToast.success('Phone verified successfully!');
      // For demo, treat as new user
      router.push('/onboarding/name');
    } else {
      showToast.error('Invalid code. Please try again.');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }

    setLoading(false);
  };

  const handleResend = () => {
    if (countdown > 0 || resendCount >= 3) return;
    setResendCount((prev) => prev + 1);
    setCountdown(30);
    showToast.info('New code sent!');
  };

  const otpComplete = otp.every((d) => d !== '');

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
          <div className="w-9" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-charcoal mb-2">
            Enter the code we sent
          </h1>
          <p className="text-textLight mb-8">
            Verification code sent to{' '}
            <span className="font-medium text-charcoal">{phoneDisplay}</span>
          </p>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8">
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
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-textLight">
                Resend code in{' '}
                <span className="font-semibold text-charcoal">
                  {countdown}s
                </span>
              </p>
            ) : resendCount >= 3 ? (
              <p className="text-sm text-red-500">
                Maximum resend attempts reached. Please try again later.
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-semibold text-rose hover:text-rose-dark transition-colors"
              >
                Resend OTP
              </button>
            )}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-8">
          <Button
            fullWidth
            size="lg"
            disabled={!otpComplete}
            loading={loading}
            onClick={() => handleVerify(otp.join(''))}
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  );
}
