import SwiftUI

struct MatchesView: View {
    @EnvironmentObject var inboxVM: InboxViewModel
    private let localization = LocalizationManager.shared
    @Environment(\.adaptiveColors) private var colors

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
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(inboxVM.matches.filter { $0.showCountdown }) { match in
                    NavigationLink(value: match) {
                        TimerAvatarCircle(match: match)
                    }
                }
            }
            .padding(.horizontal, 16)
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
                icon: "person.2",
                title: localization.t("matches.noMatchesYet"),
                message: localization.t("matches.startLiking")
            )
        } else {
            ScrollView {
                VStack(spacing: 16) {
                    // Timer avatar circles - horizontal scroll
                    timerAvatarSection

                    // Match list
                    LazyVStack(spacing: 10) {
                        ForEach(inboxVM.matches) { match in
                            NavigationLink(value: match) {
                                MatchRowView(match: match)
                            }
                        }
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
        HStack(spacing: 12) {
            ProfileAvatar(
                url: nil,
                name: match.otherUser.displayName,
                size: 52,
                isOnline: match.otherUser.isOnline
            )

            matchInfo

            Spacer()

            matchTrailing
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .cardStyle()
        .padding(.horizontal)
    }

    private var matchInfo: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(match.otherUser.displayName)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(colors.textPrimary)

            Text(match.lastMessage?.content ?? LocalizationManager.shared.t("matches.sendFirstMessage"))
                .font(.system(size: 13))
                .foregroundColor(colors.textSecondary)
                .lineLimit(1)
        }
    }

    private var matchTrailing: some View {
        VStack(alignment: .trailing, spacing: 6) {
            if let lastMsg = match.lastMessage {
                Text(lastMsg.createdAt.timeAgoShort)
                    .font(.system(size: 11))
                    .foregroundColor(colors.textMuted)
            }

            if match.showCountdown, let exp = match.expiresAt {
                CountdownBadge(expiresAt: exp)
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

                // Lock badge if first message locked
                if match.firstMsgLocked {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 20, height: 20)
                        .background(Circle().fill(AppTheme.rose))
                        .offset(x: 22, y: 22)
                }
            }

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
