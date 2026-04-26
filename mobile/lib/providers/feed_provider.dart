import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class FeedState {
  final List<FeedCard> cards;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int dailyLikesUsed;
  final int dailyRewindsUsed;
  final Map<String, dynamic> filters;

  const FeedState({
    this.cards = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.dailyLikesUsed = 0,
    this.dailyRewindsUsed = 0,
    this.filters = const {},
  });

  bool get canLike => dailyLikesUsed < ApiConfig.maxDailyLikes;
  bool get canRewind => dailyRewindsUsed < ApiConfig.maxDailyRewinds;
  int get likesRemaining => ApiConfig.maxDailyLikes - dailyLikesUsed;
  int get rewindsRemaining => ApiConfig.maxDailyRewinds - dailyRewindsUsed;

  FeedState copyWith({
    List<FeedCard>? cards,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? dailyLikesUsed,
    int? dailyRewindsUsed,
    Map<String, dynamic>? filters,
  }) {
    return FeedState(
      cards: cards ?? this.cards,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      dailyLikesUsed: dailyLikesUsed ?? this.dailyLikesUsed,
      dailyRewindsUsed: dailyRewindsUsed ?? this.dailyRewindsUsed,
      filters: filters ?? this.filters,
    );
  }
}

class FeedNotifier extends StateNotifier<FeedState> {
  final StorageService _storage;
  final ApiService _api;
  String? _cursor;

  FeedNotifier(this._storage, this._api) : super(const FeedState());

  Future<void> loadFeed() async {
    state = state.copyWith(isLoading: true);
    try {
      final likesUsed = _storage.getDailyLikesUsed();
      final rewindsUsed = _storage.getDailyRewindsUsed();

      List<FeedCard> cards;
      if (ApiConfig.useMockData) {
        await Future.delayed(const Duration(seconds: 1));
        cards = _generateMockCards(20);
      } else {
        cards = await _fetchCards(cursor: null);
      }

      state = FeedState(
        cards: cards,
        dailyLikesUsed: likesUsed,
        dailyRewindsUsed: rewindsUsed,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Failed to load feed');
    }
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      List<FeedCard> moreCards;
      if (ApiConfig.useMockData) {
        await Future.delayed(const Duration(seconds: 1));
        moreCards = _generateMockCards(20);
      } else {
        moreCards = await _fetchCards(cursor: _cursor);
      }
      state = state.copyWith(
        cards: [...state.cards, ...moreCards],
        isLoadingMore: false,
      );
    } catch (_) {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  Future<List<FeedCard>> _fetchCards({String? cursor}) async {
    final response = await _api.get<Map<String, dynamic>>(
      ApiConfig.feed,
      queryParameters: {
        if (cursor != null) 'cursor': cursor,
        'limit': ApiConfig.defaultPageSize,
      },
    );
    final data = response.data?['data'] as Map<String, dynamic>?;
    final raw = (data?['cards'] as List?) ?? const [];
    _cursor = data?['nextCursor'] as String?;
    return raw
        .whereType<Map<String, dynamic>>()
        .map((j) => FeedCard.fromJson(j))
        .toList();
  }

  Future<bool> likeUser(String userId) async {
    if (!state.canLike) return false;
    await _storage.incrementDailyLikes();
    state = state.copyWith(
      cards: state.cards.where((c) => c.user.id != userId).toList(),
      dailyLikesUsed: state.dailyLikesUsed + 1,
    );

    if (!ApiConfig.useMockData) {
      try {
        await _api.post(ApiConfig.action, data: {'targetUserId': userId, 'type': 'like'});
      } catch (_) { /* leave card removed; backend will reconcile */ }
    }

    if (state.cards.length <= ApiConfig.prefetchThreshold) {
      loadMore();
    }
    return true;
  }

  Future<void> passUser(String userId) async {
    state = state.copyWith(
      cards: state.cards.where((c) => c.user.id != userId).toList(),
    );

    if (!ApiConfig.useMockData) {
      try {
        await _api.post(ApiConfig.action, data: {'targetUserId': userId, 'type': 'pass'});
      } catch (_) {}
    }

    if (state.cards.length <= ApiConfig.prefetchThreshold) {
      loadMore();
    }
  }

  Future<bool> rewind() async {
    if (!state.canRewind) return false;
    await _storage.incrementDailyRewinds();
    state = state.copyWith(
      dailyRewindsUsed: state.dailyRewindsUsed + 1,
    );

    if (!ApiConfig.useMockData) {
      try {
        await _api.post(ApiConfig.rewind);
      } catch (_) {}
    }
    return true;
  }

  void updateFilters(Map<String, dynamic> filters) {
    state = state.copyWith(filters: filters);
    loadFeed();
  }

  List<FeedCard> _generateMockCards(int count) {
    final showMe = _storage.getOnboardingField('showMe') as String? ?? 'everyone';

    final List<String> names;
    if (showMe == 'women') {
      names = [
        'Priya', 'Kavita', 'Meena', 'Sonal', 'Riya',
        'Nisha', 'Pooja', 'Anita', 'Deepa', 'Rekha',
      ];
    } else if (showMe == 'men') {
      names = [
        'Rahul', 'Arjun', 'Vikram', 'Sunil', 'Raj',
        'Amit', 'Nikhil', 'Karan', 'Rohan', 'Dev',
      ];
    } else {
      names = [
        'Priya', 'Kavita', 'Meena', 'Sonal', 'Riya',
        'Nisha', 'Pooja', 'Anita', 'Deepa', 'Rekha',
        'Rahul', 'Arjun', 'Vikram', 'Sunil', 'Raj',
        'Amit', 'Nikhil', 'Karan', 'Rohan', 'Dev',
      ];
    }
    final cities = [
      'Mumbai', 'Delhi', 'Pune', 'Ahmedabad', 'Bangalore',
      'Hyderabad', 'Jaipur', 'Udaipur', 'Jodhpur', 'Chennai',
    ];
    final intents = ['Relationship', 'Marriage', 'Friendship', 'Dating'];
    final interests = [
      'Cooking', 'Travel', 'Reading', 'Music', 'Yoga',
      'Dancing', 'Photography', 'Hiking', 'Movies', 'Art',
      'Cricket', 'Meditation', 'Gardening', 'Fitness', 'Writing',
    ];

    return List.generate(count, (i) {
      final nameIdx = (i + DateTime.now().millisecondsSinceEpoch) % names.length;
      final cityIdx = (i + 3) % cities.length;
      final age = 22 + (i % 15);
      final id = 'mock-${DateTime.now().millisecondsSinceEpoch}-$i';

      final userInterests = <String>[];
      for (var j = 0; j < 4 + (i % 4); j++) {
        final interest = interests[(i + j * 3) % interests.length];
        if (!userInterests.contains(interest)) userInterests.add(interest);
      }

      return FeedCard(
        user: User(
          id: id,
          phone: '+91900000000$i',
          firstName: names[nameIdx],
          birthday: DateTime.now().subtract(Duration(days: age * 365)),
          gender: showMe == 'women'
              ? 'Woman'
              : showMe == 'men'
                  ? 'Man'
                  : nameIdx < 10
                      ? 'Woman'
                      : 'Man',
          photos: List.generate(
            3 + (i % 3),
            (p) => Photo(
              id: '${id}_photo_$p',
              url: 'https://picsum.photos/400/600?random=${id}_$p',
              order: p,
            ),
          ),
          bio: _mockBios[i % _mockBios.length],
          prompts: [
            Prompt(
              question: _mockPromptQuestions[(i * 2) % _mockPromptQuestions.length],
              answer: _mockPromptAnswers[(i * 2) % _mockPromptAnswers.length],
            ),
            Prompt(
              question: _mockPromptQuestions[(i * 2 + 1) % _mockPromptQuestions.length],
              answer: _mockPromptAnswers[(i * 2 + 1) % _mockPromptAnswers.length],
            ),
          ],
          intent: intents[i % intents.length],
          city: cities[cityIdx],
          interests: userInterests,
          languages: const ['Sindhi', 'Hindi', 'English'],
          isVerified: i % 3 == 0,
          community: 'Sindhi',
          education: i % 2 == 0 ? 'Masters' : 'Bachelors',
          occupation: _mockOccupations[i % _mockOccupations.length],
        ),
        culturalScore: 40 + (i * 7) % 55,
        kundliScore: 10 + (i * 3) % 26,
        commonInterests: 1 + (i % 6),
        distanceKm: 2.0 + (i * 5.3) % 95,
      );
    });
  }

  static const _mockBios = [
    'Proud Sindhi who loves exploring our rich heritage and traditions.',
    'Looking for someone who values family as much as I do.',
    'Chai lover, book reader, and part-time chef specializing in Sindhi cuisine.',
    'Adventure seeker with a love for traditional values.',
    'Software engineer by day, classical dancer by night.',
    'Fitness enthusiast who never misses a Sunday family lunch.',
    'Passionate about preserving Sindhi culture in the modern world.',
    'Foodie who can make the perfect Sai Bhaji.',
    'Love long drives, good conversations, and Sindhi music.',
    'Simple person with big dreams and a bigger heart.',
  ];

  static const _mockPromptQuestions = [
    'My ideal weekend looks like',
    'A life goal of mine',
    'I am looking for',
    'My favorite tradition is',
    'The way to my heart is',
    'I geek out on',
    'My most controversial opinion is',
    'Together, we could',
  ];

  static const _mockPromptAnswers = [
    'Cooking Sindhi food with family, followed by a long drive by the sea.',
    'To visit all historical Sindhi heritage sites across India and Pakistan.',
    'Someone who respects traditions but also loves adventure.',
    'Cheti Chand celebrations with the whole family.',
    'Through good food, honest conversations, and shared laughter.',
    'Sindhi poetry and ancient scripts.',
    'Papad is better than pickle. Fight me.',
    'Travel the world while staying rooted in our culture.',
  ];

  static const _mockOccupations = [
    'Software Engineer',
    'Doctor',
    'Business Owner',
    'Teacher',
    'Designer',
    'Chartered Accountant',
    'Lawyer',
    'Marketing Manager',
    'Architect',
    'Data Scientist',
  ];
}

final feedProvider = StateNotifierProvider<FeedNotifier, FeedState>((ref) {
  final storage = ref.read(storageServiceProvider);
  final api = ref.read(apiServiceProvider);
  return FeedNotifier(storage, api);
});
