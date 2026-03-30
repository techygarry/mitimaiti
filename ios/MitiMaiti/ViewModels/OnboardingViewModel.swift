import SwiftUI
import PhotosUI

@MainActor
class OnboardingViewModel: ObservableObject {
    @Published var currentStep: OnboardingStep = .name
    @Published var firstName = ""
    @Published var isNonSindhi = false
    @Published var birthDay = 15
    @Published var birthMonth = 6
    @Published var birthYear = 1998
    @Published var selectedGender: Gender?
    @Published var selectedPhotos: [String] = []
    @Published var selectedImages: [UIImage] = []
    @Published var selectedIntent: Intent?
    @Published var selectedShowMe: ShowMe?
    @Published var selectedCity: String?
    @Published var isLoading = false
    @Published var error: String?

    var age: Int {
        let components = DateComponents(year: birthYear, month: birthMonth, day: birthDay)
        guard let dob = Calendar.current.date(from: components) else { return 0 }
        return Calendar.current.dateComponents([.year], from: dob, to: Date()).year ?? 0
    }

    var isAgeValid: Bool {
        age >= 18
    }

    var progress: Double {
        Double(currentStep.rawValue + 1) / Double(OnboardingStep.allCases.count)
    }

    var canProceed: Bool {
        switch currentStep {
        case .name: return firstName.count >= 2
        case .birthday: return isAgeValid
        case .gender: return selectedGender != nil
        case .photos: return selectedImages.count >= 1
        case .intent: return selectedIntent != nil
        case .showMe: return selectedShowMe != nil
        case .location: return selectedCity != nil
        case .ready: return true
        }
    }

    func nextStep() {
        guard canProceed else { return }
        if let next = OnboardingStep(rawValue: currentStep.rawValue + 1) {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                currentStep = next
            }
        }
    }

    func previousStep() {
        if let prev = OnboardingStep(rawValue: currentStep.rawValue - 1) {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                currentStep = prev
            }
        }
    }

    func addPhoto() {
        if selectedPhotos.count < 6 {
            selectedPhotos.append("photo_\(selectedPhotos.count + 1)")
        }
    }

    func addImage(_ image: UIImage) {
        guard selectedImages.count < 6 else { return }
        selectedImages.append(image)
        selectedPhotos.append("photo_\(selectedPhotos.count + 1)")
        // Save the first photo as the profile picture
        if selectedImages.count == 1 {
            UserImageStore.shared.save(image)
        }
    }

    func removePhoto(at index: Int) {
        guard index < selectedPhotos.count else { return }
        selectedPhotos.remove(at: index)
        if index < selectedImages.count {
            selectedImages.remove(at: index)
        }
    }
}
