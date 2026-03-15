'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/cn';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Loader2,
  RefreshCw,
  Inbox,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Appeal {
  id: string;
  user_id: string;
  strike_id: string;
  appeal_text: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  strike?: {
    reason: string;
    created_at: string;
    issuer_id?: string;
  };
  user?: {
    display_name?: string;
    phone?: string;
  };
}

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'deny' | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAppeals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getAppeals({ status: statusFilter, page });
      const data = response.data?.data;
      setAppeals(data?.appeals || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appeals');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const handleReview = async () => {
    if (!reviewingId || !reviewAction || !reviewReason.trim()) return;

    try {
      setSubmitting(true);
      await adminApi.reviewAppeal({
        appealId: reviewingId,
        action: reviewAction,
        reason: reviewReason.trim(),
      });
      setReviewingId(null);
      setReviewAction(null);
      setReviewReason('');
      fetchAppeals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process appeal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Appeals Queue</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review user appeals against strikes and bans
            </p>
          </div>
          <button
            onClick={fetchAppeals}
            disabled={loading}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Status filter */}
        <div className="card p-4">
          <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit">
            {['pending', 'approved', 'denied'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                  statusFilter === s
                    ? 'bg-white text-brand-charcoal shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Appeals list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-rose" />
          </div>
        ) : appeals.length === 0 ? (
          <div className="card p-12 text-center">
            <Inbox size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600">No {statusFilter} appeals</h3>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter === 'pending'
                ? 'All appeals have been reviewed.'
                : `No ${statusFilter} appeals found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appeals.map((appeal) => (
              <div key={appeal.id} className="card overflow-hidden">
                {/* Status bar */}
                <div
                  className={cn(
                    'h-1',
                    appeal.status === 'pending' && 'bg-amber-400',
                    appeal.status === 'approved' && 'bg-emerald-500',
                    appeal.status === 'denied' && 'bg-red-500'
                  )}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                        {(appeal.user?.display_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-brand-charcoal">
                          {appeal.user?.display_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {appeal.user?.phone || appeal.user_id.slice(0, 8) + '...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          appeal.status === 'pending' && 'badge-pending',
                          appeal.status === 'approved' && 'badge-success',
                          appeal.status === 'denied' && 'badge-critical'
                        )}
                      >
                        {appeal.status}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Original strike info */}
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 mb-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={13} className="text-red-500" />
                      <p className="text-xs font-semibold text-red-700 uppercase">Original Strike</p>
                    </div>
                    <p className="text-sm text-red-800">
                      {appeal.strike?.reason || 'Reason not available'}
                    </p>
                    {appeal.strike?.created_at && (
                      <p className="text-xs text-red-500 mt-1">
                        Issued on {format(new Date(appeal.strike.created_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  {/* Appeal text */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText size={13} className="text-gray-500" />
                      <p className="text-xs font-semibold text-gray-400 uppercase">Appeal Message</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                      {appeal.appeal_text}
                    </p>
                  </div>

                  {/* Actions for pending appeals */}
                  {appeal.status === 'pending' && (
                    <>
                      {reviewingId === appeal.id ? (
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setReviewAction('approve')}
                              className={cn(
                                'flex-1 py-2 rounded-lg text-sm font-medium transition-all border-2',
                                reviewAction === 'approve'
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                              )}
                            >
                              <CheckCircle size={14} className="inline mr-1" />
                              Approve (Remove Strike)
                            </button>
                            <button
                              onClick={() => setReviewAction('deny')}
                              className={cn(
                                'flex-1 py-2 rounded-lg text-sm font-medium transition-all border-2',
                                reviewAction === 'deny'
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-gray-200 text-gray-600 hover:border-red-300'
                              )}
                            >
                              <XCircle size={14} className="inline mr-1" />
                              Deny Appeal
                            </button>
                          </div>

                          {reviewAction && (
                            <>
                              <textarea
                                value={reviewReason}
                                onChange={(e) => setReviewReason(e.target.value)}
                                placeholder="Explain your decision..."
                                className="input-field min-h-[80px] resize-y"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleReview}
                                  disabled={submitting || !reviewReason.trim()}
                                  className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5',
                                    reviewAction === 'approve' ? 'btn-success' : 'btn-danger'
                                  )}
                                >
                                  {submitting ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    'Submit Decision'
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setReviewingId(null);
                                    setReviewAction(null);
                                    setReviewReason('');
                                  }}
                                  className="btn-secondary"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingId(appeal.id)}
                          className="btn-primary text-sm w-full"
                        >
                          Review Appeal
                        </button>
                      )}
                    </>
                  )}

                  {/* Review result for processed appeals */}
                  {appeal.status !== 'pending' && appeal.reviewed_at && (
                    <div className="pt-3 border-t border-gray-100 text-xs text-gray-400">
                      Reviewed {formatDistanceToNow(new Date(appeal.reviewed_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary p-2"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-600 px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary p-2"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
