'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Briefcase,
  ChevronRight,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
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

const permissionLabels: { key: keyof FamilyPermissions; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'can_view_profile', label: 'View profile', description: 'Can see your full profile', icon: Eye },
  { key: 'can_view_photos', label: 'View photos', description: 'Can see all your photos', icon: Camera },
  { key: 'can_view_basics', label: 'View basics', description: 'Education, work, height, lifestyle', icon: Briefcase },
  { key: 'can_view_sindhi', label: 'Sindhi identity', description: 'Fluency, gotra, generation, dietary', icon: Moon },
  { key: 'can_view_matches', label: 'View matches', description: 'Can see who you matched with', icon: Heart },
  { key: 'can_suggest', label: 'Suggest profiles', description: 'Can send you profile suggestions', icon: MessageSquare },
  { key: 'can_view_cultural_score', label: 'Cultural scores', description: 'Can see cultural compatibility', icon: Star },
  { key: 'can_view_kundli', label: 'Kundli details', description: 'Can see kundli score and chatti', icon: BarChart3 },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 touch-target ${enabled ? 'bg-rose' : 'bg-gray-300'}`}
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
  const [activeTab, setActiveTab] = useState<'members' | 'suggestions'>('members');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: 'f1', name: 'Mom', relationship: 'Mother', status: 'active',
      permissions: { can_view_profile: true, can_view_photos: true, can_view_basics: true, can_view_sindhi: true, can_view_matches: false, can_suggest: true, can_view_cultural_score: true, can_view_kundli: false },
    },
    {
      id: 'f2', name: 'Masi', relationship: 'Aunt', status: 'pending',
      permissions: { can_view_profile: true, can_view_photos: true, can_view_basics: false, can_view_sindhi: false, can_view_matches: false, can_suggest: true, can_view_cultural_score: false, can_view_kundli: false },
    },
  ]);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: 's1', from: 'Mom', name: 'Rohit', age: 29, city: 'Pune', note: 'Lohana family, very well-settled. Your Nani knows his grandmother!', status: 'pending' },
    { id: 's2', from: 'Masi', name: 'Kiran', age: 27, city: 'Mumbai', note: 'She is a dentist, very sweet girl. Bhatia family from Ulhasnagar.', status: 'pending' },
    { id: 's3', from: 'Mom', name: 'Amit', age: 31, city: 'Dubai', note: 'Runs a business in Dubai. Very religious family, does Chaliha every year.', status: 'pending' },
    { id: 's4', from: 'Masi', name: 'Pooja', age: 26, city: 'Bangalore', note: 'Works at Google. Her mother is from our community in Jodhpur.', status: 'pending' },
  ]);
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');

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
        permissions: { can_view_profile: false, can_view_photos: false, can_view_basics: false, can_view_sindhi: false, can_view_matches: false, can_suggest: false, can_view_cultural_score: false, can_view_kundli: false },
      }))
    );
    setShowRevokeModal(false);
    showToast.success('All permissions revoked');
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  // ── Member permissions sub-view ──────────────────────────────────
  if (selectedMember) {
    const activePerms = Object.values(selectedMember.permissions).filter(Boolean).length;
    return (
      <AppShell>
        <div className="flex gap-8 p-6">
          <div className="flex-1 max-w-xl mx-auto lg:mx-0">
            {/* Back header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedMemberId(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-charcoal">{selectedMember.name}&apos;s Permissions</h1>
                <p className="text-xs text-textLight">{activePerms} of {permissionLabels.length} enabled</p>
              </div>
              <Badge variant={selectedMember.status === 'active' ? 'green' : 'orange'} size="sm">
                {selectedMember.status === 'active' ? 'Active' : 'Pending'}
              </Badge>
            </div>

            {/* Permission toggles */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-gray-50">
              {permissionLabels.map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-textLight" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">{label}</p>
                      <p className="text-xs text-textLight">{description}</p>
                    </div>
                  </div>
                  <Toggle
                    enabled={selectedMember.permissions[key]}
                    onChange={() => togglePermission(selectedMember.id, key)}
                  />
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  permissionLabels.forEach(({ key }) => {
                    if (!selectedMember.permissions[key]) togglePermission(selectedMember.id, key);
                  });
                }}
              >
                Enable All
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => {
                  permissionLabels.forEach(({ key }) => {
                    if (selectedMember.permissions[key]) togglePermission(selectedMember.id, key);
                  });
                }}
              >
                Disable All
              </Button>
            </div>

            {/* Privacy note */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mt-6">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-textLight leading-relaxed">
                  {selectedMember.name} can only see what you allow. Your messages always remain private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Main family page ─────────────────────────────────────────────
  return (
    <AppShell>
      <div className="flex gap-8 p-6">
        <div className="flex-1 max-w-xl mx-auto lg:mx-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-charcoal">Family Mode</h1>
            {members.length > 0 && (
              <Button variant="danger" size="sm" icon={<AlertTriangle className="w-4 h-4" />} onClick={() => setShowRevokeModal(true)}>
                Revoke All
              </Button>
            )}
          </div>

          {/* Invite card */}
          <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-rose" />
              </div>
              <div>
                <h2 className="font-semibold text-charcoal text-sm">Invite family to help</h2>
                <p className="text-xs text-textLight">They can view profiles and suggest matches</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowInviteModal(true)}>Invite</Button>
              <Button variant="secondary" size="sm" icon={<Share2 className="w-4 h-4" />} onClick={copyCode}>Share Code</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            {(['members', 'suggestions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === tab ? 'bg-rose text-white shadow-sm' : 'text-textLight hover:text-charcoal'
                }`}
              >
                {tab === 'members' ? `Members (${members.length})` : `Suggestions (${suggestions.length})`}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'members' ? (
              <motion.div key="members" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-rose/10 flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-rose" />
                    </div>
                    <h3 className="text-lg font-bold text-charcoal mb-2">No family members yet</h3>
                    <p className="text-textLight text-sm max-w-xs mb-5">Invite your family to help you find the perfect match.</p>
                    <Button size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowInviteModal(true)}>Invite Family Member</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member, index) => {
                      const activePerms = Object.values(member.permissions).filter(Boolean).length;
                      return (
                        <motion.button
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedMemberId(member.id)}
                          className="w-full bg-white rounded-2xl shadow-card p-5 flex items-center gap-4 text-left hover:shadow-card-hover transition-shadow"
                        >
                          <Avatar alt={member.name} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-charcoal">{member.name}</h4>
                              <Badge variant={member.status === 'active' ? 'green' : 'orange'} size="sm">
                                {member.status === 'active' ? 'Active' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-xs text-textLight mt-0.5">{member.relationship} · {activePerms}/{permissionLabels.length} permissions</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-textLight shrink-0" />
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="suggestions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {suggestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                      <Heart className="w-7 h-7 text-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-charcoal mb-2">No suggestions yet</h3>
                    <p className="text-textLight text-sm max-w-xs">Your family hasn&apos;t suggested anyone yet.</p>
                  </div>
                ) : (
                  <>
                    {/* Who suggested */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200">
                        <Users className="w-3.5 h-3.5" />
                        Suggested by {suggestions[0].from}
                      </span>
                    </div>

                    {/* Main card */}
                    <div className="relative">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={suggestions[0].id}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{
                            x: exitDirection === 'right' ? 300 : -300,
                            opacity: 0,
                            rotate: exitDirection === 'right' ? 12 : -12,
                            transition: { duration: 0.3, ease: 'easeInOut' },
                          }}
                          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        >
                          <div className="bg-white rounded-3xl overflow-hidden shadow-card">
                            {/* Avatar area */}
                            <div className="relative aspect-[4/5] gradient-rose flex items-center justify-center">
                              <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                                <span className="text-5xl font-bold text-white">
                                  {suggestions[0].name.charAt(0)}
                                </span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h2 className="text-2xl font-bold text-white">
                                  {suggestions[0].name}, {suggestions[0].age}
                                </h2>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-white/80" />
                                  <span className="text-white/85 text-sm">{suggestions[0].city}</span>
                                </div>
                              </div>
                            </div>

                            {/* Family note */}
                            {suggestions[0].note && (
                              <div className="px-5 py-4 bg-amber-50/50 border-b border-amber-100">
                                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Note from {suggestions[0].from}</p>
                                <p className="text-sm text-charcoal italic">&quot;{suggestions[0].note}&quot;</p>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center justify-center gap-5 py-5">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setExitDirection('left');
                                  setTimeout(() => setSuggestions((prev) => prev.slice(1)), 10);
                                  showToast.info('Passed');
                                }}
                                className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors shadow-md"
                              >
                                <X className="w-7 h-7 text-gray-400" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setExitDirection('right');
                                  setTimeout(() => setSuggestions((prev) => prev.slice(1)), 10);
                                  showToast.success(`You liked ${suggestions[0].name}!`);
                                }}
                                className="w-14 h-14 rounded-full bg-rose flex items-center justify-center hover:bg-rose-dark transition-colors shadow-lg"
                              >
                                <Heart className="w-7 h-7 text-white fill-white" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Up next */}
                    {suggestions.length > 1 && (
                      <div className="mt-8">
                        <div className="mb-3">
                          <h3 className="text-base font-bold text-charcoal">Up next</h3>
                          <p className="text-xs text-textLight mt-0.5">More suggestions from your family</p>
                        </div>
                        <div className="flex gap-3">
                          {suggestions.slice(1, 4).map((s) => (
                            <div key={s.id} className="flex-1 aspect-[4/5] rounded-2xl overflow-hidden relative gradient-rose">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white/60">{s.name.charAt(0)}</span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white font-semibold text-sm truncate">{s.name}</p>
                                <p className="text-white/60 text-[10px]">via {s.from}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy note */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mt-6">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-charcoal mb-1">Your Privacy</h4>
                <p className="text-xs text-textLight leading-relaxed">
                  Family members can only see what you allow. Your messages and chat history remain private. You can revoke access at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Family" size="sm">
        <div className="text-center">
          <p className="text-sm text-textLight mb-4">Share this code with your family member to join your family circle.</p>
          <div className="bg-gray-50 rounded-2xl p-6 mb-4">
            <p className="text-3xl font-bold text-charcoal tracking-widest">{inviteCode}</p>
          </div>
          <div className="flex gap-3">
            <Button fullWidth variant="secondary" icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} onClick={copyCode}>
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button fullWidth icon={<Share2 className="w-4 h-4" />} onClick={() => { if (navigator.share) { navigator.share({ title: 'Join my MitiMaiti Family', text: `Use code ${inviteCode} to join my family circle!` }); } else { copyCode(); } }}>
              Share
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke All Modal */}
      <Modal isOpen={showRevokeModal} onClose={() => setShowRevokeModal(false)} title="Revoke All Access" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-2">Revoke all family access?</h3>
          <p className="text-sm text-textLight mb-6">This will immediately remove all permissions from all family members.</p>
          <div className="flex gap-3">
            <Button fullWidth variant="secondary" onClick={() => setShowRevokeModal(false)}>Cancel</Button>
            <Button fullWidth variant="danger" onClick={handleRevokeAll}>Revoke All</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
