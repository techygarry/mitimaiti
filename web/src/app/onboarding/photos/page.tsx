'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, X, Star, ImagePlus } from 'lucide-react';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { useTranslation } from '@/lib/i18n';

interface PhotoSlot {
  file: File | null;
  preview: string | null;
}

export default function PhotosPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    Array(6).fill({ file: null, preview: null })
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const photoCount = photos.filter((p) => p.file !== null).length;
  const canContinue = photoCount >= 1;

  const handleSlotClick = useCallback((index: number) => {
    setActiveSlot(index);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || activeSlot === null) return;

      // Validate file type
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPhotos = [...photos];
        newPhotos[activeSlot] = {
          file,
          preview: ev.target?.result as string,
        };
        setPhotos(newPhotos);
      };
      reader.readAsDataURL(file);

      // Reset input
      e.target.value = '';
    },
    [activeSlot, photos]
  );

  const handleRemove = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const newPhotos = [...photos];
      newPhotos[index] = { file: null, preview: null };
      setPhotos(newPhotos);
    },
    [photos]
  );

  const handleContinue = () => {
    // For demo, just proceed
    router.push('/onboarding/intent');
  };

  return (
    <OnboardingShell
      step={4}
      title={t('onboarding.addBestPhotos')}
      subtitle={t('onboarding.photosSubtitle')}
      canContinue={canContinue}
      onContinue={handleContinue}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-3 mt-2">
        {photos.map((photo, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => !photo.file && handleSlotClick(index)}
            className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-200 ${
              photo.file
                ? 'shadow-card'
                : 'border-2 border-dashed border-gray-300 bg-gray-50 hover:border-rose hover:bg-rose/5'
            }`}
          >
            {photo.preview ? (
              <>
                {/* Photo preview */}
                <img
                  src={photo.preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(index, e)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Main badge */}
                {index === 0 && (
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-gold px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span className="text-[10px] font-bold text-white">
                      MAIN
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                {index === 0 ? (
                  <>
                    <ImagePlus className="w-8 h-8 text-textLight/40" />
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-gold" />
                      <span className="text-xs font-medium text-textLight">
                        Main
                      </span>
                    </div>
                  </>
                ) : (
                  <Plus className="w-7 h-7 text-textLight/40" />
                )}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(photoCount / 6) * 100}%` }}
            className="h-full bg-rose rounded-full"
          />
        </div>
        <span className="text-sm font-medium text-textLight">
          {photoCount}/6
        </span>
      </div>

      <p className="text-xs text-textLight mt-3 text-center">
        {t('onboarding.photosTip')}
      </p>
    </OnboardingShell>
  );
}
