'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Users } from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import CountdownTimer from '@/components/ui/CountdownTimer';
import Tabs from '@/components/ui/Tabs';
import { mockLikes, mockMatches } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';

function LikedYouTab() {
  const router = useRouter();

  if (mockLikes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-rose/10 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-rose" />
        </div>
        <h3 className="text-xl font-bold text-charcoal mb-2">
          No likes yet
        </h3>
        <p className="text-textLight text-sm max-w-sm">
          No likes yet. Keep completing your profile to attract more people.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockLikes.map((like, index) => (
          <motion.button
            key={like.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push('/discover')}
            className="relative rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-shadow text-left touch-target"
            aria-label={`View ${like.from_user.first_name}'s profile`}
          >
            {/* Photo - full view, NOT blurred */}
            <div className="aspect-[3/4] relative">
              <img
                src={like.from_photos[0]?.url}
                alt={like.from_user.first_name}
                className="w-full h-full object-cover"
              />

              {/* Like type badge */}
              <div className="absolute top-3 right-3">
                <div className="w-9 h-9 rounded-full bg-rose flex items-center justify-center shadow-md">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>

              {/* Gradient overlay */}
              <div className="gradient-overlay absolute inset-0" />

              {/* Name at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-lg">
                  {like.from_user.first_name}, {like.from_user.age}
                </p>
                <p className="text-white/70 text-sm">
                  {like.from_user.city}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MatchesTab() {
  const router = useRouter();

  if (mockMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-charcoal mb-2">
          No matches yet
        </h3>
        <p className="text-textLight text-sm max-w-sm">
          No matches yet. Start liking profiles you like.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {mockMatches.map((match, index) => {
        const isUrgent = new Date(match.expires_at).getTime() - Date.now() < 4 * 60 * 60 * 1000;

        return (
          <motion.button
            key={match.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push(`/chat/${match.id}`)}
            className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left touch-target"
            aria-label={`Chat with ${match.user.first_name}`}
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
              {match.last_message ? (
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
              ) : (
                <p className="text-sm text-rose mt-1 font-medium">
                  New match! Send a message
                </p>
              )}

              {/* Locked state */}
              {match.first_msg_locked && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  Waiting for reply...
                </p>
              )}
            </div>

            {/* Right side - countdown + unread */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {match.last_message && (
                <span className="text-xs text-textLight">
                  {formatDistanceToNow(new Date(match.last_message.created_at), {
                    addSuffix: false,
                  })}
                </span>
              )}

              {/* Countdown timer */}
              {!match.is_dissolved && (
                <CountdownTimer
                  expiresAt={match.expires_at}
                  variant="badge"
                  showIcon
                />
              )}

              {match.unread_count > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold rounded-full bg-rose text-white">
                  {match.unread_count}
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
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

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <Tabs
            tabs={[
              { id: 'liked', label: 'Liked You', badge: mockLikes.length },
              { id: 'matches', label: 'Matches', badge: mockMatches.length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
            className="mx-4 mt-4"
          />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'liked' && <LikedYouTab />}
            {activeTab === 'matches' && <MatchesTab />}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
