import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

enum AuthStatus { unknown, unauthenticated, authenticated, onboarding }

class AuthState {
  final AuthStatus status;
  final String? phone;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.status = AuthStatus.unknown,
    this.phone,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    AuthStatus? status,
    String? phone,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      phone: phone ?? this.phone,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final StorageService _storage;

  AuthNotifier(this._authService, this._storage) : super(const AuthState()) {
    _checkAuth();
  }

  void _checkAuth() {
    if (_authService.isAuthenticated) {
      if (_authService.hasCompletedOnboarding) {
        state = AuthState(
          status: AuthStatus.authenticated,
          phone: _authService.phone,
        );
      } else {
        state = AuthState(
          status: AuthStatus.onboarding,
          phone: _authService.phone,
        );
      }
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<bool> sendOtp(String phone) async {
    state = state.copyWith(isLoading: true, error: null);
    final success = await _authService.sendOtp(phone);
    if (success) {
      state = state.copyWith(isLoading: false, phone: phone);
    } else {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to send OTP. Please try again.',
      );
    }
    return success;
  }

  Future<bool> verifyOtp(String phone, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    final success = await _authService.verifyOtp(phone, otp);
    if (success) {
      if (_authService.hasCompletedOnboarding) {
        state = AuthState(
          status: AuthStatus.authenticated,
          phone: phone,
        );
      } else {
        state = AuthState(
          status: AuthStatus.onboarding,
          phone: phone,
        );
      }
    } else {
      state = state.copyWith(
        isLoading: false,
        error: 'Invalid OTP. Please try again.',
      );
    }
    return success;
  }

  Future<void> completeOnboarding() async {
    await _storage.setOnboardingCompleted();
    state = AuthState(
      status: AuthStatus.authenticated,
      phone: state.phone,
    );
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.read(authServiceProvider);
  final storage = ref.read(storageServiceProvider);
  return AuthNotifier(authService, storage);
});
