import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/api_config.dart';
import '../../models/user.dart';
import '../../providers/feed_provider.dart';
import '../../theme.dart';
import '../../widgets/discovery_card.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_shimmer.dart';
import 'score_breakdown_sheet.dart';
import 'filter_sheet.dart';

class DiscoverScreen extends ConsumerStatefulWidget {
  const DiscoverScreen({super.key});

  @override
  ConsumerState<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends ConsumerState<DiscoverScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    Future.microtask(() {
      ref.read(feedProvider.notifier).loadFeed();
    });
  }

  void _onScroll() {
    final state = ref.read(feedProvider);
    if (state.cards.length <= ApiConfig.prefetchThreshold && !state.isLoadingMore) {
      ref.read(feedProvider.notifier).loadMore();
    }
  }

  void _onLike(String userId) {
    final state = ref.read(feedProvider);
    if (!state.canLike) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('You\'ve used all 50 likes today. Come back tomorrow!'),
          backgroundColor: MitiMaitiTheme.charcoal,
        ),
      );
      return;
    }
    ref.read(feedProvider.notifier).likeUser(userId);
  }

  void _onPass(String userId) {
    ref.read(feedProvider.notifier).passUser(userId);
  }

  void _openFilters() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => const FilterSheet(),
    );
  }

  void _showCulturalBreakdown(FeedCard card) {
    showModalBottomSheet(
      context: context,
      builder: (_) => ScoreBreakdownSheet(
        type: ScoreBreakdownType.cultural,
        score: card.culturalScore,
      ),
    );
  }

  void _showKundliBreakdown(FeedCard card) {
    showModalBottomSheet(
      context: context,
      builder: (_) => ScoreBreakdownSheet(
        type: ScoreBreakdownType.kundli,
        score: card.kundliScore,
      ),
    );
  }

  void _showInterests(FeedCard card) {
    showModalBottomSheet(
      context: context,
      builder: (_) => ScoreBreakdownSheet(
        type: ScoreBreakdownType.interests,
        score: card.commonInterests,
        interests: card.user.interests,
      ),
    );
  }

  void _viewProfile(FeedCard card) {
    context.push('/profile/other', extra: card.user);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(feedProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'MitiMaiti',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: MitiMaitiTheme.rose,
            fontSize: 22,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Center(
              child: Semantics(
                label: '${state.likesRemaining} likes remaining today',
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: MitiMaitiTheme.rose.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${state.likesRemaining} likes',
                    style: const TextStyle(
                      color: MitiMaitiTheme.rose,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.tune),
            onPressed: _openFilters,
            tooltip: 'Filters',
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
            tooltip: 'Settings',
          ),
        ],
      ),
      body: _buildBody(state),
    );
  }

  Widget _buildBody(FeedState state) {
    if (state.isLoading && state.cards.isEmpty) {
      return ListView(
        padding: const EdgeInsets.only(bottom: 100),
        children: const [CardShimmer(), CardShimmer()],
      );
    }

    if (state.cards.isEmpty) {
      return EmptyState(
        icon: Icons.explore_off,
        title: 'No profiles nearby',
        message: 'Invite your Sindhi friends to join MitiMaiti!',
        actionLabel: 'Refresh',
        onAction: () => ref.read(feedProvider.notifier).loadFeed(),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.only(bottom: 100),
      itemCount: state.cards.length + (state.isLoadingMore ? 1 : 0),
      itemBuilder: (_, i) {
        if (i >= state.cards.length) {
          return const Padding(
            padding: EdgeInsets.all(32),
            child: Center(
              child: CircularProgressIndicator(
                color: MitiMaitiTheme.rose,
                strokeWidth: 2,
              ),
            ),
          );
        }

        final card = state.cards[i];
        return DiscoveryCard(
          card: card,
          onLike: () => _onLike(card.user.id),
          onPass: () => _onPass(card.user.id),
          onCulturalScoreTap: () => _showCulturalBreakdown(card),
          onKundliScoreTap: () => _showKundliBreakdown(card),
          onInterestsTap: () => _showInterests(card),
          onProfileTap: () => _viewProfile(card),
        );
      },
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}
