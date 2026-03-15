'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Phone, KeyRound, Loader2, ShieldCheck } from 'lucide-react';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { requestOtp, login } = useAdminAuth();

  const handleRequestOtp = useCallback(async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestOtp(phone.trim());
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Check your phone number.');
    } finally {
      setLoading(false);
    }
  }, [phone, requestOtp]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(phone.trim(), otp.trim());
      router.push('/dashboard');
    } catch (err: any) {
      const msg =
        err.message === 'Unauthorized: Admin access required'
          ? 'This account does not have admin privileges.'
          : err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [phone, otp, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-charcoal via-brand-rose-dark to-brand-charcoal p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-rose mx-auto flex items-center justify-center shadow-lg shadow-brand-rose/30 mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MitiMaiti Admin</h1>
          <p className="text-sm text-gray-300 mt-1">Content Moderation Dashboard</p>
        </div>

        {/* Login card */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-brand-charcoal mb-1">
            {step === 'phone' ? 'Sign in' : 'Verify OTP'}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            {step === 'phone'
              ? 'Enter your admin phone number to receive an OTP.'
              : `We sent a code to ${phone}`}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input-field pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleRequestOtp}
                disabled={loading || !phone.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  OTP Code
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="input-field pl-10 text-center text-lg tracking-[0.3em] font-mono"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 4}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Verify & Sign In'
                )}
              </button>

              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="text-sm text-gray-500 hover:text-brand-rose transition-colors w-full text-center"
              >
                Use a different number
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Authorized personnel only. All actions are logged.
        </p>
      </div>
    </div>
  );
}
