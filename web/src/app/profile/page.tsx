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
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('You');
  const [age, setAge] = useState('25');
  const [city, setCity] = useState('Mumbai, India');
  const [isNonSindhi, setIsNonSindhi] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(localStorage.getItem('onboarding_name') || sessionStorage.getItem('onboarding_name') || 'You');
      setAge(localStorage.getItem('onboarding_age') || sessionStorage.getItem('onboarding_age') || '25');
      setCity(localStorage.getItem('onboarding_city') || sessionStorage.getItem('onboarding_city') || 'Mumbai, India');
      setIsNonSindhi(localStorage.getItem('onboarding_non_sindhi') === 'true');
    }
  }, []);

  const completeness = 65;

  const allSections = [
    { label: 'My Basics', sublabel: '5/8 fields', route: '/profile/edit?tab=basics', sindhiOnly: false },
    { label: 'My Sindhi Identity', sublabel: '3/5 fields', route: '/profile/edit?tab=sindhi', sindhiOnly: true },
    { label: 'My Chatti', sublabel: '0/7 fields', route: '/profile/edit?tab=chatti', sindhiOnly: true },
    { label: 'My Culture', sublabel: '0/3 fields', route: '/profile/edit?tab=culture', sindhiOnly: true },
    { label: 'My Personality', sublabel: '2/5 fields', route: '/profile/edit?tab=personality', sindhiOnly: false },
  ];

  const sections = isNonSindhi ? allSections.filter(s => !s.sindhiOnly) : allSections;

  return (
    <AppShell>
      <div className="flex gap-8 p-6">
        <div className="flex-1 max-w-xl mx-auto lg:mx-0">
          {/* Header with settings */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-charcoal">Profile</h1>
            <button
              onClick={() => router.push('/settings')}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-soft"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-charcoal" />
            </button>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-6">
            <div className="h-36 gradient-rose relative overflow-hidden">
              <div className="absolute top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute bottom-5 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="flex flex-col items-center -mt-14 px-6 pb-6">
              <div className="relative mb-3">
                <div className="w-28 h-28 rounded-full bg-white shadow-card-hover flex items-center justify-center overflow-hidden border-4 border-white">
                  <div className="w-full h-full gradient-rose flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  className="absolute bottom-0 right-0 w-9 h-9 bg-rose rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-rose-dark transition-colors touch-target"
                  aria-label="Change profile photo"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>

                <svg
                  className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
                  viewBox="0 0 124 124"
                >
                  <circle cx="62" cy="62" r="58" fill="none" stroke="#E8A0BE" strokeWidth="3" opacity="0.3" />
                  <circle
                    cx="62" cy="62" r="58"
                    fill="none" stroke="#B5336A" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${completeness * 3.64} ${364 - completeness * 3.64}`}
                    transform="rotate(-90 62 62)"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl font-bold text-charcoal">{name}, {age}</h2>
                <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-textLight">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{city}</span>
              </div>

              <button
                onClick={() => router.push('/profile/edit')}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-rose/10 text-rose rounded-full text-sm font-semibold hover:bg-rose/15 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Completeness */}
          <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-charcoal">Profile Completeness</p>
              <span className="text-lg font-bold text-rose">{completeness}%</span>
            </div>
            <ProgressBar progress={completeness} variant="rose" size="md" />
            <p className="text-xs text-textLight mt-2">Complete your profile to get better matches</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl shadow-card p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center mx-auto mb-2">
                <Eye className="w-5 h-5 text-rose" />
              </div>
              <span className="text-xl font-bold text-charcoal block">47</span>
              <span className="text-[11px] text-textLight">Views</span>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-rose" />
              </div>
              <span className="text-xl font-bold text-charcoal block">12</span>
              <span className="text-[11px] text-textLight">Likes</span>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xl font-bold text-charcoal block">5</span>
              <span className="text-[11px] text-textLight">Matches</span>
            </div>
          </div>

          {/* Profile sections */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-gray-50 mb-6">
            {sections.map((section) => (
              <button
                key={section.label}
                onClick={() => router.push(section.route)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{section.label}</p>
                  <p className="text-xs text-textLight mt-0.5">{section.sublabel}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-textLight" />
              </button>
            ))}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
