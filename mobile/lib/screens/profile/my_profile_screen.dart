import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme.dart';

class MyProfileScreen extends StatelessWidget {
  const MyProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          IconButton(icon: const Icon(Icons.settings_outlined), onPressed: () => context.push('/settings')),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Photo + Name
            Container(
              height: 300,
              width: double.infinity,
              decoration: BoxDecoration(
                color: MitiMaitiTheme.border,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(child: Icon(Icons.person, size: 80, color: MitiMaitiTheme.textSecondary.withValues(alpha: 0.3))),
            ),
            const SizedBox(height: 16),
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Your Name, 25', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
                SizedBox(width: 6),
                Icon(Icons.verified, color: MitiMaitiTheme.rose, size: 22),
              ],
            ),
            const SizedBox(height: 4),
            const Text('Mumbai', style: TextStyle(fontSize: 15, color: MitiMaitiTheme.textSecondary)),
            const SizedBox(height: 24),
            // Completion
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: MitiMaitiTheme.rose.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: MitiMaitiTheme.rose.withValues(alpha: 0.2)),
              ),
              child: Column(
                children: [
                  const Row(children: [
                    Icon(Icons.pie_chart, color: MitiMaitiTheme.rose, size: 20),
                    SizedBox(width: 8),
                    Text('Profile 65% complete', style: TextStyle(fontWeight: FontWeight.w600, color: MitiMaitiTheme.rose)),
                  ]),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: const LinearProgressIndicator(
                      value: 0.65, backgroundColor: MitiMaitiTheme.border,
                      valueColor: AlwaysStoppedAnimation(MitiMaitiTheme.rose), minHeight: 6),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Edit sections
            _EditSection('My Basics', '5 of 8 completed', Icons.person_outline, () => context.push('/profile/edit')),
            _EditSection('My Sindhi Identity', '3 of 5 completed', Icons.auto_awesome, () => context.push('/profile/edit')),
            _EditSection('My Chatti', 'Not started', Icons.stars, () => context.push('/profile/edit')),
            _EditSection('My Culture', '1 of 3 completed', Icons.celebration, () => context.push('/profile/edit')),
            _EditSection('My Personality', '2 of 5 completed', Icons.psychology, () => context.push('/profile/edit')),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => context.push('/profile/edit'),
                icon: const Icon(Icons.edit),
                label: const Text('Edit Profile'),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _EditSection extends StatelessWidget {
  final String title, subtitle;
  final IconData icon;
  final VoidCallback onTap;
  const _EditSection(this.title, this.subtitle, this.icon, this.onTap);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color: MitiMaitiTheme.rose.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: MitiMaitiTheme.rose),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 13, color: MitiMaitiTheme.textSecondary)),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
