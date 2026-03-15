'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import UserCard from '@/components/UserCard';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Loader2,
  Shield,
  Ban,
  AlertTriangle,
  Clock,
  XCircle,
  CheckCircle,
  AlertOctagon,
  FileText,
  User,
  History,
} from 'lucide-react';

interface ReportData {
  report: any;
  reporter: any;
  reported: any;
  priorReports: any[];
  priorStrikes: any[];
}

type ActionType = 'dismiss' | 'remove_content' | 'suspend' | 'ban';

const INSTANT_BAN_REASONS = ['underage', 'csam', 'child_safety', 'violence', 'bot', 'spam_bot'];

const ACTIONS: {
  type: ActionType;
  label: string;
  description: string;
  icon: any;
  variant: string;
}[] = [
  {
    type: 'dismiss',
    label: 'Dismiss',
    description: 'No violation found. Close the report.',
    icon: XCircle,
    variant: 'btn-secondary',
  },
  {
    type: 'remove_content',
    label: 'Warn / Remove Content',
    description: 'Issue a warning strike and remove offending content.',
    icon: AlertTriangle,
    variant: 'bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg transition-colors',
  },
  {
    type: 'suspend',
    label: '7-Day Suspend',
    description: 'Suspend the user for 7 days and add a strike.',
    icon: Clock,
    variant: 'bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
  },
  {
    type: 'ban',
    label: 'Permanent Ban',
    description: 'Permanently ban the user from the platform.',
    icon: Ban,
    variant: 'btn-danger',
  },
];

export default function ReviewReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action state
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const [banPermanent, setBanPermanent] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getReport(reportId);
      setData(response.data?.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleSubmitAction = async () => {
    if (!selectedAction || !adminNote.trim()) return;

    try {
      setSubmitting(true);
      await adminApi.submitAction({
        reportId,
        action: selectedAction,
        reason: adminNote.trim(),
        suspendDays: selectedAction === 'suspend' ? suspendDays : undefined,
        banPermanent: selectedAction === 'ban' ? banPermanent : undefined,
      });

      router.push('/queue');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit action');
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantBan = async (reason: string) => {
    try {
      setSubmitting(true);
      await adminApi.submitAction({
        reportId,
        action: 'ban',
        reason: `Instant ban: ${reason}`,
        banPermanent: true,
      });

      router.push('/queue');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply instant ban');
    } finally {
      setSubmitting(false);
    }
  };

  const isInstantBanCase =
    data?.report?.reason &&
    INSTANT_BAN_REASONS.some((r) =>
      data.report.reason.toLowerCase().includes(r)
    );

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/queue')}
            className="btn-secondary p-2"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Review Report</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Report ID: {reportId.slice(0, 8)}...
            </p>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Report details + history */}
            <div className="space-y-6">
              {/* Report details */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-brand-rose" />
                  <h2 className="text-lg font-semibold">Report Details</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Reason</p>
                      <p className="text-sm font-medium mt-0.5">{data.report.reason}</p>
                    </div>
                    <span
                      className={cn(
                        data.report.priority === 'critical' && 'badge-critical',
                        data.report.priority === 'high' && 'badge-high',
                        data.report.priority === 'medium' && 'badge-medium',
                        data.report.priority === 'low' && 'badge-low'
                      )}
                    >
                      {data.report.priority?.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Status</p>
                    <span
                      className={cn(
                        'mt-0.5 inline-block',
                        data.report.status === 'pending' && 'badge-pending',
                        data.report.status === 'actioned' && 'badge-critical',
                        data.report.status === 'dismissed' && 'badge-success'
                      )}
                    >
                      {data.report.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Filed</p>
                    <p className="text-sm mt-0.5">
                      {format(new Date(data.report.created_at), 'MMM d, yyyy h:mm a')} (
                      {formatDistanceToNow(new Date(data.report.created_at), { addSuffix: true })})
                    </p>
                  </div>

                  {data.report.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Description</p>
                      <p className="text-sm mt-0.5 text-gray-700">{data.report.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reporter info */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-gray-500" />
                  <h2 className="text-lg font-semibold">Reporter</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-medium">{data.reporter?.displayName || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-medium">{data.reporter?.phone || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="font-medium">{data.reporter?.city || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Verified</p>
                    <p className="font-medium">{data.reporter?.is_verified ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Prior history */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History size={18} className="text-gray-500" />
                  <h2 className="text-lg font-semibold">Prior History</h2>
                </div>

                {/* Prior reports */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Previous Reports ({data.priorReports.length})
                  </p>
                  {data.priorReports.length === 0 ? (
                    <p className="text-sm text-gray-400">No prior reports</p>
                  ) : (
                    <div className="space-y-2">
                      {data.priorReports.map((pr: any) => (
                        <div
                          key={pr.id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                pr.status === 'actioned' ? 'bg-red-500' : 'bg-gray-300'
                              )}
                            />
                            <span className="text-sm">{pr.reason}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {format(new Date(pr.created_at), 'MMM d')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Strikes */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Active Strikes ({data.priorStrikes.length})
                  </p>
                  {data.priorStrikes.length === 0 ? (
                    <p className="text-sm text-gray-400">No active strikes</p>
                  ) : (
                    <div className="space-y-2">
                      {data.priorStrikes.map((strike: any) => (
                        <div
                          key={strike.id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={12} className="text-amber-500" />
                            <span className="text-sm">{strike.reason}</span>
                          </div>
                          <span
                            className={cn(
                              'text-xs',
                              strike.status === 'active' ? 'text-red-500' : 'text-gray-400'
                            )}
                          >
                            {strike.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Instant ban button for severe cases */}
              {isInstantBanCase && data.report.status === 'pending' && (
                <div className="card p-4 border-red-200 bg-red-50">
                  <div className="flex items-start gap-3">
                    <AlertOctagon size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">
                        Severe Violation Detected
                      </p>
                      <p className="text-xs text-red-600 mt-0.5 mb-3">
                        This report involves {data.report.reason}. Instant ban available (skips
                        strike flow).
                      </p>
                      <button
                        onClick={() => handleInstantBan(data.report.reason)}
                        disabled={submitting}
                        className="btn-danger text-sm flex items-center gap-1.5"
                      >
                        {submitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Ban size={14} />
                        )}
                        Instant Permanent Ban
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Reported user profile + actions */}
            <div className="space-y-6">
              {/* Reported user profile */}
              <UserCard
                user={data.reported}
                profile={{ basic: data.reported }}
                photos={data.reported?.photos}
              />

              {/* Photo gallery */}
              {data.reported?.photos?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4">Photos</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {data.reported.photos.map((photo: any, idx: number) => (
                      <div
                        key={idx}
                        className={cn(
                          'aspect-square rounded-lg overflow-hidden bg-gray-100',
                          photo.is_primary && 'ring-2 ring-brand-rose'
                        )}
                      >
                        <img
                          src={photo.url_medium}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin actions */}
              {data.report.status === 'pending' && (
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={18} className="text-brand-rose" />
                    <h2 className="text-lg font-semibold">Admin Action</h2>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.type}
                          onClick={() => {
                            setSelectedAction(action.type);
                            setShowConfirm(false);
                          }}
                          className={cn(
                            'p-3 rounded-lg text-left transition-all border-2',
                            selectedAction === action.type
                              ? 'border-brand-rose shadow-md'
                              : 'border-transparent bg-gray-50 hover:bg-gray-100'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={14} />
                            <span className="text-sm font-semibold">{action.label}</span>
                          </div>
                          <p className="text-[11px] text-gray-500">{action.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action-specific options */}
                  {selectedAction === 'suspend' && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Suspension Duration (days)
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

                  {selectedAction === 'ban' && (
                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={banPermanent}
                          onChange={(e) => setBanPermanent(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-brand-rose focus:ring-brand-rose"
                        />
                        <span className="text-sm font-medium text-gray-700">Permanent ban</span>
                      </label>
                    </div>
                  )}

                  {/* Admin note */}
                  {selectedAction && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Admin Note <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Explain the reasoning for this action..."
                        className="input-field min-h-[100px] resize-y"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {adminNote.length}/500 characters
                      </p>
                    </div>
                  )}

                  {/* Submit button */}
                  {selectedAction && (
                    <>
                      {!showConfirm ? (
                        <button
                          onClick={() => setShowConfirm(true)}
                          disabled={!adminNote.trim()}
                          className="btn-primary w-full"
                        >
                          Continue
                        </button>
                      ) : (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-sm font-semibold text-amber-800 mb-2">
                            Confirm Action
                          </p>
                          <p className="text-sm text-amber-700 mb-3">
                            Are you sure you want to{' '}
                            <strong>
                              {selectedAction === 'dismiss'
                                ? 'dismiss this report'
                                : selectedAction === 'remove_content'
                                ? 'warn the user and remove content'
                                : selectedAction === 'suspend'
                                ? `suspend the user for ${suspendDays} days`
                                : `${banPermanent ? 'permanently ' : ''}ban the user`}
                            </strong>
                            ?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSubmitAction}
                              disabled={submitting}
                              className={cn(
                                'flex-1 flex items-center justify-center gap-1.5',
                                selectedAction === 'dismiss'
                                  ? 'btn-secondary'
                                  : selectedAction === 'ban'
                                  ? 'btn-danger'
                                  : 'btn-primary'
                              )}
                            >
                              {submitting ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowConfirm(false)}
                              className="btn-secondary flex-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Already reviewed message */}
              {data.report.status !== 'pending' && (
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-emerald-500" />
                    <h2 className="text-lg font-semibold">Already Reviewed</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    This report was {data.report.status}{' '}
                    {data.report.reviewed_at &&
                      formatDistanceToNow(new Date(data.report.reviewed_at), {
                        addSuffix: true,
                      })}
                    .
                  </p>
                  {data.report.resolution_note && (
                    <p className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg">
                      {data.report.resolution_note}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
