'use client';

import { cn } from '@/lib/cn';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Shield,
  Ban,
  AlertTriangle,
  Heart,
  MessageCircle,
  Calendar,
  MapPin,
  Phone,
} from 'lucide-react';

interface UserCardProps {
  user: {
    id: string;
    phone: string;
    created_at: string;
    is_verified: boolean;
    is_suspended: boolean;
    is_banned: boolean;
    strikes: number;
    ban_expires?: string | null;
  };
  profile?: {
    basic?: {
      display_name?: string;
      bio?: string;
      city?: string;
      country?: string;
    };
  };
  stats?: {
    likesGiven: number;
    likesReceived: number;
    activeMatches: number;
    messagesSent: number;
  };
  photos?: { url_medium: string; is_primary: boolean }[];
  compact?: boolean;
}

export default function UserCard({ user, profile, stats, photos, compact }: UserCardProps) {
  const primaryPhoto = photos?.find((p) => p.is_primary) || photos?.[0];
  const displayName = profile?.basic?.display_name || 'Unknown';
  const joinedAgo = formatDistanceToNow(new Date(user.created_at), { addSuffix: true });

  if (compact) {
    return (
      <div className="card p-4 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url_medium}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-charcoal truncate">{displayName}</p>
          <p className="text-xs text-gray-400">{user.phone}</p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {user.is_banned && <span className="badge-critical">Banned</span>}
          {user.is_suspended && <span className="badge-high">Suspended</span>}
          {user.strikes > 0 && (
            <span className="badge-medium">{user.strikes} strike{user.strikes !== 1 ? 's' : ''}</span>
          )}
          {user.is_verified && <span className="badge-success">Verified</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header with status bar */}
      <div
        className={cn(
          'h-1.5',
          user.is_banned
            ? 'bg-red-500'
            : user.is_suspended
            ? 'bg-orange-500'
            : user.strikes > 0
            ? 'bg-yellow-500'
            : 'bg-emerald-500'
        )}
      />

      <div className="p-6">
        {/* Profile header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden ring-2 ring-white shadow">
            {primaryPhoto ? (
              <img
                src={primaryPhoto.url_medium}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-medium">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-charcoal truncate">{displayName}</h2>
              {user.is_verified && (
                <Shield size={16} className="text-emerald-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Phone size={13} />
              {user.phone}
            </p>
            {profile?.basic?.city && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <MapPin size={13} />
                {profile.basic.city}{profile.basic.country ? `, ${profile.basic.country}` : ''}
              </p>
            )}
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
              <Calendar size={12} />
              Joined {joinedAgo} ({format(new Date(user.created_at), 'MMM d, yyyy')})
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {user.is_banned && (
            <span className="badge-critical flex items-center gap-1">
              <Ban size={12} /> Banned
              {user.ban_expires && ` until ${format(new Date(user.ban_expires), 'MMM d')}`}
            </span>
          )}
          {user.is_suspended && (
            <span className="badge-high flex items-center gap-1">
              <AlertTriangle size={12} /> Suspended
              {user.ban_expires && ` until ${format(new Date(user.ban_expires), 'MMM d')}`}
            </span>
          )}
          <span
            className={cn(
              'badge',
              user.strikes === 0
                ? 'bg-emerald-100 text-emerald-800'
                : user.strikes >= 3
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            )}
          >
            {user.strikes} strike{user.strikes !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Bio */}
        {profile?.basic?.bio && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bio</p>
            <p className="text-sm text-gray-700 leading-relaxed">{profile.basic.bio}</p>
          </div>
        )}

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-brand-charcoal">{stats.likesGiven}</p>
              <p className="text-[10px] text-gray-400 uppercase">Likes Sent</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-brand-charcoal">{stats.likesReceived}</p>
              <p className="text-[10px] text-gray-400 uppercase">Likes Got</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-brand-rose">{stats.activeMatches}</p>
              <p className="text-[10px] text-gray-400 uppercase flex items-center justify-center gap-0.5">
                <Heart size={9} /> Matches
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-brand-charcoal">{stats.messagesSent}</p>
              <p className="text-[10px] text-gray-400 uppercase flex items-center justify-center gap-0.5">
                <MessageCircle size={9} /> Msgs
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
