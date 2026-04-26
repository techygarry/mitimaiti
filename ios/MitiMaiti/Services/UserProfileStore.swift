import Foundation

/// Persists profile fields captured during onboarding so they survive
/// navigation between the OnboardingViewModel and ProfileViewModel
/// (which are separate @StateObject instances in their own subtrees).
final class UserProfileStore {
    static let shared = UserProfileStore()

    private let defaults = UserDefaults.standard
    private let firstNameKey = "user_first_name"

    private init() {}

    var firstName: String {
        get { defaults.string(forKey: firstNameKey) ?? "" }
        set {
            if newValue.isEmpty {
                defaults.removeObject(forKey: firstNameKey)
            } else {
                defaults.set(newValue, forKey: firstNameKey)
            }
        }
    }
}
