import 'package:flutter/material.dart';
import '../models/user.dart';
import '../theme.dart';
import 'photo_gallery.dart';
import 'score_tag.dart';

class DiscoveryCard extends StatelessWidget {
  final FeedCard card;
  final VoidCallback onLike;
  final VoidCallback onPass;
  final VoidCallback onCulturalScoreTap;
  final VoidCallback onKundliScoreTap;
  final VoidCallback onInterestsTap;
  final VoidCallback onProfileTap;

  const DiscoveryCard({
    super.key,
    required this.card,
    required this.onLike,
    required this.onPass,
    required this.onCulturalScoreTap,
    required this.onKundliScoreTap,
    required this.onInterestsTap,
    required this.onProfileTap,
  });

  @override
  Widget build(BuildContext context) {
    final user = card.user;
    final theme = Theme.of(context);

    return Semantics(
      label: 'Profile card for ${user.displayName}, ${user.age ?? ""} years old',
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(MitiMaitiTheme.cardRadius),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Photos
            GestureDetector(
              onTap: onProfileTap,
              child: PhotoGallery(
                photos: user.photos,
                height: 420,
                showVerifiedBadge: true,
                isVerified: user.isVerified,
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name, age, verified tick
                  GestureDetector(
                    onTap: onProfileTap,
                    child: Row(
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Text(
                                '${user.displayName}, ${user.age ?? ""}',
                                style: theme.textTheme.headlineMedium,
                              ),
                              if (user.isVerified) ...[
                                const SizedBox(width: 6),
                                const Icon(
                                  Icons.verified,
                                  size: 20,
                                  color: MitiMaitiTheme.rose,
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),

                  // City + Intent pills
                  Row(
                    children: [
                      if (user.city != null) ...[
                        _InfoPill(
                          icon: Icons.location_on_outlined,
                          text: user.city!,
                        ),
                        const SizedBox(width: 8),
                      ],
                      if (user.intent != null)
                        _InfoPill(
                          icon: Icons.favorite_outline,
                          text: user.intent!,
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Score tags
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ScoreTag(
                        type: ScoreType.cultural,
                        score: card.culturalScore,
                        onTap: onCulturalScoreTap,
                      ),
                      ScoreTag(
                        type: ScoreType.kundli,
                        score: card.kundliScore,
                        onTap: onKundliScoreTap,
                      ),
                      ScoreTag(
                        type: ScoreType.interests,
                        score: card.commonInterests,
                        onTap: onInterestsTap,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Bio
                  if (user.bio != null && user.bio!.isNotEmpty) ...[
                    Text(
                      user.bio!,
                      style: theme.textTheme.bodyLarge,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Prompts
                  ...user.prompts.take(2).map((prompt) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _PromptCard(prompt: prompt),
                      )),

                  // Interests
                  if (user.interests.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: user.interests.take(6).map((interest) {
                        return Chip(
                          label: Text(
                            interest,
                            style: const TextStyle(fontSize: 13),
                          ),
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                          visualDensity: VisualDensity.compact,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Action buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Pass button
                      Semantics(
                        label: 'Pass on ${user.displayName}',
                        button: true,
                        child: _ActionButton(
                          icon: Icons.close_rounded,
                          color: MitiMaitiTheme.textSecondary,
                          backgroundColor: MitiMaitiTheme.border,
                          onTap: onPass,
                          size: 52,
                        ),
                      ),
                      const SizedBox(width: 32),
                      // Like button
                      Semantics(
                        label: 'Like ${user.displayName}',
                        button: true,
                        child: _ActionButton(
                          icon: Icons.favorite_rounded,
                          color: Colors.white,
                          backgroundColor: MitiMaitiTheme.rose,
                          onTap: onLike,
                          size: 64,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoPill extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoPill({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: MitiMaitiTheme.background,
        borderRadius: BorderRadius.circular(MitiMaitiTheme.chipRadius),
        border: Border.all(color: MitiMaitiTheme.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: MitiMaitiTheme.textSecondary),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              color: MitiMaitiTheme.textSecondary,
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
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: MitiMaitiTheme.background,
        borderRadius: BorderRadius.circular(12),
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
          const SizedBox(height: 6),
          Text(
            prompt.answer,
            style: const TextStyle(
              fontSize: 15,
              color: MitiMaitiTheme.charcoal,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final Color backgroundColor;
  final VoidCallback onTap;
  final double size;

  const _ActionButton({
    required this.icon,
    required this.color,
    required this.backgroundColor,
    required this.onTap,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: backgroundColor,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: backgroundColor.withValues(alpha: 0.4),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(icon, color: color, size: size * 0.5),
      ),
    );
  }
}
