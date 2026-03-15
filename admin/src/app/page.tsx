'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-rose flex items-center justify-center text-white font-bold text-sm">
          MM
        </div>
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    </div>
  );
}
