import 'package:flutter/material.dart';
import '../../theme.dart';

enum ScoreBreakdownType { cultural, kundli, interests }

class ScoreBreakdownSheet extends StatelessWidget {
  final ScoreBreakdownType type;
  final int score;
  final List<String>? interests;

  const ScoreBreakdownSheet({
    super.key,
    required this.type,
    required this.score,
    this.interests,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _title,
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 8),
          Text(
            _subtitle,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: MitiMaitiTheme.textSecondary,
                ),
          ),
          const SizedBox(height: 24),
          ..._buildContent(context),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  String get _title {
    switch (type) {
      case ScoreBreakdownType.cultural:
        return 'Cultural Compatibility';
      case ScoreBreakdownType.kundli:
        return 'Kundli / Gun Milan';
      case ScoreBreakdownType.interests:
        return 'Common Interests';
    }
  }

  String get _subtitle {
    switch (type) {
      case ScoreBreakdownType.cultural:
        return 'Overall: $score% - 6 cultural dimensions';
      case ScoreBreakdownType.kundli:
        return 'Total: $score/36 Gunas - 8 Ashta Koota factors';
      case ScoreBreakdownType.interests:
        return '$score interests in common';
    }
  }

  List<Widget> _buildContent(BuildContext context) {
    switch (type) {
      case ScoreBreakdownType.cultural:
        return [
          _ScoreRow('Family Values', 22, 25),
          _ScoreRow('Language & Dialect', 16, 20),
          _ScoreRow('Festivals & Traditions', 14, 20),
          _ScoreRow('Food & Cuisine', 12, 15),
          _ScoreRow('Diaspora Generation', 8, 10),
          _ScoreRow('Intent Match', 8, 10),
        ];
      case ScoreBreakdownType.kundli:
        return [
          _ScoreRow('Varna (Spiritual compatibility)', 1, 1),
          _ScoreRow('Vashya (Mutual attraction)', 2, 2),
          _ScoreRow('Tara (Birth star compatibility)', 3, 3),
          _ScoreRow('Yoni (Nature compatibility)', 3, 4),
          _ScoreRow('Graha Maitri (Planet friendship)', 4, 5),
          _ScoreRow('Gana (Temperament)', 5, 6),
          _ScoreRow('Bhakoot (Love compatibility)', 7, 7),
          _ScoreRow('Nadi (Health compatibility)', 0, 8),
        ];
      case ScoreBreakdownType.interests:
        if (interests == null || interests!.isEmpty) {
          return [
            const Text(
              'No common interests yet. Complete your profile to see matches!',
              style: TextStyle(color: MitiMaitiTheme.textSecondary),
            ),
          ];
        }
        return [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: interests!.map((interest) {
              return Chip(
                label: Text(interest),
                avatar: const Icon(Icons.favorite, size: 16, color: MitiMaitiTheme.rose),
              );
            }).toList(),
          ),
        ];
    }
  }
}

class _ScoreRow extends StatelessWidget {
  final String label;
  final int score;
  final int max;

  const _ScoreRow(this.label, this.score, this.max);

  @override
  Widget build(BuildContext context) {
    final ratio = max > 0 ? score / max : 0.0;
    final color = ratio >= 0.8
        ? MitiMaitiTheme.scoreGold
        : ratio >= 0.5
            ? MitiMaitiTheme.scoreGreen
            : MitiMaitiTheme.scoreOrange;

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 14),
                ),
              ),
              Text(
                '$score/$max',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: ratio,
              backgroundColor: MitiMaitiTheme.border,
              valueColor: AlwaysStoppedAnimation(color),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }
}
