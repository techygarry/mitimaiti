import { cn } from '@/lib/cn';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'rose' | 'gold' | 'danger' | 'success';
}

const variantStyles = {
  default: {
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  rose: {
    iconBg: 'bg-brand-rose/10',
    iconColor: 'text-brand-rose',
  },
  gold: {
    iconBg: 'bg-brand-gold/10',
    iconColor: 'text-brand-gold',
  },
  danger: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  success: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
};

export default function StatsCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold text-brand-charcoal">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg flex-shrink-0', styles.iconBg)}>
          <Icon size={20} className={styles.iconColor} />
        </div>
      </div>
    </div>
  );
}
