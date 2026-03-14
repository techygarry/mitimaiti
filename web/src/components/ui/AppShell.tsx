'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Compass,
  Heart,
  MessageCircle,
  User,
  Settings,
  Bell,
  Users,
  Crown,
} from 'lucide-react';

const mainNavItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/inbox', label: 'Inbox', icon: Heart, badge: 3 },
  { href: '/inbox?tab=matches', label: 'Matches', icon: MessageCircle, badge: 2 },
  { href: '/profile', label: 'Profile', icon: User },
];

const sidebarItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/inbox', label: 'Liked You', icon: Heart },
  { href: '/inbox?tab=matches', label: 'Matches', icon: MessageCircle },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/family', label: 'Family Mode', icon: Users },
  { href: '/premium', label: 'Premium', icon: Crown },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.includes('?')) return false; // handle query params separately
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/discover" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-rose flex items-center justify-center">
              <span className="text-sm font-bold text-white">Mm</span>
            </div>
            <span className="text-xl font-bold text-rose tracking-tight hidden sm:block">
              MitiMaiti
            </span>
          </Link>

          {/* Center Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-rose bg-rose/5'
                      : 'text-textLight hover:text-textMain hover:bg-gray-50'
                  )}
                >
                  <Icon className={clsx('w-5 h-5', active && 'stroke-[2.5px]')} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-rose text-white">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-gray-50 transition-colors relative">
              <Bell className="w-5 h-5 text-textLight" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose rounded-full" />
            </button>
            <Link
              href="/settings"
              className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-textLight" />
            </Link>
            <Link
              href="/premium"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Crown className="w-4 h-4" />
              Premium
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Large screens */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-gray-100 bg-white/50">
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-rose bg-rose/5 shadow-sm'
                      : 'text-textLight hover:text-textMain hover:bg-gray-50'
                  )}
                >
                  <Icon className={clsx('w-5 h-5', active && 'stroke-[2.5px]')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.map((item) => {
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
                <Icon className={clsx('w-6 h-6', active && 'stroke-[2.5px]')} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full bg-rose text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
