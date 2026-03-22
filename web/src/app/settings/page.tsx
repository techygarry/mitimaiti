'use client';

import { useState } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Eye,
  EyeOff,
  Moon,
  Bell,
  Globe,
  Users,
  Shield,
  LogOut,
  Trash2,
  ChevronRight,
  Phone,
  Download,
  Palette,
  SlidersHorizontal,
  Heart,
  MessageCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Mic,
  Camera,
  CheckCheck,
  BarChart3,
  Mail,
  Star,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import { setLanguage, useTranslation } from '@/lib/i18n';

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 touch-target ${
        enabled ? 'bg-rose' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 text-left touch-target ${
        onClick ? 'hover:bg-gray-50 transition-colors' : ''
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          danger ? 'bg-red-50' : 'bg-gray-100'
        }`}
      >
        <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-textMain'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-charcoal'}`}>{label}</p>
        {description && <p className="text-xs text-textLight mt-0.5">{description}</p>}
      </div>
      {children || (onClick && <ChevronRight className="w-5 h-5 text-textLight shrink-0" />)}
    </Wrapper>
  );
}

function FilterPicker({ title, options, value, onChange, onClose }: { title: string; options: string[]; value: string; onChange: (v: string) => void; onClose: () => void }) {
  const [selected, setSelected] = useState(value);

  function handlePick(opt: string) {
    setSelected(opt);
    onChange(opt);
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      <div className="absolute bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-charcoal">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-rose font-medium">Done</button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {options.map(opt => (
            <button type="button" key={opt} onClick={() => handlePick(opt)} className={`w-full text-left px-5 py-3.5 text-sm border-b border-gray-50 transition-colors ${selected === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
              {opt}
              {selected === opt && <span className="float-right text-rose">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="text-xs font-semibold text-textLight uppercase tracking-wider px-1 mb-2">{title}</h3>
      <Card variant="default" padding="none" className="divide-y divide-gray-50">
        {children}
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showDiscovery, setShowDiscovery] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [showFullName, setShowFullName] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('setting_show_full_name') === 'true';
    return false;
  });

  // Notification toggles (clubbed)
  const [notifActivity, setNotifActivity] = useState(true);     // Matches, Likes, Messages
  const [notifFamily, setNotifFamily] = useState(true);          // Family Activity & Suggestions
  const [notifTimers, setNotifTimers] = useState(true);          // Chat & Match Expiry reminders
  const [notifContent, setNotifContent] = useState(true);        // Icebreakers, Daily Prompt, Cultural Tips
  const [notifUpdates, setNotifUpdates] = useState(true);        // New Features, Weekly Summary
  const [notifSafety, setNotifSafety] = useState(true);          // Safety Alerts

  const [appLanguage, setAppLanguage] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('app_language') || 'English';
    return 'English';
  });
  const [appTheme, setAppTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('app_theme') || 'Light';
    return 'Light';
  });

  const langMap: Record<string, 'en' | 'hi' | 'sd'> = { 'English': 'en', 'Hindi': 'hi', 'Sindhi': 'sd' };
  const handleLanguageChange = (lang: string) => {
    setAppLanguage(lang);
    setLanguage(langMap[lang] || 'en');
    showToast.success(`${t('settings.languageSetTo')} ${lang}`);
  };

  const handleThemeChange = (theme: string) => {
    setAppTheme(theme);
    localStorage.setItem('app_theme', theme);
    const root = document.documentElement;
    if (theme === 'Dark') {
      root.classList.add('dark');
    } else if (theme === 'System') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      root.classList.remove('dark');
    }
    showToast.success(`${t('settings.themeSetTo')} ${theme}`);
  };
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [activePicker, setActivePicker] = useState<string | null>(null);

  // Discovery filter states — persisted to localStorage
  const getStored = (key: string) => (typeof window !== 'undefined' ? localStorage.getItem(key) || 'Any' : 'Any');
  const [filterIntent, _setFilterIntent] = useState(() => getStored('filter_intent'));
  const [filterHeight, _setFilterHeight] = useState(() => getStored('filter_height'));
  const [filterReligion, _setFilterReligion] = useState(() => getStored('filter_religion'));
  const [filterDietary, _setFilterDietary] = useState(() => getStored('filter_dietary'));
  const [filterFluency, _setFilterFluency] = useState(() => getStored('filter_fluency'));
  const [filterGeneration, _setFilterGeneration] = useState(() => getStored('filter_generation'));
  const [filterGotra, _setFilterGotra] = useState(() => getStored('filter_gotra'));
  const [filterEducation, _setFilterEducation] = useState(() => getStored('filter_education'));
  const [filterSmoking, _setFilterSmoking] = useState(() => getStored('filter_smoking'));
  const [filterDrinking, _setFilterDrinking] = useState(() => getStored('filter_drinking'));
  const [filterKids, _setFilterKids] = useState(() => getStored('filter_kids'));
  const [filterTimeline, _setFilterTimeline] = useState(() => getStored('filter_timeline'));

  const saveFilter = (key: string, setter: (v: string) => void) => (v: string) => {
    setter(v);
    localStorage.setItem(key, v);
  };
  const setFilterIntent = saveFilter('filter_intent', _setFilterIntent);
  const setFilterHeight = saveFilter('filter_height', _setFilterHeight);
  const setFilterReligion = saveFilter('filter_religion', _setFilterReligion);
  const setFilterDietary = saveFilter('filter_dietary', _setFilterDietary);
  const setFilterFluency = saveFilter('filter_fluency', _setFilterFluency);
  const setFilterGeneration = saveFilter('filter_generation', _setFilterGeneration);
  const setFilterGotra = saveFilter('filter_gotra', _setFilterGotra);
  const setFilterEducation = saveFilter('filter_education', _setFilterEducation);
  const setFilterSmoking = saveFilter('filter_smoking', _setFilterSmoking);
  const setFilterDrinking = saveFilter('filter_drinking', _setFilterDrinking);
  const setFilterKids = saveFilter('filter_kids', _setFilterKids);
  const setFilterTimeline = saveFilter('filter_timeline', _setFilterTimeline);

  return (
    <AppShell>
      <div className="flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target" aria-label="Go back">
              <ChevronRight className="w-5 h-5 text-charcoal rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-charcoal">{t('settings.title')}</h1>
              <p className="text-sm text-textLight mt-0.5">{t('settings.managePreferences')}</p>
            </div>
          </div>

          {/* Visibility */}
          <SettingSection title={t('settings.visibility')}>
            <SettingRow icon={Eye} label={t('settings.showInDiscovery')} description={t('settings.othersCanFind')}>
              <Toggle enabled={showDiscovery} onChange={(v) => { setShowDiscovery(v); showToast.success(v ? t('settings.youAreVisible') : t('settings.youAreHidden')); }} />
            </SettingRow>
            <SettingRow icon={EyeOff} label={t('settings.incognitoMode')} description={t('settings.browseWithout')}>
              <Toggle enabled={incognito} onChange={(v) => { setIncognito(v); showToast.success(v ? t('settings.incognitoOn') : t('settings.incognitoOff')); }} />
            </SettingRow>
            <SettingRow icon={Users} label={t('settings.displayFullName')} description={t('settings.showLastName')}>
              <Toggle enabled={showFullName} onChange={(v) => { setShowFullName(v); localStorage.setItem('setting_show_full_name', String(v)); showToast.success(v ? t('settings.fullNameVisible') : t('settings.firstNameOnly')); }} />
            </SettingRow>
            <SettingRow icon={Moon} label={t('settings.snooze')} description={t('settings.snoozeDesc')} onClick={() => showToast.info(t('settings.snoozeComingSoon'))} />
          </SettingSection>

          {/* Family & Permissions */}
          <SettingSection title={t('settings.familyPermissions')}>
            <SettingRow icon={Users} label={t('settings.familyModePermissions')} description={t('settings.manageFamilyAccess')} onClick={() => router.push('/family')} />
          </SettingSection>

          {/* Discovery Filters */}
          <SettingSection title={t('settings.whoLookingFor')}>
            <SettingRow icon={MapPin} label={t('settings.city')} description="Mumbai, India" onClick={() => showToast.info(t('settings.cityComingSoon'))} />
            <SettingRow icon={Users} label={t('settings.ageRange')} description="21 - 35">
              <span className="text-sm text-textLight">21-35</span>
            </SettingRow>
            <SettingRow icon={SlidersHorizontal} label={t('settings.heightRange')} description={filterHeight} onClick={() => setActivePicker('height')} />
            <SettingRow icon={Globe} label={t('settings.intent')} description={filterIntent} onClick={() => setActivePicker('intent')} />
          </SettingSection>

          <SettingSection title={t('settings.communityCulture')}>
            <SettingRow icon={Globe} label={t('settings.fluencyGeneration')} description={filterFluency === 'Any' && filterGeneration === 'Any' ? 'Any' : [filterFluency, filterGeneration].filter(v => v !== 'Any').join(' · ')} onClick={() => setActivePicker('fluency')} />
            <SettingRow icon={Shield} label={t('settings.religionGotra')} description={filterReligion === 'Any' && filterGotra === 'Any' ? 'Any' : [filterReligion, filterGotra].filter(v => v !== 'Any').join(' · ')} onClick={() => setActivePicker('religion')} />
            <SettingRow icon={Globe} label={t('settings.dietary')} description={filterDietary} onClick={() => setActivePicker('dietary')} />
          </SettingSection>

          <SettingSection title={t('settings.lifestyleFuture')}>
            <SettingRow icon={Globe} label={t('settings.educationWork')} description={filterEducation} onClick={() => setActivePicker('education')} />
            <SettingRow icon={Globe} label={t('settings.habits')} description={filterSmoking === 'Any' && filterDrinking === 'Any' ? 'Any' : [filterSmoking !== 'Any' ? `Smoke: ${filterSmoking}` : '', filterDrinking !== 'Any' ? `Drink: ${filterDrinking}` : ''].filter(Boolean).join(' · ')} onClick={() => setActivePicker('habits')} />
            <SettingRow icon={Globe} label={t('settings.familyPlans')} description={filterKids === 'Any' && filterTimeline === 'Any' ? 'Any' : [filterKids !== 'Any' ? `Kids: ${filterKids}` : '', filterTimeline !== 'Any' ? filterTimeline : ''].filter(Boolean).join(' · ')} onClick={() => setActivePicker('family')} />
          </SettingSection>

          {/* Notifications */}
          <SettingSection title={t('settings.notifications')}>
            <SettingRow icon={Heart} label={t('settings.activity')} description={t('settings.activityDesc')}>
              <Toggle enabled={notifActivity} onChange={setNotifActivity} />
            </SettingRow>
            <SettingRow icon={Users} label={t('settings.familyNotif')} description={t('settings.familyNotifDesc')}>
              <Toggle enabled={notifFamily} onChange={setNotifFamily} />
            </SettingRow>
            <SettingRow icon={Clock} label={t('settings.timersReminders')} description={t('settings.timersDesc')}>
              <Toggle enabled={notifTimers} onChange={setNotifTimers} />
            </SettingRow>
            <SettingRow icon={Sparkles} label={t('settings.tipsPrompts')} description={t('settings.tipsDesc')}>
              <Toggle enabled={notifContent} onChange={setNotifContent} />
            </SettingRow>
            <SettingRow icon={Star} label={t('settings.updates')} description={t('settings.updatesDesc')}>
              <Toggle enabled={notifUpdates} onChange={setNotifUpdates} />
            </SettingRow>
            <SettingRow icon={Shield} label={t('settings.safetyAlerts')} description={t('settings.safetyDesc')}>
              <Toggle enabled={notifSafety} onChange={setNotifSafety} />
            </SettingRow>
          </SettingSection>

          {/* App */}
          <SettingSection title={t('settings.app')}>
            <SettingRow icon={Globe} label={t('settings.language')} description={appLanguage} onClick={() => setActivePicker('language')} />
            <SettingRow icon={Palette} label={t('settings.theme')} description={appTheme} onClick={() => setActivePicker('theme')} />
          </SettingSection>

          {/* Account */}
          <SettingSection title={t('settings.account')}>
            <SettingRow icon={Phone} label={t('settings.changePhone')} description="+91 98XXX XXXXX" onClick={() => setShowChangePhoneModal(true)} />
            <SettingRow icon={Download} label={t('settings.exportData')} onClick={() => showToast.info(t('settings.dataExportRequested'))} />
            <SettingRow icon={Trash2} label={t('settings.deleteAccount')} danger onClick={() => setShowDeleteModal(true)} />
          </SettingSection>

          {/* Log Out */}
          <Button
            fullWidth
            variant="secondary"
            icon={<LogOut className="w-4 h-4" />}
            onClick={() => {
              showToast.success(t('settings.loggedOut'));
              router.push('/welcome');
            }}
            className="mb-5"
          >
            {t('settings.logOut')}
          </Button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t('settings.deleteAccountTitle')} size="sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-2">{t('settings.areYouSure')}</h3>
          <p className="text-sm text-textLight mb-4">
            {t('settings.deleteConfirmText')}
          </p>
          <div className="flex gap-3">
            <Button fullWidth variant="secondary" onClick={() => setShowDeleteModal(false)}>{t('settings.keepAccount')}</Button>
            <Button fullWidth variant="danger" onClick={() => { setShowDeleteModal(false); showToast.success(t('settings.accountDeleted')); router.push('/welcome'); }}>{t('common.delete')}</Button>
          </div>
        </div>
      </Modal>

      {/* Change Phone Modal */}
      <Modal isOpen={showChangePhoneModal} onClose={() => setShowChangePhoneModal(false)} title={t('settings.changePhoneTitle')} size="sm">
        <div className="text-center">
          <p className="text-sm text-textLight mb-4">
            {t('settings.changePhoneText')}
          </p>
          <Button fullWidth onClick={() => { setShowChangePhoneModal(false); router.push('/auth/phone'); }}>
            {t('settings.continueToVerification')}
          </Button>
        </div>
      </Modal>

      {/* Filter Pickers */}
      <AnimatePresence>
        {activePicker === 'language' && <FilterPicker title="Language" options={['English', 'Sindhi', 'Hindi']} value={appLanguage} onChange={handleLanguageChange} onClose={() => setActivePicker(null)} />}
        {activePicker === 'theme' && <FilterPicker title="Theme" options={['Light', 'Dark', 'System']} value={appTheme} onChange={handleThemeChange} onClose={() => setActivePicker(null)} />}
        {activePicker === 'intent' && <FilterPicker title="Intent" options={['Any', 'Marriage', 'Dating', 'Friendship']} value={filterIntent} onChange={setFilterIntent} onClose={() => setActivePicker(null)} />}
        {activePicker === 'height' && <FilterPicker title="Height Range" options={['Any', 'Under 5\'4"', '5\'4" – 5\'7"', '5\'7" – 5\'10"', '5\'10" – 6\'0"', 'Above 6\'0"']} value={filterHeight} onChange={setFilterHeight} onClose={() => setActivePicker(null)} />}
        {activePicker === 'fluency' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setActivePicker(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[70vh] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-charcoal">Fluency & Generation</h3>
                <button onClick={() => setActivePicker(null)} className="text-sm text-rose font-medium">Done</button>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                <p className="px-5 pt-3 pb-1 text-xs font-semibold text-textLight uppercase">Sindhi Fluency</p>
                {['Any', 'Fluent', 'Conversational', 'Basic', 'Learning'].map(opt => (
                  <button key={opt} onClick={() => setFilterFluency(opt)} className={`w-full text-left px-5 py-3 text-sm ${filterFluency === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
                    {opt}{filterFluency === opt && <span className="float-right text-rose">✓</span>}
                  </button>
                ))}
                <p className="px-5 pt-4 pb-1 text-xs font-semibold text-textLight uppercase border-t border-gray-100">Generation</p>
                {['Any', '1st Gen', '2nd Gen', '3rd Gen', '4th Gen+', 'Diaspora'].map(opt => (
                  <button key={opt} onClick={() => setFilterGeneration(opt)} className={`w-full text-left px-5 py-3 text-sm ${filterGeneration === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
                    {opt}{filterGeneration === opt && <span className="float-right text-rose">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {activePicker === 'religion' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setActivePicker(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[70vh] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-charcoal">Religion & Gotra</h3>
                <button onClick={() => setActivePicker(null)} className="text-sm text-rose font-medium">Done</button>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                <p className="px-5 pt-3 pb-1 text-xs font-semibold text-textLight uppercase">Religion</p>
                {['Any', 'Hindu Sindhi', 'Muslim Sindhi', 'Sikh Sindhi', 'Other'].map(opt => (
                  <button key={opt} onClick={() => setFilterReligion(opt)} className={`w-full text-left px-5 py-3 text-sm ${filterReligion === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
                    {opt}{filterReligion === opt && <span className="float-right text-rose">✓</span>}
                  </button>
                ))}
                <p className="px-5 pt-4 pb-1 text-xs font-semibold text-textLight uppercase border-t border-gray-100">Gotra</p>
                {['Any', 'Lohana', 'Bhatia', 'Amil', 'Sahiti', 'Hyderabadi', 'Shikarpuri', 'Other'].map(opt => (
                  <button key={opt} onClick={() => setFilterGotra(opt)} className={`w-full text-left px-5 py-3 text-sm ${filterGotra === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
                    {opt}{filterGotra === opt && <span className="float-right text-rose">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {activePicker === 'dietary' && <FilterPicker title="Dietary" options={['Any', 'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain']} value={filterDietary} onChange={setFilterDietary} onClose={() => setActivePicker(null)} />}
        {activePicker === 'education' && <FilterPicker title="Education & Work" options={['Any', 'Bachelors', 'Masters', 'PhD', 'Professional (CA/CS/MD)', 'Business Owner']} value={filterEducation} onChange={setFilterEducation} onClose={() => setActivePicker(null)} />}
        {activePicker === 'habits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setActivePicker(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[70vh] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-charcoal">Habits</h3>
                <button onClick={() => setActivePicker(null)} className="text-sm text-rose font-medium">Done</button>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                <p className="px-5 pt-3 pb-1 text-xs font-semibold text-textLight uppercase">Smoking</p>
                {['Any', 'Never', 'Occasionally', 'Regularly'].map(opt => (
                  <button key={opt} onClick={() => setFilterSmoking(opt)} className={`w-full text-left px-5 py-3 text-sm ${filterSmoking === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
                    {opt}{filterSmoking === opt && <span className="float-right text-rose">✓</span>}
                  </button>
                ))}
                <p className="px-5 pt-4 pb-1 text-xs font-semibold text-textLight uppercase border-t border-gray-100">Drinking</p>
                {['Any', 'Never', 'Socially', 'Regularly'].map(opt => (
                  <button key={opt} onClick={() => setFilterDrinking(opt)} className={`w-full text-left px-5 py-3 text-sm ${filterDrinking === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
                    {opt}{filterDrinking === opt && <span className="float-right text-rose">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {activePicker === 'family' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setActivePicker(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[70vh] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-charcoal">Family Plans</h3>
                <button onClick={() => setActivePicker(null)} className="text-sm text-rose font-medium">Done</button>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                <p className="px-5 pt-3 pb-1 text-xs font-semibold text-textLight uppercase">Wants Kids</p>
                {['Any', 'Yes', 'Maybe', 'No'].map(opt => (
                  <button key={opt} onClick={() => setFilterKids(opt)} className={`w-full text-left px-5 py-3 text-sm ${filterKids === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
                    {opt}{filterKids === opt && <span className="float-right text-rose">✓</span>}
                  </button>
                ))}
                <p className="px-5 pt-4 pb-1 text-xs font-semibold text-textLight uppercase border-t border-gray-100">Settling Timeline</p>
                {['Any', 'Within 1 year', '1-2 years', 'No rush'].map(opt => (
                  <button key={opt} onClick={() => setFilterTimeline(opt)} className={`w-full text-left px-5 py-3 text-sm ${filterTimeline === opt ? 'text-rose font-semibold bg-rose/5' : 'text-charcoal hover:bg-gray-50'}`}>
                    {opt}{filterTimeline === opt && <span className="float-right text-rose">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
