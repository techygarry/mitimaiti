'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Copy,
  Share2,
  Shield,
  Eye,
  Heart,
  Users,
  MessageSquare,
  Check,
  X,
  Bookmark,
  Camera,
  Star,
  AlertTriangle,
  BarChart3,
  Moon,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import { showToast } from '@/components/ui/Toast';
import { FamilyPermissions } from '@/types';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  status: 'active' | 'pending';
  permissions: FamilyPermissions;
}

interface Suggestion {
  id: string;
  from: string;
  name: string;
  age: number;
  city: string;
  note: string;
  status: 'pending';
}

const permissionLabels: { key: keyof FamilyPermissions; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'can_view_profile', label: 'View profile', icon: Eye },
  { key: 'can_view_photos', label: 'View photos', icon: Camera },
  { key: 'can_view_basics', label: 'View basics', icon: BarChart3 },
  { key: 'can_view_sindhi', label: 'View Sindhi identity', icon: Moon },
  { key: 'can_view_matches', label: 'View matches', icon: Heart },
  { key: 'can_suggest', label: 'Suggest profiles', icon: MessageSquare },
  { key: 'can_view_cultural_score', label: 'View cultural scores', icon: Star },
  { key: 'can_view_kundli', label: 'View Kundli details', icon: BarChart3 },
];

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

export default function FamilyPage() {
  const router = useRouter();
  const [inviteCode] = useState('MM-7X4K');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: 'f1',
      name: 'Mom',
      relationship: 'Mother',
      status: 'active',
      permissions: {
        can_view_profile: true,
        can_view_photos: true,
        can_view_basics: true,
        can_view_sindhi: true,
        can_view_matches: false,
        can_suggest: true,
        can_view_cultural_score: true,
        can_view_kundli: false,
      },
    },
    {
      id: 'f2',
      name: 'Masi',
      relationship: 'Aunt',
      status: 'pending',
      permissions: {
        can_view_profile: true,
        can_view_photos: true,
        can_view_basics: false,
        can_view_sindhi: false,
        can_view_matches: false,
        can_suggest: true,
        can_view_cultural_score: false,
        can_view_kundli: false,
      },
    },
  ]);

  const [suggestions] = useState<Suggestion[]>([
    {
      id: 's1',
      from: 'Mom',
      name: 'Rohit',
      age: 29,
      city: 'Pune',
      note: 'Lohana family, very well-settled. Your Nani knows his grandmother!',
      status: 'pending',
    },
  ]);

  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    showToast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [inviteCode]);

  const togglePermission = (memberId: string, permission: keyof FamilyPermissions) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, permissions: { ...m.permissions, [permission]: !m.permissions[permission] } }
          : m
      )
    );
    showToast.success('Permission updated');
  };

  const handleRevokeAll = () => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        permissions: {
          can_view_profile: false,
          can_view_photos: false,
          can_view_basics: false,
          can_view_sindhi: false,
          can_view_matches: false,
          can_suggest: false,
          can_view_cultural_score: false,
          can_view_kundli: false,
        },
      }))
    );
    setShowRevokeModal(false);
    showToast.success('All permissions revoked');
  };

  return (
    <AppShell>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">Family Mode</h1>
              <p className="text-sm text-textLight mt-1">Let family help you find the right match</p>
            </div>
            {members.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                icon={<AlertTriangle className="w-4 h-4" />}
                onClick={() => setShowRevokeModal(true)}
              >
                Revoke All
              </Button>
            )}
          </div>

          {/* Description & Invite */}
          <Card variant="default" className="p-6 mb-6">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose/10 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 text-rose" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-charcoal mb-1 text-lg">
                  Let family help you find love
                </h2>
                <p className="text-sm text-textLight leading-relaxed mb-4">
                  Invite trusted family members to view curated profiles and suggest matches. You always have the final say.
                </p>
                <div className="flex gap-3">
                  <Button
                    size="md"
                    icon={<UserPlus className="w-5 h-5" />}
                    onClick={() => setShowInviteModal(true)}
                  >
                    Invite Family Member
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<Share2 className="w-5 h-5" />}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join my MitiMaiti Family',
                          text: `Use code ${inviteCode} to join my family circle on MitiMaiti!`,
                        });
                      } else {
                        copyCode();
                      }
                    }}
                  >
                    Share Link
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs
            tabs={[
              { id: 'members', label: `Members (${members.length})` },
              { id: 'suggestions', label: `Suggestions (${suggestions.length})` },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
            className="mb-6"
          />

          {activeTab === 'members' ? (
            /* Members List */
            members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-rose/10 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-rose" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-2">No family members yet</h3>
                <p className="text-textLight text-sm max-w-sm mb-6">
                  Invite your family to help you find the perfect match.
                </p>
                <Button
                  icon={<UserPlus className="w-5 h-5" />}
                  onClick={() => setShowInviteModal(true)}
                >
                  Invite Family Member
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="default" className="p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar alt={member.name} size="md" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-charcoal text-base">
                            {member.name}
                          </h4>
                          <p className="text-sm text-textLight">
                            {member.relationship}
                          </p>
                        </div>
                        <Badge
                          variant={member.status === 'active' ? 'green' : 'orange'}
                          size="sm"
                        >
                          {member.status === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                      </div>

                      {/* 8 Permission toggles */}
                      <div className="space-y-3 border-t border-gray-50 pt-4">
                        {permissionLabels.map(({ key, label, icon: Icon }) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-textMain">
                              <Icon className="w-4 h-4 text-textLight" />
                              {label}
                            </div>
                            <Toggle
                              enabled={member.permissions[key]}
                              onChange={() => togglePermission(member.id, key)}
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* Suggestions Tab */
            suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-2">No suggestions yet</h3>
                <p className="text-textLight text-sm max-w-sm">
                  Your family hasn&apos;t suggested anyone yet. They will show up here when they do.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="default" className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="rose" size="sm">
                          From {suggestion.from}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <Avatar alt={suggestion.name} size="lg" />
                        <div>
                          <h4 className="font-semibold text-charcoal text-base">
                            {suggestion.name}, {suggestion.age}
                          </h4>
                          <p className="text-sm text-textLight">
                            {suggestion.city}
                          </p>
                        </div>
                      </div>

                      {suggestion.note && (
                        <Card variant="filled" padding="sm" className="mb-4">
                          <p className="text-sm text-textMain italic">
                            &quot;{suggestion.note}&quot;
                          </p>
                        </Card>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          fullWidth
                          icon={<X className="w-4 h-4" />}
                          onClick={() => showToast.info('Passed')}
                        >
                          Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          fullWidth
                          icon={<Bookmark className="w-4 h-4" />}
                          onClick={() => showToast.info('Saved for later')}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          fullWidth
                          icon={<Heart className="w-4 h-4" />}
                          onClick={() => showToast.success('Liked!')}
                        >
                          Like
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* Privacy note */}
          <Card variant="filled" padding="md" className="bg-blue-50/50 border border-blue-100 mt-6">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-charcoal mb-1">Your Privacy</h4>
                <p className="text-xs text-textLight leading-relaxed">
                  Family members can only see what you allow. Your messages and chat history remain private. You can revoke access at any time.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Family"
        size="sm"
      >
        <div className="text-center">
          <p className="text-sm text-textLight mb-4">
            Share this code with your family member so they can join your
            profile&apos;s family circle.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-4">
            <p className="text-3xl font-bold text-charcoal tracking-widest">
              {inviteCode}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              fullWidth
              variant="secondary"
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={copyCode}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button
              fullWidth
              icon={<Share2 className="w-4 h-4" />}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Join my MitiMaiti Family',
                    text: `Use code ${inviteCode} to join my family circle on MitiMaiti!`,
                  });
                } else {
                  copyCode();
                }
              }}
            >
              Share
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke All Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke All Access"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-2">
            Revoke all family access?
          </h3>
          <p className="text-sm text-textLight mb-6">
            This will immediately remove all permissions from all family members. They will no longer be able to view your profile or suggest matches.
          </p>
          <div className="flex gap-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={() => setShowRevokeModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="danger"
              onClick={handleRevokeAll}
            >
              Revoke All
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
