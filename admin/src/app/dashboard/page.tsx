'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/AdminShell';
import StatsCard from '@/components/StatsCard';
import { adminApi } from '@/lib/api';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Users,
  UserPlus,
  Clock,
  Ban,
  Activity,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  queue: {
    pending: number;
    critical: number;
    high: number;
    medium: number;
    reviewedToday: number;
  };
  avgReviewTime: string;
  bansThisWeek: number;
  activeUsers30d: number;
  newSignupsToday: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch queue stats
      const queueRes = await adminApi.getQueue({ status: 'pending', limit: 1 });
      const queueData = queueRes.data?.data;

      // Try to fetch full stats endpoint (may not exist yet)
      let fullStats: any = {};
      try {
        const statsRes = await adminApi.getStats();
        fullStats = statsRes.data?.data || {};
      } catch {
        // Stats endpoint may not be implemented yet - use queue data
      }

      setStats({
        queue: {
          pending: queueData?.stats?.pending || queueData?.pagination?.total || 0,
          critical: queueData?.stats?.critical || 0,
          high: queueData?.stats?.high || 0,
          medium: fullStats.mediumPriority || 0,
          reviewedToday: queueData?.stats?.reviewedToday || 0,
        },
        avgReviewTime: fullStats.avgReviewTime || '--',
        bansThisWeek: fullStats.bansThisWeek || 0,
        activeUsers30d: fullStats.activeUsers30d || 0,
        newSignupsToday: fullStats.newSignupsToday || 0,
      });

      setLastRefresh(new Date());
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Overview of moderation activity and platform health
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Last updated: {format(lastRefresh, 'h:mm:ss a')}
            </span>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-rose" />
          </div>
        ) : stats ? (
          <>
            {/* Priority Queue Cards */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Moderation Queue
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  label="Total Pending"
                  value={stats.queue.pending}
                  subtitle="Reports awaiting review"
                  icon={ShieldAlert}
                  variant="rose"
                />
                <StatsCard
                  label="P0 Critical"
                  value={stats.queue.critical}
                  subtitle="Immediate attention required"
                  icon={AlertOctagon}
                  variant="danger"
                />
                <StatsCard
                  label="P1 High"
                  value={stats.queue.high}
                  subtitle="Review within 1 hour"
                  icon={AlertTriangle}
                  variant="gold"
                />
                <StatsCard
                  label="Reviewed Today"
                  value={stats.queue.reviewedToday}
                  subtitle="Reports handled today"
                  icon={Clock}
                  variant="success"
                />
              </div>
            </div>

            {/* Platform Stats */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Platform Health
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  label="Avg Review Time"
                  value={stats.avgReviewTime}
                  subtitle="Time to resolve reports"
                  icon={Clock}
                  variant="default"
                />
                <StatsCard
                  label="Bans This Week"
                  value={stats.bansThisWeek}
                  subtitle="Accounts banned in 7 days"
                  icon={Ban}
                  variant="danger"
                />
                <StatsCard
                  label="Active Users (30d)"
                  value={stats.activeUsers30d}
                  subtitle="Users active in last 30 days"
                  icon={Activity}
                  variant="success"
                />
                <StatsCard
                  label="New Signups Today"
                  value={stats.newSignupsToday}
                  subtitle="New registrations today"
                  icon={UserPlus}
                  variant="rose"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/queue?priority=critical"
                  className="card p-4 hover:border-red-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-50">
                      <AlertOctagon size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal group-hover:text-red-600 transition-colors">
                        Review Critical Reports
                      </p>
                      <p className="text-xs text-gray-400">
                        {stats.queue.critical} reports need immediate action
                      </p>
                    </div>
                  </div>
                </a>

                <a
                  href="/appeals"
                  className="card p-4 hover:border-brand-gold hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50">
                      <Users size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal group-hover:text-amber-600 transition-colors">
                        Review Appeals
                      </p>
                      <p className="text-xs text-gray-400">
                        Process pending user appeals
                      </p>
                    </div>
                  </div>
                </a>

                <a
                  href="/users"
                  className="card p-4 hover:border-brand-rose hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-rose/10">
                      <Users size={20} className="text-brand-rose" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal group-hover:text-brand-rose transition-colors">
                        Lookup User
                      </p>
                      <p className="text-xs text-gray-400">
                        Search and view user profiles
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
