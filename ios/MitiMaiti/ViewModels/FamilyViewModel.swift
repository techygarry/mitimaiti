import SwiftUI

@MainActor
class FamilyViewModel: ObservableObject {
    @Published var members: [FamilyMember] = []
    @Published var suggestions: [FamilySuggestion] = []
    @Published var currentInvite: FamilyInvite?
    @Published var isLoading = false
    @Published var error: String?
    @Published var selectedTab = 0

    private let api = APIService.shared

    func loadFamily() {
        isLoading = true
        Task {
            do {
                let result = try await api.fetchFamily()
                members = result.members
                suggestions = result.suggestions
                isLoading = false
            } catch {
                self.error = error.localizedDescription
                isLoading = false
            }
        }
    }

    func generateInvite() {
        Task {
            do {
                currentInvite = try await api.generateInvite()
            } catch {
                self.error = error.localizedDescription
            }
        }
    }

    func updatePermission(memberId: String, keyPath: WritableKeyPath<FamilyPermissions, Bool>, value: Bool) {
        guard let idx = members.firstIndex(where: { $0.id == memberId }) else { return }
        members[idx].permissions[keyPath: keyPath] = value
    }

    func revokeMember(memberId: String) {
        guard let idx = members.firstIndex(where: { $0.id == memberId }) else { return }
        members[idx].status = .revoked
    }

    func likeSuggestion(id: String) {
        suggestions.removeAll { $0.id == id }
    }

    func passSuggestion(id: String) {
        suggestions.removeAll { $0.id == id }
    }
}
