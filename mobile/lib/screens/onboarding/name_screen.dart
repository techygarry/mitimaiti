import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../widgets/onboarding_shell.dart';

class NameScreen extends StatefulWidget {
  const NameScreen({super.key});
  @override
  State<NameScreen> createState() => _NameScreenState();
}

class _NameScreenState extends State<NameScreen> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller.text = Hive.box('onboarding').get('firstName', defaultValue: '');
  }

  bool get _isValid => _controller.text.trim().length >= 2;

  void _next() {
    if (!_isValid) return;
    Hive.box('onboarding').put('firstName', _controller.text.trim());
    Hive.box('settings').put('onboardingStep', 1);
    context.go('/onboarding/birthday');
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingShell(
      title: 'What\'s your\nfirst name?',
      subtitle: 'This is how you\'ll appear on MitiMaiti',
      step: 1,
      onBack: () => context.go('/auth/phone'),
      child: Column(
        children: [
          TextField(
            controller: _controller,
            autofocus: true,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(hintText: 'First name'),
            onChanged: (_) => setState(() {}),
            style: const TextStyle(fontSize: 20),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity, height: 56,
            child: ElevatedButton(
              onPressed: _isValid ? _next : null,
              child: const Text('Continue'),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
