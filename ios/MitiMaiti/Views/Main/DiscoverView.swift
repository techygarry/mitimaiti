import SwiftUI

struct DiscoverView: View {
    @EnvironmentObject var feedVM: FeedViewModel
    @Environment(\.adaptiveColors) private var colors
    private let localization = LocalizationManager.shared
    @State private var showFilters = false
    @State private var showNotifications = false
    @EnvironmentObject var profileVM: ProfileViewModel
    @State private var showEditProfile = false
    @State private var bannerDismissed = false
    @State private var showShareSheet = false
    @ObservedObject private var notificationManager = NotificationManager.shared

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                discoverHeader
                mainContent
            }
            .appBackground()
            .sheet(isPresented: $feedVM.showScoreBreakdown) {
                if let card = feedVM.selectedCard {
                    ScoreBreakdownSheet(card: card)
                }
            }
            .sheet(isPresented: $showFilters) {
                FilterSheetView()
            }
            .sheet(isPresented: $showNotifications) {
                NotificationPanelView()
            }
            .alert(localization.t("discover.itsAMatch"), isPresented: $feedVM.showMatchAlert) {
                Button(localization.t("discover.sendMessage")) {}
                Button(localization.t("discover.keepDiscovering"), role: .cancel) {}
            } message: {
                if let user = feedVM.matchedUser {
                    Text("You and \(user.displayName) liked each other! Start a conversation within 24 hours.")
                }
            }
            .navigationDestination(isPresented: $showEditProfile) {
                EditProfileView()
                    .environmentObject(profileVM)
            }
            .sheet(isPresented: $showShareSheet) {
                ShareSheet(activityItems: [
                    "Join MitiMaiti - the dating app for the Sindhi community! Download now: https://mitimaiti.app/download"
                ])
            }
        }
    }

    // MARK: - Header

    private var discoverHeader: some View {
        HStack {
            Text(localization.t("discover.title"))
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(colors.textPrimary)

            Spacer()

            // Notification bell
            Button { showNotifications = true } label: {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell")
                        .font(.system(size: 20))
                        .foregroundColor(colors.textPrimary)

                    if notificationManager.unreadCount > 0 {
                        Text("\(min(notificationManager.unreadCount, 9))")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 16, height: 16)
                            .background(Circle().fill(AppTheme.rose))
                            .offset(x: 8, y: -6)
                    }
                }
                .frame(width: 40, height: 40)
            }

            // Filters pill button matching web
            Button { showFilters = true } label: {
                HStack(spacing: 6) {
                    Image(systemName: "slider.horizontal.3")
                        .font(.system(size: 14, weight: .medium))
                    Text("Filters")
                        .font(.system(size: 14, weight: .medium))
                }
                .foregroundColor(colors.textPrimary)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(colors.cardDark)
                .clipShape(Capsule())
                .overlay(
                    Capsule().stroke(colors.border, lineWidth: 1)
                )
            }
        }
        .padding(.horizontal, AppTheme.spacingMD)
        .padding(.top, 8)
        .padding(.bottom, 4)
    }

    // MARK: - Profile Completeness Banner

    @ViewBuilder
    private var profileCompletenessBanner: some View {
        if profileVM.user.profileCompleteness < 90 && !bannerDismissed {
            HStack(spacing: 10) {
                Image(systemName: "person.crop.circle.badge.exclamationmark")
                    .font(.system(size: 20))
                    .foregroundColor(AppTheme.rose)

                VStack(alignment: .leading, spacing: 2) {
                    Text(localization.t("discover.completeProfile"))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(colors.textPrimary)
                    Text(localization.t("discover.completeProfileHint"))
                        .font(.system(size: 11))
                        .foregroundColor(colors.textSecondary)
                        .lineLimit(1)
                }

                Spacer()

                Button { showEditProfile = true } label: {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(AppTheme.rose)
                }

                Button { withAnimation { bannerDismissed = true } } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(colors.textMuted)
                }
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(AppTheme.rose.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(AppTheme.rose.opacity(0.15), lineWidth: 0.5)
                    )
            )
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.top, 4)
            .transition(.opacity.combined(with: .move(edge: .top)))
        }
    }

    // MARK: - Main Content

    @ViewBuilder
    private var mainContent: some View {
        if feedVM.isLoading {
            Spacer()
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: AppTheme.rose))
                .scaleEffect(1.5)
            Spacer()
        } else if feedVM.cards.isEmpty {
            Spacer()
            VStack(spacing: 16) {
                EmptyStateView(
                    icon: "heart.slash",
                    title: localization.t("discover.noMoreProfiles"),
                    message: localization.t("discover.noMoreProfilesMessage"),
                    actionTitle: localization.t("discover.adjustFilters"),
                    action: { showFilters = true }
                )
                Button {
                    showShareSheet = true
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 14, weight: .semibold))
                        Text(localization.t("discover.inviteFriends"))
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundColor(AppTheme.rose)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(
                        Capsule()
                            .fill(AppTheme.rose.opacity(0.15))
                            .overlay(
                                Capsule()
                                    .stroke(AppTheme.rose.opacity(0.3), lineWidth: 0.5)
                            )
                    )
                }
            }
            Spacer()
        } else {
            cardDeckView
        }
    }

    // MARK: - Card Deck View (matching web)

    @State private var showProfileDetail = false

    private var cardDeckView: some View {
        GeometryReader { geo in
            let cardWidth = geo.size.width - 16 - 48 // leading 16 + trailing 48 for deck edges
            let cardHeight = cardWidth * (4.2 / 3.0)  // 3:4.2 aspect ratio

            VStack(spacing: 0) {
                // Deck with right-side peeking edges
                ZStack {
                    ForEach((1...5).reversed(), id: \.self) { i in
                        RoundedRectangle(cornerRadius: 20)
                            .fill(Color(white: 1.0 - Double(i) * 0.04))
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(Color.gray.opacity(0.15), lineWidth: 0.5)
                            )
                            .padding(.leading, 16)
                            .padding(.trailing, 8 + CGFloat(5 - i) * 8)
                            .padding(.top, CGFloat(i * 3))
                            .padding(.bottom, CGFloat(i * 3))
                    }

                    if let card = feedVM.cards.first {
                        activeCard(card: card)
                            .padding(.leading, 16)
                            .padding(.trailing, 48)
                    }
                }
                .frame(height: cardHeight)

                // Pass / Like buttons — equal gap above and below
                HStack(spacing: 16) {
                    Button { feedVM.passUser() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.gray)
                            .frame(width: 52, height: 52)
                            .background(
                                Circle()
                                    .fill(colors.cardDark)
                                    .shadow(color: .black.opacity(0.15), radius: 6, x: 0, y: 3)
                            )
                    }
                    Button { feedVM.likeUser() } label: {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 56, height: 56)
                            .background(
                                Circle()
                                    .fill(AppTheme.rose)
                                    .shadow(color: AppTheme.rose.opacity(0.4), radius: 8, x: 0, y: 4)
                            )
                    }
                }
                .padding(.vertical, 6)

                // Complete your profile banner
                if profileVM.user.profileCompleteness < 90 && !bannerDismissed {
                    completeBanner
                }
            }
        }
    }

    private func activeCard(card: FeedCard) -> some View {
        let photoURL = card.user.photos.first?.url ?? ""

        return Color.clear
            .overlay(
                AsyncImage(url: URL(string: photoURL)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    case .failure:
                        ZStack {
                            LinearGradient(
                                colors: [AppTheme.rose.opacity(0.35), AppTheme.roseDark.opacity(0.65)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                            Text(card.user.displayName.initials)
                                .font(.system(size: 64, weight: .bold))
                                .foregroundColor(.white.opacity(0.25))
                        }
                    case .empty:
                        ZStack {
                            LinearGradient(
                                colors: [AppTheme.rose.opacity(0.2), AppTheme.roseDark.opacity(0.3)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                            ProgressView()
                                .tint(.white)
                                .scaleEffect(1.5)
                        }
                    @unknown default:
                        Color.gray
                    }
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .overlay(
                LinearGradient(
                    colors: [.clear, .clear, Color.black.opacity(0.6)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .clipShape(RoundedRectangle(cornerRadius: 20))
            )
            .overlay(alignment: .bottomLeading) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(card.user.displayName)
                            .font(.system(size: 24, weight: .bold))
                        Text("\(card.user.age)")
                            .font(.system(size: 20, weight: .medium))
                            .opacity(0.85)
                        if card.user.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 16))
                                .foregroundColor(AppTheme.info)
                        }
                    }
                    if let city = card.user.city {
                        HStack(spacing: 3) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 11))
                            Text(city)
                                .font(.system(size: 13))
                        }
                        .opacity(0.8)
                    }
                }
                .foregroundColor(.white)
                .padding(20)
                .padding(.bottom, 40)
            }
            .shadow(color: colors.elevatedShadowColor, radius: 16, x: 0, y: 8)
            .onTapGesture {
                feedVM.selectedCard = card
                showProfileDetail = true
            }
            .sheet(isPresented: $showProfileDetail) {
                if let card = feedVM.selectedCard {
                    ProfileDetailSheet(card: card, feedVM: feedVM)
                }
            }
    }

    // MARK: - Completeness Banner

    private var completeBanner: some View {
        Button { showEditProfile = true } label: {
            HStack(spacing: 10) {
                Circle()
                    .fill(AppTheme.rose)
                    .frame(width: 8, height: 8)

                Group {
                    Text("Complete your profile")
                        .font(.system(size: 13, weight: .semibold))
                    + Text(" — Sindhi Identity & Chatti details get 3x more matches!")
                        .font(.system(size: 13))
                }
                .foregroundColor(colors.textSecondary)
                .lineLimit(2)

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(colors.textMuted)
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(colors.cardDark)
                    .shadow(color: colors.cardShadowColor, radius: 4, x: 0, y: 2)
            )
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
    }
}

// MARK: - Profile Detail Sheet (tap card to see full profile)

private struct ProfileDetailSheet: View {
    let card: FeedCard
    @ObservedObject var feedVM: FeedViewModel
    @Environment(\.dismiss) var dismiss
    @Environment(\.adaptiveColors) private var colors
    private let localization = LocalizationManager.shared

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 12) {
                    // Photo header
                    AsyncImage(url: URL(string: card.user.photos.first?.url ?? "")) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFill()
                        case .failure:
                            ZStack {
                                LinearGradient(colors: [AppTheme.rose.opacity(0.4), AppTheme.roseDark.opacity(0.6)], startPoint: .topLeading, endPoint: .bottomTrailing)
                                Text(card.user.displayName.initials).font(.system(size: 60, weight: .bold)).foregroundColor(.white.opacity(0.25))
                            }
                        case .empty:
                            ZStack {
                                Color.gray.opacity(0.1)
                                ProgressView().tint(AppTheme.rose)
                            }
                        @unknown default: Color.gray
                        }
                    }
                    .frame(height: 320)
                    .frame(maxWidth: .infinity)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    // Name + age
                    HStack(spacing: 8) {
                        Text(card.user.displayName)
                            .font(.system(size: 26, weight: .bold))
                        Text("\(card.user.age)")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(colors.textSecondary)
                        if card.user.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(AppTheme.info)
                        }
                    }
                    .foregroundColor(colors.textPrimary)

                    // Location
                    if let city = card.user.city {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 13))
                            Text(city)
                                .font(.system(size: 14))
                        }
                        .foregroundColor(colors.textSecondary)
                    }

                    // Intent
                    if let intent = card.user.intent {
                        HStack(spacing: 4) {
                            Image(systemName: intent.icon)
                                .font(.system(size: 11))
                            Text(intent.display)
                                .font(.system(size: 12, weight: .medium))
                        }
                        .foregroundColor(AppTheme.roseLight)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(AppTheme.rose.opacity(0.15)))
                    }

                    // Scores
                    HStack(spacing: 8) {
                        ScoreTag(label: "Cultural", value: "\(card.culturalScore.overallScore)%", color: AppTheme.scoreGold, icon: "sparkles")
                        if let k = card.kundliScore {
                            ScoreTag(label: "Kundli", value: "\(k.totalScore)/\(k.maxScore)", color: AppTheme.gold, icon: "star.fill")
                        }
                    }
                    .padding(.top, 4)

                    // Bio
                    if let bio = card.user.bio, !bio.isEmpty {
                        Text(bio)
                            .font(.system(size: 15))
                            .foregroundColor(colors.textSecondary)
                            .lineSpacing(4)
                            .padding(14)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(colors.surfaceMedium)
                            )
                    }

                    // Prompts
                    ForEach(card.user.prompts) { prompt in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(prompt.question)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(AppTheme.gold)
                            Text(prompt.answer)
                                .font(.system(size: 15))
                                .foregroundColor(colors.textPrimary)
                        }
                        .padding(14)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(colors.surfaceMedium)
                        )
                    }

                    // Interests
                    if !card.user.interests.isEmpty {
                        Text("Interests")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(colors.textPrimary)
                            .padding(.top, 4)

                        FlowLayout(spacing: 8) {
                            ForEach(card.user.interests, id: \.self) { interest in
                                Text(interest)
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(colors.textPrimary)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(
                                        Capsule().fill(colors.surfaceMedium)
                                    )
                            }
                        }
                    }

                    // Action buttons
                    HStack(spacing: 16) {
                        Button {
                            dismiss()
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                feedVM.passUser()
                            }
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: "xmark")
                                    .font(.system(size: 14, weight: .bold))
                                Text("Pass")
                                    .font(.system(size: 15, weight: .semibold))
                            }
                            .foregroundColor(colors.textSecondary)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(colors.surfaceMedium)
                            .clipShape(Capsule())
                        }

                        Button {
                            dismiss()
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                feedVM.likeUser()
                            }
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: "heart.fill")
                                    .font(.system(size: 14, weight: .bold))
                                Text("Like")
                                    .font(.system(size: 15, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(AppTheme.rose)
                            .clipShape(Capsule())
                        }
                    }
                    .padding(.top, 8)

                    Spacer().frame(height: 40)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
            }
            .appBackground()
            .navigationTitle(card.user.displayName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(AppTheme.rose)
                }
            }
        }
    }
}

// MARK: - ProfileScrollView REMOVED - replaced by card deck + ProfileDetailSheet above

private struct ProfileScrollView_UNUSED: View {
    let card: FeedCard
    @ObservedObject var feedVM: FeedViewModel
    @Environment(\.adaptiveColors) private var colors
    private let localization = LocalizationManager.shared

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                // Hero photo with overlaid action buttons
                ZStack(alignment: .bottom) {
                    heroPhotoArea

                    // Pass/Like buttons floating over bottom of photo
                    HStack(spacing: 16) {
                        // Pass
                        Button { feedVM.passUser() } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(Color.gray)
                                .frame(width: 52, height: 52)
                                .background(
                                    Circle()
                                        .fill(colors.cardDark)
                                        .overlay(Circle().stroke(colors.border, lineWidth: 1))
                                        .shadow(color: colors.cardShadowColor, radius: 6, x: 0, y: 3)
                                )
                        }

                        // Like
                        Button { feedVM.likeUser() } label: {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 56, height: 56)
                                .background(
                                    Circle()
                                        .fill(AppTheme.rose)
                                        .shadow(color: AppTheme.rose.opacity(0.4), radius: 8, x: 0, y: 4)
                                )
                        }
                    }
                    .padding(.bottom, 20)
                }

                // Profile content below photo
                scoresSection
                bioSection
                promptsSection
                interestsSection
                languagesSection
                aboutSection
                distanceSection

                // Completeness banner (matching web position - below card)
                profileCompletenessBanner
                    .padding(.top, 12)

                Spacer().frame(height: 100)
            }
        }
    }

    // MARK: - Completeness Banner (inside scroll)

    @ViewBuilder
    private var profileCompletenessBanner: some View {
        HStack(spacing: 10) {
            Circle()
                .fill(AppTheme.rose)
                .frame(width: 8, height: 8)

            Group {
                Text("Complete your profile")
                    .font(.system(size: 14, weight: .semibold))
                + Text(" — Sindhi Identity & Chatti details get 3x more matches!")
                    .font(.system(size: 14))
            }
            .foregroundColor(colors.textSecondary)
            .lineLimit(2)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(colors.cardDark)
                .shadow(color: colors.cardShadowColor, radius: 6, x: 0, y: 2)
        )
        .padding(.horizontal, AppTheme.spacingMD)
    }

    // MARK: - Hero Photo with Name Overlay

    private var heroPhotoArea: some View {
        ZStack(alignment: .bottomLeading) {
            // Photo/gradient background
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [AppTheme.rose.opacity(0.4), AppTheme.roseDark.opacity(0.5), AppTheme.roseDark.opacity(0.7)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 340)
                .overlay(
                    Text(card.user.displayName.initials)
                        .font(.system(size: 72, weight: .bold))
                        .foregroundColor(.white.opacity(0.2))
                )

            // Bottom gradient overlay
            LinearGradient(
                colors: [.clear, .clear, Color.black.opacity(0.6)],
                startPoint: .top,
                endPoint: .bottom
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))

            // Name, age, location overlay on photo
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text(card.user.displayName)
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)

                    Text("\(card.user.age)")
                        .font(.system(size: 22, weight: .medium))
                        .foregroundColor(.white.opacity(0.85))

                    if card.user.isVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 18))
                            .foregroundColor(AppTheme.info)
                    }
                }

                if let city = card.user.city {
                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 12))
                        Text(city)
                            .font(.system(size: 14))
                    }
                    .foregroundColor(.white.opacity(0.8))
                }

                if let intent = card.user.intent {
                    HStack(spacing: 4) {
                        Image(systemName: intent.icon)
                            .font(.system(size: 10))
                        Text(intent.display)
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(Color.white.opacity(0.2)))
                }
            }
            .padding(20)
        }
        .frame(height: 340)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, AppTheme.spacingMD)
        .padding(.top, 4)
    }

    // MARK: - Scores

    private var scoresSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Spacer().frame(height: 4)
            HStack(spacing: 8) {
                Button {
                    feedVM.selectedCard = card
                    feedVM.showScoreBreakdown = true
                } label: {
                    ScoreTag(
                        label: localization.t("common.cultural"),
                        value: "\(card.culturalScore.overallScore)%",
                        color: badgeColor(card.culturalScore.badge),
                        icon: "sparkles"
                    )
                }
                .buttonStyle(.plain)

                if let kundli = card.kundliScore {
                    Button {
                        feedVM.selectedCard = card
                        feedVM.showScoreBreakdown = true
                    } label: {
                        ScoreTag(
                            label: localization.t("welcome.kundli"),
                            value: "\(kundli.totalScore)/\(kundli.maxScore)",
                            color: tierColor(kundli.tier),
                            icon: "star.fill"
                        )
                    }
                    .buttonStyle(.plain)
                }
            }

            Button {
                feedVM.selectedCard = card
                feedVM.showScoreBreakdown = true
            } label: {
                HStack(spacing: 4) {
                    Text(localization.t("discover.seeBreakdown"))
                        .font(.system(size: 13, weight: .medium))
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                }
                .foregroundColor(AppTheme.rose)
            }
        }
        .padding(.horizontal, AppTheme.spacingMD)
        .padding(.vertical, AppTheme.spacingSM)
    }

    // MARK: - Bio

    @ViewBuilder
    private var bioSection: some View {
        if let bio = card.user.bio, !bio.isEmpty {
            ContentCard {
                Text(bio)
                    .font(.system(size: 15))
                    .foregroundColor(colors.textSecondary)
                    .lineSpacing(4)
                    .padding(AppTheme.spacingMD)
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.vertical, AppTheme.spacingSM)
        }
    }

    // MARK: - Prompts

    @ViewBuilder
    private var promptsSection: some View {
        if !card.user.prompts.isEmpty {
            VStack(spacing: 12) {
                ForEach(card.user.prompts) { prompt in
                    PromptCard(prompt: prompt)
                }
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.vertical, AppTheme.spacingSM)
        }
    }

    // MARK: - Interests

    @ViewBuilder
    private var interestsSection: some View {
        if !card.user.interests.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                Text(localization.t("discover.interests"))
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(colors.textPrimary)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(card.user.interests, id: \.self) { interest in
                            InterestCapsule(text: interest)
                        }
                    }
                }
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.vertical, AppTheme.spacingSM)
        }
    }

    // MARK: - Second Photo Area

    private var secondPhotoArea: some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(
                LinearGradient(
                    colors: [AppTheme.rose.opacity(0.3), AppTheme.roseDark.opacity(0.4)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(height: 260)
            .overlay(
                Image(systemName: "camera.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.white.opacity(0.3))
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.vertical, AppTheme.spacingSM)
    }

    // MARK: - Languages

    @ViewBuilder
    private var languagesSection: some View {
        if let languages = card.user.languages, !languages.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                Text(localization.t("discover.languages"))
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(colors.textPrimary)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(languages, id: \.self) { language in
                            HStack(spacing: 4) {
                                Image(systemName: "globe")
                                    .font(.system(size: 11))
                                Text(language)
                                    .font(.system(size: 13, weight: .medium))
                            }
                            .foregroundColor(AppTheme.rose)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                Capsule()
                                    .fill(colors.surfaceMedium)
                                    .overlay(
                                        Capsule()
                                            .stroke(AppTheme.rose.opacity(0.3), lineWidth: 0.5)
                                    )
                            )
                        }
                    }
                }
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.vertical, AppTheme.spacingSM)
        }
    }

    // MARK: - About

    @ViewBuilder
    private var aboutSection: some View {
        let items = aboutItems
        if !items.isEmpty {
            ContentCard {
                VStack(alignment: .leading, spacing: 12) {
                    Text(localization.t("discover.about"))
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(colors.textPrimary)

                    ForEach(items, id: \.0) { item in
                        AboutRow(icon: item.0, label: item.1, value: item.2)
                    }
                }
                .padding(AppTheme.spacingMD)
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.vertical, AppTheme.spacingSM)
        }
    }

    private var aboutItems: [(String, String, String)] {
        var result: [(String, String, String)] = []
        if let h = card.user.heightCm {
            result.append(("ruler", localization.t("profile.height"), "\(h) cm"))
        }
        if let edu = card.user.education {
            result.append(("graduationcap.fill", localization.t("profile.education"), edu))
        }
        if let occ = card.user.occupation {
            result.append(("briefcase.fill", localization.t("profile.occupation"), occ))
        }
        return result
    }

    // MARK: - Distance

    @ViewBuilder
    private var distanceSection: some View {
        if let dist = card.distanceKm {
            HStack(spacing: 6) {
                Image(systemName: "location.fill")
                    .font(.system(size: 13))
                    .foregroundColor(AppTheme.rose)
                Text(String(format: "%.0f km away", dist))
                    .font(.system(size: 14))
                    .foregroundColor(colors.textSecondary)
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.vertical, AppTheme.spacingSM)
        }
    }

    // MARK: - Helpers

    private func badgeColor(_ badge: CulturalBadge) -> Color {
        switch badge {
        case .gold: return AppTheme.scoreGold
        case .green: return AppTheme.scoreGreen
        case .orange: return AppTheme.scoreOrange
        case .none: return colors.textMuted
        }
    }

    private func tierColor(_ tier: KundliTier) -> Color {
        switch tier {
        case .excellent: return AppTheme.scoreGold
        case .good: return AppTheme.scoreGreen
        case .challenging: return AppTheme.scoreOrange
        }
    }
}

// MARK: - Prompt Card

private struct PromptCard: View {
    let prompt: UserPrompt
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 8) {
                Text(prompt.question)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(AppTheme.gold)

                Text(prompt.answer)
                    .font(.system(size: 15))
                    .foregroundColor(colors.textPrimary)
                    .lineSpacing(3)
            }
            .padding(AppTheme.spacingMD)
        }
    }
}

// MARK: - Interest Capsule

private struct InterestCapsule: View {
    let text: String
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        Text(text)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(colors.textPrimary)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(colors.surfaceMedium)
                    .overlay(
                        Capsule()
                            .stroke(colors.border, lineWidth: 0.5)
                    )
            )
    }
}

// MARK: - About Row

private struct AboutRow: View {
    let icon: String
    let label: String
    let value: String
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.rose)
                .frame(width: 20)

            Text(label)
                .font(.system(size: 13))
                .foregroundColor(colors.textMuted)
                .frame(width: 80, alignment: .leading)

            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(colors.textPrimary)
        }
    }
}

// MARK: - Action Circle Button

struct ActionCircleButton: View {
    let icon: String
    let size: CGFloat
    var fillColor: Color?
    var iconColor: Color = .white
    var useRoseGradient: Bool = false
    let action: () -> Void

    @Environment(\.adaptiveColors) private var colors
    @State private var tapTrigger = false

    var body: some View {
        Button {
            tapTrigger.toggle()
            action()
        } label: {
            Image(systemName: icon)
                .font(.system(size: size * 0.35, weight: .bold))
                .foregroundColor(iconColor)
                .frame(width: size, height: size)
                .background(circleBackground)
        }
        .sensoryFeedback(.impact, trigger: tapTrigger)
    }

    @ViewBuilder
    private var circleBackground: some View {
        if useRoseGradient {
            Circle()
                .fill(AppTheme.roseGradient)
                .shadow(color: AppTheme.rose.opacity(0.4), radius: 10, x: 0, y: 4)
        } else if let fill = fillColor {
            Circle()
                .fill(fill)
                .overlay(
                    Circle()
                        .stroke(colors.borderSubtle, lineWidth: 0.5)
                )
        }
    }
}

// MARK: - Score Breakdown Sheet

struct ScoreBreakdownSheet: View {
    let card: FeedCard
    @Environment(\.dismiss) var dismiss
    @Environment(\.adaptiveColors) private var colors
    private let localization = LocalizationManager.shared

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    culturalSection
                    kundliSection
                }
                .padding(AppTheme.spacingMD)
            }
            .appBackground()
            .navigationTitle(localization.t("discover.compatibility"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(localization.t("common.done")) { dismiss() }
                        .foregroundColor(AppTheme.rose)
                }
            }
        }
        .presentationDetents([.large])
    }

    // MARK: - Cultural Section

    private var culturalSection: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Text(localization.t("discover.culturalCompatibility"))
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(colors.textPrimary)
                    Spacer()
                    Text("\(card.culturalScore.overallScore)%")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(AppTheme.scoreGold)
                }

                ForEach(card.culturalScore.dimensions) { dim in
                    DimensionProgressRow(name: dim.name, score: dim.score, maxScore: dim.maxScore, color: AppTheme.rose)
                }
            }
            .padding(AppTheme.spacingMD)
        }
    }

    // MARK: - Kundli Section

    @ViewBuilder
    private var kundliSection: some View {
        if let kundli = card.kundliScore {
            ContentCard {
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Text(localization.t("discover.kundliMatch"))
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(colors.textPrimary)
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("\(kundli.totalScore)/\(kundli.maxScore)")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(AppTheme.gold)
                            Text(kundli.tier.display)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(AppTheme.gold)
                        }
                    }

                    ForEach(kundli.gunas) { guna in
                        DimensionProgressRow(name: guna.name, score: guna.score, maxScore: guna.maxScore, color: AppTheme.gold)
                    }
                }
                .padding(AppTheme.spacingMD)
            }
        }
    }
}

// MARK: - Dimension Progress Row

private struct DimensionProgressRow: View {
    let name: String
    let score: Int
    let maxScore: Int
    let color: Color
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(name)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(colors.textPrimary)
                Spacer()
                Text("\(score)/\(maxScore)")
                    .font(.system(size: 12))
                    .foregroundColor(colors.textSecondary)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(colors.border)
                        .frame(height: 6)

                    let fraction = maxScore > 0 ? CGFloat(score) / CGFloat(maxScore) : 0
                    Capsule()
                        .fill(color)
                        .frame(width: geo.size.width * fraction, height: 6)
                }
            }
            .frame(height: 6)
        }
    }
}

// MARK: - Filter Sheet

struct FilterSheetView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.adaptiveColors) private var colors
    private let localization = LocalizationManager.shared

    // MARK: Basic
    @State private var selectedGender: ShowMe = .women
    @State private var ageMin: Double = 21
    @State private var ageMax: Double = 35
    @State private var heightMin: Double = 150
    @State private var heightMax: Double = 190
    @State private var verifiedOnly = false

    // MARK: Intent & Interests
    @State private var selectedIntents: Set<Intent> = []
    @State private var selectedInterests: Set<String> = []

    // MARK: Community & Culture
    @State private var selectedReligion: String = "Any"
    @State private var selectedFluency: String = "Any"
    @State private var selectedGeneration: String = "Any"
    @State private var selectedDietary: String = "Any"
    @State private var gotraText: String = ""

    // MARK: Lifestyle
    @State private var selectedEducation: String = "Any"
    @State private var selectedSmoking: String = "Any"
    @State private var selectedDrinking: String = "Any"
    @State private var selectedExercise: String = "Any"
    @State private var selectedWantsKids: String = "Any"

    // MARK: Option Lists
    private let religionOptions = ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Other", "Any"]
    private let fluencyOptions = ["Native", "Fluent", "Conversational", "Basic", "Learning", "None", "Any"]
    private let generationOptions = ["1st Gen", "2nd Gen", "3rd Gen+", "Any"]
    private let dietaryOptions = ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain", "Any"]
    private let educationOptions = ["High School", "Bachelor's", "Master's", "Doctorate", "Any"]
    private let smokingOptions = ["Never", "Sometimes", "Regularly", "Any"]
    private let drinkingOptions = ["Never", "Sometimes", "Regularly", "Any"]
    private let exerciseOptions = ["Daily", "Often", "Sometimes", "Never", "Any"]
    private let wantsKidsOptions = ["Yes", "No", "Maybe", "Any"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    basicSection
                    intentAndInterestsSection
                    communityAndCultureSection
                    lifestyleSection
                    filterButtons
                }
                .padding(AppTheme.spacingMD)
            }
            .appBackground()
            .navigationTitle(localization.t("filter.title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(localization.t("common.done")) { dismiss() }
                        .foregroundColor(AppTheme.rose)
                }
            }
        }
        .presentationDetents([.large])
    }

    // MARK: - Basic Section

    private var basicSection: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 16) {
                filterSectionHeader(localization.t("filter.basic"), icon: "person.fill")

                // Show Me
                VStack(alignment: .leading, spacing: 8) {
                    Text(localization.t("filter.showMe"))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(colors.textSecondary)

                    Picker("Gender", selection: $selectedGender) {
                        ForEach(ShowMe.allCases) { option in
                            Text(option.display).tag(option)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Divider().overlay(colors.border)

                // Age Range
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(localization.t("filter.ageRange"))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(colors.textSecondary)
                        Spacer()
                        Text("\(Int(ageMin)) - \(Int(ageMax))")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(AppTheme.rose)
                    }
                    HStack {
                        Slider(value: $ageMin, in: 18...50, step: 1)
                            .tint(AppTheme.rose)
                        Slider(value: $ageMax, in: 18...50, step: 1)
                            .tint(AppTheme.rose)
                    }
                }

                Divider().overlay(colors.border)

                // Height Range
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(localization.t("filter.heightRange"))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(colors.textSecondary)
                        Spacer()
                        Text("\(Int(heightMin)) - \(Int(heightMax)) cm")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(AppTheme.rose)
                    }
                    HStack {
                        Slider(value: $heightMin, in: 140...200, step: 1)
                            .tint(AppTheme.rose)
                        Slider(value: $heightMax, in: 140...200, step: 1)
                            .tint(AppTheme.rose)
                    }
                }

                Divider().overlay(colors.border)

                // Verified Only
                HStack {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundColor(AppTheme.rose)
                        .frame(width: 24)
                    Text(localization.t("filter.verifiedOnly"))
                        .foregroundColor(colors.textPrimary)
                        .font(.system(size: 15))
                    Spacer()
                    Toggle("", isOn: $verifiedOnly)
                        .tint(AppTheme.rose)
                        .labelsHidden()
                }
            }
            .padding(AppTheme.spacingMD)
        }
    }

    // MARK: - Intent & Interests Section

    private var intentAndInterestsSection: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 16) {
                filterSectionHeader(localization.t("filter.intentAndInterests"), icon: "heart.circle.fill")

                // Intent multi-select
                VStack(alignment: .leading, spacing: 8) {
                    Text(localization.t("filter.intent"))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(colors.textSecondary)

                    HStack(spacing: 8) {
                        ForEach(Intent.allCases) { intent in
                            FilterChip(
                                label: intent.display,
                                icon: intent.icon,
                                isSelected: selectedIntents.contains(intent)
                            ) {
                                if selectedIntents.contains(intent) {
                                    selectedIntents.remove(intent)
                                } else {
                                    selectedIntents.insert(intent)
                                }
                            }
                        }
                    }
                }

                Divider().overlay(colors.border)

                // Interests multi-select chips
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(localization.t("filter.interests"))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(colors.textSecondary)
                        Spacer()
                        if !selectedInterests.isEmpty {
                            Text("\(selectedInterests.count) \(localization.t("filter.selected"))")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(AppTheme.rose)
                        }
                    }

                    FlowLayout(spacing: 8) {
                        ForEach(MockData.allInterests, id: \.self) { interest in
                            FilterChip(
                                label: interest,
                                isSelected: selectedInterests.contains(interest)
                            ) {
                                if selectedInterests.contains(interest) {
                                    selectedInterests.remove(interest)
                                } else {
                                    selectedInterests.insert(interest)
                                }
                            }
                        }
                    }
                }
            }
            .padding(AppTheme.spacingMD)
        }
    }

    // MARK: - Community & Culture Section

    private var communityAndCultureSection: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 16) {
                filterSectionHeader(localization.t("filter.communityAndCulture"), icon: "globe.asia.australia.fill")

                filterPickerRow(title: localization.t("filter.religion"), selection: $selectedReligion, options: religionOptions)
                Divider().overlay(colors.border)
                filterPickerRow(title: localization.t("filter.sindhiFluency"), selection: $selectedFluency, options: fluencyOptions)
                Divider().overlay(colors.border)
                filterPickerRow(title: localization.t("filter.generation"), selection: $selectedGeneration, options: generationOptions)
                Divider().overlay(colors.border)
                filterPickerRow(title: localization.t("filter.dietary"), selection: $selectedDietary, options: dietaryOptions)
                Divider().overlay(colors.border)

                // Gotra text field
                VStack(alignment: .leading, spacing: 8) {
                    Text(localization.t("filter.gotra"))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(colors.textSecondary)

                    TextField("Any", text: $gotraText)
                        .font(.system(size: 15))
                        .foregroundColor(colors.textPrimary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                                .fill(colors.surfaceMedium)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                                        .stroke(colors.borderSubtle, lineWidth: 0.5)
                                )
                        )
                        .autocorrectionDisabled()
                }
            }
            .padding(AppTheme.spacingMD)
        }
    }

    // MARK: - Lifestyle Section

    private var lifestyleSection: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 16) {
                filterSectionHeader(localization.t("filter.lifestyle"), icon: "leaf.fill")

                filterPickerRow(title: localization.t("filter.education"), selection: $selectedEducation, options: educationOptions)
                Divider().overlay(colors.border)
                filterPickerRow(title: localization.t("filter.smoking"), selection: $selectedSmoking, options: smokingOptions)
                Divider().overlay(colors.border)
                filterPickerRow(title: localization.t("filter.drinking"), selection: $selectedDrinking, options: drinkingOptions)
                Divider().overlay(colors.border)
                filterPickerRow(title: localization.t("filter.exercise"), selection: $selectedExercise, options: exerciseOptions)
                Divider().overlay(colors.border)
                filterPickerRow(title: localization.t("filter.wantsKids"), selection: $selectedWantsKids, options: wantsKidsOptions)
            }
            .padding(AppTheme.spacingMD)
        }
    }

    // MARK: - Buttons

    private var filterButtons: some View {
        HStack(spacing: 12) {
            SecondaryButton(title: localization.t("filter.reset")) {
                resetAllFilters()
            }

            PrimaryButton(title: localization.t("filter.apply")) {
                dismiss()
            }
        }
    }

    // MARK: - Helpers

    private func filterSectionHeader(_ title: String, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.rose)
            Text(title)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(colors.textPrimary)
        }
    }

    private func filterPickerRow(title: String, selection: Binding<String>, options: [String]) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(colors.textSecondary)

            Spacer()

            Menu {
                ForEach(options, id: \.self) { option in
                    Button {
                        selection.wrappedValue = option
                    } label: {
                        HStack {
                            Text(option)
                            if selection.wrappedValue == option {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            } label: {
                HStack(spacing: 4) {
                    Text(selection.wrappedValue)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(selection.wrappedValue == "Any" ? colors.textMuted : AppTheme.rose)
                    Image(systemName: "chevron.up.chevron.down")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(colors.textMuted)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .fill(colors.surfaceMedium)
                        .overlay(
                            Capsule()
                                .stroke(colors.borderSubtle, lineWidth: 0.5)
                        )
                )
            }
        }
    }

    private func resetAllFilters() {
        // Basic
        selectedGender = .women
        ageMin = 21
        ageMax = 35
        heightMin = 150
        heightMax = 190
        verifiedOnly = false

        // Intent & Interests
        selectedIntents = []
        selectedInterests = []

        // Community & Culture
        selectedReligion = "Any"
        selectedFluency = "Any"
        selectedGeneration = "Any"
        selectedDietary = "Any"
        gotraText = ""

        // Lifestyle
        selectedEducation = "Any"
        selectedSmoking = "Any"
        selectedDrinking = "Any"
        selectedExercise = "Any"
        selectedWantsKids = "Any"
    }
}

// MARK: - Filter Chip

private struct FilterChip: View {
    let label: String
    var icon: String? = nil
    let isSelected: Bool
    let action: () -> Void
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 11))
                }
                Text(label)
                    .font(.system(size: 13, weight: .medium))
            }
            .foregroundColor(isSelected ? .white : colors.textSecondary)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(isSelected ? AppTheme.rose : colors.surfaceMedium)
                    .overlay(
                        Capsule()
                            .stroke(
                                isSelected ? AppTheme.rose.opacity(0.6) : colors.border,
                                lineWidth: 0.5
                            )
                    )
            )
        }
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            let point = CGPoint(
                x: bounds.minX + position.x,
                y: bounds.minY + position.y
            )
            subviews[index].place(at: point, proposal: .unspecified)
        }
    }

    private func computeLayout(proposal: ProposedViewSize, subviews: Subviews) -> LayoutResult {
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var maxRowHeight: CGFloat = 0
        let maxWidth = proposal.width ?? .infinity

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += maxRowHeight + spacing
                maxRowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            maxRowHeight = max(maxRowHeight, size.height)
            x += size.width + spacing
        }

        let totalSize = CGSize(width: maxWidth, height: y + maxRowHeight)
        return LayoutResult(positions: positions, size: totalSize)
    }

    private struct LayoutResult {
        let positions: [CGPoint]
        let size: CGSize
    }
}

// MARK: - Share Sheet (UIKit wrapper)

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
