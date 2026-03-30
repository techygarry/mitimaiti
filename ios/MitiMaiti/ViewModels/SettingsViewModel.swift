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

    // Notifications - backed by NotificationManager.shared.settings
    var notifyMatches: Bool {
        get { NotificationManager.shared.settings.matches }
        set {
            NotificationManager.shared.settings.matches = newValue
            NotificationManager.shared.saveSettings()
            objectWillChange.send()
        }
    }
    var notifyMessages: Bool {
        get { NotificationManager.shared.settings.messages }
        set {
            NotificationManager.shared.settings.messages = newValue
            NotificationManager.shared.saveSettings()
            objectWillChange.send()
        }
    }
    var notifyLikes: Bool {
        get { NotificationManager.shared.settings.likes }
        set {
            NotificationManager.shared.settings.likes = newValue
            NotificationManager.shared.saveSettings()
            objectWillChange.send()
        }
    }
    var notifyFamily: Bool {
        get { NotificationManager.shared.settings.family }
        set {
            NotificationManager.shared.settings.family = newValue
            NotificationManager.shared.saveSettings()
            objectWillChange.send()
        }
    }
    var notifyExpiry: Bool {
        get { NotificationManager.shared.settings.expiry }
        set {
            NotificationManager.shared.settings.expiry = newValue
            NotificationManager.shared.saveSettings()
            objectWillChange.send()
        }
    }
    var notifyDailyPrompt: Bool {
        get { NotificationManager.shared.settings.dailyPrompt }
        set {
            NotificationManager.shared.settings.dailyPrompt = newValue
            NotificationManager.shared.saveSettings()
            objectWillChange.send()
        }
    }
    var notifyNewFeatures: Bool {
        get { NotificationManager.shared.settings.newFeatures }
        set {
            NotificationManager.shared.settings.newFeatures = newValue
            NotificationManager.shared.saveSettings()
            objectWillChange.send()
        }
    }
    var notifySafety: Bool {
        get { NotificationManager.shared.settings.safety }
        set {
            NotificationManager.shared.settings.safety = newValue
            NotificationManager.shared.saveSettings()
            objectWillChange.send()
        }
    }

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
