import 'package:flutter_riverpod/flutter_riverpod.dart';

final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

class NotificationService {
  // Firebase messaging setup - stubbed for now since Firebase config
  // requires google-services.json / GoogleService-Info.plist

  Future<void> init() async {
    // TODO: Initialize Firebase when config files are added
    // await Firebase.initializeApp();
    // final messaging = FirebaseMessaging.instance;
    //
    // final settings = await messaging.requestPermission(
    //   alert: true,
    //   badge: true,
    //   sound: true,
    // );
    //
    // if (settings.authorizationStatus == AuthorizationStatus.authorized) {
    //   final token = await messaging.getToken();
    //   if (token != null) {
    //     await _registerToken(token);
    //   }
    //
    //   messaging.onTokenRefresh.listen(_registerToken);
    // }
    //
    // FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    // FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageTap);
  }

  Future<String?> getToken() async {
    // return await FirebaseMessaging.instance.getToken();
    return null;
  }

  Future<void> requestPermission() async {
    // Already handled in init
  }

  // Future<void> _registerToken(String token) async {
  //   // Send token to backend
  //   await _api.post(ApiConfig.fcmToken, data: {'token': token});
  // }
  //
  // void _handleForegroundMessage(RemoteMessage message) {
  //   // Show local notification
  // }
  //
  // void _handleMessageTap(RemoteMessage message) {
  //   // Navigate to relevant screen
  // }
}
