'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import { getFilteredMockMatches, getDisplayName } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';
import { Match } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { useMatches } from '@/context/MatchesContext';

// ── Circular timer avatar ────────────────────────────────────────────

function TimerAvatar({
  src,
  name,
  expiresAt,
  isLocked,
  unread,
  onClick,
}: {
  src: string;
  name: string;
  expiresAt: string;
  isLocked: boolean;
  unread: number;
  onClick: () => void;
}) {
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const matched24hAgo = expires - 24 * 60 * 60 * 1000;
  const total = 24 * 60 * 60 * 1000;
  const elapsed = now - matched24hAgo;
  const progress = Math.min(Math.max(elapsed / total, 0), 1);
  const isExpired = now >= expires;

  // SVG circle math
  const size = 76;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 relative"
      aria-label={`Match with ${name}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Timer ring */}
        {!isExpired && (
          <svg
            className="absolute inset-0"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
            {/* Progress arc — gold color like the reference */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#D4A853"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-1000"
            />
          </svg>
        )}

        {/* Photo */}
        <div
          className="absolute rounded-full overflow-hidden bg-gray-100"
          style={{
            top: strokeWidth + 2,
            left: strokeWidth + 2,
            width: size - (strokeWidth + 2) * 2,
            height: size - (strokeWidth + 2) * 2,
          }}
        >
          <img src={src} alt={name} className="w-full h-full object-cover" />
        </div>

        {/* Unread badge */}
        {unread > 0 && (
          <div className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-rose flex items-center justify-center border-2 border-white">
            <span className="text-[10px] font-bold text-white">{unread}</span>
          </div>
        )}
      </div>

      <span className="text-xs font-medium text-charcoal truncate w-16 text-center">{name}</span>
    </motion.button>
  );
}

// ── Main page ────────────────────────────────────────────────────────

export default function MatchesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { graduatedMatchIds } = useMatches();
  const matches = getFilteredMockMatches();

  /**
   * A match belongs in "Chats" (permanent list) when ANY of:
   *   1. Its timer has expired (expires_at is in the past)
   *   2. It has been graduated — i.e. both sides have exchanged a message
   *      (ice-breaker sent + reply received), tracked via MatchesContext
   *   3. Its mock status is already 'active' and it has a last_message
   *      (covers pre-seeded active conversations in mockData)
   *
   * Everything else stays in "Your Matches" (timer avatar row) while
   * the timer is still running.
   */
  const isGraduated = (m: Match): boolean => {
    const timerExpired = new Date(m.expires_at).getTime() <= Date.now();
    const graduatedByReply = graduatedMatchIds.has(m.id);
    const preSeededActive = m.status === 'active' && !!m.last_message;
    return timerExpired || graduatedByReply || preSeededActive;
  };

  const newMatches = matches.filter((m) => !isGraduated(m));
  const activeChats = matches.filter((m) => isGraduated(m) && !!m.last_message);

  return (
    <AppShell>
      <div className="flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-charcoal">{t('matches.title')}</h1>
          </div>

          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-rose/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-rose" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2">{t('matches.noMatchesYet')}</h3>
              <p className="text-textLight text-sm max-w-sm">{t('matches.startLikingShort')}</p>
            </div>
          ) : (
            <>
              {/* Your matches — circular avatars with timers */}
              {newMatches.length > 0 && (
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-charcoal mb-4">{t('matches.yourMatches')}</h2>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {newMatches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TimerAvatar
                          src={match.photos[0]?.url}
                          name={match.user.first_name}
                          expiresAt={match.expires_at}
                          isLocked={match.first_msg_locked}
                          unread={match.unread_count}
                          onClick={() => router.push(`/chat/${match.id}`)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chats — list of active conversations */}
              {activeChats.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-charcoal mb-3">{t('matches.chats')}</h2>
                  <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-gray-50">
                    {activeChats.map((match, index) => (
                      <motion.button
                        key={match.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => router.push(`/chat/${match.id}`)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={match.photos[0]?.url}
                            alt={match.user.first_name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-charcoal text-sm truncate">
                            {getDisplayName(match.user)}, {match.user.age}
                          </h3>
                          {match.last_message && (
                            <p className={`text-sm truncate mt-0.5 ${match.unread_count > 0 ? 'text-charcoal font-semibold' : 'text-textLight'}`}>
                              {match.last_message.sender_id === 'me' && <span className="text-textLight font-normal">You: </span>}
                              {match.last_message.content}
                            </p>
                          )}
                        </div>

                        {/* Right side */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {match.last_message && (
                            <span className="text-xs text-textLight">
                              {formatDistanceToNow(new Date(match.last_message.created_at), { addSuffix: false })}
                            </span>
                          )}
                          {match.unread_count > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-rose text-white">
                              {match.unread_count}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
