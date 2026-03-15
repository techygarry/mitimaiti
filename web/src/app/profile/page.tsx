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
  MessageCircle,
  Users,
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

  const sections = [
    { label: 'My Basics', sublabel: '5/8 fields', route: '/profile/edit?tab=basics' },
    { label: 'My Sindhi Identity', sublabel: '3/5 fields', route: '/profile/edit?tab=sindhi' },
    { label: 'My Chatti', sublabel: '0/7 fields', route: '/profile/edit?tab=chatti' },
    { label: 'My Culture', sublabel: '0/3 fields', route: '/profile/edit?tab=culture' },
    { label: 'My Personality', sublabel: '2/5 fields', route: '/profile/edit?tab=personality' },
  ];

  return (
    <AppShell>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Profile Card Preview */}
            <div className="lg:w-96 shrink-0">
              <div className="bg-white rounded-3xl shadow-card overflow-hidden sticky top-24">
                <div className="h-48 gradient-rose relative overflow-hidden">
                  <div className="absolute top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                  <div className="absolute bottom-5 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="flex flex-col items-center -mt-16 px-6 pb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-white shadow-card-hover flex items-center justify-center overflow-hidden border-4 border-white">
                      <div className="w-full h-full gradient-rose flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      className="absolute bottom-1 right-1 w-10 h-10 bg-rose rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-rose-dark transition-colors touch-target"
                      aria-label="Change profile photo"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>

                    <svg
                      className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
                      viewBox="0 0 140 140"
                    >
                      <circle
                        cx="70" cy="70" r="66"
                        fill="none" stroke="#E8A0BE" strokeWidth="3" opacity="0.3"
                      />
                      <circle
                        cx="70" cy="70" r="66"
                        fill="none" stroke="#B5336A" strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${completeness * 4.15} ${415 - completeness * 4.15}`}
                        transform="rotate(-90 70 70)"
                      />
                    </svg>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-charcoal">
                        {name}, {age}
                      </h1>
                      <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500" aria-label="Verified" />
                    </div>
                    <div className="flex items-center justify-center gap-1 text-textLight">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{city}</span>
                    </div>
                  </div>

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

            {/* Right Column - Stats & Sections */}
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

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
              </div>

              {/* Edit entry points per section */}
              <div>
                <h3 className="text-sm font-semibold text-textLight uppercase tracking-wider mb-3">
                  Profile Sections
                </h3>
                <Card variant="default" padding="none" className="divide-y divide-gray-50">
                  {sections.map((section) => (
                    <button
                      key={section.label}
                      onClick={() => router.push(section.route)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left touch-target"
                      aria-label={`Edit ${section.label}`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal">{section.label}</p>
                        <p className="text-xs text-textLight mt-0.5">{section.sublabel}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-textLight" />
                    </button>
                  ))}
                </Card>
              </div>

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
                    <Users className="w-5 h-5 text-textLight" />
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
