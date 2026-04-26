package com.mitimaiti.app.models

enum class Gender(val displayName: String, val emoji: String) {
    MAN("Man", "👨"),
    WOMAN("Woman", "👩"),
    NON_BINARY("Non-binary", "🧑")
}

enum class Intent(val displayName: String, val color: Long, val emoji: String, val description: String) {
    CASUAL("Something Casual", 0xFF4ECDC4, "☕", "Keep it light and see where things go"),
    SERIOUS("Something Serious", 0xFFB5336A, "🌹", "Ready for the real thing"),
    OPEN("Open to Anything", 0xFFFFBE0B, "✨", "Let fate decide, open to all possibilities"),
    MARRIAGE("Marriage", 0xFF8A1A4A, "💍", "Looking for a life partner")
}

enum class ShowMe(val displayName: String, val emoji: String) {
    MEN("Men", "👨"),
    WOMEN("Women", "👩"),
    EVERYONE("Everyone", "🌈")
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
