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
  BellOff,
  Globe,
  Users,
  Shield,
  LogOut,
  Trash2,
  ChevronRight,
  Crown,
  Phone,
  Download,
  Palette,
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
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-rose' : 'bg-gray-300'
      }`}
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
      className={`w-full flex items-center gap-3 px-5 py-4 text-left ${
        onClick ? 'hover:bg-gray-50 transition-colors' : ''
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          danger ? 'bg-red-50' : 'bg-gray-100'
        }`}
      >
        <Icon
          className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-textMain'}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            danger ? 'text-red-500' : 'text-charcoal'
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-textLight mt-0.5">{description}</p>
        )}
      </div>
      {children || (onClick && <ChevronRight className="w-5 h-5 text-textLight shrink-0" />)}
    </Wrapper>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-textLight uppercase tracking-wider px-1 mb-2">
        {title}
      </h3>
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
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifFamily, setNotifFamily] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <AppShell>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-charcoal">Settings</h1>
            <p className="text-sm text-textLight mt-1">Manage your account preferences</p>
          </div>

          {/* Discovery */}
          <SettingSection title="Discovery">
            <SettingRow
              icon={MapPin}
              label="City"
              description="Mumbai, India"
              onClick={() => showToast.info('City selector coming soon')}
            />
            <SettingRow icon={Users} label="Age Range" description="21 - 35">
              <span className="text-sm text-textLight">21-35</span>
            </SettingRow>
            <SettingRow icon={Globe} label="Intent" description="Marriage">
              <span className="text-sm text-textLight">Marriage</span>
            </SettingRow>
          </SettingSection>

          {/* Privacy */}
          <SettingSection title="Privacy">
            <SettingRow
              icon={Eye}
              label="Show in Discovery"
              description="Others can find you"
            >
              <Toggle enabled={showDiscovery} onChange={(v) => {
                setShowDiscovery(v);
                showToast.success(v ? 'You are now visible' : 'You are now hidden');
              }} />
            </SettingRow>
            <SettingRow
              icon={EyeOff}
              label="Incognito Mode"
              description="Browse without being seen"
            >
              <Toggle enabled={incognito} onChange={(v) => {
                setIncognito(v);
                if (v) showToast.info('Incognito mode on - requires Premium');
                else showToast.success('Incognito mode off');
              }} />
            </SettingRow>
            <SettingRow
              icon={Moon}
              label="Snooze"
              description="Temporarily hide your profile"
              onClick={() => showToast.info('Snooze settings coming soon')}
            />
          </SettingSection>

          {/* Family Mode */}
          <SettingSection title="Family">
            <SettingRow
              icon={Users}
              label="Manage Family Access"
              description="Invite family to help you find matches"
              onClick={() => router.push('/family')}
            />
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications">
            <SettingRow icon={Bell} label="New Matches">
              <Toggle enabled={notifMatches} onChange={setNotifMatches} />
            </SettingRow>
            <SettingRow icon={Bell} label="Messages">
              <Toggle enabled={notifMessages} onChange={setNotifMessages} />
            </SettingRow>
            <SettingRow icon={Bell} label="Likes">
              <Toggle enabled={notifLikes} onChange={setNotifLikes} />
            </SettingRow>
            <SettingRow icon={Bell} label="Family Activity">
              <Toggle enabled={notifFamily} onChange={setNotifFamily} />
            </SettingRow>
          </SettingSection>

          {/* App */}
          <SettingSection title="App">
            <SettingRow icon={Globe} label="Language" description="English">
              <span className="text-sm text-textLight">English</span>
            </SettingRow>
            <SettingRow
              icon={Palette}
              label="Theme"
              description="Light"
            >
              <span className="text-sm text-textLight">Light</span>
            </SettingRow>
          </SettingSection>

          {/* Account */}
          <SettingSection title="Account">
            <SettingRow
              icon={Phone}
              label="Phone Number"
              description="+91 98XXX XXXXX"
            >
              <span className="text-xs text-textLight">Verified</span>
            </SettingRow>
            <SettingRow
              icon={Crown}
              label="Plan"
              description="Free"
              onClick={() => router.push('/premium')}
            />
            <SettingRow
              icon={Download}
              label="Export My Data"
              onClick={() => showToast.info('Data export requested. Check your email.')}
            />
            <SettingRow
              icon={Trash2}
              label="Delete Account"
              danger
              onClick={() => setShowDeleteModal(true)}
            />
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
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="text-center">
          <div className="text-4xl mb-3">😢</div>
          <h3 className="text-lg font-bold text-charcoal mb-2">
            Are you sure?
          </h3>
          <p className="text-sm text-textLight mb-6">
            This will permanently delete your account and all your data. This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Keep Account
            </Button>
            <Button
              fullWidth
              variant="danger"
              onClick={() => {
                setShowDeleteModal(false);
                showToast.success('Account deleted');
                router.push('/welcome');
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
