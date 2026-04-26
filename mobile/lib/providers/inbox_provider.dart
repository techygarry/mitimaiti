import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/api_config.dart';
import '../models/match.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class InboxState {
  final List<LikedYouCard> likedYou;
  final List<Match> matches;
  final bool isLoading;
  final String? error;

  const InboxState({
    this.likedYou = const [],
    this.matches = const [],
    this.isLoading = false,
    this.error,
  });

  int get totalLikedYou => likedYou.length;
  int get totalMatches => matches.length;
  int get unreadMessages =>
      matches.fold(0, (sum, m) => sum + m.unreadCount);

  InboxState copyWith({
    List<LikedYouCard>? likedYou,
    List<Match>? matches,
    bool? isLoading,
    String? error,
  }) {
    return InboxState(
      likedYou: likedYou ?? this.likedYou,
      matches: matches ?? this.matches,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class InboxNotifier extends StateNotifier<InboxState> {
  final ApiService _api;
  InboxNotifier(this._api) : super(const InboxState());

  Future<void> loadInbox() async {
    state = state.copyWith(isLoading: true);
    try {
      List<LikedYouCard> likedYou;
      List<Match> matches;
      if (ApiConfig.useMockData) {
        await Future.delayed(const Duration(seconds: 1));
        likedYou = _generateMockLikedYou();
        matches = _generateMockMatches();
      } else {
        final response = await _api.get<Map<String, dynamic>>(ApiConfig.inbox);
        final data = response.data?['data'] as Map<String, dynamic>?;
        likedYou = ((data?['likes'] as List?) ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(LikedYouCard.fromJson)
            .toList();
        matches = ((data?['matches'] as List?) ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(Match.fromJson)
            .toList();
      }
      state = InboxState(likedYou: likedYou, matches: matches);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Failed to load inbox');
    }
  }

  Future<void> likeBack(String likeId) async {
    final likedCard = state.likedYou.firstWhere((l) => l.id == likeId);
    final newMatch = Match(
      id: 'match-${DateTime.now().millisecondsSinceEpoch}',
      otherUser: likedCard.user,
      status: MatchStatus.pending,
      matchedAt: DateTime.now(),
      expiresAt: DateTime.now().add(const Duration(hours: 24)),
    );
    state = state.copyWith(
      likedYou: state.likedYou.where((l) => l.id != likeId).toList(),
      matches: [newMatch, ...state.matches],
    );
  }

  Future<void> passLike(String likeId) async {
    state = state.copyWith(
      likedYou: state.likedYou.where((l) => l.id != likeId).toList(),
    );
  }

  Future<void> unmatch(String matchId) async {
    state = state.copyWith(
      matches: state.matches.where((m) => m.id != matchId).toList(),
    );
  }

  List<LikedYouCard> _generateMockLikedYou() {
    final names = ['Ananya', 'Shreya', 'Diya', 'Neha', 'Simran', 'Komal', 'Varsha'];
    return List.generate(7, (i) {
      final id = 'like-$i';
      return LikedYouCard(
        id: id,
        user: User(
          id: 'liked-user-$i',
          phone: '+91800000000$i',
          firstName: names[i],
          birthday: DateTime.now().subtract(Duration(days: (23 + i) * 365)),
          gender: 'Woman',
          photos: [
            Photo(
              id: '${id}_photo',
              url: 'https://picsum.photos/400/600?random=liked_$i',
              order: 0,
            ),
          ],
          city: ['Mumbai', 'Pune', 'Delhi', 'Ahmedabad', 'Bangalore', 'Jaipur', 'Chennai'][i],
          intent: 'Relationship',
          interests: const ['Cooking', 'Travel', 'Music'],
          community: 'Sindhi',
        ),
        likedAt: DateTime.now().subtract(Duration(hours: i * 3)),
        comment: i % 2 == 0 ? 'Love your bio!' : null,
      );
    });
  }

  List<Match> _generateMockMatches() {
    final names = ['Meera', 'Tara', 'Sita', 'Gita', 'Radha'];
    return List.generate(5, (i) {
      final id = 'match-$i';
      final isNew = i < 2;
      return Match(
        id: id,
        otherUser: User(
          id: 'matched-user-$i',
          phone: '+91700000000$i',
          firstName: names[i],
          birthday: DateTime.now().subtract(Duration(days: (24 + i) * 365)),
          gender: 'Woman',
          photos: [
            Photo(
              id: '${id}_photo',
              url: 'https://picsum.photos/400/600?random=match_$i',
              order: 0,
            ),
          ],
          city: ['Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Bangalore'][i],
          intent: 'Relationship',
          community: 'Sindhi',
        ),
        status: isNew ? MatchStatus.pending : MatchStatus.active,
        matchedAt: DateTime.now().subtract(Duration(hours: i * 6)),
        expiresAt: DateTime.now().add(Duration(hours: 24 - (i * 6))),
        lastMessage: isNew
            ? null
            : Message(
                id: 'msg-$i',
                matchId: id,
                senderId: 'matched-user-$i',
                type: MessageType.text,
                content: [
                  'Hey! How are you?',
                  'Would love to chat more!',
                  'That sounds wonderful!',
                ][i % 3],
                createdAt: DateTime.now().subtract(Duration(minutes: i * 30)),
              ),
        unreadCount: isNew ? 0 : (i % 3),
        callsUnlocked: i > 2,
      );
    });
  }
}

final inboxProvider = StateNotifierProvider<InboxNotifier, InboxState>((ref) {
  return InboxNotifier(ref.read(apiServiceProvider));
});
