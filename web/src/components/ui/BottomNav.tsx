'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Compass, Heart, MessageCircle, User } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/inbox', label: 'Liked You', icon: Heart },
  { href: '/inbox?tab=matches', label: 'Matches', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  className?: string;
}

export default function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/inbox?tab=matches') {
      return pathname === '/inbox' && typeof window !== 'undefined' && window.location.search.includes('tab=matches');
    }
    if (href === '/inbox') {
      return pathname === '/inbox' && (typeof window === 'undefined' || !window.location.search.includes('tab=matches'));
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 safe-bottom z-40',
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors duration-200',
                active ? 'text-rose' : 'text-textLight hover:text-textMain'
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-rose/5 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon
                className={clsx(
                  'w-6 h-6 relative z-10',
                  active && 'stroke-[2.5px]'
                )}
              />
              <span className="text-[10px] font-medium relative z-10">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
