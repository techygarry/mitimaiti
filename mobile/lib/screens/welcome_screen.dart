import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: MitiMaitiTheme.roseGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              children: [
                const Spacer(flex: 3),
                const Text(
                  'MitiMaiti',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: -1.5,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Where Sindhi Hearts Meet',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.white70,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 48),
                const Text(
                  'The dating app built exclusively for the\nglobal Sindhi community',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.white60,
                    height: 1.5,
                  ),
                ),
                const Spacer(flex: 2),
                // Features
                _FeatureRow(icon: Icons.favorite_outline, text: 'Respect-First Messaging'),
                const SizedBox(height: 16),
                _FeatureRow(icon: Icons.auto_awesome, text: 'Cultural Compatibility Scoring'),
                const SizedBox(height: 16),
                _FeatureRow(icon: Icons.family_restroom, text: 'Family Mode — A World First'),
                const Spacer(flex: 2),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () => context.go('/auth/phone'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: MitiMaitiTheme.rose,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    child: Semantics(
                      label: 'Get started with MitiMaiti',
                      child: const Text('Get Started'),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  '100% Free. No premium. No paywalls.',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
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

class _FeatureRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _FeatureRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: MitiMaitiTheme.gold, size: 24),
        const SizedBox(width: 12),
        Text(
          text,
          style: const TextStyle(
            fontSize: 15,
            color: Colors.white,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
