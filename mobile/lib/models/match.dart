import 'user.dart';

enum MatchStatus { pending, active, expired, unmatched }

class Match {
  final String id;
  final User otherUser;
  final MatchStatus status;
  final DateTime matchedAt;
  final DateTime expiresAt;
  final Message? lastMessage;
  final int unreadCount;
  final bool callsUnlocked;

  const Match({
    required this.id,
    required this.otherUser,
    required this.status,
    required this.matchedAt,
    required this.expiresAt,
    this.lastMessage,
    this.unreadCount = 0,
    this.callsUnlocked = false,
  });

  Duration get timeRemaining {
    final remaining = expiresAt.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }

  bool get isExpiringSoon => timeRemaining.inHours < 4;
  bool get isExpired => timeRemaining == Duration.zero;

  factory Match.fromJson(Map<String, dynamic> json) {
    return Match(
      id: json['id'] as String,
      otherUser: User.fromJson(json['other_user'] as Map<String, dynamic>),
      status: MatchStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => MatchStatus.pending,
      ),
      matchedAt: DateTime.parse(json['matched_at'] as String),
      expiresAt: DateTime.parse(json['expires_at'] as String),
      lastMessage: json['last_message'] != null
          ? Message.fromJson(json['last_message'] as Map<String, dynamic>)
          : null,
      unreadCount: json['unread_count'] as int? ?? 0,
      callsUnlocked: json['calls_unlocked'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'other_user': otherUser.toJson(),
    'status': status.name,
    'matched_at': matchedAt.toIso8601String(),
    'expires_at': expiresAt.toIso8601String(),
    'last_message': lastMessage?.toJson(),
    'unread_count': unreadCount,
    'calls_unlocked': callsUnlocked,
  };
}

enum MessageType { text, photo, voiceNote, icebreaker, system }

enum MessageStatus { sending, sent, delivered, read }

class Message {
  final String id;
  final String matchId;
  final String senderId;
  final MessageType type;
  final String content;
  final String? mediaUrl;
  final int? durationSeconds;
  final MessageStatus status;
  final DateTime createdAt;

  const Message({
    required this.id,
    required this.matchId,
    required this.senderId,
    required this.type,
    required this.content,
    this.mediaUrl,
    this.durationSeconds,
    this.status = MessageStatus.sent,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      matchId: json['match_id'] as String,
      senderId: json['sender_id'] as String,
      type: MessageType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => MessageType.text,
      ),
      content: json['content'] as String,
      mediaUrl: json['media_url'] as String?,
      durationSeconds: json['duration_seconds'] as int?,
      status: MessageStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => MessageStatus.sent,
      ),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'match_id': matchId,
    'sender_id': senderId,
    'type': type.name,
    'content': content,
    'media_url': mediaUrl,
    'duration_seconds': durationSeconds,
    'status': status.name,
    'created_at': createdAt.toIso8601String(),
  };
}

class LikedYouCard {
  final String id;
  final User user;
  final DateTime likedAt;
  final String? likedPrompt;
  final String? likedPhotoId;
  final String? comment;

  const LikedYouCard({
    required this.id,
    required this.user,
    required this.likedAt,
    this.likedPrompt,
    this.likedPhotoId,
    this.comment,
  });

  factory LikedYouCard.fromJson(Map<String, dynamic> json) {
    return LikedYouCard(
      id: json['id'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      likedAt: DateTime.parse(json['liked_at'] as String),
      likedPrompt: json['liked_prompt'] as String?,
      likedPhotoId: json['liked_photo_id'] as String?,
      comment: json['comment'] as String?,
    );
  }
}
