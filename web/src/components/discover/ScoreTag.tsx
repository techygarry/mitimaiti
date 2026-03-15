'use client';

import { clsx } from 'clsx';

interface ScoreTagProps {
  label: string;
  value: string;
  variant: 'cultural' | 'kundli' | 'interests';
  badge?: string;
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  cultural: {
    excellent: 'bg-amber-50 text-amber-800 border-amber-200',
    good: 'bg-green-50 text-green-800 border-green-200',
    fair: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  kundli: {
    ideal: 'bg-purple-50 text-purple-800 border-purple-200',
    good: 'bg-blue-50 text-blue-800 border-blue-200',
    fair: 'bg-orange-50 text-orange-800 border-orange-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  interests: 'bg-rose/10 text-rose border-rose-light/30',
};

export default function ScoreTag({
  label,
  value,
  variant,
  badge,
  onClick,
  className,
}: ScoreTagProps) {
  let colorClass = '';

  if (variant === 'cultural') {
    const lower = (badge || '').toLowerCase() as 'excellent' | 'good' | 'fair';
    colorClass = variantStyles.cultural[lower] || variantStyles.cultural.fair;
  } else if (variant === 'kundli') {
    const lower = (badge || '').toLowerCase() as 'ideal' | 'good' | 'fair' | 'low';
    colorClass = variantStyles.kundli[lower] || variantStyles.kundli.fair;
  } else {
    colorClass = variantStyles.interests;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'score-tag border',
        colorClass,
        !onClick && 'cursor-default',
        className
      )}
      aria-label={`${label}: ${value}${badge ? ` - ${badge}` : ''}`}
    >
      <span className="font-bold">{value}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
          {badge}
        </span>
      )}
    </button>
  );
}
