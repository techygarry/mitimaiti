'use client';

import { useState, useEffect } from 'react';

// Keys that are actually persisted across the app (onboarding + profile edit tabs).
// Keep this list in sync with the keys written by the onboarding flow and the
// persistence effects in /profile/edit.
const PROFILE_FIELDS = [
  // Onboarding
  'onboarding_name',
  'onboarding_age',
  'onboarding_dob',
  'onboarding_gender',
  'onboarding_city',
  'onboarding_intent',
  'onboarding_showme',
  'onboarding_photos',
  // Profile → Basics
  'profile_height',
  'profile_education',
  'profile_work',
  'profile_company',
  'profile_drinking',
  'profile_smoking',
  'profile_wants_kids',
  'profile_settling',
  // Profile → Sindhi identity
  'profile_sindhi_fluency',
  'profile_religion',
  'profile_gotra',
  'profile_generation',
  'profile_dietary',
  // Profile → Personality
  'profile_bio',
  'profile_prompts',
  'profile_interests',
];

function getField(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
}

// A value counts as "filled" when it is not null/empty AND, for JSON arrays
// (photos/prompts/interests), contains at least one non-empty entry.
function isFilled(key: string, raw: string | null): boolean {
  if (raw === null || raw === '' || raw === 'false') return false;
  if (key === 'onboarding_photos' || key === 'profile_prompts' || key === 'profile_interests') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.some((item) =>
          typeof item === 'string' ? item.length > 0 : item != null
        );
      }
    } catch {
      return false;
    }
  }
  return true;
}

export function getProfileCompleteness(): number {
  if (typeof window === 'undefined') return 0;
  const filled = PROFILE_FIELDS.filter((key) => isFilled(key, getField(key))).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function useProfileCompleteness(): number {
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    setCompleteness(getProfileCompleteness());
  }, []);

  return completeness;
}
