import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../widgets/onboarding_shell.dart';
import '../../theme.dart';

class GenderScreen extends StatefulWidget {
  const GenderScreen({super.key});
  @override
  State<GenderScreen> createState() => _GenderScreenState();
}

class _GenderScreenState extends State<GenderScreen> {
  String? _selected;

  final _options = [
    ('man', 'Man', Icons.male),
    ('woman', 'Woman', Icons.female),
    ('non-binary', 'Non-binary', Icons.transgender),
  ];

  void _next() {
    if (_selected == null) return;
    Hive.box('onboarding').put('gender', _selected);
    Hive.box('settings').put('onboardingStep', 3);
    context.go('/onboarding/photos');
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingShell(
      title: 'How do you\nidentify?',
      step: 3,
      onBack: () => context.go('/onboarding/birthday'),
      child: Column(
        children: [
          ..._options.map((o) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GestureDetector(
              onTap: () => setState(() => _selected = o.$1),
              child: Semantics(
                label: 'Select ${o.$2}',
                selected: _selected == o.$1,
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
                      Icon(o.$3, color: _selected == o.$1 ? MitiMaitiTheme.rose : MitiMaitiTheme.textSecondary),
                      const SizedBox(width: 16),
                      Text(o.$2, style: TextStyle(
                        fontSize: 18, fontWeight: FontWeight.w500,
                        color: _selected == o.$1 ? MitiMaitiTheme.rose : MitiMaitiTheme.charcoal,
                      )),
                      const Spacer(),
                      if (_selected == o.$1) const Icon(Icons.check_circle, color: MitiMaitiTheme.rose),
                    ],
                  ),
                ),
              ),
            ),
          )),
          const Spacer(),
          SizedBox(
            width: double.infinity, height: 56,
            child: ElevatedButton(
              onPressed: _selected != null ? _next : null,
              child: const Text('Continue'),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
