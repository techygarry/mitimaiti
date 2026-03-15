import 'dart:async';
import 'package:flutter/material.dart';
import '../theme.dart';

class CountdownTimer extends StatefulWidget {
  final DateTime expiresAt;
  final TextStyle? style;
  final bool showIcon;
  final VoidCallback? onExpired;

  const CountdownTimer({
    super.key,
    required this.expiresAt,
    this.style,
    this.showIcon = true,
    this.onExpired,
  });

  @override
  State<CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer> {
  Timer? _timer;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateRemaining();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      _updateRemaining();
    });
  }

  void _updateRemaining() {
    final remaining = widget.expiresAt.difference(DateTime.now());
    if (remaining.isNegative) {
      setState(() => _remaining = Duration.zero);
      _timer?.cancel();
      widget.onExpired?.call();
    } else {
      setState(() => _remaining = remaining);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isUrgent = _remaining.inHours < 4;
    final color = isUrgent ? MitiMaitiTheme.error : MitiMaitiTheme.textSecondary;
    final text = _formatDuration(_remaining);

    return Semantics(
      label: 'Time remaining: $text',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (widget.showIcon) ...[
            Icon(
              Icons.timer_outlined,
              size: 16,
              color: color,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: widget.style ??
                TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration d) {
    if (d == Duration.zero) return 'Expired';
    final hours = d.inHours;
    final minutes = d.inMinutes.remainder(60);
    final seconds = d.inSeconds.remainder(60);
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m ${seconds}s';
  }
}

class OtpCountdown extends StatefulWidget {
  final int seconds;
  final VoidCallback? onComplete;

  const OtpCountdown({
    super.key,
    required this.seconds,
    this.onComplete,
  });

  @override
  State<OtpCountdown> createState() => _OtpCountdownState();
}

class _OtpCountdownState extends State<OtpCountdown> {
  late int _secondsLeft;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _secondsLeft = widget.seconds;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_secondsLeft > 0) {
        setState(() => _secondsLeft--);
      } else {
        _timer?.cancel();
        widget.onComplete?.call();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Resend available in $_secondsLeft seconds',
      child: Text(
        '${_secondsLeft}s',
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: MitiMaitiTheme.textSecondary,
        ),
      ),
    );
  }
}
