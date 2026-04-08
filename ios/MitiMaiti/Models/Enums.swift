import Foundation

enum Gender: String, Codable, CaseIterable, Identifiable {
    case man, woman, nonBinary = "non-binary"
    var id: String { rawValue }
    var display: String {
        switch self {
        case .man: return "Man"
        case .woman: return "Woman"
        case .nonBinary: return "Non-binary"
        }
    }
    var icon: String {
        switch self {
        case .man: return "figure.stand"
        case .woman: return "figure.stand.dress"
        case .nonBinary: return "figure.2"
        }
    }
}

enum ShowMe: String, Codable, CaseIterable, Identifiable {
    case men, women, everyone
    var id: String { rawValue }
    var display: String {
        switch self {
        case .men: return "Men"
        case .women: return "Women"
        case .everyone: return "Everyone"
        }
    }
}

enum Intent: String, Codable, CaseIterable, Identifiable {
    case casual, open, marriage
    var id: String { rawValue }
    var display: String {
        switch self {
        case .casual: return "Something Casual"
        case .open: return "Open to Anything"
        case .marriage: return "Marriage"
        }
    }
    var icon: String {
        switch self {
        case .casual: return "cup.and.saucer.fill"
        case .open: return "sparkles"
        case .marriage: return "heart.circle.fill"
        }
    }
    var color: String {
        switch self {
        case .casual: return "blue"
        case .open: return "purple"
        case .marriage: return "pink"
        }
    }
}

enum SindhiFluency: String, Codable, CaseIterable, Identifiable {
    case native, fluent, conversational, basic, learning, none
    var id: String { rawValue }
    var display: String { rawValue.capitalized }
}

enum FamilyValues: String, Codable, CaseIterable, Identifiable {
    case traditional, moderate, liberal
    var id: String { rawValue }
    var display: String { rawValue.capitalized }
}

enum FoodPreference: String, Codable, CaseIterable, Identifiable {
    case vegetarian, nonVegetarian = "non_vegetarian", vegan, jain, eggetarian
    var id: String { rawValue }
    var display: String {
        switch self {
        case .vegetarian: return "Vegetarian"
        case .nonVegetarian: return "Non-Vegetarian"
        case .vegan: return "Vegan"
        case .jain: return "Jain"
        case .eggetarian: return "Eggetarian"
        }
    }
}

enum CulturalBadge: String, Codable {
    case gold, green, orange, none
    var display: String {
        switch self {
        case .gold: return "Gold"
        case .green: return "Great"
        case .orange: return "Good"
        case .none: return ""
        }
    }
}

enum KundliTier: String, Codable {
    case excellent, good, challenging
    var display: String { rawValue.capitalized }
}

enum MessageType: String, Codable {
    case text, photo, voice, gif, icebreaker, system
}

enum MessageStatus: String, Codable {
    case sending, sent, delivered, read
}

enum MatchStatus: String, Codable {
    case pendingFirstMessage = "pending_first_message"
    case active, expired, unmatched, dissolved
}

enum ActionType: String, Codable {
    case like, pass
}

enum FamilyMemberStatus: String, Codable {
    case pending, active, revoked
}

enum AppRoute: Hashable {
    case welcome
    case phoneAuth
    case otpVerification(phone: String)
    case onboarding
    case main
    case chat(matchId: String)
    case editProfile
    case settings
    case family
}

enum OnboardingStep: Int, CaseIterable {
    case name = 0
    case birthday
    case gender
    case photos
    case intent
    case showMe
    case location
    case ready

    var title: String {
        switch self {
        case .name: return "What's your full name?"
        case .birthday: return "When's your birthday?"
        case .gender: return "I am a..."
        case .photos: return "Add your best photos"
        case .intent: return "I'm looking for..."
        case .showMe: return "Show me..."
        case .location: return "Where are you?"
        case .ready: return "You're all set!"
        }
    }

    var subtitle: String {
        switch self {
        case .name: return "This is how it appears on your profile."
        case .birthday: return "Your age will be shown, not your birthday"
        case .gender: return "Choose how you identify"
        case .photos: return "Profiles with 3+ photos get 4x more matches"
        case .intent: return "What brings you to MitiMaiti?"
        case .showMe: return "Who would you like to meet?"
        case .location: return "Find matches near you"
        case .ready: return "Welcome to the Sindhi community!"
        }
    }
}
