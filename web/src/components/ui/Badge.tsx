'use client';

import { clsx } from 'clsx';

type BadgeVariant = 'gold' | 'green' | 'orange' | 'rose' | 'gray' | 'blue';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  rose: 'bg-rose/10 text-rose border-rose-light/30',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export default function Badge({
  children,
  variant = 'gray',
  size = 'md',
  className,
  icon,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// Cultural Score Badge
interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function CulturalScoreBadge({ score, className }: ScoreBadgeProps) {
  const variant: BadgeVariant =
    score >= 80 ? 'gold' : score >= 60 ? 'green' : 'orange';
  const label =
    score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair';

  return (
    <Badge variant={variant} size="sm" className={className}>
      <span className="font-bold">{score}%</span> {label} Match
    </Badge>
  );
}
