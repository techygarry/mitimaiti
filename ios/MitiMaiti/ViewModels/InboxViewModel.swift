import SwiftUI

@MainActor
class InboxViewModel: ObservableObject {
    @Published var likes: [LikedYouCard] = []
    @Published var matches: [Match] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    var totalLikes: Int { likes.count }
    var totalMatches: Int { matches.count }
    var unreadMessages: Int { matches.reduce(0) { $0 + $1.unreadCount } }

    func loadInbox() {
        guard !isLoading else { return }
        isLoading = true
        error = nil

        Task {
            do {
                let result = try await api.fetchInbox()
                likes = result.likes
                matches = result.matches
                isLoading = false
            } catch {
                self.error = error.localizedDescription
                isLoading = false
            }
        }
    }

    func likeBack(likeId: String) {
        guard let index = likes.firstIndex(where: { $0.id == likeId }) else { return }
        let like = likes.remove(at: index)

        let match = Match(
            otherUser: like.user,
            status: .pendingFirstMessage,
            matchedAt: Date(),
            expiresAt: Date().addingTimeInterval(86400),
            firstMsgLocked: true
        )
        matches.insert(match, at: 0)
    }

    func passLike(likeId: String) {
        likes.removeAll { $0.id == likeId }
    }

    func unmatch(matchId: String) {
        matches.removeAll { $0.id == matchId }
    }
}
