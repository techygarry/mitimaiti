class CulturalDimension {
  final String name;
  final String description;
  final int score;
  final int maxScore;

  const CulturalDimension({
    required this.name,
    required this.description,
    required this.score,
    required this.maxScore,
  });

  double get percentage => maxScore > 0 ? (score / maxScore) * 100 : 0;

  factory CulturalDimension.fromJson(Map<String, dynamic> json) {
    return CulturalDimension(
      name: json['name'] as String,
      description: json['description'] as String,
      score: json['score'] as int,
      maxScore: json['max_score'] as int,
    );
  }
}

class CulturalScore {
  final int overallScore;
  final List<CulturalDimension> dimensions;

  const CulturalScore({
    required this.overallScore,
    required this.dimensions,
  });

  String get badge {
    if (overallScore >= 80) return 'Excellent';
    if (overallScore >= 60) return 'Good';
    if (overallScore >= 40) return 'Fair';
    return 'Low';
  }

  factory CulturalScore.fromJson(Map<String, dynamic> json) {
    return CulturalScore(
      overallScore: json['overall_score'] as int,
      dimensions: (json['dimensions'] as List<dynamic>)
          .map((d) => CulturalDimension.fromJson(d as Map<String, dynamic>))
          .toList(),
    );
  }
}

class KundliGuna {
  final String name;
  final String description;
  final int score;
  final int maxScore;

  const KundliGuna({
    required this.name,
    required this.description,
    required this.score,
    required this.maxScore,
  });

  factory KundliGuna.fromJson(Map<String, dynamic> json) {
    return KundliGuna(
      name: json['name'] as String,
      description: json['description'] as String,
      score: json['score'] as int,
      maxScore: json['max_score'] as int,
    );
  }
}

class KundliScore {
  final int totalScore;
  final int maxScore;
  final List<KundliGuna> gunas;

  const KundliScore({
    required this.totalScore,
    this.maxScore = 36,
    required this.gunas,
  });

  String get tier {
    if (totalScore >= 28) return 'Excellent';
    if (totalScore >= 21) return 'Very Good';
    if (totalScore >= 14) return 'Good';
    return 'Average';
  }

  factory KundliScore.fromJson(Map<String, dynamic> json) {
    return KundliScore(
      totalScore: json['total_score'] as int,
      maxScore: json['max_score'] as int? ?? 36,
      gunas: (json['gunas'] as List<dynamic>)
          .map((g) => KundliGuna.fromJson(g as Map<String, dynamic>))
          .toList(),
    );
  }
}
