class ApiConfig {
  ApiConfig._();

  // Override at build time:
  //   flutter run --dart-define=API_BASE_URL=http://localhost:4000 \
  //               --dart-define=WS_URL=http://localhost:4001 \
  //               --dart-define=USE_MOCK_DATA=true
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.mitimaiti.com',
  );
  static const String wsUrl = String.fromEnvironment(
    'WS_URL',
    defaultValue: 'wss://api.mitimaiti.com',
  );
  static const bool useMockData = bool.fromEnvironment(
    'USE_MOCK_DATA',
    defaultValue: false,
  );

  // Auth — backend mounts at /v1/auth
  static const String sendOtp = '/v1/auth/login';
  static const String verifyOtp = '/v1/auth/verify';
  static const String refreshToken = '/v1/auth/refresh';
  static const String deleteOrLogout = '/v1/auth/delete';

  // Profile — backend mounts at /v1/me
  static const String profile = '/v1/me';
  static const String updateProfile = '/v1/me';
  static const String uploadPhoto = '/v1/me/media';
  static const String deletePhoto = '/v1/me/media'; // append /:id
  static const String requestSelfieVerification = '/v1/me/verify';
  static const String exportData = '/v1/me/export';
  static const String fcmToken = '/v1/me/fcm-token';

  // Discovery — backend mounts at /v1/feed
  static const String feed = '/v1/feed';
  static const String passport = '/v1/feed/passport';

  // Actions — backend mounts at /v1/action
  static const String action = '/v1/action'; // body: { targetUserId, type: 'like'|'pass' }
  static const String rewind = '/v1/action/rewind';
  static const String answerPrompt = '/v1/action/prompt';

  // Inbox — single endpoint returns both likes + matches
  static const String inbox = '/v1/inbox';

  // Chat paths intentionally omitted; managed elsewhere.

  // Family
  static const String familyInvite = '/v1/family/invite';
  static const String familyJoin = '/v1/family/join';
  static const String family = '/v1/family'; // GET members; PATCH /:id for permissions
  static const String familySuggest = '/v1/family/suggest';
  static const String familyFeed = '/v1/family/feed';
  static const String familySuggestions = '/v1/family/suggestions';

  // Safety
  static const String report = '/v1/safety/report';
  static const String block = '/v1/safety/block';
  static const String accountHealth = '/v1/safety/health';
  static const String safetyAppeal = '/v1/safety/appeal';

  // Pagination
  static const int defaultPageSize = 20;
  static const int prefetchThreshold = 15;

  // Rate limits
  static const int maxDailyLikes = 50;
  static const int maxDailyRewinds = 10;
  static const int maxOtpResends = 3;
  static const int otpCooldownSeconds = 30;
  static const int maxVoiceNoteSeconds = 60;
  static const Duration matchCountdown = Duration(hours: 24);
}
