import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme.dart';

class ChatScreen extends StatefulWidget {
  final String matchId;
  const ChatScreen({super.key, required this.matchId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<_MockMessage> _messages = [];
  bool _isFirstMsgSender = false;
  bool _isLocked = false;
  bool _otherTyping = false;
  DateTime? _deadline;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    // Mock: new match with no messages
    _deadline = DateTime.now().add(const Duration(hours: 24));
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) => setState(() {}));
  }

  String get _countdownText {
    if (_deadline == null) return '';
    final remaining = _deadline!.difference(DateTime.now());
    if (remaining.isNegative) return 'Expired';
    final h = remaining.inHours;
    final m = remaining.inMinutes % 60;
    return '${h}h ${m}m remaining';
  }

  bool get _isUrgent {
    if (_deadline == null) return false;
    return _deadline!.difference(DateTime.now()).inHours < 4;
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(_MockMessage(text: text, isMe: true, time: DateTime.now()));
      _controller.clear();
      if (_messages.where((m) => m.isMe).length == 1) {
        // First message sent — lock input (Respect-First)
        _isFirstMsgSender = true;
        _isLocked = true;
      }
    });

    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _countdownTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        title: Column(
          children: [
            const Text('Match', style: TextStyle(fontSize: 16)),
            Text(_countdownText, style: TextStyle(
              fontSize: 12, color: _isUrgent ? MitiMaitiTheme.error : MitiMaitiTheme.textSecondary,
              fontWeight: _isUrgent ? FontWeight.w600 : FontWeight.w400,
            )),
          ],
        ),
        actions: [
          // Call button — unlocked only after both have sent a message
          IconButton(
            icon: Icon(Icons.call,
              color: _messages.length >= 2 ? MitiMaitiTheme.rose : MitiMaitiTheme.border),
            onPressed: _messages.length >= 2 ? () {} : null,
            tooltip: _messages.length >= 2 ? 'Call' : 'Unlocks after both send a message',
          ),
          IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          // Countdown banner
          if (_deadline != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 8),
              color: _isUrgent ? MitiMaitiTheme.error.withValues(alpha: 0.1) : MitiMaitiTheme.rose.withValues(alpha: 0.05),
              child: Center(
                child: Text(_countdownText,
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
                    color: _isUrgent ? MitiMaitiTheme.error : MitiMaitiTheme.rose)),
              ),
            ),
          // Messages
          Expanded(
            child: _messages.isEmpty
              ? _IcebreakersView(onSelect: (text) {
                  _controller.text = text;
                  _sendMessage();
                })
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: _messages.length + (_otherTyping ? 1 : 0),
                  itemBuilder: (_, i) {
                    if (i == _messages.length) {
                      return const _TypingIndicator();
                    }
                    final msg = _messages[i];
                    return _MessageBubble(message: msg);
                  },
                ),
          ),
          // Input area
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, -2))],
            ),
            child: _isLocked
              ? Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: MitiMaitiTheme.rose.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.hourglass_top, color: MitiMaitiTheme.rose, size: 20),
                      const SizedBox(width: 8),
                      Text('Waiting for reply...',
                        style: TextStyle(color: MitiMaitiTheme.rose, fontWeight: FontWeight.w600)),
                    ],
                  ),
                )
              : Row(
                  children: [
                    IconButton(icon: const Icon(Icons.photo_camera_outlined), onPressed: () {}, tooltip: 'Send photo'),
                    IconButton(icon: const Icon(Icons.mic_outlined), onPressed: () {}, tooltip: 'Voice note'),
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: InputDecoration(
                          hintText: 'Type a message...',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                          filled: true,
                          fillColor: MitiMaitiTheme.background,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _sendMessage,
                      child: Container(
                        width: 44, height: 44,
                        decoration: const BoxDecoration(shape: BoxShape.circle, color: MitiMaitiTheme.rose),
                        child: const Icon(Icons.send, color: Colors.white, size: 20),
                      ),
                    ),
                  ],
                ),
          ),
        ],
      ),
    );
  }
}

class _MockMessage {
  final String text;
  final bool isMe;
  final DateTime time;
  final bool isRead;
  const _MockMessage({required this.text, required this.isMe, required this.time, this.isRead = false});
}

class _MessageBubble extends StatelessWidget {
  final _MockMessage message;
  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: message.isMe ? MitiMaitiTheme.rose : MitiMaitiTheme.background,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(message.isMe ? 16 : 4),
            bottomRight: Radius.circular(message.isMe ? 4 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(message.text, style: TextStyle(
              color: message.isMe ? Colors.white : MitiMaitiTheme.charcoal, fontSize: 15)),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('${message.time.hour}:${message.time.minute.toString().padLeft(2, '0')}',
                  style: TextStyle(fontSize: 11,
                    color: message.isMe ? Colors.white70 : MitiMaitiTheme.textSecondary)),
                if (message.isMe) ...[
                  const SizedBox(width: 4),
                  Icon(message.isRead ? Icons.done_all : Icons.done,
                    size: 14, color: message.isRead ? Colors.blue.shade200 : Colors.white70),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: MitiMaitiTheme.background,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _Dot(), SizedBox(width: 4), _Dot(), SizedBox(width: 4), _Dot(),
          ],
        ),
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot();
  @override
  Widget build(BuildContext context) => Container(
    width: 8, height: 8,
    decoration: BoxDecoration(shape: BoxShape.circle, color: MitiMaitiTheme.textSecondary.withValues(alpha: 0.4)),
  );
}

class _IcebreakersView extends StatelessWidget {
  final void Function(String) onSelect;
  const _IcebreakersView({required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final icebreakers = [
      'What is your favourite Sindhi dish?',
      'Cheti Chand or Diwali — which does your family go bigger on?',
      'Coffee or chai? And how do you take it?',
      'What does a perfect Sunday look like for you?',
    ];

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.chat_bubble_outline, size: 48, color: MitiMaitiTheme.rose),
            const SizedBox(height: 16),
            Text('Start the conversation', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text('Try an icebreaker!', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: MitiMaitiTheme.textSecondary)),
            const SizedBox(height: 24),
            ...icebreakers.map((text) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GestureDetector(
                onTap: () => onSelect(text),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: MitiMaitiTheme.rose.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: MitiMaitiTheme.rose.withValues(alpha: 0.2)),
                  ),
                  child: Text(text, style: const TextStyle(fontSize: 14, color: MitiMaitiTheme.charcoal)),
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }
}
