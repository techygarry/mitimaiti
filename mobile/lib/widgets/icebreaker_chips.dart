import 'package:flutter/material.dart';
import '../theme.dart';

class IcebreakerChips extends StatelessWidget {
  final List<String> suggestions;
  final ValueChanged<String> onSelect;

  const IcebreakerChips({
    super.key,
    required this.suggestions,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Icon(
                Icons.auto_awesome,
                size: 16,
                color: MitiMaitiTheme.gold,
              ),
              const SizedBox(width: 6),
              Text(
                'Start with an icebreaker',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: MitiMaitiTheme.charcoal.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: suggestions.map((suggestion) {
              return Semantics(
                label: 'Send icebreaker: $suggestion',
                button: true,
                child: GestureDetector(
                  onTap: () => onSelect(suggestion),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: MitiMaitiTheme.rose.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(MitiMaitiTheme.chipRadius),
                      border: Border.all(
                        color: MitiMaitiTheme.rose.withValues(alpha: 0.25),
                      ),
                    ),
                    child: Text(
                      suggestion,
                      style: const TextStyle(
                        fontSize: 13,
                        color: MitiMaitiTheme.rose,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
