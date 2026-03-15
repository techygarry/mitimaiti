import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../widgets/onboarding_shell.dart';
import '../../theme.dart';

class BirthdayScreen extends StatefulWidget {
  const BirthdayScreen({super.key});
  @override
  State<BirthdayScreen> createState() => _BirthdayScreenState();
}

class _BirthdayScreenState extends State<BirthdayScreen> {
  DateTime? _selectedDate;
  String? _error;

  bool get _isValid {
    if (_selectedDate == null) return false;
    final age = DateTime.now().difference(_selectedDate!).inDays ~/ 365;
    return age >= 18;
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 25),
      firstDate: DateTime(now.year - 60),
      lastDate: DateTime(now.year - 18),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: MitiMaitiTheme.rose),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        final age = now.difference(picked).inDays ~/ 365;
        _error = age < 18 ? 'You must be 18 or older to use MitiMaiti' : null;
      });
    }
  }

  void _next() {
    if (!_isValid) return;
    Hive.box('onboarding').put('birthday', _selectedDate!.toIso8601String());
    Hive.box('settings').put('onboardingStep', 2);
    context.go('/onboarding/gender');
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingShell(
      title: 'When\'s your\nbirthday?',
      subtitle: 'You must be 18 or older',
      step: 2,
      onBack: () => context.go('/onboarding/name'),
      child: Column(
        children: [
          GestureDetector(
            onTap: _pickDate,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(
                border: Border.all(color: MitiMaitiTheme.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _selectedDate != null
                  ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                  : 'Tap to select date',
                style: TextStyle(
                  fontSize: 18,
                  color: _selectedDate != null ? MitiMaitiTheme.charcoal : MitiMaitiTheme.textSecondary,
                ),
              ),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: MitiMaitiTheme.error, fontSize: 14)),
          ],
          const Spacer(),
          SizedBox(
            width: double.infinity, height: 56,
            child: ElevatedButton(
              onPressed: _isValid ? _next : null,
              child: const Text('Continue'),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
