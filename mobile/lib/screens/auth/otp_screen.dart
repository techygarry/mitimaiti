import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../theme.dart';

class OtpScreen extends StatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _loading = false;
  String? _error;
  int _countdown = 30;
  int _resendCount = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _countdown = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_countdown > 0) {
        setState(() => _countdown--);
      } else {
        t.cancel();
      }
    });
  }

  String get _otp => _controllers.map((c) => c.text).join();

  Future<void> _verify() async {
    if (_otp.length != 6) return;
    setState(() { _loading = true; _error = null; });

    // TODO: Verify OTP with Supabase Auth
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    // Save login state
    final settings = Hive.box('settings');
    await settings.put('isLoggedIn', true);

    setState(() => _loading = false);
    if (!mounted) return;
    context.go('/onboarding/name');
  }

  void _resend() {
    if (_countdown > 0 || _resendCount >= 3) return;
    setState(() => _resendCount++);
    _startCountdown();
    // TODO: Resend OTP
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) { c.dispose(); }
    for (final f in _focusNodes) { f.dispose(); }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/auth/phone'),
          tooltip: 'Back',
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              Text('Enter verification\ncode', style: Theme.of(context).textTheme.displayMedium),
              const SizedBox(height: 8),
              Text('Sent to ${widget.phone}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: MitiMaitiTheme.textSecondary)),
              const SizedBox(height: 40),
              // 6-digit OTP input
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) => SizedBox(
                  width: 48,
                  height: 56,
                  child: TextField(
                    controller: _controllers[i],
                    focusNode: _focusNodes[i],
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 1,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: InputDecoration(
                      counterText: '',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: _controllers[i].text.isNotEmpty
                            ? MitiMaitiTheme.rose : MitiMaitiTheme.border,
                          width: 2,
                        ),
                      ),
                    ),
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
                    onChanged: (v) {
                      if (v.isNotEmpty && i < 5) {
                        _focusNodes[i + 1].requestFocus();
                      }
                      if (v.isEmpty && i > 0) {
                        _focusNodes[i - 1].requestFocus();
                      }
                      setState(() {});
                      if (_otp.length == 6) _verify();
                    },
                  ),
                )),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: TextStyle(color: MitiMaitiTheme.error, fontSize: 14)),
              ],
              const SizedBox(height: 24),
              // Resend
              Center(
                child: _countdown > 0
                  ? Text('Resend in ${_countdown}s',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: MitiMaitiTheme.textSecondary))
                  : _resendCount >= 3
                    ? Text('Max resends reached. Contact support.',
                        style: Theme.of(context).textTheme.bodySmall)
                    : TextButton(
                        onPressed: _resend,
                        child: const Text('Resend Code'),
                      ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _otp.length == 6 && !_loading ? _verify : null,
                  child: _loading
                    ? const SizedBox(width: 24, height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Verify'),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
