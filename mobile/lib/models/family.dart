import 'user.dart';

class FamilyMember {
  final String id;
  final String name;
  final String phone;
  final String relationship;
  final DateTime joinedAt;
  final FamilyPermissions permissions;

  const FamilyMember({
    required this.id,
    required this.name,
    required this.phone,
    required this.relationship,
    required this.joinedAt,
    required this.permissions,
  });

  factory FamilyMember.fromJson(Map<String, dynamic> json) {
    return FamilyMember(
      id: json['id'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String,
      relationship: json['relationship'] as String,
      joinedAt: DateTime.parse(json['joined_at'] as String),
      permissions: FamilyPermissions.fromJson(
        json['permissions'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'relationship': relationship,
    'joined_at': joinedAt.toIso8601String(),
    'permissions': permissions.toJson(),
  };
}

class FamilyPermissions {
  final bool viewProfile;
  final bool viewPhotos;
  final bool viewMatches;
  final bool suggestProfiles;
  final bool viewActivity;
  final bool viewScores;
  final bool viewChat;
  final bool receiveNotifications;

  const FamilyPermissions({
    this.viewProfile = true,
    this.viewPhotos = true,
    this.viewMatches = false,
    this.suggestProfiles = true,
    this.viewActivity = false,
    this.viewScores = true,
    this.viewChat = false,
    this.receiveNotifications = false,
  });

  factory FamilyPermissions.fromJson(Map<String, dynamic> json) {
    return FamilyPermissions(
      viewProfile: json['view_profile'] as bool? ?? true,
      viewPhotos: json['view_photos'] as bool? ?? true,
      viewMatches: json['view_matches'] as bool? ?? false,
      suggestProfiles: json['suggest_profiles'] as bool? ?? true,
      viewActivity: json['view_activity'] as bool? ?? false,
      viewScores: json['view_scores'] as bool? ?? true,
      viewChat: json['view_chat'] as bool? ?? false,
      receiveNotifications: json['receive_notifications'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'view_profile': viewProfile,
    'view_photos': viewPhotos,
    'view_matches': viewMatches,
    'suggest_profiles': suggestProfiles,
    'view_activity': viewActivity,
    'view_scores': viewScores,
    'view_chat': viewChat,
    'receive_notifications': receiveNotifications,
  };

  FamilyPermissions copyWith({
    bool? viewProfile,
    bool? viewPhotos,
    bool? viewMatches,
    bool? suggestProfiles,
    bool? viewActivity,
    bool? viewScores,
    bool? viewChat,
    bool? receiveNotifications,
  }) {
    return FamilyPermissions(
      viewProfile: viewProfile ?? this.viewProfile,
      viewPhotos: viewPhotos ?? this.viewPhotos,
      viewMatches: viewMatches ?? this.viewMatches,
      suggestProfiles: suggestProfiles ?? this.suggestProfiles,
      viewActivity: viewActivity ?? this.viewActivity,
      viewScores: viewScores ?? this.viewScores,
      viewChat: viewChat ?? this.viewChat,
      receiveNotifications: receiveNotifications ?? this.receiveNotifications,
    );
  }
}

class FamilySuggestion {
  final String id;
  final FamilyMember suggestedBy;
  final User suggestedUser;
  final String? note;
  final DateTime suggestedAt;

  const FamilySuggestion({
    required this.id,
    required this.suggestedBy,
    required this.suggestedUser,
    this.note,
    required this.suggestedAt,
  });

  factory FamilySuggestion.fromJson(Map<String, dynamic> json) {
    return FamilySuggestion(
      id: json['id'] as String,
      suggestedBy: FamilyMember.fromJson(
        json['suggested_by'] as Map<String, dynamic>,
      ),
      suggestedUser: User.fromJson(
        json['suggested_user'] as Map<String, dynamic>,
      ),
      note: json['note'] as String?,
      suggestedAt: DateTime.parse(json['suggested_at'] as String),
    );
  }
}

class FamilyInvite {
  final String code;
  final DateTime expiresAt;

  const FamilyInvite({required this.code, required this.expiresAt});

  factory FamilyInvite.fromJson(Map<String, dynamic> json) {
    return FamilyInvite(
      code: json['code'] as String,
      expiresAt: DateTime.parse(json['expires_at'] as String),
    );
  }
}
