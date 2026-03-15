import 'package:flutter/material.dart';
import '../../theme.dart';

class FilterSheet extends StatefulWidget {
  const FilterSheet({super.key});

  @override
  State<FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<FilterSheet> {
  RangeValues _ageRange = const RangeValues(18, 60);
  RangeValues _heightRange = const RangeValues(140, 200);
  double _maxDistance = 100;
  String _intent = 'Any';
  String _religion = 'Any';
  String _community = 'Sindhi';
  String _sindhiFluency = 'Any';
  String _gotra = 'Any';
  String _diet = 'Any';
  String _education = 'Any';
  String _drinking = 'Any';
  String _smoking = 'Any';
  String _exercise = 'Any';
  String _kids = 'Any';
  String _settling = 'Any';
  bool _verifiedOnly = false;
  int _kundliMin = 0;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (_, controller) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: ListView(
          controller: controller,
          children: [
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Filters',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                Row(
                  children: [
                    TextButton(
                      onPressed: _resetFilters,
                      child: const Text('Reset'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(80, 40),
                      ),
                      child: const Text('Apply'),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Age Range
            _SectionTitle('Age Range'),
            Semantics(
              label: 'Age range: ${_ageRange.start.round()} to ${_ageRange.end.round()}',
              child: RangeSlider(
                values: _ageRange,
                min: 18,
                max: 60,
                divisions: 42,
                labels: RangeLabels(
                  _ageRange.start.round().toString(),
                  _ageRange.end.round().toString(),
                ),
                activeColor: MitiMaitiTheme.rose,
                onChanged: (v) => setState(() => _ageRange = v),
              ),
            ),
            _RangeLabel('${_ageRange.start.round()} - ${_ageRange.end.round()} years'),

            const Divider(height: 32),

            // Distance
            _SectionTitle('Max Distance'),
            Semantics(
              label: 'Maximum distance: ${_maxDistance.round()} km',
              child: Slider(
                value: _maxDistance,
                min: 5,
                max: 500,
                divisions: 99,
                label: '${_maxDistance.round()} km',
                activeColor: MitiMaitiTheme.rose,
                onChanged: (v) => setState(() => _maxDistance = v),
              ),
            ),
            _RangeLabel('${_maxDistance.round()} km'),

            const Divider(height: 32),

            // Height Range
            _SectionTitle('Height'),
            Semantics(
              label: 'Height range: ${_heightRange.start.round()} to ${_heightRange.end.round()} cm',
              child: RangeSlider(
                values: _heightRange,
                min: 140,
                max: 200,
                divisions: 60,
                labels: RangeLabels(
                  '${_heightRange.start.round()} cm',
                  '${_heightRange.end.round()} cm',
                ),
                activeColor: MitiMaitiTheme.rose,
                onChanged: (v) => setState(() => _heightRange = v),
              ),
            ),
            _RangeLabel('${_heightRange.start.round()} - ${_heightRange.end.round()} cm'),

            const Divider(height: 32),

            // Intent
            _DropdownFilter(
              label: 'Intent',
              value: _intent,
              options: const ['Any', 'Casual', 'Open to anything', 'Marriage'],
              onChanged: (v) => setState(() => _intent = v),
            ),

            // Community
            _DropdownFilter(
              label: 'Community',
              value: _community,
              options: const ['Sindhi', 'Any'],
              onChanged: (v) => setState(() => _community = v),
            ),

            // Religion
            _DropdownFilter(
              label: 'Religion',
              value: _religion,
              options: const ['Any', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'],
              onChanged: (v) => setState(() => _religion = v),
            ),

            // Sindhi Fluency
            _DropdownFilter(
              label: 'Sindhi Fluency',
              value: _sindhiFluency,
              options: const ['Any', 'Fluent', 'Conversational', 'Basic', 'Learning'],
              onChanged: (v) => setState(() => _sindhiFluency = v),
            ),

            // Gotra
            _DropdownFilter(
              label: 'Gotra',
              value: _gotra,
              options: const ['Any', 'Same Gotra OK', 'Different Gotra Only'],
              onChanged: (v) => setState(() => _gotra = v),
            ),

            // Diet
            _DropdownFilter(
              label: 'Dietary Preference',
              value: _diet,
              options: const ['Any', 'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'],
              onChanged: (v) => setState(() => _diet = v),
            ),

            // Education
            _DropdownFilter(
              label: 'Education',
              value: _education,
              options: const ['Any', 'High School', 'Bachelors', 'Masters', 'Doctorate', 'Professional'],
              onChanged: (v) => setState(() => _education = v),
            ),

            // Drinking
            _DropdownFilter(
              label: 'Drinking',
              value: _drinking,
              options: const ['Any', 'Never', 'Socially', 'Regularly'],
              onChanged: (v) => setState(() => _drinking = v),
            ),

            // Smoking
            _DropdownFilter(
              label: 'Smoking',
              value: _smoking,
              options: const ['Any', 'Never', 'Socially', 'Regularly'],
              onChanged: (v) => setState(() => _smoking = v),
            ),

            // Exercise
            _DropdownFilter(
              label: 'Exercise',
              value: _exercise,
              options: const ['Any', 'Daily', 'Often', 'Sometimes', 'Never'],
              onChanged: (v) => setState(() => _exercise = v),
            ),

            // Kids
            _DropdownFilter(
              label: 'Kids',
              value: _kids,
              options: const ['Any', 'Want kids', 'Don\'t want kids', 'Have kids', 'Open to kids'],
              onChanged: (v) => setState(() => _kids = v),
            ),

            // Settling
            _DropdownFilter(
              label: 'Settling Plans',
              value: _settling,
              options: const ['Any', 'India', 'Abroad', 'Flexible'],
              onChanged: (v) => setState(() => _settling = v),
            ),

            const Divider(height: 32),

            // Verified only
            SwitchListTile(
              title: const Text('Verified Profiles Only',
                  style: TextStyle(fontWeight: FontWeight.w500)),
              value: _verifiedOnly,
              onChanged: (v) => setState(() => _verifiedOnly = v),
              contentPadding: EdgeInsets.zero,
            ),

            const Divider(height: 32),

            // Kundli minimum
            _SectionTitle('Min Kundli Score'),
            Semantics(
              label: 'Minimum Kundli score: $_kundliMin out of 36',
              child: Slider(
                value: _kundliMin.toDouble(),
                min: 0,
                max: 36,
                divisions: 36,
                label: '$_kundliMin/36',
                activeColor: MitiMaitiTheme.gold,
                onChanged: (v) => setState(() => _kundliMin = v.round()),
              ),
            ),
            _RangeLabel('$_kundliMin/36 minimum'),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  void _resetFilters() {
    setState(() {
      _ageRange = const RangeValues(18, 60);
      _heightRange = const RangeValues(140, 200);
      _maxDistance = 100;
      _intent = 'Any';
      _religion = 'Any';
      _community = 'Sindhi';
      _sindhiFluency = 'Any';
      _gotra = 'Any';
      _diet = 'Any';
      _education = 'Any';
      _drinking = 'Any';
      _smoking = 'Any';
      _exercise = 'Any';
      _kids = 'Any';
      _settling = 'Any';
      _verifiedOnly = false;
      _kundliMin = 0;
    });
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: MitiMaitiTheme.charcoal,
        ),
      ),
    );
  }
}

class _RangeLabel extends StatelessWidget {
  final String text;
  const _RangeLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            color: MitiMaitiTheme.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

class _DropdownFilter extends StatelessWidget {
  final String label;
  final String value;
  final List<String> options;
  final ValueChanged<String> onChanged;

  const _DropdownFilter({
    required this.label,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        trailing: DropdownButton<String>(
          value: value,
          underline: const SizedBox.shrink(),
          items: options
              .map((o) => DropdownMenuItem(
                    value: o,
                    child: Text(o, style: const TextStyle(fontSize: 14)),
                  ))
              .toList(),
          onChanged: (v) {
            if (v != null) onChanged(v);
          },
        ),
      ),
    );
  }
}
