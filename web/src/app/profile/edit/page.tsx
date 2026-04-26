'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  X,
  Star,
  Camera,
  Check,
  ChevronDown,
  Crown,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import { interestOptions, promptOptions } from '@/lib/mockData';
import { useTranslation } from '@/lib/i18n';

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-textMain mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            showToast.success(t('profileEdit.saved'));
          }}
          className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-charcoal focus:border-rose focus:ring-2 focus:ring-rose-light outline-none transition-all pr-10"
          aria-label={label}
        >
          <option value="">{t('profileEdit.select')}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textLight pointer-events-none" />
      </div>
    </div>
  );
}

// Map from tab-state field → localStorage key (used by useProfileCompleteness)
const BASICS_STORAGE: Record<string, string> = {
  height: 'profile_height',
  education: 'profile_education',
  work_title: 'profile_work',
  company: 'profile_company',
  drinking: 'profile_drinking',
  smoking: 'profile_smoking',
  wants_kids: 'profile_wants_kids',
  settling: 'profile_settling',
};

function BasicsTab() {
  const { t } = useTranslation();
  const [basics, setBasics] = useState({
    height: '',
    education: '',
    work_title: '',
    company: '',
    drinking: '',
    smoking: '',
    wants_kids: '',
    settling: '',
    exercise: '',
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setBasics((prev) => {
      const next = { ...prev };
      for (const [field, key] of Object.entries(BASICS_STORAGE)) {
        const val = localStorage.getItem(key);
        if (val !== null) (next as Record<string, string>)[field] = val;
      }
      return next;
    });
  }, []);

  const update = (key: string, value: string) => {
    setBasics((prev) => ({ ...prev, [key]: value }));
    const storageKey = BASICS_STORAGE[key];
    if (storageKey) {
      if (value) localStorage.setItem(storageKey, value);
      else localStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="p-4 space-y-1">
      <div className="mb-4">
        <Input
          label={t('profileEdit.heightCm')}
          type="number"
          placeholder="170"
          value={basics.height}
          onChange={(e) => update('height', e.target.value)}
          onBlur={() => basics.height && showToast.success(t('profileEdit.saved'))}
        />
      </div>
      <div className="mb-4">
        <Input
          label={t('profileEdit.education')}
          placeholder="e.g., MBA, IIM Ahmedabad"
          value={basics.education}
          onChange={(e) => update('education', e.target.value)}
          onBlur={() => basics.education && showToast.success(t('profileEdit.saved'))}
        />
      </div>
      <div className="mb-4">
        <Input
          label={t('profileEdit.jobTitle')}
          placeholder="e.g., Product Manager"
          value={basics.work_title}
          onChange={(e) => update('work_title', e.target.value)}
          onBlur={() => basics.work_title && showToast.success(t('profileEdit.saved'))}
        />
      </div>
      <div className="mb-4">
        <Input
          label={t('profileEdit.company')}
          placeholder="e.g., Google"
          value={basics.company}
          onChange={(e) => update('company', e.target.value)}
          onBlur={() => basics.company && showToast.success(t('profileEdit.saved'))}
        />
      </div>
      <SelectField
        label={t('profileEdit.drinking')}
        value={basics.drinking}
        onChange={(v) => update('drinking', v)}
        options={[
          { value: 'never', label: 'Never' },
          { value: 'socially', label: 'Socially' },
          { value: 'regularly', label: 'Regularly' },
        ]}
      />
      <SelectField
        label={t('profileEdit.smoking')}
        value={basics.smoking}
        onChange={(v) => update('smoking', v)}
        options={[
          { value: 'never', label: 'Never' },
          { value: 'socially', label: 'Socially' },
          { value: 'regularly', label: 'Regularly' },
        ]}
      />
      <SelectField
        label={t('profileEdit.wantKids')}
        value={basics.wants_kids}
        onChange={(v) => update('wants_kids', v)}
        options={[
          { value: 'want', label: 'Want someday' },
          { value: 'dont_want', label: "Don't want" },
          { value: 'have_and_want_more', label: 'Have & want more' },
          { value: 'have_and_done', label: 'Have & done' },
          { value: 'open', label: 'Open to it' },
        ]}
      />
      <SelectField
        label={t('profileEdit.settlingTimeline')}
        value={basics.settling}
        onChange={(v) => update('settling', v)}
        options={[
          { value: 'asap', label: 'As soon as possible' },
          { value: '1_2_years', label: '1-2 years' },
          { value: '3_5_years', label: '3-5 years' },
          { value: 'not_sure', label: 'Not sure yet' },
        ]}
      />
    </div>
  );
}

const SINDHI_STORAGE: Record<string, string> = {
  fluency: 'profile_sindhi_fluency',
  religion: 'profile_religion',
  gotra: 'profile_gotra',
  generation: 'profile_generation',
  dietary: 'profile_dietary',
  family_involvement: 'profile_family_involvement',
};

function SindhiTab() {
  const { t } = useTranslation();
  const [sindhi, setSindhi] = useState({
    fluency: '',
    religion: '',
    gotra: '',
    generation: '',
    dietary: '',
    family_involvement: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSindhi((prev) => {
      const next = { ...prev };
      for (const [field, key] of Object.entries(SINDHI_STORAGE)) {
        const val = localStorage.getItem(key);
        if (val !== null) (next as Record<string, string>)[field] = val;
      }
      return next;
    });
  }, []);

  const update = (key: string, value: string) => {
    setSindhi((prev) => ({ ...prev, [key]: value }));
    const storageKey = SINDHI_STORAGE[key];
    if (storageKey) {
      if (value) localStorage.setItem(storageKey, value);
      else localStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="p-4 space-y-1">
      <SelectField
        label={t('profileEdit.sindhiFluency')}
        value={sindhi.fluency}
        onChange={(v) => update('fluency', v)}
        options={[
          { value: 'fluent', label: 'Fluent' },
          { value: 'conversational', label: 'Conversational' },
          { value: 'basic', label: 'Basic' },
          { value: 'learning', label: 'Learning' },
          { value: 'none', label: 'None' },
        ]}
      />
      <SelectField
        label={t('profileEdit.religion')}
        value={sindhi.religion}
        onChange={(v) => update('religion', v)}
        options={[
          { value: 'hindu', label: 'Hindu' },
          { value: 'sikh', label: 'Sikh' },
          { value: 'muslim', label: 'Muslim' },
          { value: 'christian', label: 'Christian' },
          { value: 'spiritual', label: 'Spiritual' },
          { value: 'other', label: 'Other' },
        ]}
      />
      <div className="mb-4">
        <Input
          label={t('profileEdit.gotra')}
          placeholder="e.g., Lohana, Amil, Bhatia"
          value={sindhi.gotra}
          onChange={(e) => update('gotra', e.target.value)}
          onBlur={() => sindhi.gotra && showToast.success(t('profileEdit.saved'))}
        />
      </div>
      <SelectField
        label={t('profileEdit.generation')}
        value={sindhi.generation}
        onChange={(v) => update('generation', v)}
        options={[
          { value: 'sindhi_born', label: 'Sindhi-born' },
          { value: '2nd_gen', label: '2nd Generation' },
          { value: '3rd_gen', label: '3rd Generation' },
          { value: 'mixed', label: 'Mixed heritage' },
        ]}
      />
      <SelectField
        label={t('profileEdit.dietaryPreference')}
        value={sindhi.dietary}
        onChange={(v) => update('dietary', v)}
        options={[
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'non_vegetarian', label: 'Non-Vegetarian' },
          { value: 'eggetarian', label: 'Eggetarian' },
          { value: 'vegan', label: 'Vegan' },
          { value: 'jain', label: 'Jain' },
        ]}
      />
    </div>
  );
}

function ChattiTab() {
  const { t } = useTranslation();
  const [chatti, setChatti] = useState({
    chatti_name: '',
    chatti_dob: '',
    time_of_birth: '',
    place_of_birth: '',
    nakshatra: '',
    rashi: '',
    manglik: '',
  });

  const update = (key: string, value: string) => {
    setChatti((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 space-y-1">
      <Card variant="filled" padding="md" className="mb-4">
        <p className="text-sm text-textLight">
          {t('profileEdit.chattiDetails')}
        </p>
      </Card>
      <div className="mb-4">
        <Input label={t('profileEdit.chattiName')} placeholder="Enter your chatti name" value={chatti.chatti_name} onChange={(e) => update('chatti_name', e.target.value)} onBlur={() => chatti.chatti_name && showToast.success(t('profileEdit.saved'))} />
      </div>
      <div className="mb-4">
        <Input label={t('profileEdit.chattiDob')} type="date" value={chatti.chatti_dob} onChange={(e) => { update('chatti_dob', e.target.value); showToast.success(t('profileEdit.saved')); }} />
      </div>
      <div className="mb-4">
        <Input label={t('profileEdit.timeOfBirth')} type="time" value={chatti.time_of_birth} onChange={(e) => { update('time_of_birth', e.target.value); showToast.success(t('profileEdit.saved')); }} />
      </div>
      <div className="mb-4">
        <Input label={t('profileEdit.placeOfBirth')} placeholder="e.g., Mumbai, India" value={chatti.place_of_birth} onChange={(e) => update('place_of_birth', e.target.value)} onBlur={() => chatti.place_of_birth && showToast.success(t('profileEdit.saved'))} />
      </div>
      <SelectField label={t('profileEdit.nakshatra')} value={chatti.nakshatra} onChange={(v) => update('nakshatra', v)} options={[
        { value: 'ashwini', label: 'Ashwini' }, { value: 'bharani', label: 'Bharani' }, { value: 'krittika', label: 'Krittika' }, { value: 'rohini', label: 'Rohini' }, { value: 'mrigashira', label: 'Mrigashira' }, { value: 'ardra', label: 'Ardra' }, { value: 'punarvasu', label: 'Punarvasu' }, { value: 'pushya', label: 'Pushya' }, { value: 'ashlesha', label: 'Ashlesha' }, { value: 'magha', label: 'Magha' }, { value: 'purva_phalguni', label: 'Purva Phalguni' }, { value: 'uttara_phalguni', label: 'Uttara Phalguni' }, { value: 'hasta', label: 'Hasta' }, { value: 'chitra', label: 'Chitra' }, { value: 'swati', label: 'Swati' }, { value: 'vishakha', label: 'Vishakha' }, { value: 'anuradha', label: 'Anuradha' }, { value: 'jyeshtha', label: 'Jyeshtha' }, { value: 'mula', label: 'Mula' }, { value: 'purva_ashadha', label: 'Purva Ashadha' }, { value: 'uttara_ashadha', label: 'Uttara Ashadha' }, { value: 'shravana', label: 'Shravana' }, { value: 'dhanishta', label: 'Dhanishta' }, { value: 'shatabhisha', label: 'Shatabhisha' }, { value: 'purva_bhadrapada', label: 'Purva Bhadrapada' }, { value: 'uttara_bhadrapada', label: 'Uttara Bhadrapada' }, { value: 'revati', label: 'Revati' },
      ]} />
      <SelectField label={t('profileEdit.rashi')} value={chatti.rashi} onChange={(v) => update('rashi', v)} options={[
        { value: 'mesh', label: 'Mesh (Aries)' }, { value: 'vrishabh', label: 'Vrishabh (Taurus)' }, { value: 'mithun', label: 'Mithun (Gemini)' }, { value: 'kark', label: 'Kark (Cancer)' }, { value: 'sinh', label: 'Sinh (Leo)' }, { value: 'kanya', label: 'Kanya (Virgo)' }, { value: 'tula', label: 'Tula (Libra)' }, { value: 'vrishchik', label: 'Vrishchik (Scorpio)' }, { value: 'dhanu', label: 'Dhanu (Sagittarius)' }, { value: 'makar', label: 'Makar (Capricorn)' }, { value: 'kumbh', label: 'Kumbh (Aquarius)' }, { value: 'meen', label: 'Meen (Pisces)' },
      ]} />
      <SelectField label={t('profileEdit.manglik')} value={chatti.manglik} onChange={(v) => update('manglik', v)} options={[
        { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'partial', label: 'Partial (Anshik)' }, { value: 'not_sure', label: 'Not sure' },
      ]} />
    </div>
  );
}

function CultureTab() {
  const { t } = useTranslation();
  const [culture, setCulture] = useState({
    mother_tongue: '',
    community_org: '',
    cultural_events: '',
  });

  const update = (key: string, value: string) => {
    setCulture((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <Input label={t('profileEdit.motherTongue')} placeholder="e.g., Sindhi, Hindi" value={culture.mother_tongue} onChange={(e) => update('mother_tongue', e.target.value)} onBlur={() => culture.mother_tongue && showToast.success(t('profileEdit.saved'))} />
      </div>
      <div>
        <Input label={t('profileEdit.communityOrg')} placeholder="e.g., Sindhi Panchayat, SWAS" value={culture.community_org} onChange={(e) => update('community_org', e.target.value)} onBlur={() => culture.community_org && showToast.success(t('profileEdit.saved'))} helperText={t('profileEdit.communityOrgHelper')} />
      </div>
      <div>
        <Input label={t('profileEdit.culturalEvents')} placeholder="e.g., Chaliha Sahib, Thadri, Jhulelal" value={culture.cultural_events} onChange={(e) => update('cultural_events', e.target.value)} onBlur={() => culture.cultural_events && showToast.success(t('profileEdit.saved'))} helperText={t('profileEdit.culturalEventsHelper')} />
      </div>
    </div>
  );
}

function PersonalityTab() {
  const { t } = useTranslation();
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([]);
  const [addingPrompt, setAddingPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [promptAnswer, setPromptAnswer] = useState('');

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedBio = localStorage.getItem('profile_bio');
    if (storedBio) setBio(storedBio);
    try {
      const storedInterests = localStorage.getItem('profile_interests');
      if (storedInterests) {
        const parsed = JSON.parse(storedInterests);
        if (Array.isArray(parsed)) setSelectedInterests(parsed);
      }
      const storedPrompts = localStorage.getItem('profile_prompts');
      if (storedPrompts) {
        const parsed = JSON.parse(storedPrompts);
        if (Array.isArray(parsed)) setPrompts(parsed);
      }
    } catch {
      // malformed data — ignore
    }
  }, []);

  // Persist bio (debounced via onBlur; also mirror every keystroke so
  // completeness reflects reality without requiring a blur)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (bio) localStorage.setItem('profile_bio', bio);
    else localStorage.removeItem('profile_bio');
  }, [bio]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedInterests.length > 0) {
      localStorage.setItem('profile_interests', JSON.stringify(selectedInterests));
    } else {
      localStorage.removeItem('profile_interests');
    }
  }, [selectedInterests]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (prompts.length > 0) {
      localStorage.setItem('profile_prompts', JSON.stringify(prompts));
    } else {
      localStorage.removeItem('profile_prompts');
    }
  }, [prompts]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 10
        ? [...prev, interest]
        : prev
    );
  };

  const addPrompt = () => {
    if (!selectedPrompt || !promptAnswer.trim()) return;
    setPrompts((prev) => [...prev, { question: selectedPrompt, answer: promptAnswer.trim() }]);
    setSelectedPrompt('');
    setPromptAnswer('');
    setAddingPrompt(false);
    showToast.success(t('profileEdit.promptAdded'));
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-textMain mb-1.5">{t('profileEdit.bio')}</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={() => bio && showToast.success(t('profileEdit.saved'))}
          placeholder={t('profileEdit.bioPlaceholder')}
          maxLength={500}
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-charcoal placeholder:text-textLight/50 focus:border-rose focus:ring-2 focus:ring-rose-light outline-none transition-all resize-none"
          aria-label="Bio"
        />
        <p className="text-xs text-textLight mt-1">{bio.length}/500</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-textMain">{t('profileEdit.prompts')} ({prompts.length}/3)</label>
          {prompts.length < 3 && (
            <button onClick={() => setAddingPrompt(true)} className="text-sm font-semibold text-rose" aria-label="Add prompt">+ {t('profileEdit.add')}</button>
          )}
        </div>
        {prompts.map((prompt, i) => (
          <Card key={i} variant="filled" padding="md" className="mb-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-rose uppercase tracking-wide mb-1">{prompt.question}</p>
                <p className="text-textMain text-sm">{prompt.answer}</p>
              </div>
              <button onClick={() => { setPrompts((prev) => prev.filter((_, idx) => idx !== i)); showToast.success(t('profileEdit.promptRemoved')); }} className="text-textLight hover:text-red-500 transition-colors ml-2 touch-target" aria-label="Remove prompt">
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {addingPrompt && (
          <Card variant="outlined" padding="md" className="mt-2">
            <select value={selectedPrompt} onChange={(e) => setSelectedPrompt(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal mb-2 outline-none focus:border-rose" aria-label="Choose a prompt">
              <option value="">{t('profileEdit.choosePrompt')}</option>
              {promptOptions.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
            <textarea value={promptAnswer} onChange={(e) => setPromptAnswer(e.target.value)} placeholder={t('profileEdit.yourAnswer')} rows={3} maxLength={200} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal placeholder:text-textLight/50 outline-none focus:border-rose resize-none mb-2" aria-label="Prompt answer" />
            <div className="flex gap-2">
              <button onClick={() => setAddingPrompt(false)} className="flex-1 py-2 text-sm font-medium text-textLight bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors touch-target">{t('common.cancel')}</button>
              <button onClick={addPrompt} disabled={!selectedPrompt || !promptAnswer.trim()} className="flex-1 py-2 text-sm font-medium text-white bg-rose rounded-xl hover:bg-rose-dark transition-colors disabled:opacity-50 touch-target">{t('profileEdit.add')}</button>
            </div>
          </Card>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-textMain mb-3">{t('profileEdit.interests')} ({selectedInterests.length}/10)</label>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all touch-target ${
                  isSelected ? 'bg-rose text-white border-rose' : 'bg-white text-textMain border-gray-200 hover:border-rose-light'
                }`}
                aria-pressed={isSelected}
              >
                {interest}
                {isSelected && <Check className="w-3.5 h-3.5 inline ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Input label={t('profileEdit.languages')} placeholder="e.g., Sindhi, Hindi, English" helperText={t('profileEdit.languagesHelper')} onBlur={() => showToast.success(t('profileEdit.saved'))} />
      </div>

      <div>
        <Input label={t('profileEdit.voiceIntro')} placeholder="Upload a voice introduction" helperText={t('profileEdit.voiceIntroHelper')} onBlur={() => showToast.success(t('profileEdit.saved'))} />
      </div>
    </div>
  );
}

const PHOTO_COUNT = 6;

export default function EditProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('basics');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(
    Array(PHOTO_COUNT).fill('')
  );
  const isNonSindhi = typeof window !== 'undefined' && localStorage.getItem('onboarding_non_sindhi') === 'true';

  // Load persisted photos from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('onboarding_photos');
      if (raw) {
        const previews: string[] = JSON.parse(raw);
        const padded = Array(PHOTO_COUNT)
          .fill('')
          .map((_, i) => previews[i] || '');
        setPhotoPreviews(padded);
      }
    } catch {
      // malformed data — ignore
    }
  }, []);

  const savePhotos = useCallback((previews: string[]) => {
    localStorage.setItem('onboarding_photos', JSON.stringify(previews));
  }, []);

  const handleSlotClick = useCallback((index: number) => {
    setActiveSlot(index);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || activeSlot === null) return;
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotoPreviews((prev) => {
          const next = [...prev];
          next[activeSlot] = dataUrl;
          savePhotos(next);
          return next;
        });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [activeSlot, savePhotos]
  );

  const handleRemovePhoto = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setPhotoPreviews((prev) => {
        const next = [...prev];
        next[index] = '';
        savePhotos(next);
        return next;
      });
    },
    [savePhotos]
  );

  const handleSetAsMain = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setPhotoPreviews((prev) => {
        const next = [...prev];
        // Move the selected photo to index 0, shift others down
        const chosen = next[index];
        next.splice(index, 1);
        next.unshift(chosen);
        savePhotos(next);
        showToast.success('Set as main photo');
        return next;
      });
    },
    [savePhotos]
  );

  return (
    <AppShell>
      <div className="flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-charcoal" />
            </button>
            <h1 className="text-2xl font-bold text-charcoal">{t('profileEdit.editProfile')}</h1>
          </div>

          <div className="space-y-4">
            {/* Photos */}
            <div className="bg-white rounded-2xl shadow-card p-4">
              <h2 className="font-semibold text-charcoal mb-4">{t('profileEdit.photos')}</h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="grid grid-cols-3 gap-3">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-[3/4]">
                    {preview ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-card">
                        <img
                          src={preview}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Remove button */}
                        <button
                          onClick={(e) => handleRemovePhoto(i, e)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                          aria-label={`Remove photo ${i + 1}`}
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        {/* Main badge */}
                        {i === 0 && (
                          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-gold px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 text-white fill-white" />
                            <span className="text-[10px] font-bold text-white">MAIN</span>
                          </div>
                        )}
                        {/* Set as main button for non-primary photos */}
                        {i !== 0 && (
                          <button
                            onClick={(e) => handleSetAsMain(i, e)}
                            className="absolute bottom-1.5 left-1.5 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-amber-500/80 transition-colors"
                            aria-label={`Set photo ${i + 1} as main`}
                            title="Set as main photo"
                          >
                            <Crown className="w-3.5 h-3.5 text-white" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSlotClick(i)}
                        className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center hover:border-rose hover:bg-rose/5 transition-all touch-target"
                        aria-label={i === 0 ? 'Upload main photo' : `Upload photo ${i + 1}`}
                      >
                        {i === 0 ? (
                          <>
                            <Camera className="w-7 h-7 text-textLight/40 mb-1" />
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3.5 h-3.5 text-gold" />
                              <span className="text-xs text-textLight">{t('profileEdit.main')}</span>
                            </div>
                          </>
                        ) : (
                          <Plus className="w-7 h-7 text-textLight/40" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-textLight mt-3 text-center">
                {t('profileEdit.addUpTo6')}
              </p>
            </div>

            {/* Tabbed Form */}
            <div>
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <Tabs
                  tabs={isNonSindhi ? [
                    { id: 'basics', label: t('profileEdit.myBasics') },
                    { id: 'personality', label: t('profileEdit.personality') },
                  ] : [
                    { id: 'basics', label: t('profileEdit.myBasics') },
                    { id: 'sindhi', label: t('profileEdit.sindhiIdentity') },
                    { id: 'chatti', label: t('profileEdit.myChatti') },
                    { id: 'culture', label: t('profileEdit.myCulture') },
                    { id: 'personality', label: t('profileEdit.personality') },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />

                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'basics' && <BasicsTab />}
                  {!isNonSindhi && activeTab === 'sindhi' && <SindhiTab />}
                  {!isNonSindhi && activeTab === 'chatti' && <ChattiTab />}
                  {!isNonSindhi && activeTab === 'culture' && <CultureTab />}
                  {activeTab === 'personality' && <PersonalityTab />}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
