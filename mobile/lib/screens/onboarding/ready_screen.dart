import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../theme.dart';

class ReadyScreen extends StatelessWidget {
  const ReadyScreen({super.key});

  void _goToDiscover(BuildContext context) {
    Hive.box('settings').put('onboardingComplete', true);
    context.go('/discover');
  }

  @override
  Widget build(BuildContext context) {
    final name = Hive.box('onboarding').get('firstName', defaultValue: 'there');

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: MitiMaitiTheme.roseGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              children: [
                const Spacer(flex: 2),
                const Icon(Icons.celebration, size: 64, color: MitiMaitiTheme.gold),
                const SizedBox(height: 24),
                Text(
                  'You\'re in, $name!',
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: Colors.white),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Welcome to the Sindhi community\'s\nown dating experience',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.white70, height: 1.5),
                ),
                const SizedBox(height: 40),
                // Profile completeness
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.pie_chart, color: MitiMaitiTheme.gold, size: 20),
                          SizedBox(width: 8),
                          Text('Profile 35% complete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: const LinearProgressIndicator(
                          value: 0.35,
                          backgroundColor: Colors.white24,
                          valueColor: AlwaysStoppedAnimation(MitiMaitiTheme.gold),
                          minHeight: 6,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Complete your Sindhi Identity to get\nbetter cultural matches!',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 13, color: Colors.white60),
                      ),
                    ],
                  ),
                ),
                const Spacer(flex: 2),
                SizedBox(
                  width: double.infinity, height: 56,
                  child: ElevatedButton(
                    onPressed: () => _goToDiscover(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: MitiMaitiTheme.rose,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('Start Discovering', style: TextStyle(fontSize: 18)),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    Hive.box('settings').put('onboardingComplete', true);
                    context.go('/profile/edit');
                  },
                  child: const Text('Complete Profile First',
                    style: TextStyle(color: Colors.white70, fontSize: 14)),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
