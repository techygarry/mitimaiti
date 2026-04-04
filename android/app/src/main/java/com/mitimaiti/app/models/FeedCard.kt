package com.mitimaiti.app.models

import java.util.UUID

data class CulturalDimension(
    val name: String,
    val score: Int,
    val maxScore: Int = 100,
    val description: String = ""
)

data class CulturalScore(
    val overallScore: Int,
    val badge: CulturalBadge,
    val dimensions: List<CulturalDimension> = emptyList()
)

data class KundliGuna(
    val name: String,
    val obtained: Double,
    val maxPoints: Double,
    val description: String = ""
)

data class KundliScore(
    val totalScore: Double,
    val maxScore: Double = 36.0,
    val tier: KundliTier,
    val gunas: List<KundliGuna> = emptyList()
)

data class FeedCard(
    val id: String = UUID.randomUUID().toString(),
    val user: User,
    val culturalScore: CulturalScore,
    val kundliScore: KundliScore? = null,
    val commonInterests: Int = 0,
    val distanceKm: Double? = null,
    val isExplore: Boolean = false
)
