import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/match.dart';

class ChatState {
  final String matchId;
  final List<Message> messages;
  final bool isLoading;
  final bool isSending;
  final bool isOtherTyping;
  final bool waitingForReply;
  final DateTime? countdownStart;
  final String? error;

  const ChatState({
    required this.matchId,
    this.messages = const [],
    this.isLoading = false,
    this.isSending = false,
    this.isOtherTyping = false,
    this.waitingForReply = false,
    this.countdownStart,
    this.error,
  });

  bool get hasMessages => messages.isNotEmpty;
  bool get callsUnlocked {
    if (messages.length < 2) return false;
    final senderIds = messages.map((m) => m.senderId).toSet();
    return senderIds.length >= 2;
  }

  Duration? get timeRemaining {
    if (countdownStart == null) return null;
    final elapsed = DateTime.now().difference(countdownStart!);
    final remaining = const Duration(hours: 24) - elapsed;
    return remaining.isNegative ? Duration.zero : remaining;
  }

  bool get isExpiringSoon {
    final remaining = timeRemaining;
    if (remaining == null) return false;
    return remaining.inHours < 4;
  }

  ChatState copyWith({
    String? matchId,
    List<Message>? messages,
    bool? isLoading,
    bool? isSending,
    bool? isOtherTyping,
    bool? waitingForReply,
    DateTime? countdownStart,
    String? error,
  }) {
    return ChatState(
      matchId: matchId ?? this.matchId,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      isOtherTyping: isOtherTyping ?? this.isOtherTyping,
      waitingForReply: waitingForReply ?? this.waitingForReply,
      countdownStart: countdownStart ?? this.countdownStart,
      error: error,
    );
  }
}

class ChatNotifier extends StateNotifier<ChatState> {
  static const String _currentUserId = 'mock-user-id';

  ChatNotifier(String matchId)
      : super(ChatState(matchId: matchId));

  Future<void> loadMessages() async {
    state = state.copyWith(isLoading: true);
    try {
      await Future.delayed(const Duration(milliseconds: 500));

      // Generate mock messages based on match
      final messages = _generateMockMessages(state.matchId);
      final hasUserSent = messages.any((m) => m.senderId == _currentUserId);
      final hasOtherReplied = messages.any((m) => m.senderId != _currentUserId);

      state = state.copyWith(
        messages: messages,
        isLoading: false,
        waitingForReply: hasUserSent && !hasOtherReplied,
        countdownStart: messages.isNotEmpty ? messages.first.createdAt : null,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Failed to load messages');
    }
  }

  Future<void> sendMessage(String content, {MessageType type = MessageType.text}) async {
    if (state.waitingForReply && type != MessageType.icebreaker) return;

    state = state.copyWith(isSending: true);

    final message = Message(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      matchId: state.matchId,
      senderId: _currentUserId,
      type: type,
      content: content,
      status: MessageStatus.sending,
      createdAt: DateTime.now(),
    );

    final updated = [...state.messages, message];
    state = state.copyWith(
      messages: updated,
      isSending: false,
      waitingForReply: true,
      countdownStart: state.countdownStart ?? DateTime.now(),
    );

    // Simulate delivery
    await Future.delayed(const Duration(milliseconds: 500));
    final delivered = updated.map((m) {
      if (m.id == message.id) {
        return Message(
          id: m.id,
          matchId: m.matchId,
          senderId: m.senderId,
          type: m.type,
          content: m.content,
          status: MessageStatus.delivered,
          createdAt: m.createdAt,
        );
      }
      return m;
    }).toList();
    state = state.copyWith(messages: delivered);
  }

  Future<void> sendPhoto(String photoPath) async {
    await sendMessage(photoPath, type: MessageType.photo);
  }

  Future<void> sendVoiceNote(String audioPath, int durationSeconds) async {
    await sendMessage('Voice note ($durationSeconds s)', type: MessageType.voiceNote);
  }

  void setTyping(bool isTyping) {
    // Emit typing event via socket
  }

  void onOtherTyping(bool isTyping) {
    state = state.copyWith(isOtherTyping: isTyping);
  }

  void onNewMessage(Message message) {
    if (message.matchId != state.matchId) return;
    final updated = [...state.messages, message];
    state = state.copyWith(
      messages: updated,
      waitingForReply: false,
    );
  }

  void onMessageRead(String messageId) {
    final updated = state.messages.map((m) {
      if (m.id == messageId) {
        return Message(
          id: m.id,
          matchId: m.matchId,
          senderId: m.senderId,
          type: m.type,
          content: m.content,
          status: MessageStatus.read,
          createdAt: m.createdAt,
        );
      }
      return m;
    }).toList();
    state = state.copyWith(messages: updated);
  }

  List<Message> _generateMockMessages(String matchId) {
    // For matches with IDs ending in 0 or 1 (new), return empty
    if (matchId.endsWith('0') || matchId.endsWith('1')) return [];

    final now = DateTime.now();
    return [
      Message(
        id: 'hist-1',
        matchId: matchId,
        senderId: _currentUserId,
        type: MessageType.icebreaker,
        content: 'What is your favorite Sindhi dish?',
        status: MessageStatus.read,
        createdAt: now.subtract(const Duration(hours: 12)),
      ),
      Message(
        id: 'hist-2',
        matchId: matchId,
        senderId: 'other-user',
        type: MessageType.text,
        content: 'Oh I love Sai Bhaji! What about you?',
        status: MessageStatus.read,
        createdAt: now.subtract(const Duration(hours: 11)),
      ),
      Message(
        id: 'hist-3',
        matchId: matchId,
        senderId: _currentUserId,
        type: MessageType.text,
        content: 'Same! My mom makes the best Sai Bhaji. We should cook together sometime!',
        status: MessageStatus.delivered,
        createdAt: now.subtract(const Duration(hours: 10)),
      ),
    ];
  }
}

final chatProvider =
    StateNotifierProvider.family<ChatNotifier, ChatState, String>((ref, matchId) {
  return ChatNotifier(matchId);
});

// Icebreaker suggestions
final icebreakerSuggestionsProvider = Provider<List<String>>((ref) {
  return const [
    'What is your favorite Sindhi dish?',
    'Which Sindhi festival do you enjoy the most?',
    'What does family mean to you?',
    'Have you visited any Sindhi heritage sites?',
  ];
});
