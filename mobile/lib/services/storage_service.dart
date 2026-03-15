import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

class StorageService {
  static const String _authBox = 'auth';
  static const String _onboardingBox = 'onboarding';
  static const String _settingsBox = 'settings';
  static const String _cacheBox = 'cache';
  static const String _limitsBox = 'limits';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(_authBox);
    await Hive.openBox(_onboardingBox);
    await Hive.openBox(_settingsBox);
    await Hive.openBox(_cacheBox);
    await Hive.openBox(_limitsBox);
  }

  // Auth tokens
  String? getAccessToken() => Hive.box(_authBox).get('access_token');
  String? getRefreshToken() => Hive.box(_authBox).get('refresh_token');

  Future<void> saveTokens(String accessToken, String refreshToken) async {
    final box = Hive.box(_authBox);
    await box.put('access_token', accessToken);
    await box.put('refresh_token', refreshToken);
  }

  Future<void> clearTokens() async {
    final box = Hive.box(_authBox);
    await box.delete('access_token');
    await box.delete('refresh_token');
    await box.delete('phone');
  }

  // Phone
  String? getPhone() => Hive.box(_authBox).get('phone');
  Future<void> savePhone(String phone) async {
    await Hive.box(_authBox).put('phone', phone);
  }

  // Onboarding
  bool hasCompletedOnboarding() =>
      Hive.box(_onboardingBox).get('completed', defaultValue: false) as bool;

  Future<void> setOnboardingCompleted() async {
    await Hive.box(_onboardingBox).put('completed', true);
  }

  Future<void> clearOnboarding() async {
    await Hive.box(_onboardingBox).clear();
  }

  int getOnboardingStep() =>
      Hive.box(_onboardingBox).get('step', defaultValue: 0) as int;

  Future<void> saveOnboardingStep(int step) async {
    await Hive.box(_onboardingBox).put('step', step);
  }

  // Onboarding field data (for resume mid-flow)
  Future<void> saveOnboardingField(String key, dynamic value) async {
    await Hive.box(_onboardingBox).put(key, value);
  }

  dynamic getOnboardingField(String key) =>
      Hive.box(_onboardingBox).get(key);

  // Settings
  Future<void> saveSetting(String key, dynamic value) async {
    await Hive.box(_settingsBox).put(key, value);
  }

  dynamic getSetting(String key, {dynamic defaultValue}) =>
      Hive.box(_settingsBox).get(key, defaultValue: defaultValue);

  // Cache
  Future<void> cacheData(String key, dynamic data) async {
    await Hive.box(_cacheBox).put(key, data);
    await Hive.box(_cacheBox).put('${key}_time', DateTime.now().toIso8601String());
  }

  dynamic getCachedData(String key) => Hive.box(_cacheBox).get(key);

  bool isCacheValid(String key, {Duration maxAge = const Duration(minutes: 5)}) {
    final timeStr = Hive.box(_cacheBox).get('${key}_time') as String?;
    if (timeStr == null) return false;
    final time = DateTime.tryParse(timeStr);
    if (time == null) return false;
    return DateTime.now().difference(time) < maxAge;
  }

  Future<void> clearCache() async {
    await Hive.box(_cacheBox).clear();
  }

  // Rate limits
  int getDailyLikesUsed() {
    final box = Hive.box(_limitsBox);
    final dateStr = box.get('likes_date') as String?;
    final today = DateTime.now().toIso8601String().substring(0, 10);
    if (dateStr != today) return 0;
    return box.get('likes_count', defaultValue: 0) as int;
  }

  Future<void> incrementDailyLikes() async {
    final box = Hive.box(_limitsBox);
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final dateStr = box.get('likes_date') as String?;
    if (dateStr != today) {
      await box.put('likes_date', today);
      await box.put('likes_count', 1);
    } else {
      final count = box.get('likes_count', defaultValue: 0) as int;
      await box.put('likes_count', count + 1);
    }
  }

  int getDailyRewindsUsed() {
    final box = Hive.box(_limitsBox);
    final dateStr = box.get('rewinds_date') as String?;
    final today = DateTime.now().toIso8601String().substring(0, 10);
    if (dateStr != today) return 0;
    return box.get('rewinds_count', defaultValue: 0) as int;
  }

  Future<void> incrementDailyRewinds() async {
    final box = Hive.box(_limitsBox);
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final dateStr = box.get('rewinds_date') as String?;
    if (dateStr != today) {
      await box.put('rewinds_date', today);
      await box.put('rewinds_count', 1);
    } else {
      final count = box.get('rewinds_count', defaultValue: 0) as int;
      await box.put('rewinds_count', count + 1);
    }
  }
}
