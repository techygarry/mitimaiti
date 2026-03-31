import SwiftUI
import Combine

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var messageText = ""
    @Published var isLoading = false
    @Published var isSending = false
    @Published var isOtherTyping = false
    @Published var match: Match?
    @Published var error: String?
    @Published var chatUnlocked = false

    private let api = APIService.shared
    private let currentUserId = "current-user-id"

    var hasMessages: Bool { !messages.isEmpty }

    // MARK: - Respect-First Lock State

    /// Whether the chat is in "locked" state:
    /// - The current user sent the first message
    /// - The other user has NOT replied yet
    /// - Current user CANNOT send another message until they reply
    var isLockedForMe: Bool {
        guard let match else { return false }
        // If match says locked AND I'm the one who sent first → I'm blocked
        return match.firstMsgLocked && match.firstMsgBy == currentUserId
    }

    /// Whether the other user needs to send the first message
    /// (match exists but nobody has messaged yet)
    var awaitingFirstMessage: Bool {
        guard let match else { return false }
        return !match.hasFirstMessage
    }

    /// Whether the countdown timer should show
    var showCountdown: Bool {
        match?.showCountdown ?? false
    }

    /// Dynamic banner message based on lock state
    var lockBannerMessage: (title: String, subtitle: String)? {
        guard let match else { return nil }

        if !match.hasFirstMessage {
            // No one has messaged yet
            return ("Send the first message!", "Break the ice before the timer runs out")
        }

        if match.firstMsgLocked && match.firstMsgBy == currentUserId {
            // I sent first, waiting for their reply
            return ("Waiting for reply...", "Your message has been sent. You can send another message once \(match.otherUser.displayName) replies.")
        }

        if match.firstMsgLocked && match.firstMsgBy != currentUserId {
            // They sent first, I need to reply
            return ("\(match.otherUser.displayName) sent the first message!", "Reply to keep the conversation going")
        }

        return nil
    }

    /// Whether the text input should be disabled
    var inputDisabled: Bool {
        isLockedForMe
    }

    /// Placeholder text for the input field
    var inputPlaceholder: String {
        if isLockedForMe {
            return "Waiting for \(match?.otherUser.displayName ?? "them") to reply..."
        }
        if awaitingFirstMessage {
            return "Send the first message..."
        }
        return "Type a message..."
    }

    // MARK: - Load Messages

    func loadMessages(for match: Match) {
        self.match = match
        isLoading = true

        Task {
            do {
                let msgs = try await api.fetchMessages(matchId: match.id)
                messages = msgs.sorted { $0.createdAt < $1.createdAt }
                isLoading = false

                // Check if the other user has already replied (unlock state)
                checkAndUnlockIfReplied()
            } catch {
                self.error = error.localizedDescription
                isLoading = false
            }
        }
    }

    // MARK: - Send Message

    func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, let matchId = match?.id else { return }

        // Respect-First enforcement: block if locked for me
        if isLockedForMe {
            error = "Please wait for \(match?.otherUser.displayName ?? "them") to reply to your first message."
            return
        }

        let tempMsg = Message(
            matchId: matchId,
            senderId: currentUserId,
            content: text,
            status: .sending
        )
        messages.append(tempMsg)
        messageText = ""
        isSending = true

        // If this is the first message in the match, engage the lock
        let isFirstMessage = !match!.hasFirstMessage

        Task {
            do {
                let sent = try await api.sendMessage(matchId: matchId, content: text)
                if let idx = messages.firstIndex(where: { $0.id == tempMsg.id }) {
                    messages[idx] = sent
                }
                isSending = false

                if isFirstMessage {
                    // Lock engaged: I sent first, now waiting for their reply
                    match?.firstMsgBy = currentUserId
                    match?.firstMsgLocked = true
                    match?.firstMsgAt = Date()
                }

                // In demo mode: simulate a reply from the other user
                simulateReply(matchId: matchId)
            } catch {
                self.error = error.localizedDescription
                isSending = false
            }
        }
    }

    func sendIcebreaker(_ question: String) {
        guard let matchId = match?.id else { return }

        // Icebreakers also count as first message
        if isLockedForMe {
            error = "Please wait for \(match?.otherUser.displayName ?? "them") to reply first."
            return
        }

        let isFirstMessage = !match!.hasFirstMessage

        let msg = Message(
            matchId: matchId,
            senderId: currentUserId,
            content: question,
            msgType: .icebreaker,
            status: .sending
        )
        messages.append(msg)

        Task {
            do {
                let sent = try await api.sendMessage(matchId: matchId, content: question, type: .icebreaker)
                if let idx = messages.firstIndex(where: { $0.id == msg.id }) {
                    messages[idx] = sent
                }

                if isFirstMessage {
                    match?.firstMsgBy = currentUserId
                    match?.firstMsgLocked = true
                    match?.firstMsgAt = Date()
                }

                simulateReply(matchId: matchId)
            } catch {
                self.error = error.localizedDescription
            }
        }
    }

    // MARK: - Receive Message (from other user)

    /// Called when a message arrives from the other user (via socket or simulation)
    func receiveMessage(_ message: Message) {
        messages.append(message)

        // Trigger a message notification
        if let match {
            NotificationManager.shared.addNotification(
                type: .message,
                title: "New message from \(match.otherUser.displayName)",
                body: message.content,
                actionData: match.id
            )
        }

        // If the match was locked and the other user just replied → UNLOCK
        if let match, match.firstMsgLocked {
            // The other user has replied — unlock the conversation
            self.match?.firstMsgLocked = false
            self.chatUnlocked = true

            // Match is now fully active, timer goes away
            self.match?.expiresAt = nil
        }
    }

    // MARK: - Check & Unlock

    /// After loading messages, check if the other user has already replied
    private func checkAndUnlockIfReplied() {
        guard let match, match.firstMsgLocked, match.firstMsgBy == currentUserId else { return }

        let otherUserId = match.otherUser.id
        let hasReply = messages.contains { $0.senderId == otherUserId }

        if hasReply {
            // Other user has already replied — unlock
            self.match?.firstMsgLocked = false
            self.chatUnlocked = true
            self.match?.expiresAt = nil
        }
    }

    // MARK: - Mark Messages As Read

    /// Marks all unread messages from the other user as "read"
    func markUnreadMessagesAsRead() {
        guard let match else { return }
        let otherUserId = match.otherUser.id
        for i in messages.indices {
            if messages[i].senderId == otherUserId &&
               (messages[i].status == .sent || messages[i].status == .delivered) {
                messages[i].status = .read
            }
        }
    }

    // MARK: - Simulate Reply (Demo Mode)

    private func simulateReply(matchId: String) {
        let otherUserId = match?.otherUser.id ?? "other"

        Task {
            // Show typing after 1-2 seconds
            try? await Task.sleep(nanoseconds: UInt64.random(in: 1_000_000_000...2_000_000_000))
            isOtherTyping = true

            // Send reply after 2-4 seconds
            try? await Task.sleep(nanoseconds: UInt64.random(in: 2_000_000_000...4_000_000_000))
            isOtherTyping = false

            let replies = [
                "That's so sweet! Tell me more about yourself",
                "Haha I love that! What else do you enjoy?",
                "Same here! We have so much in common",
                "That's really interesting. I'd love to hear more!",
                "You seem like such a great person!",
                "I was thinking the same thing!",
                "Sai bhaani! So glad we matched!",
                "My family would love to hear about this!"
            ]

            let reply = Message(
                matchId: matchId,
                senderId: otherUserId,
                content: replies.randomElement()!,
                status: .delivered
            )

            // Use receiveMessage to properly handle unlock
            receiveMessage(reply)
        }
    }
}
