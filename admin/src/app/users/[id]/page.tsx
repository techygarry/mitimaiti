'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import UserCard from '@/components/UserCard';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/cn';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Loader2,
  Ban,
  Clock,
  RotateCcw,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  ChevronRight,
  Heart,
  MessageCircle,
  Camera,
  FileText,
  Settings,
  Crown,
} from 'lucide-react';

interface UserData {
  user: any;
  profile: {
    basic: any;
    sindhi: any;
    chatti: any;
    personality: any;
  };
  photos: any[];
  settings: any;
  privileges: any;
  reports: any[];
  strikes: any[];
  subscriptions: any[];
  stats: {
    likesGiven: number;
    likesReceived: number;
    activeMatches: number;
    messagesSent: number;
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'reports' | 'strikes' | 'photos'>('profile');

  // Action state
  const [showActionModal, setShowActionModal] = useState<'ban' | 'suspend' | 'reset' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUser(userId);
      setData(response.data?.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleAction = async (action: 'ban' | 'suspend' | 'reset') => {
    // For ban/suspend we use a pseudo-report flow
    // For reset, it's a direct action
    try {
      setSubmitting(true);
      // These would be custom admin endpoints
      // For now, show what the action would do
      await adminApi.submitAction({
        reportId: 'admin-direct-' + Date.now(),
        action: action === 'reset' ? 'dismiss' : action,
        reason: actionReason || `Admin direct action: ${action}`,
        suspendDays: action === 'suspend' ? suspendDays : undefined,
        banPermanent: action === 'ban' ? true : undefined,
      });
      setShowActionModal(null);
      setActionReason('');
      fetchUser();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: FileText },
    { id: 'reports' as const, label: `Reports (${data?.reports?.length || 0})`, icon: AlertTriangle },
    { id: 'strikes' as const, label: `Strikes (${data?.strikes?.length || 0})`, icon: Shield },
    { id: 'photos' as const, label: `Photos (${data?.photos?.length || 0})`, icon: Camera },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/users')} className="btn-secondary p-2">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-brand-charcoal">User Detail</h1>
            <p className="text-sm text-gray-500 mt-0.5">ID: {userId}</p>
          </div>
          {data && data.user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowActionModal('suspend')}
                disabled={data.user.is_banned}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Clock size={14} /> Suspend
              </button>
              <button
                onClick={() => setShowActionModal('ban')}
                disabled={data.user.is_banned}
                className="btn-danger text-sm flex items-center gap-1.5"
              >
                <Ban size={14} /> Ban
              </button>
              <button
                onClick={() => setShowActionModal('reset')}
                disabled={data.user.strikes === 0}
                className="btn-secondary text-sm flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Reset Strikes
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-rose" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: User card */}
            <div className="space-y-6">
              <UserCard
                user={data.user}
                profile={data.profile}
                stats={data.stats}
                photos={data.photos}
              />

              {/* Subscription info */}
              {data.subscriptions?.length > 0 && (
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown size={16} className="text-brand-gold" />
                    <h3 className="font-semibold text-sm">Subscription</h3>
                  </div>
                  {data.subscriptions.map((sub: any) => (
                    <div key={sub.id} className="text-sm">
                      <p className="font-medium">{sub.plan || 'Premium'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sub.status} - {sub.started_at && format(new Date(sub.started_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings */}
              {data.settings && (
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings size={16} className="text-gray-500" />
                    <h3 className="font-semibold text-sm">Settings</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discovery</span>
                      <span className={data.settings.discovery_enabled ? 'text-emerald-600' : 'text-red-500'}>
                        {data.settings.discovery_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {data.settings.distance_km && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Distance</span>
                        <span>{data.settings.distance_km} km</span>
                      </div>
                    )}
                    {data.settings.age_min && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Age Range</span>
                        <span>{data.settings.age_min} - {data.settings.age_max}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Tabs */}
            <div className="lg:col-span-2 space-y-4">
              {/* Tab bar */}
              <div className="card p-1 flex gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                        activeTab === tab.id
                          ? 'bg-brand-rose text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  {/* Basic profile */}
                  <div className="card p-6">
                    <h3 className="font-semibold mb-4">Basic Profile</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(data.profile.basic || {}).map(([key, val]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                          <p className="font-medium mt-0.5">
                            {val !== null && val !== undefined ? String(val) : '--'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sindhi profile */}
                  {data.profile.sindhi && (
                    <div className="card p-6">
                      <h3 className="font-semibold mb-4">Sindhi Profile</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(data.profile.sindhi).map(([key, val]) => {
                          if (key === 'user_id' || key === 'id' || key === 'created_at' || key === 'updated_at') return null;
                          return (
                            <div key={key}>
                              <p className="text-xs text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                              <p className="font-medium mt-0.5">
                                {val !== null && val !== undefined ? String(val) : '--'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Chatti profile */}
                  {data.profile.chatti && (
                    <div className="card p-6">
                      <h3 className="font-semibold mb-4">Chatti Profile</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(data.profile.chatti).map(([key, val]) => {
                          if (key === 'user_id' || key === 'id' || key === 'created_at' || key === 'updated_at') return null;
                          return (
                            <div key={key}>
                              <p className="text-xs text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                              <p className="font-medium mt-0.5">
                                {val !== null && val !== undefined ? String(val) : '--'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Personality profile */}
                  {data.profile.personality && (
                    <div className="card p-6">
                      <h3 className="font-semibold mb-4">Personality Profile</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(data.profile.personality).map(([key, val]) => {
                          if (key === 'user_id' || key === 'id' || key === 'created_at' || key === 'updated_at') return null;
                          return (
                            <div key={key}>
                              <p className="text-xs text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                              <p className="font-medium mt-0.5">
                                {val !== null && val !== undefined
                                  ? Array.isArray(val)
                                    ? val.join(', ')
                                    : String(val)
                                  : '--'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Activity stats */}
                  <div className="card p-6">
                    <h3 className="font-semibold mb-4">Activity</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Heart size={14} className="text-brand-rose" />
                        </div>
                        <p className="text-xl font-bold">{data.stats.likesGiven}</p>
                        <p className="text-xs text-gray-400">Likes Given</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Heart size={14} className="text-pink-400" />
                        </div>
                        <p className="text-xl font-bold">{data.stats.likesReceived}</p>
                        <p className="text-xs text-gray-400">Likes Received</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Heart size={14} className="text-red-500" />
                        </div>
                        <p className="text-xl font-bold">{data.stats.activeMatches}</p>
                        <p className="text-xs text-gray-400">Matches</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <MessageCircle size={14} className="text-blue-500" />
                        </div>
                        <p className="text-xl font-bold">{data.stats.messagesSent}</p>
                        <p className="text-xs text-gray-400">Messages</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-3">
                  {data.reports.length === 0 ? (
                    <div className="card p-8 text-center">
                      <Shield size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No reports against this user</p>
                    </div>
                  ) : (
                    data.reports.map((report: any) => (
                      <div
                        key={report.id}
                        className="card p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                report.priority === 'critical' && 'badge-critical',
                                report.priority === 'high' && 'badge-high',
                                report.priority === 'medium' && 'badge-medium',
                                report.priority === 'low' && 'badge-low'
                              )}
                            >
                              {report.priority}
                            </span>
                            <span
                              className={cn(
                                report.status === 'pending' && 'badge-pending',
                                report.status === 'actioned' && 'badge-critical',
                                report.status === 'dismissed' && 'badge-success'
                              )}
                            >
                              {report.status}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{report.reason}</p>
                        {report.resolution_note && (
                          <p className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 rounded">
                            {report.resolution_note}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'strikes' && (
                <div className="space-y-3">
                  {data.strikes.length === 0 ? (
                    <div className="card p-8 text-center">
                      <CheckCircle size={32} className="text-emerald-300 mx-auto mb-2" />
                      <p className="text-gray-500">No strikes on record</p>
                    </div>
                  ) : (
                    <div className="card overflow-hidden">
                      {/* Timeline */}
                      <div className="p-6">
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                          {data.strikes.map((strike: any, idx: number) => (
                            <div key={strike.id} className="relative flex gap-4 pb-6 last:pb-0">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                                  strike.status === 'active'
                                    ? 'bg-red-100'
                                    : strike.status === 'appealed'
                                    ? 'bg-amber-100'
                                    : 'bg-gray-100'
                                )}
                              >
                                {strike.status === 'active' ? (
                                  <AlertTriangle size={14} className="text-red-600" />
                                ) : strike.status === 'appealed' ? (
                                  <Clock size={14} className="text-amber-600" />
                                ) : (
                                  <XCircle size={14} className="text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={cn(
                                      'text-xs font-medium',
                                      strike.status === 'active'
                                        ? 'text-red-600'
                                        : strike.status === 'appealed'
                                        ? 'text-amber-600'
                                        : 'text-gray-400'
                                    )}
                                  >
                                    Strike #{data.strikes.length - idx} - {strike.status}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {format(new Date(strike.created_at), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <p className="text-sm text-brand-charcoal">{strike.reason}</p>
                                {strike.expires_at && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Expires: {format(new Date(strike.expires_at), 'MMM d, yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="card p-6">
                  {data.photos.length === 0 ? (
                    <div className="text-center py-8">
                      <Camera size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No photos uploaded</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {data.photos.map((photo: any, idx: number) => (
                        <div key={idx} className="relative group">
                          <div
                            className={cn(
                              'aspect-[3/4] rounded-xl overflow-hidden bg-gray-100',
                              photo.is_primary && 'ring-2 ring-brand-rose ring-offset-2'
                            )}
                          >
                            <img
                              src={photo.url_medium || photo.url_full}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {photo.is_primary && (
                            <span className="absolute top-2 left-2 badge bg-brand-rose text-white text-[10px]">
                              Primary
                            </span>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1 text-center">
                            #{photo.sort_order || idx + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-brand-charcoal mb-1">
                {showActionModal === 'ban'
                  ? 'Ban User'
                  : showActionModal === 'suspend'
                  ? 'Suspend User'
                  : 'Reset Strikes'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {showActionModal === 'ban'
                  ? 'This will permanently ban the user and disable their account.'
                  : showActionModal === 'suspend'
                  ? 'This will temporarily suspend the user.'
                  : 'This will clear all active strikes from the user.'}
              </p>

              {showActionModal === 'suspend' && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Duration
                  </label>
                  <select
                    value={suspendDays}
                    onChange={(e) => setSuspendDays(Number(e.target.value))}
                    className="input-field"
                  >
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Explain the reason for this action..."
                  className="input-field min-h-[80px] resize-y"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(showActionModal)}
                  disabled={submitting || !actionReason.trim()}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5',
                    showActionModal === 'ban'
                      ? 'btn-danger'
                      : showActionModal === 'suspend'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'
                      : 'btn-primary'
                  )}
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    'Confirm'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(null);
                    setActionReason('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
