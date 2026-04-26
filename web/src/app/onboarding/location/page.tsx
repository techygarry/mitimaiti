'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation } from 'lucide-react';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { cities } from '@/lib/mockData';
import { useTranslation } from '@/lib/i18n';

export default function LocationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [detecting, setDetecting] = useState(false);

  const filteredCities = useMemo(() => {
    if (!query.trim()) return cities.slice(0, 10);
    const q = query.toLowerCase();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.display.toLowerCase().includes(q)
    );
  }, [query]);

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      () => {
        // For demo, default to Mumbai
        setSelectedCity('Mumbai, India');
        setQuery('Mumbai');
        setDetecting(false);
      },
      () => {
        // Fallback
        setDetecting(false);
      },
      { timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    // Try to auto-detect on mount
    handleDetectLocation();
  }, [handleDetectLocation]);

  const handleContinue = () => {
    if (!selectedCity) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_city', selectedCity);
      localStorage.setItem('onboarding_city', selectedCity);
    }
    router.push('/onboarding/ready');
  };

  return (
    <OnboardingShell
      step={7}
      title={t('onboarding.whereAreYou')}
      subtitle={t('onboarding.locationSubtitle')}
      canContinue={!!selectedCity}
      onContinue={handleContinue}
    >
      <div className="space-y-4 mt-2">
        {/* Auto-detect button */}
        <button
          onClick={handleDetectLocation}
          disabled={detecting}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-rose/5 border border-rose-light/30 hover:bg-rose/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-rose" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-rose">
              {detecting ? t('onboarding.detecting') : t('onboarding.useCurrentLocation')}
            </p>
            <p className="text-xs text-textLight">{t('onboarding.autoDetectCity')}</p>
          </div>
        </button>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textLight" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedCity('');
            }}
            placeholder={t('onboarding.searchCity')}
            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-charcoal placeholder:text-textLight/50 focus:border-rose focus:ring-2 focus:ring-rose-light outline-none transition-all"
          />
        </div>

        {/* Selected city display */}
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-rose/5 rounded-xl border border-rose-light/30"
          >
            <MapPin className="w-5 h-5 text-rose" />
            <span className="font-semibold text-charcoal">{selectedCity}</span>
            <button
              onClick={() => {
                setSelectedCity('');
                setQuery('');
              }}
              className="ml-auto text-xs text-textLight hover:text-rose transition-colors"
            >
              {t('onboarding.change')}
            </button>
          </motion.div>
        )}

        {/* City list */}
        {!selectedCity && (
          <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
            {filteredCities.map((city) => (
              <button
                key={city.display}
                onClick={() => {
                  setSelectedCity(city.display);
                  setQuery(city.name);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-textLight shrink-0" />
                <div>
                  <span className="text-sm font-medium text-charcoal">
                    {city.name}
                  </span>
                  <span className="text-sm text-textLight ml-1">
                    {city.country}
                  </span>
                </div>
              </button>
            ))}
            {filteredCities.length === 0 && (
              <div className="px-4 py-8 text-center text-textLight text-sm">
                {t('onboarding.noCitiesFound')}
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
