'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import ReportCard from '@/components/ReportCard';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  Loader2,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';

interface Report {
  id: string;
  reason: string;
  priority: string;
  status: string;
  reporter_count?: number;
  reported_user_id: string;
  created_at: string;
  reported_name?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PRIORITIES = [
  { value: '', label: 'All Priorities' },
  { value: 'critical', label: 'P0 Critical' },
  { value: 'high', label: 'P1 High' },
  { value: 'medium', label: 'P2 Medium' },
  { value: 'low', label: 'P3 Low' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'actioned', label: 'Actioned' },
  { value: 'dismissed', label: 'Dismissed' },
];

export default function QueuePage() {
  return (
    <Suspense fallback={
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-brand-rose" />
        </div>
      </AdminShell>
    }>
      <QueueContent />
    </Suspense>
  );
}

function QueueContent() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({ pending: 0, critical: 0, high: 0, reviewedToday: 0 });
  const [loading, setLoading] = useState(true);
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'pending');
  const [page, setPage] = useState(1);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { status, page, limit: 20 };
      if (priority) params.priority = priority;

      const response = await adminApi.getQueue(params);
      const data = response.data?.data;

      setReports(data?.reports || []);
      setPagination(data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      if (data?.stats) setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  }, [status, priority, page]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Moderation Queue</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {stats.pending} pending reports ({stats.critical} critical)
            </p>
          </div>
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: stats.pending, color: 'text-brand-rose' },
            { label: 'Critical', value: stats.critical, color: 'text-red-600' },
            { label: 'High', value: stats.high, color: 'text-orange-600' },
            { label: 'Today', value: stats.reviewedToday, color: 'text-emerald-600' },
          ].map((item) => (
            <div key={item.label} className="card p-3 text-center">
              <p className={cn('text-xl font-bold', item.color)}>{item.value}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Filter size={14} />
              <span className="font-medium">Filters:</span>
            </div>

            {/* Status tabs */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    setStatus(s.value);
                    setPage(1);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    status === s.value
                      ? 'bg-white text-brand-charcoal shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Priority filter */}
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="input-field w-auto text-sm py-1.5"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-rose" />
          </div>
        ) : reports.length === 0 ? (
          <div className="card p-12 text-center">
            <Inbox size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600">Queue is empty</h3>
            <p className="text-sm text-gray-400 mt-1">
              No {status} reports{priority ? ` with ${priority} priority` : ''} found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary p-2"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-600 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn-secondary p-2"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
