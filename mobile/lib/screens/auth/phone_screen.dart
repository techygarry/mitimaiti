import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../theme.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final _phoneController = TextEditingController();
  String _countryCode = '+91';
  bool _loading = false;
  String? _error;

  final _countryCodes = ['+91', '+1', '+44', '+971', '+65', '+61', '+1'];

  bool get _isValid {
    final phone = _phoneController.text.replaceAll(RegExp(r'[\s\-()]'), '');
    return phone.length >= 10;
  }

  Future<void> _sendOtp() async {
    if (!_isValid) return;
    setState(() { _loading = true; _error = null; });

    final fullPhone = '$_countryCode${_phoneController.text.replaceAll(RegExp(r'[\s\-()]'), '')}';

    // TODO: Call Supabase Auth to send OTP
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;
    setState(() => _loading = false);
    context.go('/auth/otp', extra: fullPhone);
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/welcome'),
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
              Text('What\'s your\nphone number?',
                style: Theme.of(context).textTheme.displayMedium),
              const SizedBox(height: 8),
              Text('We\'ll send you a verification code',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: MitiMaitiTheme.textSecondary)),
              const SizedBox(height: 40),
              Row(
                children: [
                  // Country code picker
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: MitiMaitiTheme.border),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _countryCode,
                        items: _countryCodes.map((c) => DropdownMenuItem(
                          value: c,
                          child: Text(c, style: const TextStyle(fontSize: 16)),
                        )).toList(),
                        onChanged: (v) => setState(() => _countryCode = v!),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Phone input
                  Expanded(
                    child: TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(10),
                      ],
                      autofocus: true,
                      decoration: const InputDecoration(
                        hintText: 'Phone number',
                      ),
                      onChanged: (_) => setState(() {}),
                      style: const TextStyle(fontSize: 18, letterSpacing: 1),
                    ),
                  ),
                ],
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: TextStyle(color: MitiMaitiTheme.error, fontSize: 14)),
              ],
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isValid && !_loading ? _sendOtp : null,
                  child: _loading
                    ? const SizedBox(width: 24, height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Continue'),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  'By continuing, you agree to our Terms of Service\nand Privacy Policy',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall,
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
