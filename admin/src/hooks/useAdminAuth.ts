'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';

interface AdminUser {
  id: string;
  phone: string;
  role: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (phone: string, otp: string) => {
    const response = await adminApi.verifyOtp(phone, otp);
    const { token, user: userData } = response.data.data;

    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    await adminApi.requestOtp(phone);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    requestOtp,
    logout,
  };
}
