import 'package:flutter/material.dart';
import '../../theme.dart';

class ReportSheet extends StatefulWidget {
  final String userId;

  const ReportSheet({super.key, required this.userId});

  @override
  State<ReportSheet> createState() => _ReportSheetState();
}

class _ReportSheetState extends State<ReportSheet> {
  String? _selectedReason;
  final _detailsController = TextEditingController();
  bool _isSubmitting = false;

  static const _reasons = [
    (
      'inappropriate',
      'Inappropriate Content',
      'Photos or text that are offensive, explicit, or violate guidelines',
    ),
    (
      'fake',
      'Fake Profile',
      'This person doesn\'t seem real or is impersonating someone',
    ),
    (
      'harassment',
      'Harassment',
      'Abusive, threatening, or unwanted behavior',
    ),
    (
      'spam',
      'Spam or Scam',
      'Promotional content, phishing, or financial fraud',
    ),
    (
      'underage',
      'Underage User',
      'This person appears to be under 18 years old',
    ),
    (
      'other',
      'Other',
      'Something else not listed above',
    ),
  ];

  Future<void> _submit() async {
    if (_selectedReason == null) return;

    setState(() => _isSubmitting = true);

    // Mock API call
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;
    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Report submitted. Our team will review it within 24 hours.',
        ),
        backgroundColor: MitiMaitiTheme.charcoal,
      ),
    );
  }

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Report User',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Help us keep MitiMaiti safe. Select a reason below.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: MitiMaitiTheme.textSecondary,
                  ),
            ),
            const SizedBox(height: 20),

            // Reason options
            ..._reasons.map((reason) {
              final (id, title, description) = reason;
              final isSelected = _selectedReason == id;

              return Semantics(
                label: '$title: $description',
                selected: isSelected,
                child: GestureDetector(
                  onTap: () => setState(() => _selectedReason = id),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? MitiMaitiTheme.error.withValues(alpha: 0.05)
                          : Colors.white,
                      border: Border.all(
                        color: isSelected
                            ? MitiMaitiTheme.error
                            : MitiMaitiTheme.border,
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: isSelected
                                      ? MitiMaitiTheme.error
                                      : MitiMaitiTheme.charcoal,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                description,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: MitiMaitiTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isSelected)
                          const Icon(
                            Icons.check_circle,
                            color: MitiMaitiTheme.error,
                            size: 22,
                          ),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 16),

            // Additional details
            TextField(
              controller: _detailsController,
              maxLines: 3,
              maxLength: 500,
              decoration: const InputDecoration(
                labelText: 'Additional details (optional)',
                hintText: 'Tell us more about what happened...',
                alignLabelWithHint: true,
              ),
            ),

            const SizedBox(height: 20),

            // Submit button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _selectedReason != null && !_isSubmitting
                    ? _submit
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: MitiMaitiTheme.error,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Submit Report'),
              ),
            ),

            const SizedBox(height: 8),
            Center(
              child: Text(
                'Your report is anonymous and confidential.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
