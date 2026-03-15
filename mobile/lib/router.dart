import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'models/user.dart';
import 'screens/splash_screen.dart';
import 'screens/welcome_screen.dart';
import 'screens/auth/phone_screen.dart';
import 'screens/auth/otp_screen.dart';
import 'screens/onboarding/name_screen.dart';
import 'screens/onboarding/birthday_screen.dart';
import 'screens/onboarding/gender_screen.dart';
import 'screens/onboarding/photos_screen.dart';
import 'screens/onboarding/intent_screen.dart';
import 'screens/onboarding/show_me_screen.dart';
import 'screens/onboarding/location_screen.dart';
import 'screens/onboarding/ready_screen.dart';
import 'screens/main/main_shell.dart';
import 'screens/discover/discover_screen.dart';
import 'screens/inbox/inbox_screen.dart';
import 'screens/family/family_screen.dart';
import 'screens/profile/my_profile_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/profile/other_profile_screen.dart';
import 'screens/chat/chat_screen.dart';
import 'screens/settings/settings_screen.dart';
import 'screens/safety/account_health_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/welcome', builder: (_, __) => const WelcomeScreen()),
      GoRoute(path: '/auth/phone', builder: (_, __) => const PhoneScreen()),
      GoRoute(path: '/auth/otp', builder: (_, state) {
        final phone = state.extra as String? ?? '';
        return OtpScreen(phone: phone);
      }),
      // Onboarding
      GoRoute(path: '/onboarding/name', builder: (_, __) => const NameScreen()),
      GoRoute(path: '/onboarding/birthday', builder: (_, __) => const BirthdayScreen()),
      GoRoute(path: '/onboarding/gender', builder: (_, __) => const GenderScreen()),
      GoRoute(path: '/onboarding/photos', builder: (_, __) => const PhotosScreen()),
      GoRoute(path: '/onboarding/intent', builder: (_, __) => const IntentScreen()),
      GoRoute(path: '/onboarding/showme', builder: (_, __) => const ShowMeScreen()),
      GoRoute(path: '/onboarding/location', builder: (_, __) => const LocationScreen()),
      GoRoute(path: '/onboarding/ready', builder: (_, __) => const ReadyScreen()),
      // Main app with bottom nav
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (_, __, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/discover', builder: (_, __) => const DiscoverScreen()),
          GoRoute(path: '/inbox', builder: (_, __) => const InboxScreen()),
          GoRoute(path: '/family', builder: (_, __) => const FamilyScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const MyProfileScreen()),
        ],
      ),
      // Full-screen routes (outside bottom nav)
      GoRoute(path: '/chat/:matchId', builder: (_, state) {
        return ChatScreen(matchId: state.pathParameters['matchId']!);
      }),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      GoRoute(path: '/profile/edit', builder: (_, __) => const EditProfileScreen()),
      GoRoute(path: '/profile/other', builder: (_, state) {
        final user = state.extra as User;
        return OtherProfileScreen(user: user);
      }),
      GoRoute(path: '/account-health', builder: (_, __) => const AccountHealthScreen()),
    ],
  );
});
