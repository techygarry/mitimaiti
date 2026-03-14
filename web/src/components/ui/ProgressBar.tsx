'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'rose' | 'gold' | 'green';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const variantStyles = {
  rose: 'bg-rose',
  gold: 'bg-gold',
  green: 'bg-green-500',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const bgStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export default function ProgressBar({
  progress,
  variant = 'rose',
  size = 'md',
  showLabel = false,
  animated = true,
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-textLight">Progress</span>
          <span className="text-xs font-semibold text-textMain">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div
        className={clsx(
          'w-full rounded-full bg-gray-200 overflow-hidden',
          bgStyles[size]
        )}
      >
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={clsx(
              'rounded-full',
              sizeStyles[size],
              variantStyles[variant]
            )}
          />
        ) : (
          <div
            className={clsx(
              'rounded-full transition-all duration-300',
              sizeStyles[size],
              variantStyles[variant]
            )}
            style={{ width: `${clampedProgress}%` }}
          />
        )}
      </div>
    </div>
  );
}
