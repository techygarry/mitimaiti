import SwiftUI

struct ChatView: View {
    let match: Match
    @StateObject private var chatVM = ChatViewModel()
    @Environment(\.adaptiveColors) private var colors
    private let localization = LocalizationManager.shared
    @FocusState private var isInputFocused: Bool
    @State private var showUnlockToast = false

    var body: some View {
        VStack(spacing: 0) {
            chatBannerSection
            unlockToastView
            messageListSection
            icebreakerView
            inputBarSection
        }
        .appBackground()
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                ChatHeaderPrincipal(match: match, chatVM: chatVM)
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                ChatTrailingButtons(match: match, callsUnlocked: chatVM.match?.callsUnlocked ?? false)
            }
        }
        .onAppear {
            chatVM.loadMessages(for: match)
        }
        .onChange(of: chatVM.chatUnlocked) { _, unlocked in
            if unlocked {
                withAnimation(.spring(response: 0.4)) {
                    showUnlockToast = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    withAnimation { showUnlockToast = false }
                }
            }
        }
    }

    // MARK: - Banner Section

    @ViewBuilder
    private var chatBannerSection: some View {
        if chatVM.showCountdown || chatVM.isLockedForMe {
            ChatLockBanner(
                chatVM: chatVM,
                otherUserName: match.otherUser.displayName
            )
        }
    }

    // MARK: - Unlock Toast

    @ViewBuilder
    private var unlockToastView: some View {
        if showUnlockToast {
            HStack(spacing: 8) {
                Image(systemName: "lock.open.fill")
                    .font(.system(size: 12))
                Text(localization.t("chat.chatUnlocked"))
                    .font(.system(size: 12, weight: .medium))
            }
            .foregroundColor(AppTheme.success)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(AppTheme.success.opacity(0.1))
            .transition(.move(edge: .top).combined(with: .opacity))
        }
    }

    // MARK: - Message List

    private var messageListSection: some View {
        ChatMessageList(
            chatVM: chatVM,
            otherUserName: match.otherUser.displayName
        )
    }

    // MARK: - Icebreaker

    @ViewBuilder
    private var icebreakerView: some View {
        if chatVM.awaitingFirstMessage && !chatVM.hasMessages {
            ChatIcebreakerSection(chatVM: chatVM)
        }
    }

    // MARK: - Input Bar

    private var inputBarSection: some View {
        ChatInputBar(
            chatVM: chatVM,
            isInputFocused: $isInputFocused
        )
    }
}

// MARK: - Toolbar Principal

private struct ChatHeaderPrincipal: View {
    let match: Match
    @ObservedObject var chatVM: ChatViewModel
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack(spacing: 10) {
            ProfileAvatar(
                url: nil,
                name: match.otherUser.displayName,
                size: 36,
                isOnline: match.otherUser.isOnline
            )

            VStack(alignment: .leading, spacing: 1) {
                Text(match.otherUser.displayName)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(colors.textPrimary)

                onlineStatus
            }
        }
    }

    private var onlineStatus: some View {
        HStack(spacing: 4) {
            if match.otherUser.isOnline {
                Circle()
                    .fill(AppTheme.success)
                    .frame(width: 6, height: 6)
                Text(LocalizationManager.shared.t("chat.online"))
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.success)
            } else {
                Text(match.otherUser.lastActive?.timeAgoShort ?? "")
                    .font(.system(size: 11))
                    .foregroundColor(colors.textMuted)
            }
        }
    }
}

// MARK: - Toolbar Trailing

private struct ChatTrailingButtons: View {
    let match: Match
    let callsUnlocked: Bool
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack(spacing: 16) {
            Button {} label: {
                Image(systemName: "phone.fill")
                    .font(.system(size: 16))
                    .foregroundColor(callsUnlocked ? colors.textPrimary : colors.textMuted.opacity(0.4))
            }
            .disabled(!callsUnlocked)

            Button {} label: {
                Image(systemName: "video.fill")
                    .font(.system(size: 16))
                    .foregroundColor(callsUnlocked ? colors.textPrimary : colors.textMuted.opacity(0.4))
            }
            .disabled(!callsUnlocked)
        }
    }
}

// MARK: - Lock / Countdown Banner

private struct ChatLockBanner: View {
    @ObservedObject var chatVM: ChatViewModel
    let otherUserName: String
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        ContentCard {
            HStack(spacing: 10) {
                bannerIcon

                VStack(alignment: .leading, spacing: 2) {
                    Text(chatVM.lockBannerMessage?.title ?? LocalizationManager.shared.t("chat.timerActive"))
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(colors.textPrimary)
                    Text(chatVM.lockBannerMessage?.subtitle ?? "")
                        .font(.system(size: 11))
                        .foregroundColor(colors.textSecondary)
                        .lineLimit(2)
                }

                Spacer()

                if chatVM.showCountdown, let exp = chatVM.match?.expiresAt {
                    CountdownBadge(expiresAt: exp)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(AppTheme.rose.opacity(0.08))
        }
        .padding(.horizontal, 12)
        .padding(.top, 4)
    }

    private var bannerIcon: some View {
        Image(systemName: chatVM.isLockedForMe ? "lock.fill" : "clock.fill")
            .font(.system(size: 14))
            .foregroundColor(AppTheme.rose)
    }
}

// MARK: - Message List

private struct ChatMessageList: View {
    @ObservedObject var chatVM: ChatViewModel
    let otherUserName: String
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 8) {
                    if chatVM.match?.hasFirstMessage == false {
                        systemMessageText(LocalizationManager.shared.t("chat.matchedSendMessage"))
                    }

                    ForEach(groupedMessages, id: \.date) { group in
                        dateSectionHeader(group.dateLabel)

                        ForEach(group.messages) { msg in
                            MessageBubble(message: msg, showTimestamp: true)
                                .id(msg.id)
                        }
                    }

                    if chatVM.isLockedForMe {
                        systemMessageText(LocalizationManager.shared.t("chat.waitingForReplyFrom").replacingOccurrences(of: "%@", with: otherUserName))
                    }

                    if chatVM.isOtherTyping {
                        TypingIndicator()
                            .id("typing")
                    }
                }
                .padding(.horizontal)
                .padding(.top, 12)
                .padding(.bottom, 8)
            }
            .onChange(of: chatVM.messages.count) { _, _ in
                let target = chatVM.messages.last?.id ?? "typing"
                withAnimation {
                    proxy.scrollTo(target, anchor: .bottom)
                }
            }
        }
    }

    // MARK: - Date Grouping

    private struct MessageGroup: Hashable {
        let date: String
        let dateLabel: String
        let messages: [Message]
    }

    private var groupedMessages: [MessageGroup] {
        let keyFormatter = DateFormatter()
        keyFormatter.dateFormat = "yyyy-MM-dd"

        let calendar = Calendar.current
        var groups: [String: [Message]] = [:]
        var order: [String] = []

        for msg in chatVM.messages {
            let key = keyFormatter.string(from: msg.createdAt)
            if groups[key] == nil {
                order.append(key)
                groups[key] = []
            }
            groups[key]?.append(msg)
        }

        return order.compactMap { key -> MessageGroup? in
            guard let msgs = groups[key], let first = msgs.first else { return nil }

            let label: String
            if calendar.isDateInToday(first.createdAt) {
                label = "Today"
            } else if calendar.isDateInYesterday(first.createdAt) {
                label = "Yesterday"
            } else {
                let displayFormatter = DateFormatter()
                displayFormatter.dateFormat = "EEEE, MMM d"
                label = displayFormatter.string(from: first.createdAt)
            }

            return MessageGroup(date: key, dateLabel: label, messages: msgs)
        }
    }

    // MARK: - Section Header

    private func dateSectionHeader(_ label: String) -> some View {
        Text(label)
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(colors.textMuted)
            .padding(.horizontal, 14)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(colors.border)
            )
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
    }

    // MARK: - System Message

    private func systemMessageText(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(colors.textMuted)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 30)
            .padding(.vertical, 8)
    }
}

// MARK: - Icebreaker Section

private struct ChatIcebreakerSection: View {
    @ObservedObject var chatVM: ChatViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            icebreakerHeader
            icebreakerScroll
        }
        .padding(.vertical, 10)
    }

    private var icebreakerHeader: some View {
        HStack(spacing: 6) {
            Image(systemName: "sparkles")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.gold)
            Text(LocalizationManager.shared.t("chat.breakTheIce"))
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(AppTheme.gold)
        }
        .padding(.horizontal)
    }

    private var icebreakerScroll: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(MockData.icebreakers.prefix(5)) { ice in
                    Button {
                        chatVM.sendIcebreaker(ice.question)
                    } label: {
                        IcebreakerCardView(icebreaker: ice)
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Icebreaker Card

private struct IcebreakerCardView: View {
    let icebreaker: Icebreaker
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 6) {
                Text(icebreaker.category.capitalized)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(AppTheme.gold)

                Text(icebreaker.question)
                    .font(.system(size: 13))
                    .foregroundColor(colors.textPrimary)
                    .multilineTextAlignment(.leading)
                    .lineLimit(2)
            }
            .padding(12)
            .frame(width: 180, alignment: .leading)
        }
    }
}

// MARK: - Input Bar

private struct ChatInputBar: View {
    @ObservedObject var chatVM: ChatViewModel
    var isInputFocused: FocusState<Bool>.Binding
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        if chatVM.inputDisabled {
            disabledBar
        } else {
            activeBar
        }
    }

    private var disabledBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "lock.fill")
                .font(.system(size: 16))
                .foregroundColor(colors.textMuted)

            Text(chatVM.inputPlaceholder)
                .font(.system(size: 15))
                .foregroundColor(colors.textMuted)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 22)
                .fill(colors.surfaceMedium)
                .overlay(
                    RoundedRectangle(cornerRadius: 22)
                        .stroke(colors.border, lineWidth: 0.5)
                )
        )
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            colors.surfaceDark
                .ignoresSafeArea()
        )
    }

    private var activeBar: some View {
        HStack(spacing: 10) {
            // Camera button
            Button {} label: {
                Image(systemName: "camera.fill")
                    .font(.system(size: 20))
                    .foregroundColor(colors.textMuted)
            }

            HStack {
                TextField(chatVM.inputPlaceholder, text: $chatVM.messageText, axis: .vertical)
                    .font(.system(size: 15))
                    .foregroundColor(colors.textPrimary)
                    .lineLimit(1...4)
                    .focused(isInputFocused)

                // Emoji button
                Button {} label: {
                    Image(systemName: "face.smiling")
                        .font(.system(size: 20))
                        .foregroundColor(colors.textMuted)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 22)
                    .fill(colors.surfaceMedium)
                    .overlay(
                        RoundedRectangle(cornerRadius: 22)
                            .stroke(colors.border, lineWidth: 0.5)
                    )
            )

            if chatVM.messageText.isEmpty {
                // Mic button (shown when no text)
                Button {} label: {
                    Image(systemName: "mic.fill")
                        .font(.system(size: 20))
                        .foregroundColor(colors.textMuted)
                }
            } else {
                sendButton
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            colors.surfaceDark
                .ignoresSafeArea()
        )
    }

    private var sendButton: some View {
        Button {
            chatVM.sendMessage()
        } label: {
            Image(systemName: "arrow.up")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 30, height: 30)
                .background(AppTheme.roseGradient)
                .clipShape(Circle())
        }
    }
}
