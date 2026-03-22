import SwiftUI

struct InboxView: View {
    @EnvironmentObject var inboxVM: InboxViewModel
    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Text("Inbox")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    // Tab Selector
                    HStack(spacing: 0) {
                        TabButton(title: "Likes (\(inboxVM.totalLikes))", isSelected: selectedTab == 0) {
                            withAnimation { selectedTab = 0 }
                        }
                        TabButton(title: "Matches (\(inboxVM.totalMatches))", isSelected: selectedTab == 1) {
                            withAnimation { selectedTab = 1 }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    if inboxVM.isLoading {
                        Spacer()
                        ProgressView().tint(AppTheme.rose)
                        Spacer()
                    } else {
                        TabView(selection: $selectedTab) {
                            // Likes Tab
                            LikesTabContent(likes: inboxVM.likes, onLike: inboxVM.likeBack, onPass: inboxVM.passLike)
                                .tag(0)

                            // Matches Tab
                            MatchesTabContent(matches: inboxVM.matches)
                                .tag(1)
                        }
                        .tabViewStyle(.page(indexDisplayMode: .never))
                    }
                }
                .padding(.bottom, 70)
            }
        }
    }
}

// MARK: - Tab Button
struct TabButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Text(title)
                    .font(.system(size: 15, weight: isSelected ? .semibold : .regular))
                    .foregroundColor(isSelected ? .white : AppTheme.textMuted)

                Rectangle()
                    .fill(isSelected ? AppTheme.rose : Color.clear)
                    .frame(height: 2)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Likes Tab
struct LikesTabContent: View {
    let likes: [LikedYouCard]
    let onLike: (String) -> Void
    let onPass: (String) -> Void

    var body: some View {
        if likes.isEmpty {
            EmptyStateView(icon: "heart", title: "No likes yet", message: "When someone likes you, they'll appear here")
        } else {
            ScrollView {
                VStack(spacing: 16) {
                    // Main card
                    if let first = likes.first {
                        LikeProfileCard(like: first, onLike: onLike, onPass: onPass)
                            .padding(.horizontal)
                    }

                    // Up next
                    if likes.count > 1 {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Up next")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(AppTheme.textSecondary)
                                .padding(.horizontal)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(likes.dropFirst().prefix(3)) { like in
                                        GlassCard(cornerRadius: 14) {
                                            VStack(spacing: 8) {
                                                ProfileAvatar(url: nil, name: like.user.displayName, size: 56)
                                                Text(like.user.displayName)
                                                    .font(.system(size: 13, weight: .medium))
                                                    .foregroundColor(.white)
                                                Text("\(like.user.age)")
                                                    .font(.system(size: 11))
                                                    .foregroundColor(AppTheme.textSecondary)
                                            }
                                            .padding(12)
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                }
                .padding(.top, 16)
                .padding(.bottom, 100)
            }
        }
    }
}

struct LikeProfileCard: View {
    let like: LikedYouCard
    let onLike: (String) -> Void
    let onPass: (String) -> Void

    var body: some View {
        GlassCard(cornerRadius: 20) {
            VStack(spacing: 0) {
                // Photo area
                ZStack(alignment: .bottom) {
                    RoundedRectangle(cornerRadius: 0)
                        .fill(
                            LinearGradient(
                                colors: [AppTheme.rose.opacity(0.3), AppTheme.surfaceDark],
                                startPoint: .top, endPoint: .bottom
                            )
                        )
                        .frame(height: 280)
                        .overlay(
                            Image(systemName: "person.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.white.opacity(0.3))
                        )

                    // Like label
                    Text(like.likeLabel)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(AppTheme.roseGradient)
                        .clipShape(Capsule())
                        .padding(.bottom, 60)

                    // Name overlay
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(like.user.displayName), \(like.user.age)")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.white)
                            Text(like.user.city ?? "")
                                .font(.system(size: 13))
                                .foregroundColor(.white.opacity(0.7))
                        }
                        Spacer()
                        ScoreTagView(label: "Cultural", value: "\(like.culturalScore)%",
                                    color: like.culturalBadge == .gold ? AppTheme.scoreGold : AppTheme.scoreGreen)
                    }
                    .padding(16)
                    .background(LinearGradient(colors: [.clear, .black.opacity(0.6)], startPoint: .top, endPoint: .bottom))
                }

                // Action buttons
                HStack(spacing: 24) {
                    ActionCircle(icon: "xmark", color: AppTheme.textMuted, size: 52) {
                        onPass(like.id)
                    }
                    ActionCircle(icon: "heart.fill", color: AppTheme.rose, size: 52) {
                        onLike(like.id)
                    }
                }
                .padding(.vertical, 16)
            }
        }
    }
}

// MARK: - Matches Tab
struct MatchesTabContent: View {
    let matches: [Match]

    var body: some View {
        if matches.isEmpty {
            EmptyStateView(icon: "person.2", title: "No matches yet", message: "Start liking profiles to get matches!")
        } else {
            ScrollView {
                VStack(spacing: 12) {
                    // Pending matches: awaiting first message OR locked (waiting for reply)
                    let pending = matches.filter { $0.showCountdown }
                    if !pending.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("New Matches")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(AppTheme.textSecondary)
                                .padding(.horizontal)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(pending) { match in
                                        NavigationLink(value: match) {
                                            VStack(spacing: 6) {
                                                ZStack {
                                                    // Circular timer ring around avatar
                                                    ProfileAvatar(url: nil, name: match.otherUser.displayName, size: 64, isOnline: match.otherUser.isOnline, showBorder: true)

                                                    // Lock icon if I sent first and waiting
                                                    if match.firstMsgLocked && match.firstMsgBy == "current-user-id" {
                                                        Image(systemName: "lock.fill")
                                                            .font(.system(size: 10))
                                                            .foregroundColor(AppTheme.rose)
                                                            .padding(4)
                                                            .background(AppTheme.background)
                                                            .clipShape(Circle())
                                                            .offset(x: 24, y: -24)
                                                    }

                                                    if let exp = match.expiresAt {
                                                        CountdownBadge(expiresAt: exp)
                                                            .offset(y: 30)
                                                    }
                                                }
                                                Text(match.otherUser.displayName)
                                                    .font(.system(size: 12, weight: .medium))
                                                    .foregroundColor(.white)
                                            }
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }

                    // Active chats: unlocked conversations (both users have exchanged messages)
                    let active = matches.filter { !$0.showCountdown && $0.hasFirstMessage }
                    if !active.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Conversations")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(AppTheme.textSecondary)
                                .padding(.horizontal)

                            ForEach(active) { match in
                                NavigationLink(value: match) {
                                    MatchRow(match: match)
                                }
                            }
                        }
                    }
                }
                .padding(.top, 12)
                .padding(.bottom, 100)
            }
            .navigationDestination(for: Match.self) { match in
                ChatView(match: match)
            }
        }
    }
}

struct MatchRow: View {
    let match: Match

    var body: some View {
        HStack(spacing: 12) {
            ProfileAvatar(url: nil, name: match.otherUser.displayName, size: 52, isOnline: match.otherUser.isOnline)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(match.otherUser.displayName)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
                    if match.otherUser.isVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 12))
                            .foregroundColor(AppTheme.info)
                    }
                }

                Text(match.lastMessage?.content ?? "Say hello!")
                    .font(.system(size: 13))
                    .foregroundColor(AppTheme.textSecondary)
                    .lineLimit(1)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 6) {
                Text(match.lastMessage?.createdAt.timeAgoShort ?? "")
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textMuted)

                if match.unreadCount > 0 {
                    BadgeView(count: match.unreadCount)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }
}
