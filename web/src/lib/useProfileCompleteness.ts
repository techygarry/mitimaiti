'use client';

import { useState, useEffect } from 'react';

const PROFILE_FIELDS = [
  'onboarding_name',
  'onboarding_age',
  'onboarding_birthday',
  'onboarding_gender',
  'onboarding_city',
  'onboarding_intent',
  'onboarding_showme',
  'onboarding_photos',
  'profile_bio',
  'profile_education',
  'profile_work',
  'profile_height',
  'profile_sindhi_fluency',
  'profile_gotra',
  'profile_generation',
  'profile_dietary',
  'profile_chatti',
  'profile_cultural_badges',
  'profile_prompts',
  'profile_voice_note',
];

function getField(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
}

export function getProfileCompleteness(): number {
  if (typeof window === 'undefined') return 0;
  const filled = PROFILE_FIELDS.filter((key) => {
    const val = getField(key);
    return val !== null && val !== '' && val !== 'false';
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function useProfileCompleteness(): number {
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    setCompleteness(getProfileCompleteness());
  }, []);

  return completeness;
}
