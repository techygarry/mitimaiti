import SwiftUI

struct InboxView: View {
    @EnvironmentObject var inboxVM: InboxViewModel
    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                inboxHeader
                segmentedControl
                tabContent
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

    private var inboxHeader: some View {
        HStack {
            Text("Inbox")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)
            Spacer()
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }

    // MARK: - Segmented Control

    private var segmentedControl: some View {
        HStack(spacing: 0) {
            InboxSegmentButton(
                title: "Liked You",
                count: inboxVM.totalLikes,
                isSelected: selectedTab == 0
            ) {
                withAnimation(.easeInOut(duration: 0.25)) {
                    selectedTab = 0
                }
            }

            InboxSegmentButton(
                title: "Matches",
                count: inboxVM.totalMatches,
                isSelected: selectedTab == 1
            ) {
                withAnimation(.easeInOut(duration: 0.25)) {
                    selectedTab = 1
                }
            }
        }
        .padding(4)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(AppTheme.surfaceDark)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.white.opacity(0.06), lineWidth: 0.5)
                )
        )
        .padding(.horizontal)
        .padding(.top, 12)
    }

    // MARK: - Tab Content

    @ViewBuilder
    private var tabContent: some View {
        if inboxVM.isLoading {
            Spacer()
            ProgressView()
                .tint(AppTheme.rose)
            Spacer()
        } else {
            TabView(selection: $selectedTab) {
                LikedYouTabView(likes: inboxVM.likes)
                    .tag(0)

                MatchesTabView(matches: inboxVM.matches)
                    .tag(1)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
        }
    }
}

// MARK: - Segment Button

private struct InboxSegmentButton: View {
    let title: String
    let count: Int
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(title)
                    .font(.system(size: 14, weight: isSelected ? .semibold : .regular))

                if count > 0 {
                    Text("\(count)")
                        .font(.system(size: 11, weight: .bold))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(
                            Capsule()
                                .fill(isSelected ? AppTheme.rose.opacity(0.3) : Color.white.opacity(0.1))
                        )
                }
            }
            .foregroundColor(isSelected ? .white : AppTheme.textSecondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(
                Group {
                    if isSelected {
                        RoundedRectangle(cornerRadius: 11)
                            .fill(AppTheme.rose)
                    }
                }
            )
        }
    }
}

// MARK: - Liked You Tab

private struct LikedYouTabView: View {
    let likes: [LikedYouCard]

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        if likes.isEmpty {
            EmptyStateView(
                icon: "heart",
                title: "No likes yet",
                message: "When someone likes your profile, they will appear here. Keep your profile fresh!"
            )
        } else {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 14) {
                    ForEach(likes) { like in
                        LikedYouCardView(like: like)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 16)
                .padding(.bottom, 100)
            }
        }
    }
}

// MARK: - Liked You Card

private struct LikedYouCardView: View {
    let like: LikedYouCard

    var body: some View {
        Button {
            print("Tapped profile: \(like.user.displayName)")
        } label: {
            likeCardBody
        }
        .buttonStyle(.plain)
    }

    private var likeCardBody: some View {
        ContentCard {
            VStack(spacing: 10) {
                ProfileAvatar(
                    url: nil,
                    name: like.user.displayName,
                    size: 60,
                    isOnline: like.user.isOnline,
                    showBorder: true
                )

                VStack(spacing: 2) {
                    Text(like.user.displayName)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)

                    Text("\(like.user.age)")
                        .font(.system(size: 13))
                        .foregroundColor(AppTheme.textSecondary)
                }

                culturalBadge

                Text(like.likeLabel)
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textMuted)
                    .lineLimit(1)

                Text(like.likedAt.timeAgoShort)
                    .font(.system(size: 10))
                    .foregroundColor(AppTheme.textMuted)
            }
            .padding(.vertical, 14)
            .padding(.horizontal, 10)
            .frame(maxWidth: .infinity)
        }
    }

    private var culturalBadge: some View {
        let badgeColor: Color = {
            switch like.culturalBadge {
            case .gold: return AppTheme.scoreGold
            case .green: return AppTheme.scoreGreen
            case .orange: return AppTheme.scoreOrange
            case .none: return AppTheme.textMuted
            }
        }()

        return ScoreTag(
            label: "Cultural",
            value: "\(like.culturalScore)%",
            color: badgeColor
        )
    }
}

// MARK: - Matches Tab

private struct MatchesTabView: View {
    let matches: [Match]

    var body: some View {
        if matches.isEmpty {
            EmptyStateView(
                icon: "person.2",
                title: "No matches yet",
                message: "Start swiping on profiles to find your perfect match!"
            )
        } else {
            matchList
        }
    }

    private var matchList: some View {
        ScrollView {
            LazyVStack(spacing: 10) {
                ForEach(matches) { match in
                    NavigationLink(value: match) {
                        MatchRowView(match: match)
                    }
                }
            }
            .padding(.top, 12)
            .padding(.bottom, 100)
        }
    }
}

// MARK: - Match Row

private struct MatchRowView: View {
    let match: Match

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
                .foregroundColor(.white)

            Text(match.lastMessage?.content ?? "Send the first message!")
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textSecondary)
                .lineLimit(1)
        }
    }

    private var matchTrailing: some View {
        VStack(alignment: .trailing, spacing: 6) {
            if let lastMsg = match.lastMessage {
                Text(lastMsg.createdAt.timeAgoShort)
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textMuted)
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

// MARK: - Unread Badge

private struct MatchUnreadBadge: View {
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
