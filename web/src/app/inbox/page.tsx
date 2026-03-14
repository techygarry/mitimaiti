'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Heart, Star, MessageCircle, Crown } from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Tabs from '@/components/ui/Tabs';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { mockLikes, mockMatches } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';

function LikedYouTab() {
  const router = useRouter();
  const isPremium = false; // Demo: free user

  return (
    <div className="p-6">
      {/* Upgrade banner for free users */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gold/10 to-amber-50 rounded-2xl p-5 mb-6 border border-gold/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-charcoal">
                {mockLikes.length} people liked you
              </p>
              <p className="text-sm text-textLight">
                Upgrade to see who likes you
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/premium')}
              className="bg-gold hover:bg-amber-600 text-sm"
            >
              Upgrade
            </Button>
          </div>
        </motion.div>
      )}

      {/* Likes grid - 3-4 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockLikes.map((like, index) => (
          <motion.div
            key={like.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-shadow"
          >
            {/* Photo */}
            <div className="aspect-[3/4] relative">
              <img
                src={like.from_photos[0]?.url}
                alt={like.from_user.first_name}
                className="w-full h-full object-cover"
              />

              {/* Blur overlay for free users */}
              {!isPremium && (
                <div className="absolute inset-0 backdrop-blur-lg bg-white/20 flex flex-col items-center justify-center">
                  <Lock className="w-10 h-10 text-white mb-2" />
                  <p className="text-white font-semibold text-sm">
                    Upgrade to see
                  </p>
                </div>
              )}

              {/* Like type badge */}
              <div className="absolute top-3 right-3">
                {like.type === 'super_like' ? (
                  <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center shadow-md">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                ) : like.type === 'comment' ? (
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-rose flex items-center justify-center shadow-md">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Gradient overlay */}
              <div className="gradient-overlay absolute inset-0" />

              {/* Name at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-lg">
                  {isPremium
                    ? `${like.from_user.first_name}, ${like.from_user.age}`
                    : '???'}
                </p>
              </div>
            </div>

            {/* Comment preview */}
            {like.comment && (
              <div className="p-4 border-t border-gray-50">
                <p className="text-sm text-textLight line-clamp-2">
                  &quot;{isPremium ? like.comment : '********'}&quot;
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {mockLikes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">💝</div>
          <h3 className="text-xl font-bold text-charcoal mb-2">
            No likes yet
          </h3>
          <p className="text-textLight text-sm max-w-sm">
            When someone likes your profile, they&apos;ll appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function MatchesTab() {
  const router = useRouter();

  return (
    <div className="divide-y divide-gray-50">
      {mockMatches.map((match, index) => (
        <motion.button
          key={match.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => router.push(`/chat/${match.id}`)}
          className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
        >
          {/* Avatar */}
          <div className="relative">
            <Avatar
              src={match.photos[0]?.url}
              alt={match.user.first_name}
              size="md"
              online={match.is_online}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-charcoal truncate text-base">
                {match.user.first_name}, {match.user.age}
              </h3>
              {match.user.verified && (
                <Badge variant="blue" size="sm">
                  Verified
                </Badge>
              )}
            </div>
            {match.last_message && (
              <p
                className={`text-sm truncate mt-1 ${
                  match.unread_count > 0
                    ? 'text-charcoal font-medium'
                    : 'text-textLight'
                }`}
              >
                {match.last_message.sender_id === 'me' && (
                  <span className="text-textLight">You: </span>
                )}
                {match.last_message.content}
              </p>
            )}
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {match.last_message && (
              <span className="text-xs text-textLight">
                {formatDistanceToNow(new Date(match.last_message.created_at), {
                  addSuffix: false,
                })}
              </span>
            )}
            {match.unread_count > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold rounded-full bg-rose text-white">
                {match.unread_count}
              </span>
            )}
          </div>
        </motion.button>
      ))}

      {mockMatches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-bold text-charcoal mb-2">
            No matches yet
          </h3>
          <p className="text-textLight text-sm max-w-sm">
            When you match with someone, your conversations will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState('liked');

  return (
    <AppShell>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal">Inbox</h1>
          <p className="text-sm text-textLight mt-1">See who likes you and manage your matches</p>
        </div>

        {/* Desktop two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Likes Section */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose" />
                  Liked You
                  <span className="text-sm font-normal text-textLight">({mockLikes.length})</span>
                </h2>
              </div>
              <LikedYouTab />
            </div>
          </div>

          {/* Matches Section */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden lg:sticky lg:top-24">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Matches
                  <span className="text-sm font-normal text-textLight">({mockMatches.length})</span>
                </h2>
              </div>
              <MatchesTab />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
