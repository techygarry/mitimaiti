import Foundation

actor APIService {
    static let shared = APIService()
    private let baseURL = "https://api.mitimaiti.com/v1"
    private var accessToken: String?
    private var refreshToken: String?

    func setTokens(access: String, refresh: String) {
        self.accessToken = access
        self.refreshToken = refresh
    }

    func clearTokens() {
        self.accessToken = nil
        self.refreshToken = nil
    }

    // MARK: - Auth
    func sendOTP(phone: String) async throws -> Bool {
        // Mock: simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)
        return true
    }

    func verifyOTP(phone: String, code: String) async throws -> (accessToken: String, refreshToken: String, isNew: Bool) {
        try await Task.sleep(nanoseconds: 1_500_000_000)
        guard code == "123456" else {
            throw APIError.invalidOTP
        }
        let access = "mock-access-token-\(UUID().uuidString)"
        let refresh = "mock-refresh-token-\(UUID().uuidString)"
        await setTokens(access: access, refresh: refresh)
        return (access, refresh, true)
    }

    // MARK: - Profile
    func fetchProfile() async throws -> User {
        try await Task.sleep(nanoseconds: 800_000_000)
        return MockData.currentUser
    }

    func updateProfile(_ updates: [String: Any]) async throws -> User {
        try await Task.sleep(nanoseconds: 600_000_000)
        return MockData.currentUser
    }

    // MARK: - Feed
    func fetchFeed(cursor: String? = nil) async throws -> [FeedCard] {
        try await Task.sleep(nanoseconds: 1_000_000_000)
        return MockData.feedCards
    }

    // MARK: - Actions
    func performAction(targetId: String, type: ActionType) async throws -> (isMatch: Bool, matchId: String?) {
        try await Task.sleep(nanoseconds: 500_000_000)
        let isMatch = Double.random(in: 0...1) > 0.7
        return (isMatch, isMatch ? UUID().uuidString : nil)
    }

    func rewind() async throws -> String {
        try await Task.sleep(nanoseconds: 500_000_000)
        return UUID().uuidString
    }

    // MARK: - Inbox
    func fetchInbox() async throws -> (likes: [LikedYouCard], matches: [Match]) {
        try await Task.sleep(nanoseconds: 800_000_000)
        return (MockData.mockLikes, MockData.mockMatches)
    }

    // MARK: - Chat
    func fetchMessages(matchId: String, before: String? = nil) async throws -> [Message] {
        try await Task.sleep(nanoseconds: 600_000_000)
        let otherUserId = MockData.mockMatches.first(where: { $0.id == matchId })?.otherUser.id ?? "other"
        return MockData.mockMessages(matchId: matchId, otherUserId: otherUserId)
    }

    func sendMessage(matchId: String, content: String, type: MessageType = .text) async throws -> Message {
        try await Task.sleep(nanoseconds: 300_000_000)
        return Message(matchId: matchId, senderId: "current-user-id", content: content, msgType: type, status: .sent)
    }

    // MARK: - Family
    func fetchFamily() async throws -> (members: [FamilyMember], suggestions: [FamilySuggestion]) {
        try await Task.sleep(nanoseconds: 600_000_000)
        return (MockData.mockFamilyMembers, MockData.mockFamilySuggestions)
    }

    func generateInvite() async throws -> FamilyInvite {
        try await Task.sleep(nanoseconds: 500_000_000)
        return FamilyInvite()
    }

    // MARK: - Safety
    func reportUser(userId: String, reason: String, details: String?) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }

    func blockUser(userId: String) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }
}

// MARK: - API Errors
enum APIError: LocalizedError {
    case invalidOTP
    case networkError
    case unauthorized
    case rateLimited
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .invalidOTP: return "Invalid verification code. Please try again."
        case .networkError: return "Network error. Please check your connection."
        case .unauthorized: return "Session expired. Please log in again."
        case .rateLimited: return "Too many requests. Please wait a moment."
        case .serverError(let msg): return msg
        }
    }
}
