import Foundation

struct CulturalDimension: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let description: String
    let score: Int
    let maxScore: Int

    var percentage: Double {
        guard maxScore > 0 else { return 0 }
        return Double(score) / Double(maxScore) * 100
    }

    init(id: String = UUID().uuidString, name: String, description: String, score: Int, maxScore: Int) {
        self.id = id
        self.name = name
        self.description = description
        self.score = score
        self.maxScore = maxScore
    }
}

struct CulturalScore: Codable, Hashable {
    let overallScore: Int
    let badge: CulturalBadge
    let dimensions: [CulturalDimension]
}

struct KundliGuna: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let description: String
    let score: Int
    let maxScore: Int

    init(id: String = UUID().uuidString, name: String, description: String, score: Int, maxScore: Int) {
        self.id = id
        self.name = name
        self.description = description
        self.score = score
        self.maxScore = maxScore
    }
}

struct KundliScore: Codable, Hashable {
    let totalScore: Int
    let maxScore: Int
    let tier: KundliTier
    let gunas: [KundliGuna]

    init(totalScore: Int, maxScore: Int = 36, tier: KundliTier, gunas: [KundliGuna]) {
        self.totalScore = totalScore
        self.maxScore = maxScore
        self.tier = tier
        self.gunas = gunas
    }
}

struct FeedCard: Identifiable, Codable, Hashable {
    let id: String
    let user: User
    let culturalScore: CulturalScore
    let kundliScore: KundliScore?
    let commonInterests: Int
    let distanceKm: Double?
    var isExplore: Bool

    init(
        id: String = UUID().uuidString,
        user: User,
        culturalScore: CulturalScore,
        kundliScore: KundliScore? = nil,
        commonInterests: Int = 0,
        distanceKm: Double? = nil,
        isExplore: Bool = false
    ) {
        self.id = id
        self.user = user
        self.culturalScore = culturalScore
        self.kundliScore = kundliScore
        self.commonInterests = commonInterests
        self.distanceKm = distanceKm
        self.isExplore = isExplore
    }
}
