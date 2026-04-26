'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
  X,
  Pencil,
  Trash2,
  MoreHorizontal,
  Play,
  Pause,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Avatar from '@/components/ui/Avatar';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { mockMatches, mockMessages } from '@/lib/mockData';
import { getRandomIceBreakers, IceBreakerPrompt } from '@/lib/iceBreakerPrompts';
import { Message, REACTION_EMOJIS, ReactionEmoji } from '@/types';
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
  onImageClick,
  onEdit,
  onDelete,
  onReact,
}: {
  message: Message;
  isMine: boolean;
  avatarSrc?: string;
  avatarAlt: string;
  showAvatar: boolean;
  onImageClick?: (url: string) => void;
  onEdit?: (msg: Message) => void;
  onDelete?: (msg: Message) => void;
  onReact?: (msg: Message, emoji: ReactionEmoji) => void;
}) {
  const status = message.status ?? (message.read ? 'read' : 'delivered');
  const isImage = message.type === 'image' && !!message.imageUrl;
  const isVoice = message.type === 'voice' && !!message.audioUrl;
  const isEdited = message.type === 'text' && message.content.includes('[edited]');
  const displayContent = isEdited ? message.content.replace(/\s*\[edited\]\s*$/, '') : message.content;
  const [menuOpen, setMenuOpen] = useState(false);
  const canEdit = isMine && message.type === 'text' && !!onEdit;
  const canDelete = isMine && !!onDelete;
  const canReact = !!onReact;
  const showActions = canEdit || canDelete || canReact;

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

      {isVoice ? (
        <div className={`max-w-[72%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
          <VoiceBubble
            audioUrl={message.audioUrl!}
            duration={message.durationSeconds ?? 0}
            isMine={isMine}
          />
          <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'justify-end' : ''}`}>
            <p className="text-[10px] text-textLight">{formatMessageTime(message.created_at)}</p>
            {isMine && <ReadReceipt status={status} />}
          </div>
        </div>
      ) : isImage ? (
        <div className={`max-w-[72%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
          <button
            type="button"
            onClick={() => onImageClick?.(message.imageUrl!)}
            className="block rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose"
            aria-label="View photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl}
              alt="Photo message"
              className="max-w-[240px] max-h-[320px] object-cover"
            />
          </button>
          <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'justify-end' : ''}`}>
            <p className="text-[10px] text-textLight">{formatMessageTime(message.created_at)}</p>
            {isMine && <ReadReceipt status={status} />}
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="relative inline-block">
            <div
              className={`max-w-[72%] px-4 py-2.5 rounded-2xl ${
                isMine
                  ? 'bg-rose text-white rounded-br-sm'
                  : 'bg-gray-100 text-charcoal rounded-bl-sm'
              }`}
              onContextMenu={(e) => {
                if (!showActions) return;
                e.preventDefault();
                setMenuOpen((v) => !v);
              }}
            >
              <p className="text-sm leading-relaxed break-words">{displayContent}</p>
              <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
                {isEdited && (
                  <span className={`text-[10px] italic ${isMine ? 'text-white/55' : 'text-textLight'}`}>
                    edited
                  </span>
                )}
                <p className={`text-[10px] ${isMine ? 'text-white/55' : 'text-textLight'}`}>
                  {formatMessageTime(message.created_at)}
                </p>
                {isMine && <ReadReceipt status={status} />}
              </div>
            </div>
            {message.reaction && (
              <div
                className={`absolute -bottom-2 ${isMine ? 'left-1' : 'right-1'} bg-white rounded-full shadow border border-gray-200 px-1.5 py-0.5 text-xs leading-none`}
                aria-label={`Reaction ${message.reaction}`}
              >
                {message.reaction}
              </div>
            )}
          </div>
          {showActions && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={`absolute -top-1 ${isMine ? '-left-7' : '-right-7'} p-1 rounded-full bg-white shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity`}
              aria-label="Message actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-textLight" />
            </button>
          )}
          {menuOpen && showActions && (
            <div
              className={`absolute z-10 mt-1 ${isMine ? 'right-0' : 'left-10'} bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px]`}
              onMouseLeave={() => setMenuOpen(false)}
            >
              {canReact && (
                <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100 mb-1">
                  {REACTION_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { setMenuOpen(false); onReact?.(message, e); }}
                      className={`text-lg leading-none p-1 rounded-full hover:bg-gray-100 transition-colors ${
                        message.reaction === e ? 'bg-rose-light/30' : ''
                      }`}
                      aria-label={`React ${e}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit?.(message); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-charcoal hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete?.(message); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Voice message bubble (play/pause + stylized waveform + duration) ──────

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

// Pre-computed bar heights for the stylized waveform — looks "audio-y" without
// actually analysing the file. 20 bars between 30% and 100% height.
const WAVEFORM_HEIGHTS = [
  0.55, 0.78, 0.42, 0.92, 0.65, 0.38, 0.85, 0.58, 0.72, 0.46,
  0.88, 0.51, 0.66, 0.81, 0.43, 0.74, 0.59, 0.95, 0.62, 0.49,
];

function VoiceBubble({
  audioUrl,
  duration,
  isMine,
}: {
  audioUrl: string;
  duration: number;
  isMine: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    const onEnded = () => { setIsPlaying(false); setProgress(0); };
    const onTime = () => {
      const d = audio.duration && isFinite(audio.duration) ? audio.duration : duration;
      setProgress(d > 0 ? audio.currentTime / d : 0);
    };
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTime);
    return () => {
      audio.pause();
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTime);
      audioRef.current = null;
    };
  }, [audioUrl, duration]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      a.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const filledColor = isMine ? 'bg-white' : 'bg-rose';
  const dimColor = isMine ? 'bg-white/40' : 'bg-gray-300';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${
        isMine ? 'bg-rose text-white rounded-br-sm' : 'bg-gray-100 text-charcoal rounded-bl-sm'
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isMine ? 'bg-white/20' : 'bg-rose text-white'
        }`}
        aria-label={isPlaying ? 'Pause' : 'Play voice message'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[1px]" />}
      </button>
      <div className="flex items-center gap-[3px] h-6 min-w-[120px]">
        {WAVEFORM_HEIGHTS.map((h, i) => {
          const filled = i / WAVEFORM_HEIGHTS.length <= progress;
          return (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-colors ${filled ? filledColor : dimColor}`}
              style={{ height: `${h * 100}%` }}
            />
          );
        })}
      </div>
      <span className={`text-[11px] tabular-nums shrink-0 ${isMine ? 'text-white/80' : 'text-textLight'}`}>
        {formatDuration(duration)}
      </span>
    </div>
  );
}

// ─── Fullscreen image viewer ─────────────────────────────────────────────────

function ImageViewer({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Photo"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
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
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartRef = useRef<number>(0);
  const recordingCancelledRef = useRef<boolean>(false);
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

  // 1-hour expiry warning — fires once per match per session
  useEffect(() => {
    if (!match.expires_at) return;
    const remainingMs = new Date(match.expires_at).getTime() - Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    if (remainingMs > 0 && remainingMs <= ONE_HOUR) {
      const warnedKey = `chat_1h_warned_${matchId}`;
      if (typeof window !== 'undefined' && !sessionStorage.getItem(warnedKey)) {
        sessionStorage.setItem(warnedKey, '1');
        toast('⏳ Less than 1 hour left to chat!', { duration: 5000 });
      }
    }
  }, [match.expires_at, matchId]);

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
      if (!text.trim()) return;

      // Edit mode — replace existing message instead of sending a new one
      if (editingMessageId) {
        const trimmed = text.trim();
        const withMarker = trimmed.includes('[edited]') ? trimmed : `${trimmed} [edited]`;
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMessageId ? { ...m, content: withMarker } : m))
        );
        setEditingMessageId(null);
        setInput('');
        return;
      }

      if (isLocked) return;

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

  const startEdit = useCallback((msg: Message) => {
    if (msg.type !== 'text') return;
    setEditingMessageId(msg.id);
    setInput(msg.content.replace(/\s*\[edited\]\s*$/, ''));
    inputRef.current?.focus();
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setInput('');
  }, []);

  const deleteMessage = useCallback((msg: Message) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    if (editingMessageId === msg.id) {
      setEditingMessageId(null);
      setInput('');
    }
  }, [editingMessageId]);

  const sendVoice = useCallback(
    (blob: Blob, seconds: number) => {
      if (isLocked) return;
      const url = URL.createObjectURL(blob);
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        match_id: matchId,
        sender_id: 'me',
        content: '',
        type: 'voice',
        audioUrl: url,
        durationSeconds: seconds,
        read: false,
        status: 'sent',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);

      const hasPriorOutgoing = messages.some((m) => m.sender_id === 'me');
      const isFirstOutgoing = !hasPriorOutgoing;
      if (isNewChat) setIsLocked(true);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === 'me' && m.status === 'sent' ? { ...m, status: 'delivered' } : m
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
          content: 'Loved hearing your voice!',
          type: 'text',
          read: false,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, reply]);
        setMessages((prev) =>
          prev.map((m) => (m.sender_id === 'me' ? { ...m, read: true, status: 'read' } : m))
        );
        setIsLocked(false);
        if (isNewChat || isFirstOutgoing) {
          setShowUnlockToast(true);
          setTimeout(() => setShowUnlockToast(false), 3000);
        }
        const timerStillActive = new Date(match.expires_at).getTime() > Date.now();
        if (isFirstOutgoing && timerStillActive) graduateMatch(matchId);
      }, 2000 + Math.random() * 2000);
    },
    [matchId, match.user.id, match.expires_at, isLocked, messages, isNewChat, graduateMatch]
  );

  const startRecording = useCallback(async () => {
    if (isLocked || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeOptions = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'];
      const supported = mimeOptions.find((m) =>
        typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)
      );
      const recorder = new MediaRecorder(
        stream,
        supported ? { mimeType: supported } : undefined
      );
      audioChunksRef.current = [];
      recordingCancelledRef.current = false;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const seconds = Math.max(1, Math.round((Date.now() - recordingStartRef.current) / 1000));
        if (recordingCancelledRef.current) return;
        if (seconds < 1) {
          toast('Hold longer to record', { icon: 'ℹ️' });
          return;
        }
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        sendVoice(blob, seconds);
      };
      mediaRecorderRef.current = recorder;
      recordingStartRef.current = Date.now();
      setIsRecording(true);
      setRecordingSeconds(0);
      recorder.start();
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(Math.floor((Date.now() - recordingStartRef.current) / 1000));
      }, 250);
    } catch {
      toast.error('Microphone access denied');
      setIsRecording(false);
    }
  }, [isLocked, isRecording, sendVoice]);

  const stopRecording = useCallback((cancel = false) => {
    recordingCancelledRef.current = cancel;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);

  const reactToMessage = useCallback((msg: Message, emoji: ReactionEmoji) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? { ...m, reaction: m.reaction === emoji ? undefined : emoji }
          : m
      )
    );
  }, []);

  const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB — matches backend multer cap

  const sendImage = useCallback(
    (file: File) => {
      if (isLocked) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are supported');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('Image must be under 15MB');
        return;
      }

      const url = URL.createObjectURL(file);

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        match_id: matchId,
        sender_id: 'me',
        content: '',
        type: 'image',
        imageUrl: url,
        read: false,
        status: 'sent',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);

      const hasPriorOutgoing = messages.some((m) => m.sender_id === 'me');
      const isFirstOutgoing = !hasPriorOutgoing;

      if (isNewChat) setIsLocked(true);

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
          content: 'Wow, great photo!',
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
    [matchId, match.user.id, match.expires_at, isLocked, messages, isNewChat, graduateMatch, MAX_IMAGE_SIZE]
  );

  const handleFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (file) sendImage(file);
    },
    [sendImage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      } else if (e.key === 'Escape' && editingMessageId) {
        e.preventDefault();
        cancelEdit();
      }
    },
    [handleSend, editingMessageId, cancelEdit]
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
              onClick={() => toast('📞 Voice calls coming soon', { duration: 2500 })}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
              aria-label="Voice call"
            >
              <Phone className="w-[18px] h-[18px] text-charcoal" />
            </button>
            <button
              onClick={() => toast('📹 Video calls coming soon', { duration: 2500 })}
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
                onImageClick={setViewerImage}
                onEdit={startEdit}
                onDelete={deleteMessage}
                onReact={reactToMessage}
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
          {editingMessageId && (
            <div className="flex items-center justify-between mb-2 px-3 py-2 bg-rose/5 border border-rose/20 rounded-lg">
              <div className="flex items-center gap-2 text-xs">
                <Pencil className="w-3.5 h-3.5 text-rose" />
                <span className="text-charcoal">Editing message</span>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs text-rose font-medium hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          {isRecording && (
            <div className="flex items-center justify-between mb-2 px-3 py-2 bg-rose text-white rounded-lg">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Recording… {formatDuration(recordingSeconds)}</span>
              </div>
              <button
                type="button"
                onClick={() => stopRecording(true)}
                className="text-xs font-medium underline"
              >
                Cancel
              </button>
            </div>
          )}
          {isLocked && !editingMessageId ? (
            <div className="flex items-center justify-center py-3 bg-gray-50 rounded-full">
              <p className="text-sm text-textLight font-medium">
                {t('chat.waitingForReply')}…
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Camera */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
                aria-hidden="true"
              />
              <button
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors touch-target shrink-0"
                aria-label="Send photo"
                onClick={() => fileInputRef.current?.click()}
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
                    onPointerDown={(e) => { e.preventDefault(); startRecording(); }}
                    onPointerUp={() => stopRecording(false)}
                    onPointerLeave={() => { if (isRecording) stopRecording(false); }}
                    onPointerCancel={() => stopRecording(true)}
                    className={`p-2.5 rounded-xl transition-colors touch-target shrink-0 select-none ${
                      isRecording ? 'bg-rose text-white' : 'hover:bg-gray-100'
                    }`}
                    aria-label="Hold to record voice note"
                  >
                    <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-textLight'}`} />
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

        {viewerImage && (
          <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
