class ApiConfig {
  ApiConfig._();

  static const String baseUrl = 'https://api.mitimaiti.com';
  static const String wsUrl = 'wss://api.mitimaiti.com';

  // Auth
  static const String sendOtp = '/auth/otp/send';
  static const String verifyOtp = '/auth/otp/verify';
  static const String refreshToken = '/auth/token/refresh';

  // Profile
  static const String profile = '/users/me';
  static const String updateProfile = '/users/me';
  static const String uploadPhoto = '/users/me/photos';
  static const String reorderPhotos = '/users/me/photos/reorder';
  static const String deletePhoto = '/users/me/photos';

  // Discovery
  static const String feed = '/discovery/feed';
  static const String filters = '/discovery/filters';
  static const String like = '/discovery/like';
  static const String pass = '/discovery/pass';
  static const String rewind = '/discovery/rewind';

  // Scores
  static const String culturalScore = '/scores/cultural';
  static const String kundliScore = '/scores/kundli';

  // Inbox
  static const String likedYou = '/inbox/liked-you';
  static const String matches = '/inbox/matches';
  static const String unmatch = '/inbox/matches'; // DELETE

  // Chat
  static const String messages = '/chat/messages';
  static const String sendMessage = '/chat/messages';
  static const String markRead = '/chat/messages/read';

  // Family
  static const String familyInvite = '/family/invite';
  static const String familyMembers = '/family/members';
  static const String familyPermissions = '/family/permissions';
  static const String familySuggestions = '/family/suggestions';

  // Safety
  static const String report = '/safety/report';
  static const String block = '/safety/block';
  static const String accountHealth = '/safety/account-health';

  // Settings
  static const String settings = '/settings';
  static const String deleteAccount = '/settings/account';
  static const String exportData = '/settings/export';

  // Notifications
  static const String fcmToken = '/notifications/fcm-token';

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
