'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Heart, Users, Shield, Sparkles, Globe, MessageCircle } from 'lucide-react';

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
      className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow"
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
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mb-8 inline-block"
              >
                <div className="w-20 h-20 bg-white/15 rounded-3xl backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    Mm
                  </span>
                </div>
              </motion.div>

              {/* App Name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
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
                Where Sindhi Hearts Meet
              </motion.p>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white/70 text-lg max-w-md mb-8 lg:mx-0 mx-auto"
              >
                The modern way to find love rooted in tradition. Connect with Sindhis worldwide.
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
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/auth/phone">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 text-lg px-10"
                  >
                    Sign In
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
                        <span className="text-3xl font-bold text-white">P</span>
                      </div>
                      <Sparkles className="absolute top-4 right-4 w-5 h-5 text-gold animate-pulse" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-charcoal">Priya, 27</h3>
                      <p className="text-sm text-textLight mt-1">Mumbai, India</p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                          92% Cultural Match
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
              How It Works
            </h2>
            <p className="text-textLight text-lg max-w-xl mx-auto">
              Find your perfect Sindhi match in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StepCard
              number={1}
              title="Create Your Profile"
              description="Share your story, traditions, and what matters to you. Add your cultural preferences for better matches."
              delay={0.1}
            />
            <StepCard
              number={2}
              title="Discover Matches"
              description="Our cultural compatibility algorithm finds people who share your values and traditions."
              delay={0.2}
            />
            <StepCard
              number={3}
              title="Connect & Meet"
              description="Start meaningful conversations, get family involved if you want, and build something real."
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
              Built for the Sindhi Community
            </h2>
            <p className="text-textLight text-lg max-w-xl mx-auto">
              Features designed with cultural understanding at the core
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Sparkles}
              title="Cultural Compatibility"
              description="Our algorithm considers Sindhi traditions, values, family involvement, and lifestyle preferences for meaningful matches."
              delay={0.1}
            />
            <FeatureCard
              icon={Users}
              title="Family Mode"
              description="Invite trusted family members to view profiles and suggest matches. Because in Sindhi culture, family matters."
              delay={0.15}
            />
            <FeatureCard
              icon={Shield}
              title="Verified Profiles"
              description="Phone verification and photo checks ensure you are connecting with real people who are serious about finding love."
              delay={0.2}
            />
            <FeatureCard
              icon={Globe}
              title="Global Sindhi Network"
              description="Connect with Sindhis across India, UAE, UK, USA, Singapore and beyond. Find someone who shares your roots."
              delay={0.25}
            />
            <FeatureCard
              icon={Heart}
              title="Kundli Matching"
              description="Optional chatti-based compatibility scoring for families who value traditional astrological matching."
              delay={0.3}
            />
            <FeatureCard
              icon={MessageCircle}
              title="Respectful Conversations"
              description="Built-in conversation starters and cultural icebreakers help you make genuine connections."
              delay={0.35}
            />
          </div>
        </div>
      </section>

      {/* Cultural Compatibility Section */}
      <section className="py-24 bg-cream">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-6">
                Cultural Compatibility{' '}
                <span className="text-rose">Scoring</span>
              </h2>
              <p className="text-textLight text-lg mb-6 leading-relaxed">
                We go beyond surface-level matching. Our algorithm considers your Sindhi fluency,
                family values, dietary preferences, festivals you celebrate, and more to find someone
                who truly understands your world.
              </p>
              <div className="space-y-4">
                {[
                  'Sindhi language fluency matching',
                  'Religious and spiritual alignment',
                  'Family involvement preferences',
                  'Dietary and lifestyle compatibility',
                  'Festival and cultural traditions',
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-rose/10 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-rose" />
                    </div>
                    <span className="text-charcoal">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 flex justify-center"
            >
              <div className="w-64 h-64 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle
                    cx="100" cy="100" r="90"
                    fill="none" stroke="#E8A0BE" strokeWidth="8" opacity="0.3"
                  />
                  <circle
                    cx="100" cy="100" r="90"
                    fill="none" stroke="#B5336A" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="481 565"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-rose">85%</span>
                  <span className="text-sm text-textLight mt-1">Average Match Score</span>
                </div>
              </div>
            </motion.div>
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
            Ready to find your Sindhi soulmate?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mb-8"
          >
            Join thousands of Sindhis who have found meaningful connections on MitiMaiti.
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
                Get Started Free
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
              <span className="hover:text-white/80 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white/80 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white/80 cursor-pointer transition-colors">Contact</span>
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
