import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_service.dart';
import 'storage_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  final api = ref.read(apiServiceProvider);
  final storage = ref.read(storageServiceProvider);
  return AuthService(api, storage);
});

class AuthService {
  // ignore: unused_field - will be used when real API is connected
  final ApiService _api;
  final StorageService _storage;

  AuthService(this._api, this._storage);

  /// Send OTP to phone number
  Future<bool> sendOtp(String phone) async {
    try {
      // Mock: always succeed for now
      await Future.delayed(const Duration(seconds: 1));
      // Real: await _api.post(ApiConfig.sendOtp, data: {'phone': phone});
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Verify OTP and get tokens
  Future<bool> verifyOtp(String phone, String otp) async {
    try {
      // Mock: accept 123456 as valid OTP
      await Future.delayed(const Duration(seconds: 1));

      if (otp == '123456') {
        // Mock tokens
        await _storage.saveTokens(
          'mock_access_token_${DateTime.now().millisecondsSinceEpoch}',
          'mock_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
        );
        await _storage.savePhone(phone);
        return true;
      }

      // Real API:
      // final response = await _api.post(
      //   ApiConfig.verifyOtp,
      //   data: {'phone': phone, 'otp': otp},
      // );
      // final data = response.data as Map<String, dynamic>;
      // await _storage.saveTokens(
      //   data['access_token'] as String,
      //   data['refresh_token'] as String,
      // );
      // await _storage.savePhone(phone);
      // return true;

      return false;
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
