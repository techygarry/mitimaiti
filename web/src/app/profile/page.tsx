'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Settings,
  Edit3,
  Eye,
  Heart,
  MapPin,
  BadgeCheck,
  Camera,
  ChevronRight,
  Crown,
  MessageCircle,
  Star,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('You');
  const [age, setAge] = useState('25');
  const [city, setCity] = useState('Mumbai, India');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(sessionStorage.getItem('onboarding_name') || 'You');
      setAge(sessionStorage.getItem('onboarding_age') || '25');
      setCity(sessionStorage.getItem('onboarding_city') || 'Mumbai, India');
    }
  }, []);

  const completeness = 65;

  return (
    <AppShell>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Profile Card Preview */}
            <div className="lg:w-96 shrink-0">
              <div className="bg-white rounded-3xl shadow-card overflow-hidden sticky top-24">
                {/* Background gradient */}
                <div className="h-48 gradient-rose relative overflow-hidden">
                  <div className="absolute top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                  <div className="absolute bottom-5 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                </div>

                {/* Avatar - overlapping the gradient */}
                <div className="flex flex-col items-center -mt-16 px-6 pb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-white shadow-card-hover flex items-center justify-center overflow-hidden border-4 border-white">
                      <div className="w-full h-full gradient-rose flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Camera edit overlay */}
                    <button className="absolute bottom-1 right-1 w-10 h-10 bg-rose rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-rose-dark transition-colors">
                      <Camera className="w-5 h-5 text-white" />
                    </button>

                    {/* Completeness ring */}
                    <svg
                      className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
                      viewBox="0 0 140 140"
                    >
                      <circle
                        cx="70"
                        cy="70"
                        r="66"
                        fill="none"
                        stroke="#E8A0BE"
                        strokeWidth="3"
                        opacity="0.3"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r="66"
                        fill="none"
                        stroke="#B5336A"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${completeness * 4.15} ${415 - completeness * 4.15}`}
                        transform="rotate(-90 70 70)"
                      />
                    </svg>
                  </div>

                  {/* Name & Info */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-charcoal">
                        {name}, {age}
                      </h1>
                      <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500" />
                    </div>
                    <div className="flex items-center justify-center gap-1 text-textLight">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{city}</span>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <Button
                    fullWidth
                    variant="outline"
                    size="md"
                    onClick={() => router.push('/profile/edit')}
                    icon={<Edit3 className="w-4 h-4" />}
                    className="mt-5"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Info */}
            <div className="flex-1 space-y-6">
              {/* Completeness Card */}
              <Card variant="default" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">
                      Profile Completeness
                    </h3>
                    <p className="text-sm text-textLight">
                      Complete your profile to get better matches
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-rose">{completeness}%</span>
                </div>
                <ProgressBar progress={completeness} variant="rose" size="md" />
              </Card>

              {/* Stats - 4 column grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="default" hoverable className="text-center p-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-rose/10 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-rose" />
                    </div>
                    <span className="text-2xl font-bold text-charcoal">47</span>
                    <span className="text-xs text-textLight">Profile Views</span>
                  </div>
                </Card>
                <Card variant="default" hoverable className="text-center p-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-rose/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-rose" />
                    </div>
                    <span className="text-2xl font-bold text-charcoal">12</span>
                    <span className="text-xs text-textLight">Likes Received</span>
                  </div>
                </Card>
                <Card variant="default" hoverable className="text-center p-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className="text-2xl font-bold text-charcoal">5</span>
                    <span className="text-xs text-textLight">Matches</span>
                  </div>
                </Card>
                <Card variant="default" hoverable className="text-center p-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                      <Star className="w-6 h-6 text-gold" />
                    </div>
                    <span className="text-2xl font-bold text-charcoal">3</span>
                    <span className="text-xs text-textLight">Super Likes</span>
                  </div>
                </Card>
              </div>

              {/* Premium upsell */}
              <Card
                variant="default"
                hoverable
                className="bg-gradient-to-r from-gold/5 to-amber-50 border border-gold/20 cursor-pointer p-6"
                onClick={() => router.push('/premium')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-charcoal text-lg">Go Premium</h3>
                    <p className="text-sm text-textLight">
                      Unlock unlimited likes, see who likes you & more
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-textLight" />
                </div>
              </Card>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-4">
                <Card
                  variant="default"
                  hoverable
                  className="cursor-pointer p-5"
                  onClick={() => router.push('/settings')}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-textLight" />
                    <span className="font-medium text-charcoal">Settings</span>
                    <ChevronRight className="w-4 h-4 text-textLight ml-auto" />
                  </div>
                </Card>
                <Card
                  variant="default"
                  hoverable
                  className="cursor-pointer p-5"
                  onClick={() => router.push('/family')}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-textLight" />
                    <span className="font-medium text-charcoal">Family Mode</span>
                    <ChevronRight className="w-4 h-4 text-textLight ml-auto" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
