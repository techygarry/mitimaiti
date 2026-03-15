import 'package:flutter/material.dart';
import '../models/match.dart';
import '../theme.dart';

class MessageBubble extends StatelessWidget {
  final Message message;
  final bool isMine;
  final bool showTimestamp;

  const MessageBubble({
    super.key,
    required this.message,
    required this.isMine,
    this.showTimestamp = true,
  });

  @override
  Widget build(BuildContext context) {
    if (message.type == MessageType.system) {
      return _SystemMessage(text: message.content);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 3),
      child: Row(
        mainAxisAlignment:
            isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (isMine) const Spacer(flex: 2),
          Flexible(
            flex: 5,
            child: Column(
              crossAxisAlignment:
                  isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                _buildBubble(context),
                if (showTimestamp)
                  Padding(
                    padding: const EdgeInsets.only(top: 2, left: 4, right: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _formatTime(message.createdAt),
                          style: const TextStyle(
                            fontSize: 11,
                            color: MitiMaitiTheme.textSecondary,
                          ),
                        ),
                        if (isMine) ...[
                          const SizedBox(width: 4),
                          _StatusIcon(status: message.status),
                        ],
                      ],
                    ),
                  ),
              ],
            ),
          ),
          if (!isMine) const Spacer(flex: 2),
        ],
      ),
    );
  }

  Widget _buildBubble(BuildContext context) {
    final bgColor = isMine
        ? MitiMaitiTheme.rose
        : MitiMaitiTheme.background;
    final textColor = isMine ? Colors.white : MitiMaitiTheme.charcoal;

    switch (message.type) {
      case MessageType.photo:
        return _PhotoBubble(isMine: isMine, url: message.mediaUrl ?? message.content);
      case MessageType.voiceNote:
        return _VoiceNoteBubble(
          isMine: isMine,
          duration: message.durationSeconds ?? 0,
        );
      case MessageType.icebreaker:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [MitiMaitiTheme.rose, MitiMaitiTheme.roseDark],
            ),
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(18),
              topRight: const Radius.circular(18),
              bottomLeft: Radius.circular(isMine ? 18 : 4),
              bottomRight: Radius.circular(isMine ? 4 : 18),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.auto_awesome, size: 14, color: MitiMaitiTheme.gold),
                  SizedBox(width: 4),
                  Text(
                    'Icebreaker',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: MitiMaitiTheme.gold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                message.content,
                style: const TextStyle(
                  fontSize: 15,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        );
      default:
        return Semantics(
          label: '${isMine ? "You" : "Them"}: ${message.content}',
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(18),
                topRight: const Radius.circular(18),
                bottomLeft: Radius.circular(isMine ? 18 : 4),
                bottomRight: Radius.circular(isMine ? 4 : 18),
              ),
            ),
            child: Text(
              message.content,
              style: TextStyle(
                fontSize: 15,
                color: textColor,
              ),
            ),
          ),
        );
    }
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

class _StatusIcon extends StatelessWidget {
  final MessageStatus status;

  const _StatusIcon({required this.status});

  @override
  Widget build(BuildContext context) {
    switch (status) {
      case MessageStatus.sending:
        return const Icon(Icons.access_time, size: 14, color: MitiMaitiTheme.textSecondary);
      case MessageStatus.sent:
        return const Icon(Icons.check, size: 14, color: MitiMaitiTheme.textSecondary);
      case MessageStatus.delivered:
        return const Icon(Icons.done_all, size: 14, color: MitiMaitiTheme.textSecondary);
      case MessageStatus.read:
        return const Icon(Icons.done_all, size: 14, color: Colors.blue);
    }
  }
}

class _PhotoBubble extends StatelessWidget {
  final bool isMine;
  final String url;

  const _PhotoBubble({required this.isMine, required this.url});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.only(
        topLeft: const Radius.circular(18),
        topRight: const Radius.circular(18),
        bottomLeft: Radius.circular(isMine ? 18 : 4),
        bottomRight: Radius.circular(isMine ? 4 : 18),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 240, maxHeight: 300),
        color: MitiMaitiTheme.border,
        child: const Center(
          child: Icon(Icons.image, size: 48, color: MitiMaitiTheme.textSecondary),
        ),
      ),
    );
  }
}

class _VoiceNoteBubble extends StatelessWidget {
  final bool isMine;
  final int duration;

  const _VoiceNoteBubble({required this.isMine, required this.duration});

  @override
  Widget build(BuildContext context) {
    final bgColor = isMine ? MitiMaitiTheme.rose : MitiMaitiTheme.background;
    final fgColor = isMine ? Colors.white : MitiMaitiTheme.charcoal;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(18),
          topRight: const Radius.circular(18),
          bottomLeft: Radius.circular(isMine ? 18 : 4),
          bottomRight: Radius.circular(isMine ? 4 : 18),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.play_arrow, color: fgColor, size: 24),
          const SizedBox(width: 8),
          Container(
            width: 120,
            height: 24,
            decoration: BoxDecoration(
              color: fgColor.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '0:${duration.toString().padLeft(2, '0')}',
            style: TextStyle(fontSize: 12, color: fgColor),
          ),
        ],
      ),
    );
  }
}

class _SystemMessage extends StatelessWidget {
  final String text;

  const _SystemMessage({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 40),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: MitiMaitiTheme.border,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: MitiMaitiTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

class TypingIndicator extends StatefulWidget {
  const TypingIndicator({super.key});

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: MitiMaitiTheme.background,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(18),
              ),
            ),
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, _) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(3, (i) {
                    final delay = i * 0.2;
                    final progress = (_controller.value - delay) % 1.0;
                    final opacity = (progress < 0.5)
                        ? 0.3 + (progress * 1.4)
                        : 1.0 - ((progress - 0.5) * 1.4);
                    return Padding(
                      padding: EdgeInsets.only(right: i < 2 ? 4 : 0),
                      child: Opacity(
                        opacity: opacity.clamp(0.3, 1.0),
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: MitiMaitiTheme.textSecondary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
