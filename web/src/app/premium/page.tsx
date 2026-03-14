'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  Heart,
  Star,
  MessageCircle,
  Eye,
  SlidersHorizontal,
  Globe,
  EyeOff,
  CheckCheck,
  Zap,
  RotateCcw,
  Crown,
  Sparkles,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';

const benefits = [
  {
    icon: Heart,
    title: 'Unlimited Likes',
    description: 'Like as many profiles as you want, every day',
  },
  {
    icon: Star,
    title: '5 Super Likes / Week',
    description: 'Stand out from the crowd',
  },
  {
    icon: MessageCircle,
    title: '3 Comments / Week',
    description: 'Send comments on profiles you love',
  },
  {
    icon: Eye,
    title: 'See Who Likes You',
    description: 'No more guessing - see every like instantly',
  },
  {
    icon: SlidersHorizontal,
    title: 'Advanced Filters',
    description: '16 filters including religion, gotra, dietary & more',
  },
  {
    icon: Sparkles,
    title: 'Kundli Matching',
    description: 'Get chatti-based compatibility scores',
  },
  {
    icon: Globe,
    title: 'Passport',
    description: 'Browse profiles in any city worldwide',
  },
  {
    icon: EyeOff,
    title: 'Incognito Mode',
    description: 'Browse without anyone knowing',
  },
  {
    icon: CheckCheck,
    title: 'Read Receipts',
    description: 'Know when your messages are read',
  },
  {
    icon: Zap,
    title: 'Priority in Feed',
    description: 'Your profile gets shown first',
  },
  {
    icon: RotateCcw,
    title: 'Unlimited Rewinds',
    description: 'Accidentally passed? Bring them back',
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <AppShell>
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-gold/20 to-amber-50" />
        <div className="absolute top-10 -right-10 w-60 h-60 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-5 -left-10 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-6 py-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-gold mb-6 shadow-lg"
          >
            <Crown className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-charcoal mb-3"
          >
            MitiMaiti{' '}
            <span className="text-gold">Premium</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-textLight max-w-lg mx-auto"
          >
            The best experience for finding your Sindhi soulmate
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12">
        {/* Benefits Grid - 2 or 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 -mt-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.04 }}
              >
                <Card variant="default" hoverable className="p-5 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-charcoal mb-0.5">
                        {benefit.title}
                      </h3>
                      <p className="text-xs text-textLight">
                        {benefit.description}
                      </p>
                    </div>
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing Cards - Side by side */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-charcoal text-center mb-6">Choose your plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Yearly */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => setSelectedPlan('yearly')}
              className={`w-full relative rounded-2xl border-2 p-6 text-left transition-all ${
                selectedPlan === 'yearly'
                  ? 'border-gold bg-gold/5 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Best value badge */}
              <div className="absolute -top-3 left-4">
                <Badge variant="gold" size="sm">
                  BEST VALUE - Save 58%
                </Badge>
              </div>

              <div className="mt-2">
                <h3 className="font-bold text-charcoal text-xl mb-1">Yearly</h3>
                <p className="text-sm text-textLight mb-4">12 months</p>
                <p className="text-3xl font-bold text-charcoal">
                  ₹499<span className="text-sm font-normal text-textLight">/mo</span>
                </p>
                <p className="text-sm text-textLight line-through">₹1,199/mo</p>
              </div>

              {/* Radio */}
              <div
                className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'yearly' ? 'border-gold' : 'border-gray-300'
                }`}
              >
                {selectedPlan === 'yearly' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-gold" />
                )}
              </div>
            </motion.button>

            {/* Monthly */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={() => setSelectedPlan('monthly')}
              className={`w-full relative rounded-2xl border-2 p-6 text-left transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-gold bg-gold/5 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <h3 className="font-bold text-charcoal text-xl mb-1">Monthly</h3>
                <p className="text-sm text-textLight mb-4">1 month</p>
                <p className="text-3xl font-bold text-charcoal">
                  ₹1,199<span className="text-sm font-normal text-textLight">/mo</span>
                </p>
              </div>

              {/* Radio */}
              <div
                className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly' ? 'border-gold' : 'border-gray-300'
                }`}
              >
                {selectedPlan === 'monthly' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-gold" />
                )}
              </div>
            </motion.button>
          </div>

          {/* Subscribe button */}
          <Button
            fullWidth
            size="lg"
            onClick={() => showToast.success('Subscription started! (Demo)')}
            className="gradient-gold border-0 shadow-lg mb-4"
          >
            <Crown className="w-5 h-5 mr-2" />
            Subscribe for{' '}
            {selectedPlan === 'yearly' ? '₹5,988/year' : '₹1,199/month'}
          </Button>

          {/* Restore purchases */}
          <button
            onClick={() => showToast.info('No previous purchases found')}
            className="w-full text-center text-sm text-textLight hover:text-rose transition-colors py-2"
          >
            Restore Purchases
          </button>

          {/* Fine print */}
          <p className="text-xs text-textLight text-center mt-4 leading-relaxed px-4">
            Subscriptions auto-renew unless cancelled at least 24 hours before the
            end of the current period. You can manage subscriptions in your account
            settings.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
