import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../widgets/onboarding_shell.dart';
import '../../theme.dart';

class IntentScreen extends StatefulWidget {
  const IntentScreen({super.key});
  @override
  State<IntentScreen> createState() => _IntentScreenState();
}

class _IntentScreenState extends State<IntentScreen> {
  String? _selected;

  final _options = [
    ('casual', 'Casual', 'Just seeing what\'s out there'),
    ('open', 'Open to anything', 'Let\'s see where it goes'),
    ('marriage', 'Marriage', 'Looking for a life partner'),
  ];

  void _next() {
    if (_selected == null) return;
    Hive.box('onboarding').put('intent', _selected);
    Hive.box('settings').put('onboardingStep', 5);
    context.go('/onboarding/showme');
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingShell(
      title: 'What are you\nlooking for?',
      step: 5,
      onBack: () => context.go('/onboarding/photos'),
      child: Column(
        children: [
          ..._options.map((o) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GestureDetector(
              onTap: () => setState(() => _selected = o.$1),
              child: Semantics(
                label: '${o.$2}: ${o.$3}',
                selected: _selected == o.$1,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: _selected == o.$1 ? MitiMaitiTheme.rose.withValues(alpha: 0.08) : Colors.white,
                    border: Border.all(
                      color: _selected == o.$1 ? MitiMaitiTheme.rose : MitiMaitiTheme.border,
                      width: _selected == o.$1 ? 2 : 1,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(o.$2, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600,
                        color: _selected == o.$1 ? MitiMaitiTheme.rose : MitiMaitiTheme.charcoal)),
                      const SizedBox(height: 4),
                      Text(o.$3, style: TextStyle(fontSize: 14, color: MitiMaitiTheme.textSecondary)),
                    ],
                  ),
                ),
              ),
            ),
          )),
          const Spacer(),
          SizedBox(width: double.infinity, height: 56,
            child: ElevatedButton(onPressed: _selected != null ? _next : null, child: const Text('Continue'))),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
