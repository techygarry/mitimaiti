'use client';

import { cn } from '@/lib/cn';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Clock, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ReportCardProps {
  report: {
    id: string;
    reason: string;
    priority: string;
    status: string;
    reporter_count?: number;
    reported_user_id: string;
    created_at: string;
    reported_name?: string;
  };
}

const priorityConfig: Record<string, { label: string; className: string; order: number }> = {
  critical: { label: 'P0 Critical', className: 'badge-critical', order: 0 },
  high: { label: 'P1 High', className: 'badge-high', order: 1 },
  medium: { label: 'P2 Medium', className: 'badge-medium', order: 2 },
  low: { label: 'P3 Low', className: 'badge-low', order: 3 },
};

export default function ReportCard({ report }: ReportCardProps) {
  const priority = priorityConfig[report.priority] || priorityConfig.medium;
  const timeAgo = formatDistanceToNow(new Date(report.created_at), { addSuffix: true });

  return (
    <Link
      href={`/queue/${report.id}`}
      className="card p-4 hover:border-brand-rose/30 hover:shadow-md transition-all group cursor-pointer block"
    >
      <div className="flex items-center gap-4">
        {/* Priority indicator */}
        <div
          className={cn(
            'w-1 self-stretch rounded-full flex-shrink-0',
            report.priority === 'critical' && 'bg-red-500',
            report.priority === 'high' && 'bg-orange-500',
            report.priority === 'medium' && 'bg-yellow-500',
            report.priority === 'low' && 'bg-blue-400'
          )}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={priority.className}>{priority.label}</span>
            {report.status === 'pending' && (
              <span className="badge-pending">Pending</span>
            )}
          </div>

          <p className="text-sm font-medium text-brand-charcoal truncate">
            {report.reason}
          </p>

          {report.reported_name && (
            <p className="text-xs text-gray-500 mt-0.5">
              Reported: {report.reported_name}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {timeAgo}
            </span>
            {report.reporter_count && report.reporter_count > 1 && (
              <span className="flex items-center gap-1 text-orange-500 font-medium">
                <Users size={12} />
                {report.reporter_count} reporters
              </span>
            )}
            {report.priority === 'critical' && (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <AlertTriangle size={12} />
                Immediate attention
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={18}
          className="text-gray-300 group-hover:text-brand-rose transition-colors flex-shrink-0"
        />
      </div>
    </Link>
  );
}
