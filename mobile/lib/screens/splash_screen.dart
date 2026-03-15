import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigate();
  }

  Future<void> _navigate() async {
    await Future.delayed(const Duration(milliseconds: 1500));
    if (!mounted) return;

    final settings = Hive.box('settings');
    final isLoggedIn = settings.get('isLoggedIn', defaultValue: false);
    final onboardingComplete = settings.get('onboardingComplete', defaultValue: false);

    if (isLoggedIn && onboardingComplete) {
      context.go('/discover');
    } else if (isLoggedIn) {
      final step = settings.get('onboardingStep', defaultValue: 0);
      final routes = [
        '/onboarding/name', '/onboarding/birthday', '/onboarding/gender',
        '/onboarding/photos', '/onboarding/intent', '/onboarding/showme',
        '/onboarding/location', '/onboarding/ready',
      ];
      context.go(step < routes.length ? routes[step] : '/onboarding/name');
    } else {
      context.go('/welcome');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: MitiMaitiTheme.roseGradient),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'MitiMaiti',
                style: TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  letterSpacing: -1,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Where Sindhi Hearts Meet',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
