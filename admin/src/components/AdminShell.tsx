'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { adminApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const router = useRouter();
  const [queueCount, setQueueCount] = useState(0);
  const [appealCount, setAppealCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch queue counts periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCounts = async () => {
      try {
        const response = await adminApi.getQueue({ status: 'pending', limit: 1 });
        setQueueCount(response.data?.data?.pagination?.total || 0);
      } catch {
        // Silently fail - counts are not critical
      }

      try {
        const response = await adminApi.getAppeals({ status: 'pending' });
        setAppealCount(response.data?.data?.pagination?.total || 0);
      } catch {
        // Silently fail
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-rose" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Sidebar onLogout={logout} queueCount={queueCount} appealCount={appealCount} />
      <main className="ml-60 min-h-screen">
        <div className="p-6 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
