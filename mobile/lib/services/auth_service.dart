import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/api_config.dart';
import 'api_service.dart';
import 'storage_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  final api = ref.read(apiServiceProvider);
  final storage = ref.read(storageServiceProvider);
  return AuthService(api, storage);
});

class AuthService {
  final ApiService _api;
  final StorageService _storage;

  AuthService(this._api, this._storage);

  /// Send OTP to phone number
  Future<bool> sendOtp(String phone) async {
    if (ApiConfig.useMockData) {
      await Future.delayed(const Duration(seconds: 1));
      return true;
    }
    try {
      await _api.post(ApiConfig.sendOtp, data: {'phone': phone});
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Verify OTP and get tokens
  Future<bool> verifyOtp(String phone, String otp) async {
    if (ApiConfig.useMockData) {
      await Future.delayed(const Duration(seconds: 1));
      if (otp != '123456') return false;
      await _storage.saveTokens(
        'mock_access_token_${DateTime.now().millisecondsSinceEpoch}',
        'mock_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
      );
      await _storage.savePhone(phone);
      return true;
    }
    try {
      final response = await _api.post<Map<String, dynamic>>(
        ApiConfig.verifyOtp,
        data: {'phone': phone, 'token': otp},
      );
      final data = response.data?['data'] as Map<String, dynamic>?;
      final session = data?['session'] as Map<String, dynamic>?;
      if (session == null) return false;
      await _storage.saveTokens(
        session['accessToken'] as String,
        session['refreshToken'] as String,
      );
      await _storage.savePhone(phone);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Check if user is authenticated
  bool get isAuthenticated => _storage.getAccessToken() != null;

  /// Check if user has completed onboarding
  bool get hasCompletedOnboarding => _storage.hasCompletedOnboarding();

  /// Get stored phone number
  String? get phone => _storage.getPhone();

  /// Logout
  Future<void> logout() async {
    await _storage.clearTokens();
    await _storage.clearOnboarding();
  }
}
