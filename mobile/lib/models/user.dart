class Photo {
  final String id;
  final String url;
  final int order;
  final bool isVerified;

  const Photo({
    required this.id,
    required this.url,
    required this.order,
    this.isVerified = false,
  });

  factory Photo.fromJson(Map<String, dynamic> json) {
    return Photo(
      id: json['id'] as String,
      url: json['url'] as String,
      order: json['order'] as int? ?? 0,
      isVerified: json['is_verified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'url': url,
    'order': order,
    'is_verified': isVerified,
  };
}

class Prompt {
  final String question;
  final String answer;

  const Prompt({required this.question, required this.answer});

  factory Prompt.fromJson(Map<String, dynamic> json) {
    return Prompt(
      question: json['question'] as String,
      answer: json['answer'] as String,
    );
  }

  Map<String, dynamic> toJson() => {'question': question, 'answer': answer};
}

class User {
  final String id;
  final String phone;
  final String? firstName;
  final String? lastName;
  final DateTime? birthday;
  final String? gender;
  final List<Photo> photos;
  final String? bio;
  final List<Prompt> prompts;
  final String? intent;
  final String? showMe;
  final String? city;
  final double? latitude;
  final double? longitude;
  final int? heightCm;
  final String? education;
  final String? occupation;
  final String? company;
  final String? religion;
  final String? community;
  final String? motherTongue;
  final String? gotra;
  final String? nakshatra;
  final String? manglikStatus;
  final String? dietPreference;
  final String? drinkPreference;
  final String? smokePreference;
  final String? exerciseFrequency;
  final String? sleepSchedule;
  final String? socialStyle;
  final String? communicationStyle;
  final String? loveLanguage;
  final List<String> interests;
  final List<String> languages;
  final bool isVerified;
  final bool isActive;
  final int profileCompletion;
  final DateTime? createdAt;
  final DateTime? lastActive;

  const User({
    required this.id,
    required this.phone,
    this.firstName,
    this.lastName,
    this.birthday,
    this.gender,
    this.photos = const [],
    this.bio,
    this.prompts = const [],
    this.intent,
    this.showMe,
    this.city,
    this.latitude,
    this.longitude,
    this.heightCm,
    this.education,
    this.occupation,
    this.company,
    this.religion,
    this.community,
    this.motherTongue,
    this.gotra,
    this.nakshatra,
    this.manglikStatus,
    this.dietPreference,
    this.drinkPreference,
    this.smokePreference,
    this.exerciseFrequency,
    this.sleepSchedule,
    this.socialStyle,
    this.communicationStyle,
    this.loveLanguage,
    this.interests = const [],
    this.languages = const [],
    this.isVerified = false,
    this.isActive = true,
    this.profileCompletion = 0,
    this.createdAt,
    this.lastActive,
  });

  String get displayName => firstName ?? 'User';

  int? get age {
    if (birthday == null) return null;
    final now = DateTime.now();
    int age = now.year - birthday!.year;
    if (now.month < birthday!.month ||
        (now.month == birthday!.month && now.day < birthday!.day)) {
      age--;
    }
    return age;
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      phone: json['phone'] as String? ?? '',
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      birthday: json['birthday'] != null
          ? DateTime.tryParse(json['birthday'] as String)
          : null,
      gender: json['gender'] as String?,
      photos: (json['photos'] as List<dynamic>?)
              ?.map((p) => Photo.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      bio: json['bio'] as String?,
      prompts: (json['prompts'] as List<dynamic>?)
              ?.map((p) => Prompt.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      intent: json['intent'] as String?,
      showMe: json['show_me'] as String?,
      city: json['city'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      heightCm: json['height_cm'] as int?,
      education: json['education'] as String?,
      occupation: json['occupation'] as String?,
      company: json['company'] as String?,
      religion: json['religion'] as String?,
      community: json['community'] as String?,
      motherTongue: json['mother_tongue'] as String?,
      gotra: json['gotra'] as String?,
      nakshatra: json['nakshatra'] as String?,
      manglikStatus: json['manglik_status'] as String?,
      dietPreference: json['diet_preference'] as String?,
      drinkPreference: json['drink_preference'] as String?,
      smokePreference: json['smoke_preference'] as String?,
      exerciseFrequency: json['exercise_frequency'] as String?,
      sleepSchedule: json['sleep_schedule'] as String?,
      socialStyle: json['social_style'] as String?,
      communicationStyle: json['communication_style'] as String?,
      loveLanguage: json['love_language'] as String?,
      interests: (json['interests'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      languages: (json['languages'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isVerified: json['is_verified'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? true,
      profileCompletion: json['profile_completion'] as int? ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
      lastActive: json['last_active'] != null
          ? DateTime.tryParse(json['last_active'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'phone': phone,
    'first_name': firstName,
    'last_name': lastName,
    'birthday': birthday?.toIso8601String(),
    'gender': gender,
    'photos': photos.map((p) => p.toJson()).toList(),
    'bio': bio,
    'prompts': prompts.map((p) => p.toJson()).toList(),
    'intent': intent,
    'show_me': showMe,
    'city': city,
    'latitude': latitude,
    'longitude': longitude,
    'height_cm': heightCm,
    'education': education,
    'occupation': occupation,
    'company': company,
    'religion': religion,
    'community': community,
    'mother_tongue': motherTongue,
    'gotra': gotra,
    'nakshatra': nakshatra,
    'manglik_status': manglikStatus,
    'diet_preference': dietPreference,
    'drink_preference': drinkPreference,
    'smoke_preference': smokePreference,
    'exercise_frequency': exerciseFrequency,
    'sleep_schedule': sleepSchedule,
    'social_style': socialStyle,
    'communication_style': communicationStyle,
    'love_language': loveLanguage,
    'interests': interests,
    'languages': languages,
    'is_verified': isVerified,
    'is_active': isActive,
    'profile_completion': profileCompletion,
  };

  User copyWith({
    String? id,
    String? phone,
    String? firstName,
    String? lastName,
    DateTime? birthday,
    String? gender,
    List<Photo>? photos,
    String? bio,
    List<Prompt>? prompts,
    String? intent,
    String? showMe,
    String? city,
    double? latitude,
    double? longitude,
    int? heightCm,
    String? education,
    String? occupation,
    String? company,
    String? religion,
    String? community,
    String? motherTongue,
    String? gotra,
    String? nakshatra,
    String? manglikStatus,
    String? dietPreference,
    String? drinkPreference,
    String? smokePreference,
    String? exerciseFrequency,
    String? sleepSchedule,
    String? socialStyle,
    String? communicationStyle,
    String? loveLanguage,
    List<String>? interests,
    List<String>? languages,
    bool? isVerified,
    bool? isActive,
    int? profileCompletion,
    DateTime? createdAt,
    DateTime? lastActive,
  }) {
    return User(
      id: id ?? this.id,
      phone: phone ?? this.phone,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      birthday: birthday ?? this.birthday,
      gender: gender ?? this.gender,
      photos: photos ?? this.photos,
      bio: bio ?? this.bio,
      prompts: prompts ?? this.prompts,
      intent: intent ?? this.intent,
      showMe: showMe ?? this.showMe,
      city: city ?? this.city,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      heightCm: heightCm ?? this.heightCm,
      education: education ?? this.education,
      occupation: occupation ?? this.occupation,
      company: company ?? this.company,
      religion: religion ?? this.religion,
      community: community ?? this.community,
      motherTongue: motherTongue ?? this.motherTongue,
      gotra: gotra ?? this.gotra,
      nakshatra: nakshatra ?? this.nakshatra,
      manglikStatus: manglikStatus ?? this.manglikStatus,
      dietPreference: dietPreference ?? this.dietPreference,
      drinkPreference: drinkPreference ?? this.drinkPreference,
      smokePreference: smokePreference ?? this.smokePreference,
      exerciseFrequency: exerciseFrequency ?? this.exerciseFrequency,
      sleepSchedule: sleepSchedule ?? this.sleepSchedule,
      socialStyle: socialStyle ?? this.socialStyle,
      communicationStyle: communicationStyle ?? this.communicationStyle,
      loveLanguage: loveLanguage ?? this.loveLanguage,
      interests: interests ?? this.interests,
      languages: languages ?? this.languages,
      isVerified: isVerified ?? this.isVerified,
      isActive: isActive ?? this.isActive,
      profileCompletion: profileCompletion ?? this.profileCompletion,
      createdAt: createdAt ?? this.createdAt,
      lastActive: lastActive ?? this.lastActive,
    );
  }
}

class FeedCard {
  final User user;
  final int culturalScore;
  final int kundliScore;
  final int commonInterests;
  final double distanceKm;

  const FeedCard({
    required this.user,
    required this.culturalScore,
    required this.kundliScore,
    required this.commonInterests,
    required this.distanceKm,
  });

  String get culturalBadge {
    if (culturalScore >= 80) return 'Excellent';
    if (culturalScore >= 60) return 'Good';
    if (culturalScore >= 40) return 'Fair';
    return 'Low';
  }

  String get kundliTier {
    if (kundliScore >= 28) return 'Excellent';
    if (kundliScore >= 21) return 'Very Good';
    if (kundliScore >= 14) return 'Good';
    return 'Average';
  }

  factory FeedCard.fromJson(Map<String, dynamic> json) {
    return FeedCard(
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      culturalScore: json['cultural_score'] as int? ?? 0,
      kundliScore: json['kundli_score'] as int? ?? 0,
      commonInterests: json['common_interests'] as int? ?? 0,
      distanceKm: (json['distance_km'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'user': user.toJson(),
    'cultural_score': culturalScore,
    'kundli_score': kundliScore,
    'common_interests': commonInterests,
    'distance_km': distanceKm,
  };
}
