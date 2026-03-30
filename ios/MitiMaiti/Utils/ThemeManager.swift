import SwiftUI
import Combine

@MainActor
class ThemeManager: ObservableObject {
    static let shared = ThemeManager()

    private let key = "app_theme_preference"

    enum ThemePreference: String {
        case light, dark, system
    }

    @Published var preference: ThemePreference {
        didSet {
            UserDefaults.standard.set(preference.rawValue, forKey: key)
        }
    }

    /// nil means follow system; .light / .dark means force that scheme
    var colorScheme: ColorScheme? {
        switch preference {
        case .light: return .light
        case .dark: return .dark
        case .system: return nil
        }
    }

    init() {
        let stored = UserDefaults.standard.string(forKey: key) ?? "system"
        self.preference = ThemePreference(rawValue: stored) ?? .system
    }
}
