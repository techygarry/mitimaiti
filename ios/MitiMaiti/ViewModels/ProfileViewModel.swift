import SwiftUI

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User = MockData.currentUser
    @Published var isLoading = false
    @Published var error: String?
    @Published var isSaving = false
    @Published var saveSuccess = false

    // Edit fields
    @Published var editBio = ""
    @Published var editHeight = ""
    @Published var editEducation = ""
    @Published var editOccupation = ""
    @Published var editCompany = ""
    @Published var editReligion = ""
    @Published var editSmoking = ""
    @Published var editDrinking = ""
    @Published var editExercise = ""
    @Published var editFluency: SindhiFluency = .fluent
    @Published var editFamilyValues: FamilyValues = .moderate
    @Published var editFoodPreference: FoodPreference = .vegetarian

    private let api = APIService.shared

    var profileStats: [(String, String, String)] {
        [
            ("eye.fill", "47", "Views"),
            ("heart.fill", "12", "Likes"),
            ("person.2.fill", "5", "Matches")
        ]
    }

    func loadProfile() {
        isLoading = true
        Task {
            do {
                user = try await api.fetchProfile()
                populateEditFields()
                isLoading = false
            } catch {
                self.error = error.localizedDescription
                isLoading = false
            }
        }
    }

    func populateEditFields() {
        editBio = user.bio ?? ""
        editHeight = user.heightCm.map(String.init) ?? ""
        editEducation = user.education ?? ""
        editOccupation = user.occupation ?? ""
        editCompany = user.company ?? ""
        editReligion = user.religion ?? ""
        editSmoking = user.smoking ?? ""
        editDrinking = user.drinking ?? ""
        editExercise = user.exercise ?? ""
        editFluency = user.sindhiFluency ?? .fluent
        editFamilyValues = user.familyValues ?? .moderate
        editFoodPreference = user.foodPreference ?? .vegetarian
    }

    func saveProfile() {
        isSaving = true
        Task {
            do {
                _ = try await api.updateProfile([:])
                isSaving = false
                saveSuccess = true

                try? await Task.sleep(nanoseconds: 2_000_000_000)
                saveSuccess = false
            } catch {
                self.error = error.localizedDescription
                isSaving = false
            }
        }
    }
}
