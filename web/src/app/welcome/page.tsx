'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Heart, Users, Shield, Sparkles, Globe, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="w-12 h-12 rounded-xl bg-rose/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-rose" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal mb-2">{title}</h3>
      <p className="text-sm text-textLight leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  description,
  delay,
}: {
  number: number;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <div className="w-14 h-14 rounded-full gradient-rose flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold shadow-md">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-charcoal mb-2">{title}</h3>
      <p className="text-sm text-textLight leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function WelcomePage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Full viewport */}
      <section className="min-h-screen relative flex items-center">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-rose" />

        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-gold/10 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left - Text content & CTAs */}
            <div className="flex-1 text-center lg:text-left">
              {/* Text Logo */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl lg:text-7xl font-bold text-white mb-4 tracking-tight"
              >
                MitiMaiti
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-2xl lg:text-3xl font-medium mb-4"
                style={{ color: '#D4A853' }}
              >
                {t('welcome.tagline')}
              </motion.p>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white/70 text-lg max-w-md mb-5 lg:mx-0 mx-auto"
              >
                {t('welcome.subtitle')}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center"
              >
                <Link href="/auth/phone">
                  <Button
                    size="lg"
                    className="bg-white text-rose hover:bg-white/90 active:bg-white/80 shadow-lg text-lg font-bold px-10"
                    aria-label="Get started with MitiMaiti"
                  >
                    {t('welcome.getStarted')}
                  </Button>
                </Link>
                <Link href="/auth/phone">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 text-lg px-10"
                    aria-label="Sign in to your account"
                  >
                    {t('welcome.signIn')}
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right - App mockup/illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex-1 flex justify-center"
            >
              <div className="relative">
                {/* Floating hearts */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-8 -left-6 z-10"
                >
                  <Heart className="w-8 h-8 text-rose-light/60 fill-rose-light/60" />
                </motion.div>
                <motion.div
                  animate={{ y: [8, -8, 8] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 right-4 z-10"
                >
                  <Heart className="w-5 h-5 text-gold/60 fill-gold/60" />
                </motion.div>
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-12 -right-8 z-10"
                >
                  <Heart className="w-6 h-6 text-white/40 fill-white/40" />
                </motion.div>

                {/* Mock phone frame with card */}
                <div className="w-72 lg:w-80 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-card">
                    <div className="h-56 gradient-rose flex items-center justify-center relative">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                        <span className="text-3xl font-bold text-white">T</span>
                      </div>
                      <Sparkles className="absolute top-4 right-4 w-5 h-5 text-gold animate-pulse" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-charcoal">Tanya, 28</h3>
                      <p className="text-sm text-textLight mt-1">Hyderabad, India</p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                          94% Cultural Match
                        </span>
                        <span className="px-2.5 py-1 bg-rose/10 text-rose rounded-full text-xs font-medium">
                          💍 Marriage
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-cream">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-4">
              {t('welcome.howItWorks')}
            </h2>
            <p className="text-textLight text-lg max-w-xl mx-auto">
              {t('welcome.howItWorksSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StepCard
              number={1}
              title={t('welcome.step1Title')}
              description={t('welcome.step1Desc')}
              delay={0.1}
            />
            <StepCard
              number={2}
              title={t('welcome.step2Title')}
              description={t('welcome.step2Desc')}
              delay={0.2}
            />
            <StepCard
              number={3}
              title={t('welcome.step3Title')}
              description={t('welcome.step3Desc')}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-4">
              {t('welcome.builtForSindhi')}
            </h2>
            <p className="text-textLight text-lg max-w-xl mx-auto">
              {t('welcome.builtForSindhiSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Sparkles}
              title={t('welcome.culturalCompatibility')}
              description={t('welcome.culturalCompatibilityDesc')}
              delay={0.1}
            />
            <FeatureCard
              icon={Users}
              title={t('welcome.familyMode')}
              description={t('welcome.familyModeDesc')}
              delay={0.15}
            />
            <FeatureCard
              icon={Shield}
              title={t('welcome.verifiedProfiles')}
              description={t('welcome.verifiedProfilesDesc')}
              delay={0.2}
            />
            <FeatureCard
              icon={Globe}
              title={t('welcome.globalNetwork')}
              description={t('welcome.globalNetworkDesc')}
              delay={0.25}
            />
            <FeatureCard
              icon={Heart}
              title={t('welcome.kundliMatching')}
              description={t('welcome.kundliMatchingDesc')}
              delay={0.3}
            />
            <FeatureCard
              icon={MessageCircle}
              title={t('welcome.respectfulConversations')}
              description={t('welcome.respectfulConversationsDesc')}
              delay={0.35}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-rose relative overflow-hidden">
        <div className="absolute top-10 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-white mb-4"
          >
            {t('welcome.readyToFind')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mb-5"
          >
            {t('welcome.joinThousands')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/auth/phone">
              <Button
                size="lg"
                className="bg-white text-rose hover:bg-white/90 shadow-lg text-lg font-bold px-12"
              >
                {t('welcome.getStarted')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-rose flex items-center justify-center">
                <span className="text-sm font-bold text-white">Mm</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                MitiMaiti
              </span>
            </div>
            <div className="flex items-center gap-6 text-white/50 text-sm">
              <span className="hover:text-white/80 cursor-pointer transition-colors">{t('welcome.termsOfService')}</span>
              <span className="hover:text-white/80 cursor-pointer transition-colors">{t('welcome.privacyPolicy')}</span>
              <span className="hover:text-white/80 cursor-pointer transition-colors">{t('welcome.contact')}</span>
            </div>
            <p className="text-white/30 text-sm">
              &copy; 2026 MitiMaiti. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
