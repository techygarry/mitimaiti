'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Upload,
  Images,
  X,
  Check,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import { useProfileCompleteness } from '@/lib/useProfileCompleteness';
import { useTranslation } from '@/lib/i18n';

// ---------------------------------------------------------------------------
// PhotoPickerModal
// ---------------------------------------------------------------------------
function PhotoPickerModal({
  open,
  onClose,
  onPhotoSelected,
  uploadedPhotos,
}: {
  open: boolean;
  onClose: () => void;
  onPhotoSelected: (dataUrl: string) => void;
  uploadedPhotos: string[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onPhotoSelected(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Filtered list: exclude the current main (index 0) so user picks a different one
  const otherPhotos = uploadedPhotos.filter((p, i) => p !== '' && i !== 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-3xl bg-white shadow-2xl px-5 pt-5 pb-8"
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

            {/* Title row */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-charcoal">Change Profile Photo</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-textLight" />
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Choose from device */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-rose/8 hover:bg-rose/12 transition-colors mb-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-rose/15 flex items-center justify-center flex-shrink-0 group-hover:bg-rose/20 transition-colors">
                <Upload className="w-5 h-5 text-rose" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-charcoal">Choose from device</p>
                <p className="text-xs text-textLight mt-0.5">Upload a new photo from your gallery</p>
              </div>
            </button>

            {/* Choose from uploaded photos */}
            {otherPhotos.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Images className="w-4 h-4 text-textLight" />
                  <p className="text-sm font-medium text-textLight">Choose from uploaded photos</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedPhotos.map((photo, idx) => {
                    if (!photo || idx === 0) return null;
                    return (
                      <button
                        key={idx}
                        onClick={() => onPhotoSelected(photo)}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-rose transition-all group"
                        aria-label={`Set photo ${idx + 1} as main`}
                      >
                        <img
                          src={photo}
                          alt={`Uploaded photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-rose/0 group-hover:bg-rose/10 transition-colors flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-rose opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-50">
                <Images className="w-5 h-5 text-textLight/50 flex-shrink-0" />
                <p className="text-sm text-textLight">No other uploaded photos yet.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState('You');
  const [age, setAge] = useState('25');
  const [city, setCity] = useState('Mumbai, India');
  const [isNonSindhi, setIsNonSindhi] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<string | null>(null);
  const [allPhotos, setAllPhotos] = useState<string[]>([]);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const loadPhotos = () => {
    try {
      const raw = localStorage.getItem('onboarding_photos');
      if (raw) {
        const previews: string[] = JSON.parse(raw);
        setAllPhotos(previews);
        const first = previews.find((p) => p !== '');
        setMainPhoto(first ?? null);
      } else {
        setAllPhotos([]);
        setMainPhoto(null);
      }
    } catch {
      // malformed data — ignore
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(localStorage.getItem('onboarding_name') || sessionStorage.getItem('onboarding_name') || 'You');
      setAge(localStorage.getItem('onboarding_age') || sessionStorage.getItem('onboarding_age') || '25');
      setCity(localStorage.getItem('onboarding_city') || sessionStorage.getItem('onboarding_city') || 'Mumbai, India');
      setIsNonSindhi(localStorage.getItem('onboarding_non_sindhi') === 'true');
      loadPhotos();
    }
  }, []);

  const handlePhotoSelected = (dataUrl: string) => {
    // Build new array with chosen photo at index 0
    const current: string[] = allPhotos.length > 0
      ? [...allPhotos]
      : Array(6).fill('');

    // Remove the chosen photo from its current position (if it was already there)
    const filtered = current.filter((p) => p !== dataUrl);

    // Ensure we have 6 slots
    while (filtered.length < 6) filtered.push('');
    const next = [dataUrl, ...filtered.slice(0, 5)];

    localStorage.setItem('onboarding_photos', JSON.stringify(next));
    setAllPhotos(next);
    setMainPhoto(dataUrl);
    setPhotoModalOpen(false);
  };

  const completeness = useProfileCompleteness();

  const allSections = [
    { label: t('profile.myBasics'), sublabel: '5/8 fields', route: '/profile/edit?tab=basics', sindhiOnly: false },
    { label: t('profile.mySindhiIdentity'), sublabel: '3/5 fields', route: '/profile/edit?tab=sindhi', sindhiOnly: true },
    { label: t('profile.myChatti'), sublabel: '0/7 fields', route: '/profile/edit?tab=chatti', sindhiOnly: true },
    { label: t('profile.myCulture'), sublabel: '0/3 fields', route: '/profile/edit?tab=culture', sindhiOnly: true },
    { label: t('profile.myPersonality'), sublabel: '2/5 fields', route: '/profile/edit?tab=personality', sindhiOnly: false },
  ];

  const sections = isNonSindhi ? allSections.filter(s => !s.sindhiOnly) : allSections;

  return (
    <AppShell>
      <div className="flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Header with settings */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-charcoal">{t('nav.profile')}</h1>
            <button
              onClick={() => router.push('/settings')}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-soft"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-charcoal" />
            </button>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-3">
            <div className="h-28 gradient-rose relative overflow-hidden">
              <div className="absolute top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute bottom-5 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="flex flex-col items-center -mt-12 px-6 pb-4">
              <div className="relative mb-3">
                {/* Clickable avatar */}
                <button
                  onClick={() => setPhotoModalOpen(true)}
                  className="w-24 h-24 rounded-full bg-white shadow-card-hover flex items-center justify-center overflow-hidden border-4 border-white focus:outline-none focus:ring-2 focus:ring-rose focus:ring-offset-2 group"
                  aria-label="Change profile photo"
                >
                  {mainPhoto ? (
                    <>
                      <img
                        src={mainPhoto}
                        alt={name}
                        className="w-full h-full object-cover group-hover:brightness-90 transition-all"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full gradient-rose flex items-center justify-center relative">
                      <span className="text-3xl font-bold text-white group-hover:opacity-70 transition-opacity">
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                      </div>
                    </div>
                  )}
                </button>

                {/* Camera badge */}
                <button
                  onClick={() => setPhotoModalOpen(true)}
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
                {t('profile.editProfile')}
              </button>
            </div>
          </div>

          {/* Completeness */}
          <button onClick={() => router.push('/profile/edit')} className="w-full bg-white rounded-2xl shadow-card p-4 mb-3 text-left hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-charcoal">{t('profile.profileCompleteness')}</p>
              <span className="text-lg font-bold text-rose">{completeness}%</span>
            </div>
            <ProgressBar progress={completeness} variant="rose" size="md" />
            <p className="text-xs text-textLight mt-2">{t('profile.completeForBetterMatches')}</p>
          </button>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white rounded-2xl shadow-card p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-rose/10 flex items-center justify-center mx-auto mb-1">
                <Eye className="w-5 h-5 text-rose" />
              </div>
              <span className="text-lg font-bold text-charcoal block">47</span>
              <span className="text-[10px] text-textLight">{t('profile.views')}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-rose/10 flex items-center justify-center mx-auto mb-1">
                <Heart className="w-4 h-4 text-rose" />
              </div>
              <span className="text-lg font-bold text-charcoal block">12</span>
              <span className="text-[10px] text-textLight">{t('profile.likes')}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-1">
                <MessageCircle className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-lg font-bold text-charcoal block">5</span>
              <span className="text-[10px] text-textLight">{t('nav.matches')}</span>
            </div>
          </div>

          {/* Profile sections */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-gray-50 mb-3">
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

      {/* Photo picker modal */}
      <PhotoPickerModal
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        onPhotoSelected={handlePhotoSelected}
        uploadedPhotos={allPhotos}
      />
    </AppShell>
  );
}
