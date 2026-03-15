import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../models/user.dart';
import '../../theme.dart';
import '../../widgets/photo_gallery.dart';
import '../safety/report_sheet.dart';

class OtherProfileScreen extends StatelessWidget {
  final User user;

  const OtherProfileScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Photo app bar
          SliverAppBar(
            expandedHeight: 420,
            pinned: true,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.3),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
              onPressed: () => context.pop(),
              tooltip: 'Back',
            ),
            actions: [
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.3),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.more_vert, color: Colors.white, size: 20),
                ),
                onPressed: () => _showOptions(context),
                tooltip: 'More options',
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: PhotoGallery(
                photos: user.photos,
                height: 420,
                borderRadius: 0,
                showVerifiedBadge: true,
                isVerified: user.isVerified,
              ),
            ),
          ),

          // Profile content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name + age + verified
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '${user.displayName}, ${user.age ?? ""}',
                          style: Theme.of(context).textTheme.displayMedium,
                        ),
                      ),
                      if (user.isVerified)
                        const Icon(
                          Icons.verified,
                          color: MitiMaitiTheme.rose,
                          size: 24,
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Info pills
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (user.city != null)
                        _InfoChip(Icons.location_on_outlined, user.city!),
                      if (user.intent != null)
                        _InfoChip(Icons.favorite_outline, user.intent!),
                      if (user.occupation != null)
                        _InfoChip(Icons.work_outline, user.occupation!),
                      if (user.education != null)
                        _InfoChip(Icons.school_outlined, user.education!),
                      if (user.heightCm != null)
                        _InfoChip(Icons.straighten, '${user.heightCm} cm'),
                      if (user.community != null)
                        _InfoChip(Icons.people_outline, user.community!),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Bio
                  if (user.bio != null && user.bio!.isNotEmpty) ...[
                    Text(
                      user.bio!,
                      style: const TextStyle(fontSize: 16, height: 1.5),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Prompts
                  if (user.prompts.isNotEmpty) ...[
                    ...user.prompts.map((prompt) => _PromptCard(prompt: prompt)),
                    const SizedBox(height: 16),
                  ],

                  // Interests
                  if (user.interests.isNotEmpty) ...[
                    Text(
                      'Interests',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: user.interests.map((interest) {
                        return Chip(
                          label: Text(interest),
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Languages
                  if (user.languages.isNotEmpty) ...[
                    Text(
                      'Languages',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: user.languages.map((lang) {
                        return Chip(
                          label: Text(lang),
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Sindhi Identity section
                  if (user.gotra != null ||
                      user.nakshatra != null ||
                      user.manglikStatus != null ||
                      user.motherTongue != null) ...[
                    Text(
                      'Sindhi Identity',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    _DetailRow('Mother Tongue', user.motherTongue),
                    _DetailRow('Gotra', user.gotra),
                    _DetailRow('Nakshatra', user.nakshatra),
                    _DetailRow('Manglik Status', user.manglikStatus),
                    const SizedBox(height: 24),
                  ],

                  // Lifestyle section
                  if (user.dietPreference != null ||
                      user.drinkPreference != null ||
                      user.smokePreference != null ||
                      user.exerciseFrequency != null) ...[
                    Text(
                      'Lifestyle',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    _DetailRow('Diet', user.dietPreference),
                    _DetailRow('Drinking', user.drinkPreference),
                    _DetailRow('Smoking', user.smokePreference),
                    _DetailRow('Exercise', user.exerciseFrequency),
                    _DetailRow('Sleep Schedule', user.sleepSchedule),
                    const SizedBox(height: 24),
                  ],

                  // Personality section
                  if (user.socialStyle != null ||
                      user.communicationStyle != null ||
                      user.loveLanguage != null) ...[
                    Text(
                      'Personality',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    _DetailRow('Social Style', user.socialStyle),
                    _DetailRow('Communication', user.communicationStyle),
                    _DetailRow('Love Language', user.loveLanguage),
                    const SizedBox(height: 24),
                  ],

                  const SizedBox(height: 60),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Row(
            children: [
              // Pass button
              Semantics(
                label: 'Pass on ${user.displayName}',
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    border: Border.all(color: MitiMaitiTheme.border, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.close,
                      color: MitiMaitiTheme.textSecondary,
                    ),
                    onPressed: () => context.pop(),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Like button
              Expanded(
                child: Semantics(
                  label: 'Like ${user.displayName}',
                  child: SizedBox(
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('You liked ${user.displayName}!'),
                            backgroundColor: MitiMaitiTheme.rose,
                          ),
                        );
                        context.pop();
                      },
                      icon: const Icon(Icons.favorite, size: 22),
                      label: const Text('Like', style: TextStyle(fontSize: 17)),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.flag_outlined),
              title: const Text('Report'),
              onTap: () {
                Navigator.pop(context);
                showModalBottomSheet(
                  context: context,
                  builder: (_) => ReportSheet(userId: user.id),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.block, color: MitiMaitiTheme.error),
              title: const Text('Block', style: TextStyle(color: MitiMaitiTheme.error)),
              onTap: () {
                Navigator.pop(context);
                showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('Block user?'),
                    content: const Text('They won\'t be able to see or contact you.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                          context.pop();
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: MitiMaitiTheme.error,
                        ),
                        child: const Text('Block'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoChip(this.icon, this.text);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: MitiMaitiTheme.background,
        borderRadius: BorderRadius.circular(MitiMaitiTheme.chipRadius),
        border: Border.all(color: MitiMaitiTheme.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: MitiMaitiTheme.textSecondary),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              color: MitiMaitiTheme.charcoal,
            ),
          ),
        ],
      ),
    );
  }
}

class _PromptCard extends StatelessWidget {
  final Prompt prompt;

  const _PromptCard({required this.prompt});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: MitiMaitiTheme.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: MitiMaitiTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            prompt.question,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: MitiMaitiTheme.rose,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            prompt.answer,
            style: const TextStyle(
              fontSize: 16,
              height: 1.4,
              color: MitiMaitiTheme.charcoal,
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String? value;

  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    if (value == null || value!.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: MitiMaitiTheme.textSecondary,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value!,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
