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
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  status: 'active' | 'pending';
  canViewProfile: boolean;
  canViewMatches: boolean;
  canSuggest: boolean;
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

export default function FamilyPage() {
  const router = useRouter();
  const [inviteCode] = useState('MM-7X4K');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: 'f1',
      name: 'Mom',
      relationship: 'Mother',
      status: 'active',
      canViewProfile: true,
      canViewMatches: false,
      canSuggest: true,
    },
    {
      id: 'f2',
      name: 'Masi',
      relationship: 'Aunt',
      status: 'pending',
      canViewProfile: true,
      canViewMatches: false,
      canSuggest: true,
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

  const togglePermission = (memberId: string, permission: keyof FamilyMember) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, [permission]: !m[permission] } : m
      )
    );
    showToast.success('Permission updated');
  };

  return (
    <AppShell>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-charcoal">Family Mode</h1>
            <p className="text-sm text-textLight mt-1">Let family help you find the right match</p>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Members */}
            <div className="flex-1 space-y-6">
              {/* Description */}
              <Card variant="default" className="p-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose/10 flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-rose" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-charcoal mb-1 text-lg">
                      Let family help you find love
                    </h2>
                    <p className="text-sm text-textLight leading-relaxed">
                      Invite trusted family members to view curated profiles and
                      suggest matches. You always have the final say.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Invite Button */}
              <Button
                fullWidth
                size="lg"
                icon={<UserPlus className="w-5 h-5" />}
                onClick={() => setShowInviteModal(true)}
              >
                Invite Family Member
              </Button>

              {/* Members List */}
              <div>
                <h3 className="text-sm font-semibold text-textLight uppercase tracking-wider mb-3">
                  Family Members ({members.length})
                </h3>

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

                        {/* Permissions */}
                        <div className="space-y-3 border-t border-gray-50 pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-textMain">
                              <Eye className="w-4 h-4 text-textLight" />
                              Can view profile
                            </div>
                            <button
                              onClick={() =>
                                togglePermission(member.id, 'canViewProfile')
                              }
                              className={`w-9 h-5 rounded-full transition-colors ${
                                member.canViewProfile ? 'bg-rose' : 'bg-gray-300'
                              }`}
                            >
                              <motion.div
                                animate={{ x: member.canViewProfile ? 16 : 2 }}
                                className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-textMain">
                              <Heart className="w-4 h-4 text-textLight" />
                              Can view matches
                            </div>
                            <button
                              onClick={() =>
                                togglePermission(member.id, 'canViewMatches')
                              }
                              className={`w-9 h-5 rounded-full transition-colors ${
                                member.canViewMatches ? 'bg-rose' : 'bg-gray-300'
                              }`}
                            >
                              <motion.div
                                animate={{ x: member.canViewMatches ? 16 : 2 }}
                                className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-textMain">
                              <MessageSquare className="w-4 h-4 text-textLight" />
                              Can suggest profiles
                            </div>
                            <button
                              onClick={() =>
                                togglePermission(member.id, 'canSuggest')
                              }
                              className={`w-9 h-5 rounded-full transition-colors ${
                                member.canSuggest ? 'bg-rose' : 'bg-gray-300'
                              }`}
                            >
                              <motion.div
                                animate={{ x: member.canSuggest ? 16 : 2 }}
                                className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                              />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Suggestions */}
            <div className="lg:w-96 shrink-0">
              <div className="sticky top-24 space-y-6">
                {suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-textLight uppercase tracking-wider mb-3">
                      Suggestions from Family
                    </h3>

                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card variant="default" className="mb-4 p-5">
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
                )}

                {/* Privacy note */}
                <Card variant="filled" padding="md" className="bg-blue-50/50 border border-blue-100">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-charcoal mb-1">Your Privacy</h4>
                      <p className="text-xs text-textLight leading-relaxed">
                        Family members can only see what you allow. Your messages and chat history remain private.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
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

          {/* Code display */}
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
    </AppShell>
  );
}
