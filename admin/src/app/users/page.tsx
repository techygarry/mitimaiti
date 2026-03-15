'use client';

import { useState, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/cn';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Search,
  Loader2,
  Users,
  Shield,
  Ban,
  AlertTriangle,
  ChevronRight,
  Phone,
  UserSearch,
} from 'lucide-react';

interface UserResult {
  id: string;
  phone: string;
  display_name?: string;
  city?: string;
  is_verified: boolean;
  is_banned: boolean;
  is_suspended: boolean;
  strikes: number;
  created_at: string;
}

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSearched(true);

      const response = await adminApi.searchUsers(query.trim());
      setResults(response.data?.data?.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">User Lookup</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Search users by phone number or display name
          </p>
        </div>

        {/* Search bar */}
        <div className="card p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by phone number or name..."
                className="input-field pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="btn-primary flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserSearch size={16} />
              )}
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-rose" />
          </div>
        ) : searched && results.length === 0 ? (
          <div className="card p-12 text-center">
            <Users size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600">No users found</h3>
            <p className="text-sm text-gray-400 mt-1">
              Try searching with a different phone number or name.
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Strikes</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium flex-shrink-0">
                          {(user.display_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-brand-charcoal">
                            {user.display_name || 'Unnamed'}
                          </p>
                          <p className="text-xs text-gray-400">{user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Phone size={12} />
                        {user.phone}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">{user.city || '--'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        {user.is_banned ? (
                          <span className="badge-critical flex items-center gap-1">
                            <Ban size={10} /> Banned
                          </span>
                        ) : user.is_suspended ? (
                          <span className="badge-high flex items-center gap-1">
                            <AlertTriangle size={10} /> Suspended
                          </span>
                        ) : user.is_verified ? (
                          <span className="badge-success flex items-center gap-1">
                            <Shield size={10} /> Verified
                          </span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-600">Active</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span
                        className={cn(
                          'font-medium',
                          user.strikes === 0
                            ? 'text-gray-400'
                            : user.strikes >= 3
                            ? 'text-red-600'
                            : 'text-amber-600'
                        )}
                      >
                        {user.strikes}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/users/${user.id}`}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors inline-flex"
                      >
                        <ChevronRight size={16} className="text-gray-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !searched ? (
          <div className="card p-12 text-center">
            <UserSearch size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600">Search for a user</h3>
            <p className="text-sm text-gray-400 mt-1">
              Enter a phone number or name to look up user profiles.
            </p>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
