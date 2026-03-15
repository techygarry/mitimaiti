import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'theme.dart';
import 'router.dart';

/// Main MaterialApp with GoRouter configuration.
/// This is referenced from main.dart via the MitiMaitiApp widget.
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
