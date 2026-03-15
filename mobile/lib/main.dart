import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'theme.dart';
import 'router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Status bar style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  // Init Hive for local storage
  await Hive.initFlutter();
  await Hive.openBox('auth');
  await Hive.openBox('onboarding');
  await Hive.openBox('cache');
  await Hive.openBox('settings');
  await Hive.openBox('limits');

  runApp(const ProviderScope(child: MitiMaitiApp()));
}

class MitiMaitiApp extends ConsumerWidget {
  const MitiMaitiApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'MitiMaiti',
      debugShowCheckedModeBanner: false,
      theme: MitiMaitiTheme.lightTheme,
      routerConfig: router,
    );
  }
}
