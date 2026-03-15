import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../widgets/onboarding_shell.dart';
import '../../theme.dart';

class ShowMeScreen extends StatefulWidget {
  const ShowMeScreen({super.key});
  @override
  State<ShowMeScreen> createState() => _ShowMeScreenState();
}

class _ShowMeScreenState extends State<ShowMeScreen> {
  String? _selected;
  final _options = [('men', 'Men'), ('women', 'Women'), ('everyone', 'Everyone')];

  void _next() {
    if (_selected == null) return;
    Hive.box('onboarding').put('showMe', _selected);
    Hive.box('settings').put('onboardingStep', 6);
    context.go('/onboarding/location');
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingShell(
      title: 'Show me',
      subtitle: 'Who would you like to see?',
      step: 6,
      onBack: () => context.go('/onboarding/intent'),
      child: Column(
        children: [
          ..._options.map((o) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GestureDetector(
              onTap: () => setState(() => _selected = o.$1),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                decoration: BoxDecoration(
                  color: _selected == o.$1 ? MitiMaitiTheme.rose.withValues(alpha: 0.08) : Colors.white,
                  border: Border.all(
                    color: _selected == o.$1 ? MitiMaitiTheme.rose : MitiMaitiTheme.border,
                    width: _selected == o.$1 ? 2 : 1,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Text(o.$2, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500,
                      color: _selected == o.$1 ? MitiMaitiTheme.rose : MitiMaitiTheme.charcoal)),
                    const Spacer(),
                    if (_selected == o.$1) const Icon(Icons.check_circle, color: MitiMaitiTheme.rose),
                  ],
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
