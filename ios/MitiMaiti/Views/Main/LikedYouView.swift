import SwiftUI

struct LikedYouView: View {
    @EnvironmentObject var inboxVM: InboxViewModel
    private let localization = LocalizationManager.shared
    @Environment(\.adaptiveColors) private var colors

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                likedYouHeader
                likedYouContent
            }
            .appBackground()
            .onAppear {
                inboxVM.loadInbox()
            }
        }
    }

    // MARK: - Header

    private var likedYouHeader: some View {
        HStack {
            Text(localization.t("inbox.likedYou"))
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(colors.textPrimary)

            if inboxVM.totalLikes > 0 {
                Text("\(inboxVM.totalLikes)")
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

    // MARK: - Content

    @ViewBuilder
    private var likedYouContent: some View {
        if inboxVM.isLoading {
            Spacer()
            ProgressView()
                .tint(AppTheme.rose)
            Spacer()
        } else if inboxVM.likes.isEmpty {
            EmptyStateView(
                icon: "heart",
                title: localization.t("inbox.noLikesYet"),
                message: localization.t("inbox.noLikesMessage")
            )
        } else {
            ScrollView {
                VStack(spacing: 20) {
                    // Main featured card (first like)
                    if let firstLike = inboxVM.likes.first {
                        LikedYouFeaturedCard(
                            like: firstLike,
                            onLike: { inboxVM.likeBack(likeId: firstLike.id) },
                            onPass: { inboxVM.passLike(likeId: firstLike.id) }
                        )
                    }

                    // Up Next section
                    if inboxVM.likes.count > 1 {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Up Next")
                                .font(.system(size: 17, weight: .semibold))
                                .foregroundColor(colors.textPrimary)
                                .padding(.horizontal)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(Array(inboxVM.likes.dropFirst().prefix(3))) { like in
                                        LikedYouThumbnailCard(like: like)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }

                    // Remaining likes as grid
                    if inboxVM.likes.count > 4 {
                        LazyVGrid(columns: columns, spacing: 14) {
                            ForEach(Array(inboxVM.likes.dropFirst(4))) { like in
                                LikedYouCardView(like: like)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.top, 16)
                .padding(.bottom, 100)
            }
        }
    }
}

// MARK: - Liked You Card

struct LikedYouCardView: View {
    let like: LikedYouCard
    @Environment(\.adaptiveColors) private var colors

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
                        .foregroundColor(colors.textPrimary)
                        .lineLimit(1)

                    Text("\(like.user.age)")
                        .font(.system(size: 13))
                        .foregroundColor(colors.textSecondary)
                }

                culturalBadge

                Text(like.likeLabel)
                    .font(.system(size: 11))
                    .foregroundColor(colors.textMuted)
                    .lineLimit(1)

                Text(like.likedAt.timeAgoShort)
                    .font(.system(size: 10))
                    .foregroundColor(colors.textMuted)
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
            case .none: return colors.textMuted
            }
        }()

        return ScoreTag(
            label: LocalizationManager.shared.t("common.cultural"),
            value: "\(like.culturalScore)%",
            color: badgeColor
        )
    }
}

// MARK: - Featured Card (Large, like Discover card)

struct LikedYouFeaturedCard: View {
    let like: LikedYouCard
    let onLike: () -> Void
    let onPass: () -> Void
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        VStack(spacing: 16) {
            // Large photo card with gradient and name overlay
            ZStack(alignment: .bottomLeading) {
                RoundedRectangle(cornerRadius: 16)
                    .fill(
                        LinearGradient(
                            colors: [AppTheme.rose.opacity(0.4), AppTheme.roseDark.opacity(0.5), AppTheme.roseDark.opacity(0.7)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 380)
                    .overlay(
                        Text(like.user.displayName.initials)
                            .font(.system(size: 72, weight: .bold))
                            .foregroundColor(.white.opacity(0.2))
                    )

                // Bottom gradient
                LinearGradient(
                    colors: [.clear, .clear, Color.black.opacity(0.6)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .clipShape(RoundedRectangle(cornerRadius: 16))

                // Name overlay
                VStack(alignment: .leading, spacing: 6) {
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text(like.user.displayName)
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)

                        Text("\(like.user.age)")
                            .font(.system(size: 22, weight: .medium))
                            .foregroundColor(.white.opacity(0.85))
                    }

                    if let city = like.user.city {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 12))
                            Text(city)
                                .font(.system(size: 14))
                        }
                        .foregroundColor(.white.opacity(0.8))
                    }

                    Text(like.likeLabel)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(Color.white.opacity(0.2)))
                }
                .padding(20)
            }
            .frame(height: 380)
            .clipShape(RoundedRectangle(cornerRadius: 16))

            // Action buttons
            HStack(spacing: 20) {
                // Pass button
                Button {
                    onPass()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(colors.textSecondary)
                        .frame(width: 56, height: 56)
                        .background(
                            Circle()
                                .fill(colors.surfaceMedium)
                                .overlay(
                                    Circle()
                                        .stroke(colors.border, lineWidth: 0.5)
                                )
                        )
                }

                // Like button
                Button {
                    onLike()
                } label: {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 64, height: 64)
                        .background(
                            Circle()
                                .fill(AppTheme.roseGradient)
                                .shadow(color: AppTheme.rose.opacity(0.4), radius: 10, x: 0, y: 4)
                        )
                }
            }
        }
        .padding(.horizontal)
    }
}

// MARK: - Thumbnail Card (Up Next)

struct LikedYouThumbnailCard: View {
    let like: LikedYouCard
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        VStack(spacing: 0) {
            ZStack(alignment: .bottomLeading) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        LinearGradient(
                            colors: [AppTheme.rose.opacity(0.3), AppTheme.roseDark.opacity(0.4)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 120, height: 150)
                    .overlay(
                        Text(like.user.displayName.initials)
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white.opacity(0.3))
                    )

                LinearGradient(
                    colors: [.clear, Color.black.opacity(0.5)],
                    startPoint: .center,
                    endPoint: .bottom
                )
                .clipShape(RoundedRectangle(cornerRadius: 12))

                VStack(alignment: .leading, spacing: 2) {
                    Text(like.user.displayName.components(separatedBy: " ").first ?? like.user.displayName)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)

                    Text("\(like.user.age)")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.8))
                }
                .padding(8)
            }
            .frame(width: 120, height: 150)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}
