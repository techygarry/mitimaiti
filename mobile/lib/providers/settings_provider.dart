import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsState {
  // Discovery & visibility
  final bool discoveryEnabled;
  final bool incognitoMode;
  final bool showFullName;
  final bool isSnoozed;

  // Filters
  final int ageMin;
  final int ageMax;
  final int heightMin;
  final int heightMax;
  final int distanceKm;
  final String genderPreference; // 'men' | 'women' | 'everyone'
  final String? intentFilter; // 'casual' | 'open' | 'marriage'
  final bool verifiedOnly;
  final String? fluencyFilter;
  final String? generationFilter;
  final String? religionFilter;
  final String? gotraFilter;
  final String? dietaryFilter;
  final String? educationFilter;
  final String? smokingFilter;
  final String? drinkingFilter;
  final String? familyPlansFilter;

  // Notifications
  final bool notifyMatches;
  final bool notifyMessages;
  final bool notifyLikes;
  final bool notifyFamily;
  final bool notifyExpiry;
  final bool notifySafety;
  final bool notifyDailyPrompts;
  final bool notifyNewFeatures;

  // Theme
  final ThemeMode themeMode;

  const SettingsState({
    this.discoveryEnabled = true,
    this.incognitoMode = false,
    this.showFullName = false,
    this.isSnoozed = false,
    this.ageMin = 21,
    this.ageMax = 35,
    this.heightMin = 150,
    this.heightMax = 190,
    this.distanceKm = 100,
    this.genderPreference = 'everyone',
    this.intentFilter,
    this.verifiedOnly = false,
    this.fluencyFilter,
    this.generationFilter,
    this.religionFilter,
    this.gotraFilter,
    this.dietaryFilter,
    this.educationFilter,
    this.smokingFilter,
    this.drinkingFilter,
    this.familyPlansFilter,
    this.notifyMatches = true,
    this.notifyMessages = true,
    this.notifyLikes = true,
    this.notifyFamily = true,
    this.notifyExpiry = true,
    this.notifySafety = true,
    this.notifyDailyPrompts = true,
    this.notifyNewFeatures = true,
    this.themeMode = ThemeMode.system,
  });

  SettingsState copyWith({
    bool? discoveryEnabled,
    bool? incognitoMode,
    bool? showFullName,
    bool? isSnoozed,
    int? ageMin,
    int? ageMax,
    int? heightMin,
    int? heightMax,
    int? distanceKm,
    String? genderPreference,
    Object? intentFilter = _noChange,
    bool? verifiedOnly,
    Object? fluencyFilter = _noChange,
    Object? generationFilter = _noChange,
    Object? religionFilter = _noChange,
    Object? gotraFilter = _noChange,
    Object? dietaryFilter = _noChange,
    Object? educationFilter = _noChange,
    Object? smokingFilter = _noChange,
    Object? drinkingFilter = _noChange,
    Object? familyPlansFilter = _noChange,
    bool? notifyMatches,
    bool? notifyMessages,
    bool? notifyLikes,
    bool? notifyFamily,
    bool? notifyExpiry,
    bool? notifySafety,
    bool? notifyDailyPrompts,
    bool? notifyNewFeatures,
    ThemeMode? themeMode,
  }) {
    return SettingsState(
      discoveryEnabled: discoveryEnabled ?? this.discoveryEnabled,
      incognitoMode: incognitoMode ?? this.incognitoMode,
      showFullName: showFullName ?? this.showFullName,
      isSnoozed: isSnoozed ?? this.isSnoozed,
      ageMin: ageMin ?? this.ageMin,
      ageMax: ageMax ?? this.ageMax,
      heightMin: heightMin ?? this.heightMin,
      heightMax: heightMax ?? this.heightMax,
      distanceKm: distanceKm ?? this.distanceKm,
      genderPreference: genderPreference ?? this.genderPreference,
      intentFilter: identical(intentFilter, _noChange) ? this.intentFilter : intentFilter as String?,
      verifiedOnly: verifiedOnly ?? this.verifiedOnly,
      fluencyFilter: identical(fluencyFilter, _noChange) ? this.fluencyFilter : fluencyFilter as String?,
      generationFilter: identical(generationFilter, _noChange) ? this.generationFilter : generationFilter as String?,
      religionFilter: identical(religionFilter, _noChange) ? this.religionFilter : religionFilter as String?,
      gotraFilter: identical(gotraFilter, _noChange) ? this.gotraFilter : gotraFilter as String?,
      dietaryFilter: identical(dietaryFilter, _noChange) ? this.dietaryFilter : dietaryFilter as String?,
      educationFilter: identical(educationFilter, _noChange) ? this.educationFilter : educationFilter as String?,
      smokingFilter: identical(smokingFilter, _noChange) ? this.smokingFilter : smokingFilter as String?,
      drinkingFilter: identical(drinkingFilter, _noChange) ? this.drinkingFilter : drinkingFilter as String?,
      familyPlansFilter: identical(familyPlansFilter, _noChange) ? this.familyPlansFilter : familyPlansFilter as String?,
      notifyMatches: notifyMatches ?? this.notifyMatches,
      notifyMessages: notifyMessages ?? this.notifyMessages,
      notifyLikes: notifyLikes ?? this.notifyLikes,
      notifyFamily: notifyFamily ?? this.notifyFamily,
      notifyExpiry: notifyExpiry ?? this.notifyExpiry,
      notifySafety: notifySafety ?? this.notifySafety,
      notifyDailyPrompts: notifyDailyPrompts ?? this.notifyDailyPrompts,
      notifyNewFeatures: notifyNewFeatures ?? this.notifyNewFeatures,
      themeMode: themeMode ?? this.themeMode,
    );
  }
}

const _noChange = Object();

class SettingsNotifier extends StateNotifier<SettingsState> {
  SettingsNotifier() : super(const SettingsState());

  void setDiscoveryEnabled(bool v) => state = state.copyWith(discoveryEnabled: v);
  void setIncognito(bool v) => state = state.copyWith(incognitoMode: v);
  void setShowFullName(bool v) => state = state.copyWith(showFullName: v);
  void setSnoozed(bool v) => state = state.copyWith(isSnoozed: v);

  void setAgeRange(int min, int max) => state = state.copyWith(ageMin: min, ageMax: max);
  void setHeightRange(int min, int max) => state = state.copyWith(heightMin: min, heightMax: max);
  void setDistance(int km) => state = state.copyWith(distanceKm: km);
  void setGenderPreference(String v) => state = state.copyWith(genderPreference: v);
  void setIntentFilter(String? v) => state = state.copyWith(intentFilter: v);
  void setVerifiedOnly(bool v) => state = state.copyWith(verifiedOnly: v);
  void setFluencyFilter(String? v) => state = state.copyWith(fluencyFilter: v);
  void setGenerationFilter(String? v) => state = state.copyWith(generationFilter: v);
  void setReligionFilter(String? v) => state = state.copyWith(religionFilter: v);
  void setGotraFilter(String? v) => state = state.copyWith(gotraFilter: v);
  void setDietaryFilter(String? v) => state = state.copyWith(dietaryFilter: v);
  void setEducationFilter(String? v) => state = state.copyWith(educationFilter: v);
  void setSmokingFilter(String? v) => state = state.copyWith(smokingFilter: v);
  void setDrinkingFilter(String? v) => state = state.copyWith(drinkingFilter: v);
  void setFamilyPlansFilter(String? v) => state = state.copyWith(familyPlansFilter: v);

  void setNotifyMatches(bool v) => state = state.copyWith(notifyMatches: v);
  void setNotifyMessages(bool v) => state = state.copyWith(notifyMessages: v);
  void setNotifyLikes(bool v) => state = state.copyWith(notifyLikes: v);
  void setNotifyFamily(bool v) => state = state.copyWith(notifyFamily: v);
  void setNotifyExpiry(bool v) => state = state.copyWith(notifyExpiry: v);
  void setNotifySafety(bool v) => state = state.copyWith(notifySafety: v);
  void setNotifyDailyPrompts(bool v) => state = state.copyWith(notifyDailyPrompts: v);
  void setNotifyNewFeatures(bool v) => state = state.copyWith(notifyNewFeatures: v);

  void setTheme(ThemeMode mode) => state = state.copyWith(themeMode: mode);

  void resetFilters() {
    state = state.copyWith(
      ageMin: 21,
      ageMax: 35,
      heightMin: 150,
      heightMax: 190,
      distanceKm: 100,
      intentFilter: null,
      fluencyFilter: null,
      generationFilter: null,
      religionFilter: null,
      gotraFilter: null,
      dietaryFilter: null,
      educationFilter: null,
      smokingFilter: null,
      drinkingFilter: null,
      familyPlansFilter: null,
      verifiedOnly: false,
    );
  }
}

final settingsProvider = StateNotifierProvider<SettingsNotifier, SettingsState>(
  (ref) => SettingsNotifier(),
);
