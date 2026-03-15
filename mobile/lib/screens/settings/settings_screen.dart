import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          // Visibility
          _SectionTitle('Visibility'),
          SwitchListTile(
            title: const Text('Show in Discovery'), value: true, onChanged: (_) {},
            subtitle: const Text('Other users can find you')),
          ListTile(title: const Text('Snooze Mode'), trailing: const Icon(Icons.chevron_right),
            subtitle: const Text('Hide from discovery temporarily'), onTap: () {}),
          SwitchListTile(
            title: const Text('Incognito Mode'), value: false, onChanged: (_) {},
            subtitle: const Text('Only visible to users you\'ve liked')),
          const Divider(),

          // Family
          _SectionTitle('Family'),
          ListTile(title: const Text('Manage Family Members'), trailing: const Icon(Icons.chevron_right),
            onTap: () => context.go('/family')),
          const Divider(),

          // Discovery
          _SectionTitle('Discovery Filters'),
          ListTile(title: const Text('Age Range'), trailing: const Text('18 - 60', style: TextStyle(color: MitiMaitiTheme.textSecondary)), onTap: () {}),
          ListTile(title: const Text('Intent'), trailing: const Text('All', style: TextStyle(color: MitiMaitiTheme.textSecondary)), onTap: () {}),
          ListTile(title: const Text('Religion'), trailing: const Text('All', style: TextStyle(color: MitiMaitiTheme.textSecondary)), onTap: () {}),
          SwitchListTile(title: const Text('Verified Only'), value: false, onChanged: (_) {}),
          ListTile(title: const Text('Passport Mode'), trailing: const Icon(Icons.chevron_right),
            subtitle: const Text('Browse profiles in another city (7 days)'), onTap: () {}),
          ListTile(title: const Text('All 16 Filters'), trailing: const Icon(Icons.chevron_right), onTap: () {}),
          const Divider(),

          // Notifications
          _SectionTitle('Notifications'),
          SwitchListTile(title: const Text('Likes'), value: true, onChanged: (_) {}),
          SwitchListTile(title: const Text('Matches'), value: true, onChanged: (_) {}),
          SwitchListTile(title: const Text('Messages'), value: true, onChanged: (_) {}),
          SwitchListTile(title: const Text('Family'), value: true, onChanged: (_) {}),
          SwitchListTile(title: const Text('Expiry Warnings'), value: true, onChanged: (_) {}),
          SwitchListTile(title: const Text('Profile Nudges'), value: false, onChanged: (_) {}),
          const Divider(),

          // App
          _SectionTitle('App'),
          ListTile(title: const Text('Theme'), trailing: const Text('System', style: TextStyle(color: MitiMaitiTheme.textSecondary)), onTap: () {}),
          const Divider(),

          // Account
          _SectionTitle('Account'),
          ListTile(title: const Text('Export My Data'), subtitle: const Text('Download all your data (GDPR)'),
            trailing: const Icon(Icons.download), onTap: () {}),
          ListTile(
            title: const Text('Delete Account', style: TextStyle(color: MitiMaitiTheme.error)),
            subtitle: const Text('30-day grace period to recover'),
            onTap: () {
              showDialog(context: context, builder: (_) => AlertDialog(
                title: const Text('Delete Account?'),
                content: const Text('Your account will be scheduled for deletion in 30 days. You can recover it by logging back in during this period.'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                  TextButton(onPressed: () { Navigator.pop(context); },
                    style: TextButton.styleFrom(foregroundColor: MitiMaitiTheme.error),
                    child: const Text('Delete')),
                ],
              ));
            },
          ),
          const Divider(),

          // Support
          _SectionTitle('Support'),
          ListTile(title: const Text('Community Guidelines'), onTap: () {}),
          ListTile(title: const Text('Privacy Policy'), onTap: () {}),
          ListTile(title: const Text('Terms of Service'), onTap: () {}),
          ListTile(title: const Text('Report a Problem'), onTap: () {}),
          const SizedBox(height: 16),
          Center(child: Text('MitiMaiti v1.0.0',
            style: TextStyle(fontSize: 13, color: MitiMaitiTheme.textSecondary))),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(title, style: const TextStyle(
        fontSize: 13, fontWeight: FontWeight.w600, color: MitiMaitiTheme.textSecondary,
        letterSpacing: 0.5)),
    );
  }
}
