'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import { BadgeCheck } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
  online?: boolean;
  className?: string;
}

const sizeStyles = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

const badgeSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

const onlineDotSizes = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
};

export default function Avatar({
  src,
  alt,
  size = 'md',
  verified = false,
  online,
  className,
}: AvatarProps) {
  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      <div
        className={clsx(
          'rounded-full overflow-hidden bg-rose-light/30 flex items-center justify-center',
          sizeStyles[size]
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover rounded-full"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <span className="text-rose font-semibold text-sm">{initials}</span>
        )}
      </div>

      {/* Verified badge */}
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
          <BadgeCheck
            className={clsx('text-blue-500 fill-blue-500', badgeSizes[size])}
          />
        </div>
      )}

      {/* Online dot */}
      {online !== undefined && (
        <div
          className={clsx(
            'absolute top-0 right-0 rounded-full border-2 border-white',
            onlineDotSizes[size],
            online ? 'bg-green-400' : 'bg-gray-300'
          )}
        />
      )}
    </div>
  );
}
