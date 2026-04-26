import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class UserState {
  final User? user;
  final bool isLoading;
  final String? error;

  const UserState({this.user, this.isLoading = false, this.error});

  UserState copyWith({User? user, bool? isLoading, String? error}) {
    return UserState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class UserNotifier extends StateNotifier<UserState> {
  final StorageService _storage;
  final ApiService _api;

  UserNotifier(this._storage, this._api) : super(const UserState());

  Future<bool> uploadPhoto(String filePath) async {
    if (state.user == null) return false;
    if (ApiConfig.useMockData) {
      await Future.delayed(const Duration(milliseconds: 500));
      final order = state.user!.photos.length;
      final newPhoto = Photo(
        id: 'mock-${DateTime.now().millisecondsSinceEpoch}',
        url: 'https://i.pravatar.cc/600?u=${DateTime.now().millisecondsSinceEpoch}',
        order: order,
      );
      state = state.copyWith(user: state.user!.copyWith(photos: [...state.user!.photos, newPhoto]));
      return true;
    }
    try {
      final response = await _api.uploadFile<Map<String, dynamic>>('/v1/me/media', filePath);
      final media = (response.data?['data'] as Map<String, dynamic>?)?['media'] as Map<String, dynamic>?;
      if (media == null) return false;
      final photo = Photo(
        id: media['id'] as String,
        url: (media['url_original'] ?? media['url']) as String,
        order: media['sort_order'] as int? ?? state.user!.photos.length,
        isVerified: false,
      );
      state = state.copyWith(user: state.user!.copyWith(photos: [...state.user!.photos, photo]));
      return true;
    } catch (_) {
      state = state.copyWith(error: 'Photo upload failed');
      return false;
    }
  }

  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true);
    try {
      // Mock user data
      await Future.delayed(const Duration(milliseconds: 500));
      final user = User(
        id: 'mock-user-id',
        phone: _storage.getPhone() ?? '+919876543210',
        firstName: _storage.getOnboardingField('first_name') as String? ?? 'User',
        lastName: _storage.getOnboardingField('last_name') as String?,
        birthday: _storage.getOnboardingField('birthday') != null
            ? DateTime.tryParse(_storage.getOnboardingField('birthday') as String)
            : DateTime(1998, 5, 15),
        gender: _storage.getOnboardingField('gender') as String? ?? 'Woman',
        photos: [
          const Photo(id: '1', url: 'https://picsum.photos/400/600?random=1', order: 0),
          const Photo(id: '2', url: 'https://picsum.photos/400/600?random=2', order: 1),
        ],
        bio: 'Love exploring Sindhi culture and traditions',
        prompts: const [
          Prompt(question: 'My ideal weekend looks like', answer: 'Cooking Sindhi food with family, followed by a long drive'),
          Prompt(question: 'A life goal of mine', answer: 'To visit all the historical Sindhi heritage sites'),
        ],
        intent: _storage.getOnboardingField('intent') as String? ?? 'Relationship',
        showMe: _storage.getOnboardingField('show_me') as String? ?? 'Men',
        city: _storage.getOnboardingField('city') as String? ?? 'Mumbai',
        interests: const ['Cooking', 'Travel', 'Reading', 'Music', 'Yoga'],
        languages: const ['Sindhi', 'Hindi', 'English'],
        isVerified: true,
        profileCompletion: 75,
      );
      state = UserState(user: user);
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load profile',
      );
    }
  }

  Future<bool> answerDailyPrompt(String answer) async {
    if (ApiConfig.useMockData) {
      await Future.delayed(const Duration(milliseconds: 400));
      return true;
    }
    try {
      await _api.post('/v1/action/prompt', data: {'answer': answer});
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Register FCM device token with backend.
  ///
  /// To enable real push notifications:
  ///   1. Add `firebase_core` and `firebase_messaging` to pubspec.yaml.
  ///   2. Run `flutterfire configure` to generate firebase_options.dart.
  ///   3. After auth, call:
  ///        final token = await FirebaseMessaging.instance.getToken();
  ///        if (token != null) ref.read(userProvider.notifier).registerFcmToken(token);
  Future<bool> registerFcmToken(String token, {String platform = 'android'}) async {
    if (ApiConfig.useMockData) {
      await Future.delayed(const Duration(milliseconds: 200));
      return true;
    }
    try {
      await _api.post('/v1/me/fcm-token', data: {'token': token, 'platform': platform});
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> joinFamily(String code, String roleTag) async {
    if (ApiConfig.useMockData) {
      await Future.delayed(const Duration(milliseconds: 500));
      return true;
    }
    try {
      await _api.post('/v1/family/join', data: {'code': code, 'roleTag': roleTag});
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    if (state.user == null) return;
    state = state.copyWith(isLoading: true);
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      // Apply updates to current user
      final currentUser = state.user!;
      final updatedUser = currentUser.copyWith(
        firstName: updates['first_name'] as String? ?? currentUser.firstName,
        lastName: updates['last_name'] as String? ?? currentUser.lastName,
        bio: updates['bio'] as String? ?? currentUser.bio,
        city: updates['city'] as String? ?? currentUser.city,
        intent: updates['intent'] as String? ?? currentUser.intent,
      );
      state = UserState(user: updatedUser);
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to update profile',
      );
    }
  }
}

final userProvider = StateNotifierProvider<UserNotifier, UserState>((ref) {
  final storage = ref.read(storageServiceProvider);
  final api = ref.read(apiServiceProvider);
  return UserNotifier(storage, api);
});
