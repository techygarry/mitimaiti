import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme.dart';

class AccountHealthScreen extends StatelessWidget {
  const AccountHealthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
          tooltip: 'Back',
        ),
        title: const Text('Account Health'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Health score
            Center(
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: MitiMaitiTheme.success.withValues(alpha: 0.1),
                      border: Border.all(
                        color: MitiMaitiTheme.success,
                        width: 3,
                      ),
                    ),
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '95',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              color: MitiMaitiTheme.success,
                            ),
                          ),
                          Text(
                            'out of 100',
                            style: TextStyle(
                              fontSize: 11,
                              color: MitiMaitiTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Excellent',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: MitiMaitiTheme.success,
                        ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Your account is in great standing',
                    style: TextStyle(
                      color: MitiMaitiTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Factors
            Text(
              'Health Factors',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),

            _HealthFactor(
              icon: Icons.verified_user,
              title: 'Identity Verified',
              status: 'Verified',
              isPositive: true,
              description: 'Your identity has been verified via phone OTP',
            ),
            _HealthFactor(
              icon: Icons.photo_library,
              title: 'Photo Authenticity',
              status: 'Good',
              isPositive: true,
              description: 'All photos meet our guidelines',
            ),
            _HealthFactor(
              icon: Icons.chat,
              title: 'Messaging Behavior',
              status: 'Excellent',
              isPositive: true,
              description: 'Respectful conversations with no complaints',
            ),
            _HealthFactor(
              icon: Icons.flag,
              title: 'Reports Received',
              status: '0 reports',
              isPositive: true,
              description: 'No one has reported your profile',
            ),
            _HealthFactor(
              icon: Icons.speed,
              title: 'Activity',
              status: 'Active',
              isPositive: true,
              description: 'Regular usage without suspicious patterns',
            ),
            _HealthFactor(
              icon: Icons.block,
              title: 'Warnings',
              status: '0 warnings',
              isPositive: true,
              description: 'No warnings or violations on your account',
            ),

            const SizedBox(height: 32),

            // Tips
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: MitiMaitiTheme.rose.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: MitiMaitiTheme.rose.withValues(alpha: 0.15),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.tips_and_updates,
                        color: MitiMaitiTheme.gold,
                        size: 20,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Tips to maintain good health',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _Tip('Be respectful in all conversations'),
                  _Tip('Only use real, recent photos of yourself'),
                  _Tip('Keep your profile information accurate'),
                  _Tip('Report profiles that violate guidelines'),
                  _Tip('Respond to messages within 24 hours'),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _HealthFactor extends StatelessWidget {
  final IconData icon;
  final String title;
  final String status;
  final bool isPositive;
  final String description;

  const _HealthFactor({
    required this.icon,
    required this.title,
    required this.status,
    required this.isPositive,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    final color = isPositive ? MitiMaitiTheme.success : MitiMaitiTheme.error;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: MitiMaitiTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      status,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: color,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 13,
                    color: MitiMaitiTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Tip extends StatelessWidget {
  final String text;

  const _Tip(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 6),
            child: Icon(
              Icons.circle,
              size: 6,
              color: MitiMaitiTheme.rose,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
