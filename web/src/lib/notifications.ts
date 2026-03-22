'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'match'
  | 'like'
  | 'message'
  | 'family'
  | 'family_suggestion'
  | 'expiry'
  | 'system'
  | 'profile_view'
  | 'icebreaker'
  | 'feature';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string; // ISO 8601
  read: boolean;
  actionUrl?: string;
  avatar?: string;
  dismissed: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'mm_notifications';
const CHANGE_EVENT = 'notifications-change';
const MAX_NOTIFICATIONS = 50;

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

// ── Seed data ──────────────────────────────────────────────────────────────

function getSeedNotifications(): AppNotification[] {
  return [
    {
      id: generateId(),
      type: 'match',
      title: 'You matched with Tanya!',
      body: 'Say hi before the timer runs out!',
      time: minutesAgo(2),
      read: false,
      actionUrl: '/chat/m1',
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'like',
      title: 'Isha liked your profile',
      body: 'Check Liked You to see who!',
      time: minutesAgo(15),
      read: false,
      actionUrl: '/inbox',
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'message',
      title: 'New message from Aryan',
      body: '"I just made the best dal pakwan of my life!"',
      time: hoursAgo(1),
      read: false,
      actionUrl: '/chat/m4',
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'family_suggestion',
      title: 'Mom suggested Rohit from Pune',
      body: 'Check Family Mode to review the suggestion.',
      time: hoursAgo(2),
      read: true,
      actionUrl: '/family',
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'expiry',
      title: 'Match with Roshni expires in 4h',
      body: 'Send a message before it is too late!',
      time: hoursAgo(3),
      read: true,
      actionUrl: '/chat/m3',
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'like',
      title: 'Anika liked your photo',
      body: 'You have a new admirer! Take a look.',
      time: hoursAgo(4),
      read: false,
      actionUrl: '/inbox',
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'message',
      title: 'Dev sent you a voice note',
      body: 'Tap to listen to the voice note.',
      time: hoursAgo(5),
      read: true,
      actionUrl: '/chat/m6',
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'system',
      title: 'Weekly summary: 47 views, 12 likes',
      body: 'Your profile had a great week! Keep it up.',
      time: daysAgo(1),
      read: true,
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'profile_view',
      title: 'Complete your Sindhi Identity',
      body: 'Add Sindhi Identity details to get 3x more matches.',
      time: daysAgo(2),
      read: true,
      actionUrl: '/profile/edit',
      dismissed: false,
    },
    {
      id: generateId(),
      type: 'feature',
      title: 'New feature: Voice Intros!',
      body: 'Record a short voice intro to stand out from the crowd.',
      time: daysAgo(3),
      read: true,
      dismissed: false,
    },
  ];
}

// ── NotificationManager (static, works from anywhere) ──────────────────────

export class NotificationManager {
  // ── Storage ──

  static getAll(): AppNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as AppNotification[];
    } catch {
      return [];
    }
  }

  static save(notifications: AppNotification[]): void {
    if (typeof window === 'undefined') return;
    // Prune to max
    const pruned = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }

  // ── Seed on first load ──

  static seedIfEmpty(): void {
    const existing = NotificationManager.getAll();
    if (existing.length === 0) {
      NotificationManager.save(getSeedNotifications());
    }
  }

  // ── CRUD ──

  static addNotification(
    notification: Omit<AppNotification, 'id' | 'read' | 'dismissed' | 'time'> & {
      id?: string;
      read?: boolean;
      dismissed?: boolean;
      time?: string;
    },
  ): AppNotification {
    const entry: AppNotification = {
      id: notification.id ?? generateId(),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      time: notification.time ?? new Date().toISOString(),
      read: notification.read ?? false,
      actionUrl: notification.actionUrl,
      avatar: notification.avatar,
      dismissed: notification.dismissed ?? false,
    };

    const all = NotificationManager.getAll();
    NotificationManager.save([entry, ...all]);

    // Show native browser notification if permitted and page hidden
    if (typeof document !== 'undefined' && document.hidden) {
      NotificationManager.showNativeNotification(entry.title, entry.body);
    }

    return entry;
  }

  static markAsRead(id: string): void {
    const all = NotificationManager.getAll();
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    NotificationManager.save(updated);
  }

  static markAllRead(): void {
    const all = NotificationManager.getAll();
    const updated = all.map((n) => ({ ...n, read: true }));
    NotificationManager.save(updated);
  }

  static dismiss(id: string): void {
    const all = NotificationManager.getAll();
    const updated = all.filter((n) => n.id !== id);
    NotificationManager.save(updated);
  }

  static dismissAll(): void {
    NotificationManager.save([]);
  }

  static clearAll(): void {
    NotificationManager.save([]);
  }

  static getUnreadCount(): number {
    return NotificationManager.getAll().filter((n) => !n.read && !n.dismissed).length;
  }

  // ── Native browser Notification API ──

  static requestPermission(): void {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  static showNativeNotification(title: string, body: string): void {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } catch {
      // Service worker fallback — silently ignored in dev
    }
  }

  // ── Scheduled / delayed notifications ──

  private static scheduledTimers: ReturnType<typeof setTimeout>[] = [];

  static scheduleNotification(
    notification: Omit<AppNotification, 'id' | 'read' | 'dismissed' | 'time'>,
    delayMs: number,
  ): void {
    const timer = setTimeout(() => {
      NotificationManager.addNotification(notification);
    }, delayMs);
    NotificationManager.scheduledTimers.push(timer);
  }

  static clearScheduled(): void {
    NotificationManager.scheduledTimers.forEach((t) => clearTimeout(t));
    NotificationManager.scheduledTimers = [];
  }

  // ── Auto-generated contextual notifications ──

  static scheduleExpiryReminders(): void {
    // 4-hour reminder
    NotificationManager.scheduleNotification(
      {
        type: 'expiry',
        title: 'Match expiring in 4 hours',
        body: 'Send a message before your match expires!',
        actionUrl: '/matches',
      },
      4 * 60 * 60 * 1000,
    );
    // 1-hour reminder
    NotificationManager.scheduleNotification(
      {
        type: 'expiry',
        title: 'Match expiring in 1 hour!',
        body: 'Last chance to send a message!',
        actionUrl: '/matches',
      },
      1 * 60 * 60 * 1000,
    );
  }

  static scheduleDailyPrompt(): void {
    // Schedule a daily prompt notification for 12 hours from now
    NotificationManager.scheduleNotification(
      {
        type: 'icebreaker',
        title: 'Daily conversation starter',
        body: 'What Sindhi dish reminds you of home? Use it as an icebreaker today!',
        actionUrl: '/discover',
      },
      12 * 60 * 60 * 1000,
    );
  }

  static scheduleWeeklySummary(): void {
    // Schedule a weekly summary 7 days from now
    NotificationManager.scheduleNotification(
      {
        type: 'system',
        title: 'Your weekly summary is ready',
        body: 'See how your profile performed this week!',
        actionUrl: '/profile',
      },
      7 * 24 * 60 * 60 * 1000,
    );
  }

  /** Boot: seed data + request permission + start scheduled tasks */
  static initialize(): void {
    NotificationManager.seedIfEmpty();
    NotificationManager.requestPermission();
    NotificationManager.scheduleDailyPrompt();
    NotificationManager.scheduleWeeklySummary();
  }
}

// ── React hook ─────────────────────────────────────────────────────────────

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(() => {
    setNotifications(NotificationManager.getAll().filter((n) => !n.dismissed));
  }, []);

  useEffect(() => {
    // First load — seed and hydrate
    NotificationManager.initialize();
    refresh();

    const onChange = () => refresh();
    window.addEventListener(CHANGE_EVENT, onChange);
    // Also listen for storage changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    NotificationManager.markAsRead(id);
  }, []);

  const markAllRead = useCallback(() => {
    NotificationManager.markAllRead();
  }, []);

  const dismiss = useCallback((id: string) => {
    NotificationManager.dismiss(id);
  }, []);

  const dismissAll = useCallback(() => {
    NotificationManager.dismissAll();
  }, []);

  const addNotification = useCallback(
    (
      notification: Omit<AppNotification, 'id' | 'read' | 'dismissed' | 'time'> & {
        id?: string;
        read?: boolean;
        dismissed?: boolean;
        time?: string;
      },
    ) => {
      return NotificationManager.addNotification(notification);
    },
    [],
  );

  const clearAll = useCallback(() => {
    NotificationManager.clearAll();
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    dismiss,
    dismissAll,
    addNotification,
    clearAll,
  };
}
