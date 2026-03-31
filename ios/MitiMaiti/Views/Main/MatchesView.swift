import SwiftUI

struct MatchesView: View {
    @EnvironmentObject var inboxVM: InboxViewModel
    private let localization = LocalizationManager.shared
    @Environment(\.adaptiveColors) private var colors

    /// Matches that still have an active countdown (timer avatars section)
    private var timerMatches: [Match] {
        inboxVM.matches.filter { $0.showCountdown }
    }

    /// Matches where timer expired OR both users have messaged (active chats)
    private var chatMatches: [Match] {
        inboxVM.matches.filter { !$0.showCountdown }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                matchesHeader
                matchesContent
            }
            .appBackground()
            .navigationDestination(for: Match.self) { match in
                ChatView(match: match)
            }
            .onAppear {
                inboxVM.loadInbox()
            }
        }
    }

    // MARK: - Header

    private var matchesHeader: some View {
        HStack {
            Text(localization.t("matches.title"))
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(colors.textPrimary)

            if inboxVM.totalMatches > 0 {
                Text("\(inboxVM.totalMatches)")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(AppTheme.rose))
            }

            Spacer()
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }

    // MARK: - Timer Avatar Section

    private var timerAvatarSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(localization.t("matches.yourMatches"))
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(colors.textSecondary)
                .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(timerMatches) { match in
                        NavigationLink(value: match) {
                            TimerAvatarCircle(match: match)
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Chats Section

    private var chatsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(localization.t("matches.chats"))
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(colors.textSecondary)
                .padding(.horizontal, 16)

            LazyVStack(spacing: 10) {
                ForEach(Array(chatMatches.enumerated()), id: \.element.id) { index, match in
                    NavigationLink(value: match) {
                        MatchRowView(match: match)
                    }
                    .opacity(1)
                    .animation(
                        .easeOut(duration: 0.3).delay(Double(index) * 0.05),
                        value: chatMatches.count
                    )
                }
            }
        }
    }

    // MARK: - Content

    @ViewBuilder
    private var matchesContent: some View {
        if inboxVM.isLoading {
            Spacer()
            ProgressView()
                .tint(AppTheme.rose)
            Spacer()
        } else if inboxVM.matches.isEmpty {
            EmptyStateView(
                icon: "heart.circle",
                title: localization.t("matches.noMatchesYet"),
                message: localization.t("matches.startLiking")
            )
        } else {
            ScrollView {
                VStack(spacing: 16) {
                    // Timer avatar circles - horizontal scroll
                    if !timerMatches.isEmpty {
                        timerAvatarSection
                    }

                    // Active chats - vertical list
                    if !chatMatches.isEmpty {
                        chatsSection
                    }
                }
                .padding(.top, 12)
                .padding(.bottom, 100)
            }
        }
    }
}

// MARK: - Match Row

struct MatchRowView: View {
    let match: Match
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack(spacing: 14) {
            ProfileAvatar(
                url: nil,
                name: match.otherUser.displayName,
                size: 56,
                isOnline: match.otherUser.isOnline
            )

            matchInfo

            Spacer()

            matchTrailing
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .cardStyle()
        .padding(.horizontal)
    }

    private var lastMessageText: String {
        guard let lastMsg = match.lastMessage else {
            return LocalizationManager.shared.t("matches.sendFirstMessage")
        }
        let prefix = lastMsg.isFromMe ? "You: " : ""
        return prefix + lastMsg.content
    }

    private var matchInfo: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(match.otherUser.displayName)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(colors.textPrimary)

            Text(lastMessageText)
                .font(.system(size: 13, weight: match.unreadCount > 0 ? .semibold : .regular))
                .foregroundColor(match.unreadCount > 0 ? colors.textPrimary : colors.textSecondary)
                .lineLimit(1)
        }
    }

    private var relativeTime: String? {
        guard let lastMsg = match.lastMessage else { return nil }
        let interval = Date().timeIntervalSince(lastMsg.createdAt)
        if interval < 60 { return "now" }
        if interval < 3600 { return "\(Int(interval / 60))m" }
        if interval < 86400 { return "\(Int(interval / 3600))h" }
        if interval < 172800 { return "Yesterday" }
        if interval < 604800 { return "\(Int(interval / 86400))d" }
        return "\(Int(interval / 604800))w"
    }

    private var matchTrailing: some View {
        VStack(alignment: .trailing, spacing: 6) {
            if let time = relativeTime {
                Text(time)
                    .font(.system(size: 11))
                    .foregroundColor(match.unreadCount > 0 ? AppTheme.rose : colors.textMuted)
            }

            if match.unreadCount > 0 {
                MatchUnreadBadge(count: match.unreadCount)
            }
        }
    }
}

// MARK: - Timer Avatar Circle

struct TimerAvatarCircle: View {
    let match: Match
    @Environment(\.adaptiveColors) private var colors

    private var progress: Double {
        guard let exp = match.expiresAt else { return 0 }
        let total: TimeInterval = 86400 // 24 hours
        let remaining = max(0, exp.timeIntervalSinceNow)
        return remaining / total
    }

    private var ringColor: Color {
        if match.isExpiringSoon {
            return AppTheme.scoreOrange
        }
        return AppTheme.rose
    }

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                // Background ring
                Circle()
                    .stroke(colors.border, lineWidth: 3)
                    .frame(width: 64, height: 64)

                // Countdown progress ring
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        ringColor,
                        style: StrokeStyle(lineWidth: 3, lineCap: .round)
                    )
                    .frame(width: 64, height: 64)
                    .rotationEffect(.degrees(-90))

                // Avatar
                ProfileAvatar(
                    url: nil,
                    name: match.otherUser.displayName,
                    size: 54,
                    isOnline: match.otherUser.isOnline
                )

                // Bottom-center badge: lock if firstMsgLocked, timer if new match with no messages
                if match.firstMsgLocked {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 18, height: 18)
                        .background(Circle().fill(AppTheme.saffron))
                        .offset(y: 28)
                } else if !match.hasFirstMessage {
                    Image(systemName: "timer")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 18, height: 18)
                        .background(Circle().fill(AppTheme.scoreOrange))
                        .offset(y: 28)
                }

                // Unread badge at top-right
                if match.unreadCount > 0 {
                    Text("\(min(match.unreadCount, 99))")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                        .frame(minWidth: 16, minHeight: 16)
                        .background(Circle().fill(AppTheme.rose))
                        .offset(x: 24, y: -24)
                }
            }
            .frame(width: 68, height: 68)

            Text(match.otherUser.displayName.components(separatedBy: " ").first ?? match.otherUser.displayName)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(colors.textPrimary)
                .lineLimit(1)
                .frame(width: 68)
        }
    }
}

// MARK: - Unread Badge

struct MatchUnreadBadge: View {
    let count: Int

    var body: some View {
        Text("\(min(count, 99))")
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(.white)
            .frame(minWidth: 20, minHeight: 20)
            .background(
                Circle()
                    .fill(AppTheme.rose)
            )
    }
}
