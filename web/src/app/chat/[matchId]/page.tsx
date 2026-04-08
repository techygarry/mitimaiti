'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Mic,
  Send,
  Smile,
  CheckCheck,
  Check,
  Video,
  Phone,
  MoreVertical,
  Dice5,
  Flag,
  ShieldOff,
  UserX,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Avatar from '@/components/ui/Avatar';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { mockMatches, mockMessages } from '@/lib/mockData';
import { getRandomIceBreakers, IceBreakerPrompt } from '@/lib/iceBreakerPrompts';
import { Message } from '@/types';
import { useMatches } from '@/context/MatchesContext';
import { format, isToday, isYesterday } from 'date-fns';
import { useTranslation } from '@/lib/i18n';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, h:mm a');
}

function getAutoReply(message: string): string {
  void message;
  const replies = [
    'That sounds amazing! Tell me more about yourself.',
    'Haha, I love that! What else do you enjoy?',
    'That is so interesting! I have always wanted to try that.',
    'You have great taste! We should definitely meet up sometime.',
    'I totally agree! It is nice to meet someone who thinks the same way.',
    'That is wonderful! What are you up to this weekend?',
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// ─── Read-receipt icon ───────────────────────────────────────────────────────

function ReadReceipt({ status }: { status: string }) {
  if (status === 'read') {
    return <CheckCheck className="w-3.5 h-3.5 text-sky-300" aria-label="Read" />;
  }
  if (status === 'delivered') {
    return <CheckCheck className="w-3.5 h-3.5 text-white/50" aria-label="Delivered" />;
  }
  return <Check className="w-3.5 h-3.5 text-white/50" aria-label="Sent" />;
}

// ─── Message bubble ──────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isMine,
  avatarSrc,
  avatarAlt,
  showAvatar,
}: {
  message: Message;
  isMine: boolean;
  avatarSrc?: string;
  avatarAlt: string;
  showAvatar: boolean;
}) {
  const status = message.status ?? (message.read ? 'read' : 'delivered');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`flex items-end gap-2 mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar placeholder for received — keeps alignment consistent */}
      {!isMine && (
        <div className="w-8 shrink-0">
          {showAvatar && (
            <Avatar src={avatarSrc} alt={avatarAlt} size="xs" />
          )}
        </div>
      )}

      <div
        className={`max-w-[72%] px-4 py-2.5 rounded-2xl ${
          isMine
            ? 'bg-rose text-white rounded-br-sm'
            : 'bg-gray-100 text-charcoal rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
          <p className={`text-[10px] ${isMine ? 'text-white/55' : 'text-textLight'}`}>
            {formatMessageTime(message.created_at)}
          </p>
          {isMine && <ReadReceipt status={status} />}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator({ avatarSrc, avatarAlt }: { avatarSrc?: string; avatarAlt: string }) {
  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="w-8 shrink-0">
        <Avatar src={avatarSrc} alt={avatarAlt} size="xs" />
      </div>
      <div
        className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
        aria-label="Typing"
      >
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay, ease: 'easeInOut' }}
            className="w-2 h-2 bg-gray-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Ice-breaker card ────────────────────────────────────────────────────────

function IceBreakerCard({
  prompt,
  onClick,
}: {
  prompt: IceBreakerPrompt;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-1 min-w-[160px] max-w-[220px] shrink-0 flex flex-col gap-1.5 p-3 bg-white border border-rose-light/30 rounded-2xl shadow-soft text-left hover:border-rose/40 hover:bg-rose/[0.03] transition-colors"
      aria-label={`Send ice breaker: ${prompt.text}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{prompt.emoji}</span>
        <span className="text-[11px] font-semibold text-rose uppercase tracking-wide">
          {prompt.category}
        </span>
      </div>
      <p className="text-xs text-charcoal leading-snug line-clamp-3">{prompt.text}</p>
    </motion.button>
  );
}

// ─── Lock banner ─────────────────────────────────────────────────────────────

function LockBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-5 py-3 bg-gradient-to-r from-rose/10 via-rose/5 to-rose/10 border-b border-rose-light/20 text-center shrink-0"
    >
      <div className="flex items-center justify-center gap-2 mb-0.5">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-rose/60"
        />
        <p className="text-sm text-rose font-semibold">Waiting for reply…</p>
      </div>
      <p className="text-xs text-rose/55">Your match hasn&apos;t replied yet</p>
    </motion.div>
  );
}

// ─── Unlock toast ─────────────────────────────────────────────────────────────

function UnlockToast({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -48 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -48 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="absolute top-0 inset-x-0 z-30 flex justify-center pointer-events-none"
    >
      <div className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white rounded-full shadow-lg text-sm font-medium">
        <span className="text-base">💬</span>
        {name} replied — chat unlocked!
      </div>
    </motion.div>
  );
}

// ─── Report reason picker ─────────────────────────────────────────────────────

const REPORT_REASONS = [
  'Inappropriate behavior',
  'Fake profile',
  'Spam',
  'Underage',
  'Other',
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

function ReportSheet({
  name,
  onSubmit,
  onCancel,
}: {
  name: string;
  onSubmit: (reason: ReportReason) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<ReportReason | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 shadow-xl"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-base font-semibold text-charcoal mb-1">
          Report {name}
        </h3>
        <p className="text-sm text-textLight mb-4">Why are you reporting this profile?</p>
        <div className="flex flex-col gap-2 mb-5">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setSelected(r)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                selected === r
                  ? 'border-rose bg-rose/5 text-rose'
                  : 'border-gray-200 text-charcoal hover:bg-gray-50'
              }`}
            >
              {r}
              {selected === r && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
        <button
          disabled={!selected}
          onClick={() => selected && onSubmit(selected)}
          className="w-full py-3 rounded-full bg-rose text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-dark transition-colors"
        >
          Submit Report
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-5">
          <h3 className="text-base font-semibold text-charcoal mb-1.5">{title}</h3>
          <p className="text-sm text-textLight">{body}</p>
        </div>
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 text-sm font-medium text-textLight hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="w-px bg-gray-100" />
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              danger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-rose hover:bg-rose/5'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type OverlayState =
  | 'none'
  | 'unmatch-confirm'
  | 'block-confirm'
  | 'report';

export default function ChatPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useParams();
  const matchId = params.matchId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { graduateMatch } = useMatches();

  const match = mockMatches.find((m) => m.id === matchId) ?? mockMatches[0];
  const matchAvatarSrc = match.photos[0]?.url;
  const matchName = match.user.first_name;

  const localStorageKey = `chat_messages_${matchId}`;

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        return JSON.parse(stored) as Message[];
      }
    } catch {
      // ignore parse errors
    }
    return mockMessages.filter((m) => m.match_id === matchId || m.match_id === 'm1');
  });

  // Track whether this chat had existing messages when the page first loaded.
  // Used to suppress ice breakers for returning users.
  const [hadStoredMessages] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        return parsed.length > 0;
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLocked, setIsLocked] = useState(match.first_msg_locked);
  const [showUnlockToast, setShowUnlockToast] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState>('none');
  const [iceBreakers, setIceBreakers] = useState<IceBreakerPrompt[]>(() =>
    getRandomIceBreakers(3)
  );

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(messages));
    } catch {
      // storage quota exceeded or unavailable — fail silently
    }
  }, [messages, localStorageKey]);

  // Ice breakers are only shown for genuinely new chats (no stored history)
  const isNewChat = messages.length === 0 && !hadStoredMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Close menu when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isLocked) return;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        match_id: matchId,
        sender_id: 'me',
        content: text.trim(),
        type: 'text',
        read: false,
        status: 'sent',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInput('');

      const hasPriorOutgoing = messages.some((m) => m.sender_id === 'me');
      const isFirstOutgoing = !hasPriorOutgoing;

      if (isNewChat) setIsLocked(true);

      // Simulate delivery
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === 'me' && m.status === 'sent'
              ? { ...m, status: 'delivered' }
              : m
          )
        );
      }, 1000);

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);

        const reply: Message = {
          id: `msg-reply-${Date.now()}`,
          match_id: matchId,
          sender_id: match.user.id,
          content: getAutoReply(text),
          type: 'text',
          read: false,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, reply]);
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === 'me' ? { ...m, read: true, status: 'read' } : m
          )
        );

        setIsLocked(false);

        // Show unlock toast if chat was previously locked (ice-breaker path)
        if (isNewChat || isFirstOutgoing) {
          setShowUnlockToast(true);
          setTimeout(() => setShowUnlockToast(false), 3000);
        }

        const timerStillActive = new Date(match.expires_at).getTime() > Date.now();
        if (isFirstOutgoing && timerStillActive) {
          graduateMatch(matchId);
        }
      }, 2000 + Math.random() * 2000);
    },
    [matchId, match.user.id, match.expires_at, isLocked, messages, isNewChat, graduateMatch]
  );

  const handleSend = useCallback(() => sendMessage(input), [input, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const shuffleIceBreakers = useCallback(() => {
    setIceBreakers(getRandomIceBreakers(3));
  }, []);

  // Determine which received messages should show the avatar
  // (only the last consecutive received message in each group)
  const avatarVisibleSet = new Set<string>();
  for (let i = 0; i < messages.length; i++) {
    const curr = messages[i];
    const next = messages[i + 1];
    if (curr.sender_id !== 'me') {
      const nextIsMineOrEnd = !next || next.sender_id === 'me';
      if (nextIsMineOrEnd) {
        avatarVisibleSet.add(curr.id);
      }
    }
  }

  return (
    <AppShell hideSidebar>
      <div className="flex h-[calc(100vh-4rem)] bg-white flex-col relative overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0 z-10">
          <button
            onClick={() => router.push('/matches')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
            aria-label={t('chat.backToMatches')}
          >
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </button>

          <button
            onClick={() => router.push(`/profile/${match.user.id}`)}
            className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            aria-label={`View ${matchName}'s profile`}
          >
            <Avatar
              src={matchAvatarSrc}
              alt={matchName}
              size="sm"
              online={match.is_online}
            />
            <div className="min-w-0">
              <h2 className="font-semibold text-charcoal text-sm truncate leading-tight">
                {matchName}, {match.user.age}
              </h2>
              <p className="text-xs text-textLight leading-tight">
                {match.is_online ? t('chat.onlineNow') : t('chat.activeRecently')}
              </p>
            </div>
          </button>

          {/* Call icons */}
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
              aria-label="Voice call"
            >
              <Phone className="w-[18px] h-[18px] text-charcoal" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
              aria-label="Video call"
            >
              <Video className="w-[18px] h-[18px] text-charcoal" />
            </button>

            {/* "…" menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
                aria-label="More options"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="w-[18px] h-[18px] text-charcoal" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -6 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden z-20"
                  >
                    {/* Unmatch */}
                    <button
                      onClick={() => { setMenuOpen(false); setOverlay('unmatch-confirm'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-charcoal hover:bg-gray-50 transition-colors"
                    >
                      <UserX className="w-4 h-4 text-textLight" />
                      Unmatch
                    </button>
                    {/* Block */}
                    <button
                      onClick={() => { setMenuOpen(false); setOverlay('block-confirm'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-charcoal hover:bg-gray-50 transition-colors"
                    >
                      <ShieldOff className="w-4 h-4 text-textLight" />
                      Block
                    </button>
                    {/* Report */}
                    <button
                      onClick={() => { setMenuOpen(false); setOverlay('report'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Countdown banner ── */}
        {!match.is_dissolved && (
          <CountdownTimer expiresAt={match.expires_at} variant="banner" />
        )}

        {/* ── Lock banner ── */}
        <AnimatePresence>
          {isLocked && <LockBanner />}
        </AnimatePresence>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 relative">
          {/* Unlock toast — floats inside messages area */}
          <AnimatePresence>
            {showUnlockToast && <UnlockToast name={matchName} />}
          </AnimatePresence>

          {/* Match capsule */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose/5 border border-rose-light/20 rounded-full">
              <span className="text-xs text-rose">♥</span>
              <p className="text-xs text-textLight font-medium">
                You matched with {matchName} on{' '}
                {format(new Date(match.matched_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </motion.div>

          {/* ── Ice-breaker prompts (empty chat only) ── */}
          {isNewChat && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-5"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <p className="text-sm text-textLight text-center">
                  Break the ice — tap a prompt to send it
                </p>
                <button
                  onClick={shuffleIceBreakers}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Shuffle ice breakers"
                  title="Shuffle prompts"
                >
                  <Dice5 className="w-4 h-4 text-textLight" />
                </button>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {iceBreakers.map((prompt) => (
                  <IceBreakerCard
                    key={prompt.id}
                    prompt={prompt}
                    onClick={() => sendMessage(prompt.text)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Message list ── */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.sender_id === 'me'}
                avatarSrc={matchAvatarSrc}
                avatarAlt={matchName}
                showAvatar={avatarVisibleSet.has(msg.id)}
              />
            ))}
          </AnimatePresence>

          {/* ── Typing indicator ── */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                <TypingIndicator avatarSrc={matchAvatarSrc} avatarAlt={matchName} />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
          {isLocked ? (
            <div className="flex items-center justify-center py-3 bg-gray-50 rounded-full">
              <p className="text-sm text-textLight font-medium">
                {t('chat.waitingForReply')}…
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Camera */}
              <button
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors touch-target shrink-0"
                aria-label="Send photo"
              >
                <Camera className="w-5 h-5 text-textLight" />
              </button>

              {/* Text + emoji */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message…"
                  className="w-full px-4 py-2.5 pr-9 bg-gray-100 rounded-full text-sm text-charcoal placeholder:text-textLight/50 focus:bg-gray-50 focus:ring-2 focus:ring-rose-light outline-none transition-all"
                  aria-label="Message input"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Emoji picker"
                  tabIndex={-1}
                >
                  <Smile className="w-4.5 h-4.5 text-textLight" />
                </button>
              </div>

              {/* Mic or Send — mutually exclusive */}
              <AnimatePresence mode="wait" initial={false}>
                {input.trim() ? (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={handleSend}
                    className="p-3 rounded-full bg-rose text-white shadow-sm hover:bg-rose-dark transition-colors touch-target shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="mic"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors touch-target shrink-0"
                    aria-label="Record voice note"
                  >
                    <Mic className="w-5 h-5 text-textLight" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Overlays ── */}
      <AnimatePresence>
        {overlay === 'unmatch-confirm' && (
          <ConfirmDialog
            title={`Unmatch ${matchName}?`}
            body="This will remove the match and your conversation will be deleted. This cannot be undone."
            confirmLabel="Unmatch"
            danger
            onConfirm={() => { setOverlay('none'); router.push('/matches'); }}
            onCancel={() => setOverlay('none')}
          />
        )}

        {overlay === 'block-confirm' && (
          <ConfirmDialog
            title={`Block ${matchName}?`}
            body={`${matchName} will no longer be able to see your profile or contact you.`}
            confirmLabel="Block"
            danger
            onConfirm={() => { setOverlay('none'); router.push('/matches'); }}
            onCancel={() => setOverlay('none')}
          />
        )}

        {overlay === 'report' && (
          <ReportSheet
            name={matchName}
            onSubmit={(_reason) => { setOverlay('none'); }}
            onCancel={() => setOverlay('none')}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
