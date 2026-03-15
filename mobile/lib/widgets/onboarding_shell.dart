import 'package:flutter/material.dart';
import '../theme.dart';

class OnboardingShell extends StatelessWidget {
  final String title;
  final String? subtitle;
  final int step;
  final int totalSteps;
  final VoidCallback? onBack;
  final Widget child;

  const OnboardingShell({
    super.key,
    required this.title,
    this.subtitle,
    required this.step,
    this.totalSteps = 8,
    this.onBack,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: onBack != null
          ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: onBack, tooltip: 'Back')
          : null,
        title: Text('$step of $totalSteps', style: const TextStyle(fontSize: 14, color: MitiMaitiTheme.textSecondary)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: step / totalSteps,
                  backgroundColor: MitiMaitiTheme.border,
                  valueColor: const AlwaysStoppedAnimation(MitiMaitiTheme.rose),
                  minHeight: 4,
                ),
              ),
              const SizedBox(height: 32),
              Text(title, style: Theme.of(context).textTheme.displayMedium),
              if (subtitle != null) ...[
                const SizedBox(height: 8),
                Text(subtitle!, style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: MitiMaitiTheme.textSecondary)),
              ],
              const SizedBox(height: 32),
              Expanded(child: child),
            ],
          ),
        ),
      ),
    );
  }
}
