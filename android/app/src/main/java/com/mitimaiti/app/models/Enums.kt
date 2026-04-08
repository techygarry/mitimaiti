package com.mitimaiti.app.models

enum class Gender(val displayName: String, val emoji: String) {
    MAN("Man", "\uD83D\uDC71\u200D\u2642\uFE0F"),
    WOMAN("Woman", "\uD83D\uDC71\u200D\u2640\uFE0F"),
    NON_BINARY("Non-binary", "\uD83E\uDDD1")
}

enum class Intent(val displayName: String, val color: Long, val emoji: String, val description: String) {
    CASUAL("Something Casual", 0xFF4ECDC4, "\uD83D\uDD2E", "Keep it light and see where things go"),
    OPEN("Open to Anything", 0xFFFFBE0B, "\u2728", "Let fate decide, open to all possibilities"),
    MARRIAGE("Marriage", 0xFFB5336A, "\uD83D\uDC8D", "Looking for a life partner")
}

enum class ShowMe(val displayName: String, val emoji: String) {
    MEN("Men", "\uD83D\uDC71\u200D\u2642\uFE0F"),
    WOMEN("Women", "\uD83D\uDC71\u200D\u2640\uFE0F"),
    EVERYONE("Everyone", "\uD83C\uDF08")
}

enum class SindhiFluency(val displayName: String) {
    NATIVE("Native"),
    FLUENT("Fluent"),
    CONVERSATIONAL("Conversational"),
    BASIC("Basic"),
    LEARNING("Learning"),
    NONE("None")
}

enum class FamilyValues(val displayName: String) {
    TRADITIONAL("Traditional"),
    MODERATE("Moderate"),
    LIBERAL("Liberal")
}

enum class FoodPreference(val displayName: String) {
    VEGETARIAN("Vegetarian"),
    NON_VEGETARIAN("Non-Vegetarian"),
    VEGAN("Vegan"),
    JAIN("Jain"),
    EGGETARIAN("Eggetarian")
}

enum class CulturalBadge(val displayName: String) {
    GOLD("Gold"),
    GREEN("Green"),
    ORANGE("Orange"),
    NONE("None")
}

enum class KundliTier(val displayName: String) {
    EXCELLENT("Excellent"),
    GOOD("Good"),
    CHALLENGING("Challenging")
}

enum class MessageType(val value: String) {
    TEXT("text"),
    PHOTO("photo"),
    VOICE("voice"),
    GIF("gif"),
    ICEBREAKER("icebreaker"),
    SYSTEM("system")
}

enum class MessageStatus(val value: String) {
    SENDING("sending"),
    SENT("sent"),
    DELIVERED("delivered"),
    READ("read")
}

enum class MatchStatus(val value: String) {
    PENDING_FIRST_MESSAGE("pending_first_message"),
    ACTIVE("active"),
    EXPIRED("expired"),
    UNMATCHED("unmatched"),
    DISSOLVED("dissolved")
}

enum class FamilyMemberStatus(val value: String) {
    PENDING("pending"),
    ACTIVE("active"),
    REVOKED("revoked")
}

enum class AppThemeMode(val displayName: String) {
    LIGHT("Light"),
    DARK("Dark"),
    SYSTEM("System")
}
