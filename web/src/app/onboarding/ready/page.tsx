'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { MapPin, Sparkles, ChevronRight } from 'lucide-react';

const confettiColors = ['#B5336A', '#D4A853', '#E8A0BE', '#8A1A4A', '#FF6B9D', '#FFD700'];

function ConfettiPiece({ index }: { index: number }) {
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    backgroundColor: confettiColors[index % confettiColors.length],
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2 + Math.random() * 2}s`,
    width: `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 8}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    transform: `rotate(${Math.random() * 360}deg)`,
  }), [index]);

  return <div className="confetti-piece" style={style} />;
}

export default function ReadyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(sessionStorage.getItem('onboarding_name') || 'You');
      setAge(sessionStorage.getItem('onboarding_age') || '25');
      setCity(sessionStorage.getItem('onboarding_city') || 'Mumbai, India');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-8 relative overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-x-0 top-0 h-96 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
        {/* Content */}
        <div className="flex flex-col items-center px-8 pt-10 pb-4">
          {/* Celebration emoji */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="text-7xl mb-6"
          >
            🎉
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-charcoal mb-2 text-center"
          >
            You&apos;re In!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-textLight text-center mb-8"
          >
            Welcome to the MitiMaiti community, {name}!
          </motion.p>

          {/* Profile preview card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-xs bg-white rounded-3xl shadow-card-hover overflow-hidden border border-gray-100"
          >
            {/* Avatar area */}
            <div className="h-48 gradient-rose flex items-center justify-center relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <span className="text-4xl font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <Sparkles className="absolute top-4 right-4 w-5 h-5 text-gold animate-pulse-soft" />
              <Sparkles className="absolute bottom-6 left-4 w-4 h-4 text-white/50 animate-pulse-soft" />
            </div>

            {/* Info */}
            <div className="p-5">
              <h2 className="text-xl font-bold text-charcoal">
                {name}, {age}
              </h2>
              <div className="flex items-center gap-1 mt-1 text-textLight">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{city}</span>
              </div>

              {/* Completeness */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-textLight">
                    Profile completeness
                  </span>
                  <span className="text-sm font-bold text-rose">35%</span>
                </div>
                <ProgressBar progress={35} variant="rose" size="md" />
              </div>

              <p className="text-xs text-textLight mt-3 text-center">
                Fill out more to get better matches!
              </p>
            </div>
          </motion.div>

          {/* Complete identity prompt */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => router.push('/profile/edit')}
            className="w-full mt-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors text-left"
            aria-label="Complete your profile"
          >
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <span className="text-lg">{typeof window !== 'undefined' && localStorage.getItem('onboarding_non_sindhi') === 'true' ? '✨' : '🕉'}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-charcoal">
                {typeof window !== 'undefined' && localStorage.getItem('onboarding_non_sindhi') === 'true' ? 'Complete your Profile' : 'Complete your Sindhi Identity'}
              </p>
              <p className="text-xs text-textLight mt-0.5">
                {typeof window !== 'undefined' && localStorage.getItem('onboarding_non_sindhi') === 'true' ? 'Add more details for better matching' : 'Add fluency, gotra, festivals for better cultural matching'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-textLight shrink-0" />
          </motion.button>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-8 pb-8 pt-4"
        >
          <Button
            fullWidth
            size="lg"
            onClick={() => router.push('/discover')}
            icon={<Sparkles className="w-5 h-5" />}
          >
            Go to Discover
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
