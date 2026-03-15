import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/inbox_provider.dart';
import '../../theme.dart';
import '../../widgets/loading_shimmer.dart';
import 'liked_you_tab.dart';
import 'matches_tab.dart';

class InboxScreen extends ConsumerStatefulWidget {
  const InboxScreen({super.key});

  @override
  ConsumerState<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends ConsumerState<InboxScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    Future.microtask(() {
      ref.read(inboxProvider.notifier).loadInbox();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(inboxProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inbox'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: MitiMaitiTheme.rose,
          labelColor: MitiMaitiTheme.rose,
          unselectedLabelColor: MitiMaitiTheme.textSecondary,
          labelStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          unselectedLabelStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w400),
          tabs: [
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Liked You'),
                  if (state.totalLikedYou > 0) ...[
                    const SizedBox(width: 6),
                    _Badge(count: state.totalLikedYou),
                  ],
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Matches'),
                  if (state.unreadMessages > 0) ...[
                    const SizedBox(width: 6),
                    _Badge(count: state.unreadMessages),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
      body: state.isLoading
          ? const ListShimmer(itemCount: 6)
          : TabBarView(
              controller: _tabController,
              children: const [
                LikedYouTab(),
                MatchesTab(),
              ],
            ),
    );
  }
}

class _Badge extends StatelessWidget {
  final int count;
  const _Badge({required this.count});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: MitiMaitiTheme.rose,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        count > 99 ? '99+' : '$count',
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }
}
