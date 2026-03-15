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
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Avatar from '@/components/ui/Avatar';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { mockMatches, mockMessages, mockIcebreakers } from '@/lib/mockData';
import { Message } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, h:mm a');
}

function MessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-lg px-5 py-3 rounded-2xl ${
          isMine
            ? 'bg-rose text-white rounded-br-md'
            : 'bg-gray-100 text-charcoal rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
          <p
            className={`text-[11px] ${
              isMine ? 'text-white/60' : 'text-textLight'
            }`}
          >
            {formatMessageTime(message.created_at)}
          </p>
          {/* Read receipts for sent messages */}
          {isMine && (
            message.read ? (
              <CheckCheck className="w-3.5 h-3.5 text-white/80" aria-label="Read" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white/50" aria-label="Delivered" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

function IcebreakerChip({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-block px-4 py-2.5 bg-rose/5 border border-rose-light/30 rounded-2xl text-sm text-rose font-medium hover:bg-rose/10 transition-colors whitespace-nowrap shrink-0 touch-target"
      aria-label={`Send icebreaker: ${text}`}
    >
      {text}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-gray-100 px-5 py-3 rounded-2xl rounded-bl-md flex items-center gap-1" aria-label="Typing">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          className="w-2 h-2 bg-gray-400 rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 bg-gray-400 rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 bg-gray-400 rounded-full"
        />
      </div>
    </div>
  );
}

function MatchesSidebar({ currentMatchId }: { currentMatchId: string }) {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-charcoal text-base">Your Matches</h2>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {mockMatches.map((match) => (
          <button
            key={match.id}
            onClick={() => router.push(`/chat/${match.id}`)}
            className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left touch-target ${
              match.id === currentMatchId ? 'bg-rose/5 border-r-2 border-rose' : ''
            }`}
            aria-label={`Chat with ${match.user.first_name}`}
          >
            <Avatar
              src={match.photos[0]?.url}
              alt={match.user.first_name}
              size="sm"
              online={match.is_online}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-charcoal text-sm truncate">
                {match.user.first_name}, {match.user.age}
              </h3>
              {match.last_message && (
                <p className="text-xs text-textLight truncate mt-0.5">
                  {match.last_message.content}
                </p>
              )}
            </div>
            {match.unread_count > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-rose text-white">
                {match.unread_count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const match = mockMatches.find((m) => m.id === matchId) || mockMatches[0];
  const [messages, setMessages] = useState<Message[]>(
    mockMessages.filter((m) => m.match_id === matchId || m.match_id === 'm1')
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLocked, setIsLocked] = useState(match.first_msg_locked);
  const isNewChat = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      if (isLocked) return;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        match_id: matchId,
        sender_id: 'me',
        content: text.trim(),
        type: 'text',
        read: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInput('');

      // If this is the first message, lock the input
      if (messages.length === 0 || isNewChat) {
        setIsLocked(true);
        // Simulate reply after delay
        setTimeout(() => {
          setIsLocked(false);
        }, 5000);
      }

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
        // Mark previous messages as read
        setMessages((prev) =>
          prev.map((m) => (m.sender_id === 'me' ? { ...m, read: true } : m))
        );
      }, 2000 + Math.random() * 2000);
    },
    [matchId, match.user.id, isLocked, messages.length, isNewChat]
  );

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Column - Matches Sidebar (desktop only) */}
        <div className="hidden lg:block w-80 shrink-0 bg-white border-r border-gray-100">
          <MatchesSidebar currentMatchId={matchId} />
        </div>

        {/* Right Column - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat top bar */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-white shrink-0">
            <button
              onClick={() => router.back()}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-charcoal" />
            </button>

            <Avatar
              src={match.photos[0]?.url}
              alt={match.user.first_name}
              size="md"
              online={match.is_online}
            />

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-charcoal text-base truncate">
                {match.user.first_name}, {match.user.age}
              </h2>
              <p className="text-sm text-textLight">
                {match.is_online ? 'Online now' : 'Active recently'}
              </p>
            </div>

            {/* Countdown timer visible to both */}
            {!match.is_dissolved && (
              <CountdownTimer
                expiresAt={match.expires_at}
                variant="badge"
              />
            )}
          </div>

          {/* Countdown banner */}
          {!match.is_dissolved && (
            <CountdownTimer
              expiresAt={match.expires_at}
              variant="banner"
            />
          )}

          {/* Locked first message state */}
          {isLocked && (
            <div className="px-6 py-2.5 bg-rose/5 border-b border-rose-light/20 text-center">
              <p className="text-sm text-rose font-medium">
                Waiting for reply...
              </p>
              <p className="text-xs text-textLight mt-0.5">
                Your message has been sent. You can send another message once they reply.
              </p>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Icebreakers for new chat */}
            {isNewChat && (
              <div className="mb-8">
                <p className="text-sm text-textLight text-center mb-4">
                  Start the conversation with an icebreaker
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {mockIcebreakers.map((ice) => (
                    <IcebreakerChip
                      key={ice.id}
                      text={ice.text}
                      onClick={() => sendMessage(ice.text)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Match announcement */}
            {messages.length > 0 && (
              <div className="text-center mb-8">
                <p className="text-sm text-textLight">
                  You matched with {match.user.first_name} on{' '}
                  {format(new Date(match.matched_at), 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Messages */}
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMine={msg.sender_id === 'me'}
                />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
            {isLocked ? (
              <div className="flex items-center justify-center py-3 bg-gray-50 rounded-full">
                <p className="text-sm text-textLight font-medium">
                  Waiting for reply...
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 max-w-4xl mx-auto">
                <button
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors touch-target"
                  aria-label="Send photo"
                >
                  <Camera className="w-5 h-5 text-textLight" />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-5 py-3 bg-gray-100 rounded-full text-sm text-charcoal placeholder:text-textLight/50 focus:bg-gray-50 focus:ring-2 focus:ring-rose-light outline-none transition-all"
                    aria-label="Message input"
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 touch-target"
                    aria-label="Emoji picker"
                  >
                    <Smile className="w-5 h-5 text-textLight" />
                  </button>
                </div>

                <button
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors touch-target"
                  aria-label="Record voice note"
                >
                  <Mic className="w-5 h-5 text-textLight" />
                </button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`p-3 rounded-full transition-all touch-target ${
                    input.trim()
                      ? 'bg-rose text-white shadow-sm hover:bg-rose-dark'
                      : 'bg-gray-100 text-textLight'
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function getAutoReply(message: string): string {
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
