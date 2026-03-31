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
            // Mark all unread messages from the other user as read
            chatVM.markUnreadMessagesAsRead()
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
            match: match
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
        if chatVM.isLockedForMe {
            // Rose-tinted "waiting for reply" banner
            VStack(spacing: 4) {
                HStack(spacing: 8) {
                    bannerIcon

                    VStack(alignment: .leading, spacing: 3) {
                        Text("Waiting for reply...")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(AppTheme.rose)
                        Text("Your match hasn't seen your message yet")
                            .font(.system(size: 11))
                            .foregroundColor(colors.textMuted)
                    }

                    Spacer()

                    if chatVM.showCountdown, let exp = chatVM.match?.expiresAt {
                        CountdownBadge(expiresAt: exp)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(AppTheme.rose.opacity(0.05))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(AppTheme.rose.opacity(0.15), lineWidth: 1)
                    )
            )
            .padding(.horizontal, 12)
            .padding(.top, 6)
        } else {
            // Standard countdown / prompt banner
            HStack(spacing: 12) {
                bannerIcon

                VStack(alignment: .leading, spacing: 3) {
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
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(colors.surfaceMedium)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(AppTheme.rose.opacity(0.2), lineWidth: 1)
                    )
                    .shadow(color: AppTheme.rose.opacity(0.08), radius: 8, x: 0, y: 2)
            )
            .padding(.horizontal, 12)
            .padding(.top, 6)
        }
    }

    private var bannerIcon: some View {
        ZStack {
            Circle()
                .fill(AppTheme.rose.opacity(0.12))
                .frame(width: 36, height: 36)

            Image(systemName: chatVM.isLockedForMe ? "lock.fill" : "clock.fill")
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(AppTheme.rose)
        }
    }
}

// MARK: - Message List

private struct ChatMessageList: View {
    @ObservedObject var chatVM: ChatViewModel
    let match: Match
    @Environment(\.adaptiveColors) private var colors
    @State private var showScrollToBottom = false

    private var otherUserName: String { match.otherUser.displayName }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 8) {
                    // Match announcement at the very top
                    matchAnnouncementView

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

                    // Anchor for scroll detection
                    Color.clear
                        .frame(height: 1)
                        .id("bottom-anchor")
                        .onAppear { showScrollToBottom = false }
                        .onDisappear { showScrollToBottom = true }
                }
                .padding(.horizontal)
                .padding(.top, 12)
                .padding(.bottom, 8)
            }
            .overlay(alignment: .bottomTrailing) {
                if showScrollToBottom {
                    Button {
                        let target = chatVM.messages.last?.id ?? "bottom-anchor"
                        withAnimation(.easeOut(duration: 0.3)) {
                            proxy.scrollTo(target, anchor: .bottom)
                        }
                    } label: {
                        Image(systemName: "chevron.down")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(colors.textSecondary)
                            .frame(width: 36, height: 36)
                            .background(
                                Circle()
                                    .fill(colors.cardDark)
                                    .shadow(color: colors.cardShadowColor, radius: 8, x: 0, y: 4)
                            )
                            .overlay(
                                Circle()
                                    .stroke(colors.border, lineWidth: 0.5)
                            )
                    }
                    .padding(.trailing, 16)
                    .padding(.bottom, 8)
                    .transition(.opacity.combined(with: .scale(scale: 0.8)))
                    .animation(.easeOut(duration: 0.2), value: showScrollToBottom)
                }
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

    // MARK: - Match Announcement

    private var matchAnnouncementView: some View {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy"
        let dateString = formatter.string(from: match.matchedAt)

        return HStack(spacing: 6) {
            Image(systemName: "heart.fill")
                .font(.system(size: 10))
                .foregroundColor(AppTheme.rose.opacity(0.7))
            Text("You matched with \(otherUserName) on \(dateString)")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(colors.textMuted)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 7)
        .background(
            Capsule()
                .fill(colors.surfaceMedium)
                .overlay(
                    Capsule()
                        .stroke(colors.border, lineWidth: 0.5)
                )
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
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            icebreakerHeader
            icebreakerScroll
        }
        .padding(.vertical, 12)
    }

    private var icebreakerHeader: some View {
        HStack(spacing: 6) {
            Image(systemName: "sparkles")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.rose)
            Text(LocalizationManager.shared.t("chat.breakTheIce"))
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(AppTheme.rose)
        }
        .padding(.horizontal)
    }

    private var icebreakerScroll: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(MockData.icebreakers.prefix(5)) { ice in
                    Button {
                        chatVM.sendIcebreaker(ice.question)
                    } label: {
                        IcebreakerCardView(icebreaker: ice)
                    }
                    .buttonStyle(IcebreakerButtonStyle())
                }
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Icebreaker Button Style

private struct IcebreakerButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Icebreaker Card

private struct IcebreakerCardView: View {
    let icebreaker: Icebreaker
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 5) {
                Image(systemName: "sparkles")
                    .font(.system(size: 9, weight: .bold))
                Text(icebreaker.category.capitalized)
                    .font(.system(size: 10, weight: .bold))
                    .textCase(.uppercase)
                    .tracking(0.5)
            }
            .foregroundColor(AppTheme.rose)

            Text(icebreaker.question)
                .font(.system(size: 13))
                .foregroundColor(colors.textPrimary)
                .multilineTextAlignment(.leading)
                .lineLimit(2)
        }
        .padding(14)
        .frame(width: 200, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(AppTheme.rose.opacity(0.06))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(
                            LinearGradient(
                                colors: [AppTheme.rose.opacity(0.3), AppTheme.rose.opacity(0.1)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                )
                .shadow(color: AppTheme.rose.opacity(0.1), radius: 8, x: 0, y: 4)
        )
    }
}

// MARK: - Input Bar

private struct ChatInputBar: View {
    @ObservedObject var chatVM: ChatViewModel
    var isInputFocused: FocusState<Bool>.Binding
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        if chatVM.inputDisabled {
            inputBarContainer {
                disabledContent
            }
        } else {
            inputBarContainer {
                activeContent
            }
        }
    }

    // MARK: - Shared Container

    private func inputBarContainer<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        content()
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                Rectangle()
                    .fill(.ultraThinMaterial)
                    .overlay(
                        Rectangle()
                            .fill(colors.surfaceDark.opacity(0.5))
                    )
                    .overlay(alignment: .top) {
                        Divider()
                            .foregroundColor(colors.border)
                    }
                    .ignoresSafeArea()
            )
    }

    // MARK: - Disabled Content

    private var disabledContent: some View {
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
    }

    // MARK: - Active Content

    private var activeContent: some View {
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
