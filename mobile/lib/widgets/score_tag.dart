import 'package:flutter/material.dart';
import '../theme.dart';

enum ScoreType { cultural, kundli, interests }

class ScoreTag extends StatelessWidget {
  final ScoreType type;
  final int score;
  final int? maxScore;
  final VoidCallback? onTap;

  const ScoreTag({
    super.key,
    required this.type,
    required this.score,
    this.maxScore,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getConfig();

    return Semantics(
      label: config.semanticsLabel,
      button: onTap != null,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: config.backgroundColor,
            borderRadius: BorderRadius.circular(MitiMaitiTheme.chipRadius),
            border: Border.all(color: config.borderColor, width: 1),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                config.icon,
                size: 14,
                color: config.textColor,
              ),
              const SizedBox(width: 4),
              Text(
                config.text,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: config.textColor,
                ),
              ),
              if (onTap != null) ...[
                const SizedBox(width: 2),
                Icon(
                  Icons.chevron_right,
                  size: 14,
                  color: config.textColor,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  _ScoreConfig _getConfig() {
    switch (type) {
      case ScoreType.cultural:
        final Color color;
        if (score >= 80) {
          color = MitiMaitiTheme.scoreGold;
        } else if (score >= 60) {
          color = MitiMaitiTheme.scoreGreen;
        } else {
          color = MitiMaitiTheme.scoreOrange;
        }
        return _ScoreConfig(
          icon: Icons.star_rounded,
          text: '$score% Cultural',
          textColor: color,
          backgroundColor: color.withValues(alpha: 0.1),
          borderColor: color.withValues(alpha: 0.3),
          semanticsLabel: 'Cultural compatibility score: $score percent',
        );
      case ScoreType.kundli:
        final String tier;
        final Color color;
        if (score >= 28) {
          tier = 'Excellent';
          color = MitiMaitiTheme.scoreGold;
        } else if (score >= 21) {
          tier = 'Very Good';
          color = MitiMaitiTheme.scoreGreen;
        } else if (score >= 14) {
          tier = 'Good';
          color = MitiMaitiTheme.scoreGreen;
        } else {
          tier = 'Average';
          color = MitiMaitiTheme.scoreOrange;
        }
        return _ScoreConfig(
          icon: Icons.auto_awesome,
          text: '$score/36 $tier',
          textColor: color,
          backgroundColor: color.withValues(alpha: 0.1),
          borderColor: color.withValues(alpha: 0.3),
          semanticsLabel: 'Kundli score: $score out of 36, $tier',
        );
      case ScoreType.interests:
        return _ScoreConfig(
          icon: Icons.favorite_rounded,
          text: '$score common',
          textColor: MitiMaitiTheme.rose,
          backgroundColor: MitiMaitiTheme.rose.withValues(alpha: 0.1),
          borderColor: MitiMaitiTheme.rose.withValues(alpha: 0.3),
          semanticsLabel: '$score common interests',
        );
    }
  }
}

class _ScoreConfig {
  final IconData icon;
  final String text;
  final Color textColor;
  final Color backgroundColor;
  final Color borderColor;
  final String semanticsLabel;

  const _ScoreConfig({
    required this.icon,
    required this.text,
    required this.textColor,
    required this.backgroundColor,
    required this.borderColor,
    required this.semanticsLabel,
  });
}
