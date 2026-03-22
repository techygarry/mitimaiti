import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math';
import '../models/family.dart';
import '../models/user.dart';

class FamilyState {
  final List<FamilyMember> members;
  final List<FamilySuggestion> suggestions;
  final FamilyInvite? currentInvite;
  final bool isLoading;
  final String? error;

  const FamilyState({
    this.members = const [],
    this.suggestions = const [],
    this.currentInvite,
    this.isLoading = false,
    this.error,
  });

  FamilyState copyWith({
    List<FamilyMember>? members,
    List<FamilySuggestion>? suggestions,
    FamilyInvite? currentInvite,
    bool? isLoading,
    String? error,
  }) {
    return FamilyState(
      members: members ?? this.members,
      suggestions: suggestions ?? this.suggestions,
      currentInvite: currentInvite ?? this.currentInvite,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class FamilyNotifier extends StateNotifier<FamilyState> {
  FamilyNotifier() : super(const FamilyState());

  Future<void> loadFamily() async {
    state = state.copyWith(isLoading: true);
    try {
      await Future.delayed(const Duration(seconds: 1));

      final mockMembers = [
        FamilyMember(
          id: 'fam-1',
          name: 'Maa',
          phone: '+919876543211',
          relationship: 'Mother',
          joinedAt: DateTime.now().subtract(const Duration(days: 30)),
          permissions: const FamilyPermissions(
            viewProfile: true,
            viewPhotos: true,
            viewMatches: true,
            suggestProfiles: true,
            viewActivity: false,
            viewScores: true,
            viewChat: false,
            receiveNotifications: true,
          ),
        ),
        FamilyMember(
          id: 'fam-2',
          name: 'Papa',
          phone: '+919876543212',
          relationship: 'Father',
          joinedAt: DateTime.now().subtract(const Duration(days: 25)),
          permissions: const FamilyPermissions(
            viewProfile: true,
            viewPhotos: true,
            viewMatches: false,
            suggestProfiles: true,
            viewActivity: false,
            viewScores: true,
            viewChat: false,
            receiveNotifications: false,
          ),
        ),
      ];

      final mockSuggestions = [
        FamilySuggestion(
          id: 'sug-1',
          suggestedBy: mockMembers[0],
          suggestedUser: User(
            id: 'suggested-1',
            phone: '+919876543220',
            firstName: 'Arjun',
            birthday: DateTime.now().subtract(const Duration(days: 9125)),
            gender: 'Man',
            photos: const [
              Photo(id: 'sug-photo-1', url: 'https://picsum.photos/400/600?random=sug1', order: 0),
            ],
            city: 'Mumbai',
            intent: 'Marriage',
            interests: const ['Business', 'Travel', 'Cricket'],
            community: 'Sindhi',
            occupation: 'Business Owner',
          ),
          note: 'He is from a very good family. His father knows your uncle.',
          suggestedAt: DateTime.now().subtract(const Duration(hours: 5)),
        ),
      ];

      state = FamilyState(
        members: mockMembers,
        suggestions: mockSuggestions,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Failed to load family');
    }
  }

  Future<FamilyInvite> generateInviteCode() async {
    await Future.delayed(const Duration(milliseconds: 500));
    final code = 'MM-${(Random().nextInt(9000) + 1000)}';
    final invite = FamilyInvite(
      code: code,
      expiresAt: DateTime.now().add(const Duration(days: 7)),
    );
    state = state.copyWith(currentInvite: invite);
    return invite;
  }

  Future<void> updatePermissions(
    String memberId,
    FamilyPermissions permissions,
  ) async {
    final updatedMembers = state.members.map((m) {
      if (m.id == memberId) {
        return FamilyMember(
          id: m.id,
          name: m.name,
          phone: m.phone,
          relationship: m.relationship,
          joinedAt: m.joinedAt,
          permissions: permissions,
        );
      }
      return m;
    }).toList();
    state = state.copyWith(members: updatedMembers);
  }

  Future<void> revokeMember(String memberId) async {
    state = state.copyWith(
      members: state.members.where((m) => m.id != memberId).toList(),
    );
  }

  Future<void> likeSuggestion(String suggestionId) async {
    state = state.copyWith(
      suggestions: state.suggestions.where((s) => s.id != suggestionId).toList(),
    );
  }

  Future<void> passSuggestion(String suggestionId) async {
    state = state.copyWith(
      suggestions: state.suggestions.where((s) => s.id != suggestionId).toList(),
    );
  }
}

final familyProvider = StateNotifierProvider<FamilyNotifier, FamilyState>((ref) {
  return FamilyNotifier();
});
