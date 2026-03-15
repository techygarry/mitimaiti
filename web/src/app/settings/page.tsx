'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-textLight uppercase tracking-wider px-1 mb-2">{title}</h3>
      <Card variant="default" padding="none" className="divide-y divide-gray-50">
        {children}
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [showDiscovery, setShowDiscovery] = useState(true);
  const [incognito, setIncognito] = useState(false);

  // 18 notification toggles
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifFamily, setNotifFamily] = useState(true);
  const [notifFamilySuggestions, setNotifFamilySuggestions] = useState(true);
  const [notifChatExpiry, setNotifChatExpiry] = useState(true);
  const [notifProfileViews, setNotifProfileViews] = useState(false);
  const [notifDailyPrompt, setNotifDailyPrompt] = useState(true);
  const [notifNewFeatures, setNotifNewFeatures] = useState(true);
  const [notifIcebreakers, setNotifIcebreakers] = useState(true);
  const [notifMatchExpiry4h, setNotifMatchExpiry4h] = useState(true);
  const [notifMatchExpiry12h, setNotifMatchExpiry12h] = useState(true);
  const [notifMatchExpiry24h, setNotifMatchExpiry24h] = useState(true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);
  const [notifCulturalTips, setNotifCulturalTips] = useState(false);
  const [notifSafetyAlerts, setNotifSafetyAlerts] = useState(true);
  const [notifVoiceNote, setNotifVoiceNote] = useState(true);
  const [notifPhotoMessage, setNotifPhotoMessage] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);

  return (
    <AppShell>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-charcoal">Settings</h1>
            <p className="text-sm text-textLight mt-1">Manage your account preferences</p>
          </div>

          {/* Visibility */}
          <SettingSection title="Visibility">
            <SettingRow icon={Eye} label="Show in Discovery" description="Others can find you">
              <Toggle enabled={showDiscovery} onChange={(v) => { setShowDiscovery(v); showToast.success(v ? 'You are now visible' : 'You are now hidden'); }} />
            </SettingRow>
            <SettingRow icon={EyeOff} label="Incognito Mode" description="Browse without being seen">
              <Toggle enabled={incognito} onChange={(v) => { setIncognito(v); showToast.success(v ? 'Incognito on' : 'Incognito off'); }} />
            </SettingRow>
            <SettingRow icon={Moon} label="Snooze" description="Temporarily hide your profile" onClick={() => showToast.info('Snooze settings coming soon')} />
          </SettingSection>

          {/* Family */}
          <SettingSection title="Family">
            <SettingRow icon={Users} label="Manage Family Access" description="Invite family to help you find matches" onClick={() => router.push('/family')} />
          </SettingSection>

          {/* Discovery - 16 filters */}
          <SettingSection title="Discovery Filters">
            <SettingRow icon={MapPin} label="City" description="Mumbai, India" onClick={() => showToast.info('City selector coming soon')} />
            <SettingRow icon={Users} label="Age Range" description="21 - 35">
              <span className="text-sm text-textLight">21-35</span>
            </SettingRow>
            <SettingRow icon={SlidersHorizontal} label="Height Range" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Intent" description="Marriage">
              <span className="text-sm text-textLight">Marriage</span>
            </SettingRow>
            <SettingRow icon={Users} label="Gender" description="Women">
              <span className="text-sm text-textLight">Women</span>
            </SettingRow>
            <SettingRow icon={Shield} label="Religion" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Dietary" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Sindhi Fluency" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Generation" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Gotra" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Education" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Smoking" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Drinking" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Exercise" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Wants Kids" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Settling Timeline" description="Any">
              <span className="text-sm text-textLight">Any</span>
            </SettingRow>
          </SettingSection>

          {/* Notifications - 18 toggles */}
          <SettingSection title="Notifications">
            <SettingRow icon={Heart} label="New Matches">
              <Toggle enabled={notifMatches} onChange={setNotifMatches} />
            </SettingRow>
            <SettingRow icon={MessageCircle} label="Messages">
              <Toggle enabled={notifMessages} onChange={setNotifMessages} />
            </SettingRow>
            <SettingRow icon={Heart} label="Likes">
              <Toggle enabled={notifLikes} onChange={setNotifLikes} />
            </SettingRow>
            <SettingRow icon={Users} label="Family Activity">
              <Toggle enabled={notifFamily} onChange={setNotifFamily} />
            </SettingRow>
            <SettingRow icon={Users} label="Family Suggestions">
              <Toggle enabled={notifFamilySuggestions} onChange={setNotifFamilySuggestions} />
            </SettingRow>
            <SettingRow icon={Clock} label="Chat Expiry Warning">
              <Toggle enabled={notifChatExpiry} onChange={setNotifChatExpiry} />
            </SettingRow>
            <SettingRow icon={Eye} label="Profile Views">
              <Toggle enabled={notifProfileViews} onChange={setNotifProfileViews} />
            </SettingRow>
            <SettingRow icon={Sparkles} label="Daily Prompt">
              <Toggle enabled={notifDailyPrompt} onChange={setNotifDailyPrompt} />
            </SettingRow>
            <SettingRow icon={Star} label="New Features">
              <Toggle enabled={notifNewFeatures} onChange={setNotifNewFeatures} />
            </SettingRow>
            <SettingRow icon={MessageCircle} label="Icebreaker Suggestions">
              <Toggle enabled={notifIcebreakers} onChange={setNotifIcebreakers} />
            </SettingRow>
            <SettingRow icon={AlertTriangle} label="Match Expiry (4h)">
              <Toggle enabled={notifMatchExpiry4h} onChange={setNotifMatchExpiry4h} />
            </SettingRow>
            <SettingRow icon={Clock} label="Match Expiry (12h)">
              <Toggle enabled={notifMatchExpiry12h} onChange={setNotifMatchExpiry12h} />
            </SettingRow>
            <SettingRow icon={Clock} label="Match Expiry (24h)">
              <Toggle enabled={notifMatchExpiry24h} onChange={setNotifMatchExpiry24h} />
            </SettingRow>
            <SettingRow icon={BarChart3} label="Weekly Summary">
              <Toggle enabled={notifWeeklySummary} onChange={setNotifWeeklySummary} />
            </SettingRow>
            <SettingRow icon={Globe} label="Cultural Tips">
              <Toggle enabled={notifCulturalTips} onChange={setNotifCulturalTips} />
            </SettingRow>
            <SettingRow icon={Shield} label="Safety Alerts">
              <Toggle enabled={notifSafetyAlerts} onChange={setNotifSafetyAlerts} />
            </SettingRow>
            <SettingRow icon={Mic} label="Voice Notes">
              <Toggle enabled={notifVoiceNote} onChange={setNotifVoiceNote} />
            </SettingRow>
            <SettingRow icon={Camera} label="Photo Messages">
              <Toggle enabled={notifPhotoMessage} onChange={setNotifPhotoMessage} />
            </SettingRow>
          </SettingSection>

          {/* App */}
          <SettingSection title="App">
            <SettingRow icon={Globe} label="Language" description="English">
              <span className="text-sm text-textLight">English</span>
            </SettingRow>
            <SettingRow icon={Palette} label="Theme" description="Light">
              <span className="text-sm text-textLight">Light</span>
            </SettingRow>
          </SettingSection>

          {/* Account */}
          <SettingSection title="Account">
            <SettingRow icon={Phone} label="Change Phone Number" description="+91 98XXX XXXXX" onClick={() => setShowChangePhoneModal(true)} />
            <SettingRow icon={Download} label="Export My Data" onClick={() => showToast.info('Data export requested. Check your email.')} />
            <SettingRow icon={Trash2} label="Delete Account" danger onClick={() => setShowDeleteModal(true)} />
          </SettingSection>

          {/* Log Out */}
          <Button
            fullWidth
            variant="secondary"
            icon={<LogOut className="w-4 h-4" />}
            onClick={() => {
              showToast.success('Logged out');
              router.push('/welcome');
            }}
            className="mb-8"
          >
            Log Out
          </Button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-2">Are you sure?</h3>
          <p className="text-sm text-textLight mb-6">
            This will permanently delete your account and all your data. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button fullWidth variant="secondary" onClick={() => setShowDeleteModal(false)}>Keep Account</Button>
            <Button fullWidth variant="danger" onClick={() => { setShowDeleteModal(false); showToast.success('Account deleted'); router.push('/welcome'); }}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Change Phone Modal */}
      <Modal isOpen={showChangePhoneModal} onClose={() => setShowChangePhoneModal(false)} title="Change Phone Number" size="sm">
        <div className="text-center">
          <p className="text-sm text-textLight mb-6">
            To change your phone number, you will need to verify your new number with an OTP. Your account data will be preserved.
          </p>
          <Button fullWidth onClick={() => { setShowChangePhoneModal(false); router.push('/auth/phone'); }}>
            Continue to Verification
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
