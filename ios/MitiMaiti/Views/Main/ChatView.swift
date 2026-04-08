import SwiftUI

struct ChatView: View {
    let match: Match
    @StateObject private var chatVM = ChatViewModel()
    @EnvironmentObject private var inboxVM: InboxViewModel
    @Environment(\.adaptiveColors) private var colors
    private let localization = LocalizationManager.shared
    @FocusState private var isInputFocused: Bool

    // Toast
    @State private var showUnlockToast = false

    // Header menu / modals
    @State private var showMoreMenu     = false
    @State private var showUnmatchAlert = false
    @State private var showBlockAlert   = false
    @State private var showReportSheet  = false

    var body: some View {
        VStack(spacing: 0) {
            // Slide-in unlock toast at the very top
            unlockToastView

            // Lock banner (only when I sent ice-breaker and am waiting)
            chatBannerSection

            // Messages + typing
            messageListSection

            // Ice-breaker cards (only when chat is empty and no one has messaged)
            icebreakerView

            // Text input
            inputBarSection
        }
        .appBackground()
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(false)
        .toolbar {
            ToolbarItem(placement: .principal) {
                ChatHeaderPrincipal(match: match, chatVM: chatVM)
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                ChatTrailingButtons(
                    match: match,
                    callsUnlocked: chatVM.match?.callsUnlocked ?? false,
                    showMoreMenu: $showMoreMenu,
                    showUnmatchAlert: $showUnmatchAlert,
                    showBlockAlert: $showBlockAlert,
                    showReportSheet: $showReportSheet
                )
            }
        }
        .onAppear {
            chatVM.inboxViewModel = inboxVM
            chatVM.loadMessages(for: match)
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
        // Unmatch confirmation
        .alert("Unmatch with \(match.otherUser.displayName)?", isPresented: $showUnmatchAlert) {
            Button("Unmatch", role: .destructive) { /* chatVM.unmatch() */ }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You'll both lose this conversation and won't be able to rematch.")
        }
        // Block confirmation
        .alert("Block \(match.otherUser.displayName)?", isPresented: $showBlockAlert) {
            Button("Block", role: .destructive) { /* chatVM.block() */ }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("They won't be able to message you or see your profile.")
        }
        // Report sheet
        .sheet(isPresented: $showReportSheet) {
            ReportSheet(userName: match.otherUser.displayName, isPresented: $showReportSheet)
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
                    .font(.system(size: 13, weight: .semibold))
            }
            .foregroundColor(.white)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(AppTheme.success)
                    .shadow(color: AppTheme.success.opacity(0.4), radius: 10, x: 0, y: 4)
            )
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 40)
            .padding(.top, 6)
            .transition(.move(edge: .top).combined(with: .opacity))
        }
    }

    // MARK: - Banner Section (only when I sent first and am waiting)

    @ViewBuilder
    private var chatBannerSection: some View {
        if chatVM.isLockedForMe {
            ChatLockBanner(chatVM: chatVM, otherUserName: match.otherUser.displayName)
        }
    }

    // MARK: - Message List

    private var messageListSection: some View {
        ChatMessageList(chatVM: chatVM, match: match)
    }

    // MARK: - Icebreaker

    @ViewBuilder
    private var icebreakerView: some View {
        if match.status == .pendingFirstMessage && !chatVM.hasMessages {
            ChatIcebreakerSection(chatVM: chatVM)
        }
    }

    // MARK: - Input Bar

    private var inputBarSection: some View {
        ChatInputBar(chatVM: chatVM, isInputFocused: $isInputFocused)
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
                url: match.otherUser.primaryPhoto?.url,
                name: match.otherUser.displayName,
                size: 36,
                isOnline: match.otherUser.isOnline
            )

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 4) {
                    Text(match.otherUser.displayName)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(colors.textPrimary)
                    if match.otherUser.age > 0 {
                        Text("\(match.otherUser.age)")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(colors.textSecondary)
                    }
                }
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

// MARK: - Toolbar Trailing (video, voice, "..." menu)

private struct ChatTrailingButtons: View {
    let match: Match
    let callsUnlocked: Bool
    @Binding var showMoreMenu: Bool
    @Binding var showUnmatchAlert: Bool
    @Binding var showBlockAlert: Bool
    @Binding var showReportSheet: Bool
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack(spacing: 14) {
            // Video call
            Button {} label: {
                Image(systemName: "video.fill")
                    .font(.system(size: 17))
                    .foregroundColor(callsUnlocked ? colors.textPrimary : colors.textMuted.opacity(0.35))
            }
            .disabled(!callsUnlocked)

            // Voice call
            Button {} label: {
                Image(systemName: "phone.fill")
                    .font(.system(size: 16))
                    .foregroundColor(callsUnlocked ? colors.textPrimary : colors.textMuted.opacity(0.35))
            }
            .disabled(!callsUnlocked)

            // "..." overflow menu
            Menu {
                Button {
                    showUnmatchAlert = true
                } label: {
                    Label("Unmatch", systemImage: "heart.slash")
                }

                Button {
                    showBlockAlert = true
                } label: {
                    Label("Block", systemImage: "nosign")
                }

                Button {
                    showReportSheet = true
                } label: {
                    Label("Report", systemImage: "flag")
                }
            } label: {
                Image(systemName: "ellipsis")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(colors.textPrimary)
                    .frame(width: 28, height: 28)
            }
        }
    }
}

// MARK: - Lock Banner (only while waiting for their reply after I sent the ice-breaker)

private struct ChatLockBanner: View {
    @ObservedObject var chatVM: ChatViewModel
    let otherUserName: String
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(AppTheme.rose.opacity(0.12))
                    .frame(width: 36, height: 36)
                Image(systemName: "lock.fill")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(AppTheme.rose)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text("Waiting for reply...")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(AppTheme.rose)
                Text("You can send another message once \(otherUserName) replies.")
                    .font(.system(size: 11))
                    .foregroundColor(colors.textMuted)
                    .lineLimit(2)
            }

            Spacer()
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
    }
}

// MARK: - Message List

private struct ChatMessageList: View {
    @ObservedObject var chatVM: ChatViewModel
    let match: Match
    @Environment(\.adaptiveColors) private var colors
    @State private var showScrollToBottom = false

    private var otherUserName: String { match.otherUser.displayName }
    private var otherUserAvatarURL: String? { match.otherUser.primaryPhoto?.url }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 8) {
                    matchAnnouncementView

                    if chatVM.match?.hasFirstMessage == false {
                        systemMessageText(LocalizationManager.shared.t("chat.matchedSendMessage"))
                    }

                    ForEach(groupedMessages, id: \.date) { group in
                        dateSectionHeader(group.dateLabel)

                        ForEach(group.messages) { msg in
                            BumbleMessageBubble(
                                message: msg,
                                otherUserName: otherUserName,
                                otherUserAvatarURL: otherUserAvatarURL
                            )
                            .id(msg.id)
                        }
                    }

                    if chatVM.isLockedForMe {
                        systemMessageText(
                            LocalizationManager.shared
                                .t("chat.waitingForReplyFrom")
                                .replacingOccurrences(of: "%@", with: otherUserName)
                        )
                    }

                    if chatVM.isOtherTyping {
                        BumbleTypingIndicator(
                            otherUserName: otherUserName,
                            avatarURL: otherUserAvatarURL
                        )
                        .id("typing")
                    }

                    Color.clear
                        .frame(height: 1)
                        .id("bottom-anchor")
                        .onAppear  { showScrollToBottom = false }
                        .onDisappear { showScrollToBottom = true }
                }
                .padding(.horizontal)
                .padding(.top, 12)
                .padding(.bottom, 8)
            }
            .overlay(alignment: .bottom) {
                if showScrollToBottom {
                    newMessageButton(proxy: proxy)
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

    // MARK: "New message ↓" pill button

    private func newMessageButton(proxy: ScrollViewProxy) -> some View {
        Button {
            let target = chatVM.messages.last?.id ?? "bottom-anchor"
            withAnimation(.easeOut(duration: 0.3)) {
                proxy.scrollTo(target, anchor: .bottom)
            }
        } label: {
            HStack(spacing: 6) {
                Text("New message")
                    .font(.system(size: 12, weight: .semibold))
                Image(systemName: "chevron.down")
                    .font(.system(size: 11, weight: .semibold))
            }
            .foregroundColor(.white)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(AppTheme.rose)
                    .shadow(color: AppTheme.rose.opacity(0.4), radius: 8, x: 0, y: 4)
            )
        }
        .padding(.bottom, 10)
        .transition(.opacity.combined(with: .scale(scale: 0.85)))
        .animation(.spring(response: 0.3), value: showScrollToBottom)
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
                let fmt = DateFormatter()
                fmt.dateFormat = "EEEE, MMM d"
                label = fmt.string(from: first.createdAt)
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
            .background(Capsule().fill(colors.border))
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
                .overlay(Capsule().stroke(colors.border, lineWidth: 0.5))
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

// MARK: - Bumble-style Message Bubble
// Sent: rose color, right-aligned, no avatar.
// Received: gray surfaceMedium, left-aligned, 32pt avatar beside it.

private struct BumbleMessageBubble: View {
    let message: Message
    let otherUserName: String
    let otherUserAvatarURL: String?

    @Environment(\.adaptiveColors) private var colors
    @Environment(\.colorScheme) private var colorScheme
    @State private var appeared = false

    private let bubbleRadius: CGFloat = 18
    private let tailRadius: CGFloat  = 4

    var body: some View {
        HStack(alignment: .bottom, spacing: 6) {
            if message.isFromMe {
                Spacer(minLength: 60)
                sentContent
            } else {
                // Avatar (32pt)
                ProfileAvatar(
                    url: otherUserAvatarURL,
                    name: otherUserName,
                    size: 32
                )

                receivedContent
                Spacer(minLength: 60)
            }
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 8)
        .scaleEffect(appeared ? 1 : 0.97)
        .onAppear {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                appeared = true
            }
        }
    }

    // MARK: Sent bubble (rose, right)

    private var sentContent: some View {
        VStack(alignment: .trailing, spacing: 4) {
            icebreakerLabel

            if message.msgType != .system {
                Text(message.content)
                    .font(.system(size: 15))
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 11)
                    .background(sentBubble)
                    .shadow(color: AppTheme.rose.opacity(0.2), radius: 8, x: 0, y: 3)
            } else {
                systemText
            }

            timestampRow
        }
    }

    // MARK: Received bubble (gray, left)

    private var receivedContent: some View {
        VStack(alignment: .leading, spacing: 4) {
            icebreakerLabel

            if message.msgType != .system {
                Text(message.content)
                    .font(.system(size: 15))
                    .foregroundColor(colors.textPrimary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 11)
                    .background(receivedBubble)
                    .shadow(color: colors.cardShadowColor.opacity(0.5), radius: 5, x: 0, y: 2)
            } else {
                systemText
            }

            timestampRow
        }
    }

    // MARK: Bubble shapes

    /// Sent bubble: 18dp radius on all corners except bottom-right uses 4dp (tail)
    private var sentBubble: some View {
        SentBubbleShape(mainRadius: bubbleRadius, tailRadius: tailRadius)
            .fill(AppTheme.roseGradient)
    }

    /// Received bubble: 18dp radius on all corners except bottom-left uses 4dp (tail)
    private var receivedBubble: some View {
        ReceivedBubbleShape(mainRadius: bubbleRadius, tailRadius: tailRadius)
            .fill(colors.surfaceMedium)
            .overlay(
                ReceivedBubbleShape(mainRadius: bubbleRadius, tailRadius: tailRadius)
                    .stroke(colors.border, lineWidth: 0.5)
            )
    }

    // MARK: Sub-views

    @ViewBuilder
    private var icebreakerLabel: some View {
        if message.msgType == .icebreaker {
            HStack(spacing: 4) {
                Image(systemName: "sparkles")
                    .font(.system(size: 10))
                Text("Icebreaker")
                    .font(.system(size: 10, weight: .semibold))
            }
            .foregroundColor(AppTheme.gold)
        }
    }

    private var systemText: some View {
        Text(message.content)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(colors.textMuted)
            .italic()
    }

    private var timestampRow: some View {
        HStack(spacing: 4) {
            Text(message.createdAt.messageTime)
                .font(.system(size: 10))
                .foregroundColor(colors.textMuted)

            if message.isFromMe {
                readReceiptIcon
            }
        }
    }

    // MARK: Read receipt

    private var readColor: Color {
        colorScheme == .dark ? .white : Color(hex: "3478F6")
    }

    @ViewBuilder
    private var readReceiptIcon: some View {
        switch message.status {
        case .sending:
            Image(systemName: "clock")
                .font(.system(size: 10))
                .foregroundColor(colors.textMuted)
        case .sent:
            // Single checkmark
            Image(systemName: "checkmark")
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(colors.textMuted)
        case .delivered:
            // Double gray checkmarks
            doubleCheck(color: colors.textMuted)
        case .read:
            // Double blue checkmarks
            doubleCheck(color: readColor)
        }
    }

    private func doubleCheck(color: Color) -> some View {
        ZStack(alignment: .leading) {
            Image(systemName: "checkmark")
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(color)
            Image(systemName: "checkmark")
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(color)
                .offset(x: 5)
        }
        .frame(width: 19)
    }
}

// MARK: - Sent Bubble Shape (tail on bottom-right)

private struct SentBubbleShape: Shape {
    let mainRadius: CGFloat
    let tailRadius: CGFloat

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let tl = mainRadius
        let tr = mainRadius
        let bl = mainRadius
        let br = tailRadius  // tail side

        path.move(to: CGPoint(x: rect.minX + tl, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX - tr, y: rect.minY))
        path.addArc(center: CGPoint(x: rect.maxX - tr, y: rect.minY + tr),
                    radius: tr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false)
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - br))
        path.addArc(center: CGPoint(x: rect.maxX - br, y: rect.maxY - br),
                    radius: br, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false)
        path.addLine(to: CGPoint(x: rect.minX + bl, y: rect.maxY))
        path.addArc(center: CGPoint(x: rect.minX + bl, y: rect.maxY - bl),
                    radius: bl, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false)
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + tl))
        path.addArc(center: CGPoint(x: rect.minX + tl, y: rect.minY + tl),
                    radius: tl, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        path.closeSubpath()
        return path
    }
}

// MARK: - Received Bubble Shape (tail on bottom-left)

private struct ReceivedBubbleShape: Shape {
    let mainRadius: CGFloat
    let tailRadius: CGFloat

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let tl = mainRadius
        let tr = mainRadius
        let bl = tailRadius  // tail side
        let br = mainRadius

        path.move(to: CGPoint(x: rect.minX + tl, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX - tr, y: rect.minY))
        path.addArc(center: CGPoint(x: rect.maxX - tr, y: rect.minY + tr),
                    radius: tr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false)
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - br))
        path.addArc(center: CGPoint(x: rect.maxX - br, y: rect.maxY - br),
                    radius: br, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false)
        path.addLine(to: CGPoint(x: rect.minX + bl, y: rect.maxY))
        path.addArc(center: CGPoint(x: rect.minX + bl, y: rect.maxY - bl),
                    radius: bl, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false)
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + tl))
        path.addArc(center: CGPoint(x: rect.minX + tl, y: rect.minY + tl),
                    radius: tl, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        path.closeSubpath()
        return path
    }
}

// MARK: - Bumble Typing Indicator (dots bubble + avatar on left)

private struct BumbleTypingIndicator: View {
    let otherUserName: String
    let avatarURL: String?
    @Environment(\.adaptiveColors) private var colors
    @State private var dotScale: [CGFloat] = [1, 1, 1]
    @State private var dotOpacity: [Double] = [0.4, 0.4, 0.4]

    var body: some View {
        HStack(alignment: .bottom, spacing: 6) {
            ProfileAvatar(url: avatarURL, name: otherUserName, size: 32)

            HStack(spacing: 5) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(colors.textMuted)
                        .frame(width: 7, height: 7)
                        .scaleEffect(dotScale[i])
                        .opacity(dotOpacity[i])
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                ReceivedBubbleShape(mainRadius: 18, tailRadius: 4)
                    .fill(colors.surfaceMedium)
            )
            .overlay(
                ReceivedBubbleShape(mainRadius: 18, tailRadius: 4)
                    .stroke(colors.border, lineWidth: 0.5)
            )

            Spacer()
        }
        .onAppear { animateDots() }
    }

    private func animateDots() {
        for i in 0..<3 {
            withAnimation(
                .easeInOut(duration: 0.6)
                .repeatForever(autoreverses: true)
                .delay(Double(i) * 0.18)
            ) {
                dotScale[i]   = 1.4
                dotOpacity[i] = 1.0
            }
        }
    }
}

// MARK: - Icebreaker Section
// Shows 2-3 random prompts. Dice button to shuffle. Tap → send.

private struct ChatIcebreakerSection: View {
    @ObservedObject var chatVM: ChatViewModel
    @Environment(\.adaptiveColors) private var colors

    @State private var visiblePrompts: [IceBreakerPrompt] = IceBreakerPrompts.random(count: 3)

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            icebreakerHeader
            promptCards
        }
        .padding(.vertical, 12)
    }

    // MARK: Header row

    private var icebreakerHeader: some View {
        HStack(spacing: 6) {
            Image(systemName: "sparkles")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.rose)
            Text(LocalizationManager.shared.t("chat.breakTheIce"))
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(AppTheme.rose)

            Spacer()

            // Dice shuffle button
            Button {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                    visiblePrompts = IceBreakerPrompts.random(count: 3)
                }
            } label: {
                Image(systemName: "dice.fill")
                    .font(.system(size: 16))
                    .foregroundColor(AppTheme.rose)
                    .frame(width: 34, height: 34)
                    .background(
                        Circle()
                            .fill(AppTheme.rose.opacity(0.1))
                            .overlay(Circle().stroke(AppTheme.rose.opacity(0.2), lineWidth: 1))
                    )
            }
        }
        .padding(.horizontal)
    }

    // MARK: Prompt cards

    private var promptCards: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(visiblePrompts) { prompt in
                    Button {
                        chatVM.sendIcebreaker(prompt.text)
                    } label: {
                        IceBreakerPromptCard(prompt: prompt)
                    }
                    .buttonStyle(IcebreakerButtonStyle())
                }
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Icebreaker Prompt Card

private struct IceBreakerPromptCard: View {
    let prompt: IceBreakerPrompt
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Category row: emoji + category name
            HStack(spacing: 5) {
                Text(prompt.category.emoji)
                    .font(.system(size: 12))
                Text(prompt.category.displayName.uppercased())
                    .font(.system(size: 10, weight: .bold))
                    .tracking(0.5)
            }
            .foregroundColor(AppTheme.rose)

            // Prompt text
            Text(prompt.text)
                .font(.system(size: 13))
                .foregroundColor(colors.textPrimary)
                .multilineTextAlignment(.leading)
                .lineLimit(3)
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

// MARK: - Icebreaker Button Style

private struct IcebreakerButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Input Bar

private struct ChatInputBar: View {
    @ObservedObject var chatVM: ChatViewModel
    var isInputFocused: FocusState<Bool>.Binding
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        if chatVM.inputDisabled {
            inputBarContainer { disabledContent }
        } else {
            inputBarContainer { activeContent }
        }
    }

    private func inputBarContainer<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        content()
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                Rectangle()
                    .fill(.ultraThinMaterial)
                    .overlay(Rectangle().fill(colors.surfaceDark.opacity(0.5)))
                    .overlay(alignment: .top) {
                        Divider().foregroundColor(colors.border)
                    }
                    .ignoresSafeArea()
            )
    }

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

    private var activeContent: some View {
        HStack(spacing: 10) {
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

// MARK: - Report Sheet

private struct ReportSheet: View {
    let userName: String
    @Binding var isPresented: Bool
    @Environment(\.adaptiveColors) private var colors

    @State private var selectedReason: ReportReason?
    @State private var showConfirmation = false

    enum ReportReason: String, CaseIterable, Identifiable {
        case inappropriateBehavior = "Inappropriate behavior"
        case fakeProfile           = "Fake profile"
        case spam                  = "Spam"
        case underage              = "Underage"
        case other                 = "Other"
        var id: String { rawValue }
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 0) {
                if showConfirmation {
                    confirmationView
                } else {
                    reasonPickerView
                }
            }
            .navigationTitle("Report \(userName)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { isPresented = false }
                        .foregroundColor(colors.textSecondary)
                }
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }

    // MARK: Reason picker

    private var reasonPickerView: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Why are you reporting this profile?")
                .font(.system(size: 14))
                .foregroundColor(colors.textSecondary)
                .padding(.horizontal, 20)
                .padding(.vertical, 16)

            ForEach(ReportReason.allCases) { reason in
                Button {
                    selectedReason = reason
                } label: {
                    HStack {
                        Text(reason.rawValue)
                            .font(.system(size: 16))
                            .foregroundColor(colors.textPrimary)
                        Spacer()
                        if selectedReason == reason {
                            Image(systemName: "checkmark")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(AppTheme.rose)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 14)
                    .contentShape(Rectangle())
                }

                Divider()
                    .padding(.leading, 20)
            }

            Spacer()

            Button {
                guard selectedReason != nil else { return }
                showConfirmation = true
            } label: {
                Text("Submit Report")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(selectedReason == nil ? colors.textMuted : .white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(
                        RoundedRectangle(cornerRadius: 14)
                            .fill(selectedReason == nil ? colors.surfaceMedium : AppTheme.rose)
                    )
            }
            .disabled(selectedReason == nil)
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
    }

    // MARK: Confirmation

    private var confirmationView: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 52))
                .foregroundColor(AppTheme.success)

            VStack(spacing: 8) {
                Text("Report submitted")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(colors.textPrimary)
                Text("Thank you. We review all reports within 24 hours.")
                    .font(.system(size: 14))
                    .foregroundColor(colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }

            Spacer()

            Button("Done") { isPresented = false }
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(RoundedRectangle(cornerRadius: 14).fill(AppTheme.rose))
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
        }
    }
}
