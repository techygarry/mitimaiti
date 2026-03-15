'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  variant?: 'inline' | 'badge' | 'banner';
  showIcon?: boolean;
  className?: string;
}

function getTimeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    total: diff,
  };
}

function formatTime(hours: number, minutes: number, seconds: number) {
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

export default function CountdownTimer({
  expiresAt,
  onExpire,
  variant = 'inline',
  showIcon = true,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const tl = getTimeLeft(expiresAt);
      setTimeLeft(tl);
      if (tl.total <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isUrgent = timeLeft.total > 0 && timeLeft.hours < 4;
  const isExpired = timeLeft.total <= 0;

  if (variant === 'badge') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
          isExpired
            ? 'bg-gray-100 text-gray-500'
            : isUrgent
            ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200',
          className
        )}
        aria-label={isExpired ? 'Expired' : `${formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)} remaining`}
      >
        {showIcon && <Clock className="w-3 h-3" />}
        {isExpired ? 'Expired' : formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
      </span>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={clsx(
          'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium',
          isExpired
            ? 'bg-gray-100 text-gray-500'
            : isUrgent
            ? 'bg-red-50 text-red-600 border-b border-red-100'
            : 'bg-amber-50 text-amber-700 border-b border-amber-100',
          className
        )}
        role="timer"
        aria-label={isExpired ? 'Match expired' : `Match expires in ${formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}`}
      >
        {showIcon && <Clock className="w-4 h-4" />}
        {isExpired
          ? 'This match has expired'
          : `Reply within ${formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}`}
      </div>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-medium',
        isExpired
          ? 'text-gray-400'
          : isUrgent
          ? 'text-red-500'
          : 'text-amber-600',
        className
      )}
      aria-label={isExpired ? 'Expired' : `${formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)} remaining`}
    >
      {showIcon && <Clock className="w-3 h-3" />}
      {isExpired ? 'Expired' : formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
    </span>
  );
}
