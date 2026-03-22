'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Compass,
  Heart,
  MessageCircle,
  User,
  Bell,
  Users,
  X,
  Clock,
  Star,
  Shield,
  Eye,
  Sparkles,
  Zap,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow, isToday } from 'date-fns';
import { useTranslation } from '@/lib/i18n';
import { useNotifications, type AppNotification, type NotificationType } from '@/lib/notifications';

// ── Icon & colour maps ────────────────────────────────────────────────────

const notifIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  match: Heart,
  like: Star,
  message: MessageCircle,
  family: Users,
  family_suggestion: Users,
  expiry: Clock,
  system: Shield,
  profile_view: Eye,
  icebreaker: Zap,
  feature: Sparkles,
};

const notifColors: Record<NotificationType, string> = {
  match: 'bg-rose/10 text-rose',
  like: 'bg-amber-50 text-amber-600',
  message: 'bg-blue-50 text-blue-500',
  family: 'bg-purple-50 text-purple-500',
  family_suggestion: 'bg-purple-50 text-purple-500',
  expiry: 'bg-orange-50 text-orange-500',
  system: 'bg-gray-100 text-textLight',
  profile_view: 'bg-emerald-50 text-emerald-500',
  icebreaker: 'bg-cyan-50 text-cyan-500',
  feature: 'bg-indigo-50 text-indigo-500',
};

// ── Relative time helper ──────────────────────────────────────────────────

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

// ── Group notifications by "today" vs "earlier" ──────────────────────────

function groupNotifications(notifications: AppNotification[]) {
  const today: AppNotification[] = [];
  const earlier: AppNotification[] = [];
  for (const n of notifications) {
    if (isToday(new Date(n.time))) {
      today.push(n);
    } else {
      earlier.push(n);
    }
  }
  return { today, earlier };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AppShell({
  children,
  hideSidebar = false,
}: {
  children: React.ReactNode;
  hideSidebar?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    dismiss,
    clearAll,
  } = useNotifications();

  // Track previous count to show toasts on new arrivals
  const prevCountRef = useRef(notifications.length);
  useEffect(() => {
    if (notifications.length > prevCountRef.current && prevCountRef.current > 0) {
      const newest = notifications[0];
      if (newest && !newest.read) {
        toast(newest.title, {
          icon: '🔔',
          duration: 3000,
          position: 'top-right',
        });
      }
    }
    prevCountRef.current = notifications.length;
  }, [notifications]);

  const { today, earlier } = groupNotifications(notifications);

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.actionUrl) {
      setShowNotifications(false);
      router.push(notif.actionUrl);
    }
  };

  const mainNavItems = [
    { href: '/discover', label: t('nav.discover'), icon: Compass },
    { href: '/inbox', label: t('nav.likedYou'), icon: Heart, badge: 3 },
    { href: '/matches', label: t('nav.matches'), icon: MessageCircle, badge: 2 },
    { href: '/family', label: t('nav.family'), icon: Users },
    { href: '/profile', label: t('nav.profile'), icon: User },
  ];

  const isActive = (href: string) => {
    if (href.includes('?')) return false;
    return pathname.startsWith(href);
  };

  // ── Render a single notification row ──

  const renderNotification = (notif: AppNotification) => {
    const Icon = notifIcons[notif.type] || Bell;
    const colorClass = notifColors[notif.type] || 'bg-gray-100 text-textLight';

    return (
      <motion.div
        key={notif.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          'flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer',
          !notif.read && 'bg-rose/5',
        )}
        onClick={() => handleNotificationClick(notif)}
      >
        <div
          className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
            colorClass,
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={clsx(
                'text-sm',
                !notif.read ? 'font-semibold text-charcoal' : 'font-medium text-charcoal/80',
              )}
            >
              {notif.title}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss(notif.id);
              }}
              className="p-0.5 rounded hover:bg-gray-200 shrink-0"
            >
              <X className="w-3 h-3 text-textLight" />
            </button>
          </div>
          <p className="text-xs text-textLight mt-0.5 line-clamp-2">{notif.body}</p>
          <p className="text-[10px] text-textLight/60 mt-1">{relativeTime(notif.time)}</p>
        </div>
        {!notif.read && <div className="w-2 h-2 rounded-full bg-rose shrink-0 mt-2" />}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/discover" className="flex items-center gap-2" aria-label="MitiMaiti home">
            <div className="w-9 h-9 rounded-xl gradient-rose flex items-center justify-center">
              <span className="text-sm font-bold text-white">Mm</span>
            </div>
            <span className="text-xl font-bold text-rose tracking-tight hidden sm:block">
              MitiMaiti
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl hover:bg-gray-50 transition-colors relative touch-target"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-textLight" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full bg-rose text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-charcoal text-sm">
                        {t('nav.notifications')}
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-rose font-medium hover:underline"
                          >
                            {t('notification.markAllRead')}
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="p-1 rounded-lg hover:bg-gray-100"
                            title={t('notification.clearAll')}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-textLight" />
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 rounded-lg hover:bg-gray-100"
                        >
                          <X className="w-4 h-4 text-textLight" />
                        </button>
                      </div>
                    </div>

                    {/* Notifications list */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-center">
                          <Bell className="w-8 h-8 text-textLight/30 mb-2" />
                          <p className="text-sm text-textLight">
                            {t('notification.noNotifications')}
                          </p>
                        </div>
                      ) : (
                        <>
                          {today.length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-gray-50">
                                <p className="text-xs font-semibold text-textLight uppercase tracking-wide">
                                  {t('notification.today')}
                                </p>
                              </div>
                              <AnimatePresence initial={false}>
                                {today.map(renderNotification)}
                              </AnimatePresence>
                            </>
                          )}
                          {earlier.length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-gray-50">
                                <p className="text-xs font-semibold text-textLight uppercase tracking-wide">
                                  {t('notification.earlier')}
                                </p>
                              </div>
                              <AnimatePresence initial={false}>
                                {earlier.map(renderNotification)}
                              </AnimatePresence>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto flex">
        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 safe-bottom z-40"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-around px-2 py-2">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors duration-200 touch-target',
                  active
                    ? 'text-rose bg-rose/5'
                    : 'text-textLight hover:text-textMain hover:bg-gray-50',
                )}
              >
                <Icon className={clsx('w-5 h-5', active && 'stroke-[2.5px]')} />
                <span className="text-sm font-medium hidden sm:block">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-0.5 right-0 sm:static min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-rose text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="bottom-nav-underline"
                    className="absolute top-0 left-2 right-2 h-0.5 bg-rose rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
