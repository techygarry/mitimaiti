import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../widgets/onboarding_shell.dart';
import '../../theme.dart';

const _cities = [
  'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Bangalore', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Jaipur', 'Lucknow', 'Indore', 'Surat',
  'Vadodara', 'Nagpur', 'Thane', 'Navi Mumbai', 'Gurgaon', 'Noida',
  'Chandigarh', 'Jodhpur', 'Udaipur', 'Ulhasnagar', 'Adipur', 'Gandhidham',
];

class LocationScreen extends StatefulWidget {
  const LocationScreen({super.key});
  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  String? _selectedCity;
  String _search = '';

  List<String> get _filteredCities =>
    _search.isEmpty ? _cities : _cities.where((c) => c.toLowerCase().contains(_search.toLowerCase())).toList();

  void _next() {
    if (_selectedCity == null) return;
    Hive.box('onboarding').put('city', _selectedCity);
    Hive.box('settings').put('onboardingStep', 7);
    context.go('/onboarding/ready');
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingShell(
      title: 'Where are\nyou based?',
      subtitle: 'Select your city',
      step: 7,
      onBack: () => context.go('/onboarding/showme'),
      child: Column(
        children: [
          TextField(
            decoration: const InputDecoration(
              hintText: 'Search city...',
              prefixIcon: Icon(Icons.search),
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: _filteredCities.length,
              itemBuilder: (_, i) {
                final city = _filteredCities[i];
                final isSelected = _selectedCity == city;
                return ListTile(
                  title: Text(city, style: TextStyle(
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? MitiMaitiTheme.rose : MitiMaitiTheme.charcoal,
                  )),
                  trailing: isSelected ? const Icon(Icons.check_circle, color: MitiMaitiTheme.rose) : null,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  selected: isSelected,
                  selectedTileColor: MitiMaitiTheme.rose.withValues(alpha: 0.06),
                  onTap: () => setState(() => _selectedCity = city),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(width: double.infinity, height: 56,
            child: ElevatedButton(onPressed: _selectedCity != null ? _next : null, child: const Text('Continue'))),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
