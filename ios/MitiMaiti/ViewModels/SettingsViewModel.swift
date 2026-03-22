import SwiftUI

@MainActor
class SettingsViewModel: ObservableObject {
    // Visibility
    @Published var discoveryEnabled = true
    @Published var incognitoMode = false
    @Published var showFullName = true
    @Published var isSnoozed = false

    // Discovery Filters
    @Published var ageMin: Double = 21
    @Published var ageMax: Double = 35
    @Published var heightMin: Double = 150
    @Published var heightMax: Double = 190
    @Published var genderPreference: ShowMe = .women
    @Published var intentFilter: Intent?
    @Published var religionFilter: String?
    @Published var dietaryFilter: FoodPreference?
    @Published var fluencyFilter: SindhiFluency?
    @Published var verifiedOnly = false

    // Notifications
    @Published var notifyMatches = true
    @Published var notifyMessages = true
    @Published var notifyLikes = true
    @Published var notifyFamily = true
    @Published var notifyExpiry = true
    @Published var notifyDailyPrompt = true
    @Published var notifyNewFeatures = false
    @Published var notifySafety = true

    // Appearance
    @Published var theme: AppearanceTheme = .auto

    // Account
    @Published var showDeleteConfirmation = false
    @Published var showLogoutConfirmation = false

    enum AppearanceTheme: String, CaseIterable, Identifiable {
        case light, dark, auto
        var id: String { rawValue }
        var display: String { rawValue.capitalized }
        var icon: String {
            switch self {
            case .light: return "sun.max.fill"
            case .dark: return "moon.fill"
            case .auto: return "circle.lefthalf.filled"
            }
        }
    }
}
