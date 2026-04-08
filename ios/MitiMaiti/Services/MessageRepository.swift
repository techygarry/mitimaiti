import Foundation

/// Singleton in-memory cache that survives ChatViewModel recreation.
/// Keeps message arrays keyed by match ID so navigating back and
/// returning to the same chat does not require a fresh API fetch.
final class MessageRepository {
    static let shared = MessageRepository()
    private init() {}

    private var messages: [String: [Message]] = [:]

    func getMessages(matchId: String) -> [Message] {
        messages[matchId] ?? []
    }

    func setMessages(matchId: String, msgs: [Message]) {
        messages[matchId] = msgs
    }

    func addMessage(matchId: String, message: Message) {
        messages[matchId, default: []].append(message)
    }

    func hasMessages(matchId: String) -> Bool {
        !(messages[matchId]?.isEmpty ?? true)
    }
}
