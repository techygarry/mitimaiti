import SwiftUI

struct DiscoverView: View {
    @EnvironmentObject var feedVM: FeedViewModel
    @State private var showFilters = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                VStack(spacing: 0) {
                    discoverHeader
                    mainContent
                }

                if !feedVM.cards.isEmpty {
                    floatingActionBar
                }
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
            .alert("It's a Match!", isPresented: $feedVM.showMatchAlert) {
                Button("Send Message") {}
                Button("Keep Discovering", role: .cancel) {}
            } message: {
                if let user = feedVM.matchedUser {
                    Text("You and \(user.displayName) liked each other! Start a conversation within 24 hours.")
                }
            }
        }
    }

    // MARK: - Header

    private var discoverHeader: some View {
        HStack {
            Text("Discover")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)

            Spacer()

            likesRemainingBadge

            Button { showFilters = true } label: {
                Image(systemName: "slider.horizontal.3")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white)
                    .frame(width: 40, height: 40)
                    .background(AppTheme.surfaceMedium)
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusMD))
            }
        }
        .padding(.horizontal, AppTheme.spacingMD)
        .padding(.top, 8)
        .padding(.bottom, 4)
    }

    private var likesRemainingBadge: some View {
        HStack(spacing: 4) {
            Image(systemName: "heart.fill")
                .font(.system(size: 11))
            Text("\(feedVM.likesRemaining)")
                .font(.system(size: 13, weight: .bold))
        }
        .foregroundColor(.white)
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Capsule().fill(AppTheme.rose))
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
            EmptyStateView(
                icon: "heart.slash",
                title: "No more profiles",
                message: "We've run out of profiles nearby. Try adjusting your filters or check back later!",
                actionTitle: "Adjust Filters",
                action: { showFilters = true }
            )
            Spacer()
        } else if let card = feedVM.cards.first {
            ProfileScrollView(card: card, feedVM: feedVM)
        }
    }

    // MARK: - Floating Action Bar

    private var floatingActionBar: some View {
        HStack(spacing: 20) {
            // Pass
            ActionCircleButton(
                icon: "xmark",
                size: 50,
                fillColor: AppTheme.surfaceMedium,
                iconColor: AppTheme.textSecondary
            ) {
                feedVM.passUser()
            }

            // Like
            ActionCircleButton(
                icon: "heart.fill",
                size: 60,
                fillColor: nil,
                iconColor: .white,
                useRoseGradient: true
            ) {
                feedVM.likeUser()
            }

            // Super Like
            ActionCircleButton(
                icon: "star.fill",
                size: 50,
                fillColor: AppTheme.surfaceMedium,
                iconColor: AppTheme.gold
            ) {
                if let top = feedVM.cards.first {
                    feedVM.selectedCard = top
                    feedVM.showScoreBreakdown = true
                }
            }
        }
        .padding(.horizontal, AppTheme.spacingLG)
        .padding(.vertical, 14)
        .background(
            Capsule()
                .fill(.ultraThinMaterial)
                .overlay(
                    Capsule()
                        .stroke(Color.white.opacity(0.15), lineWidth: 0.5)
                )
        )
        .clipShape(Capsule())
        .shadow(color: Color.black.opacity(0.3), radius: 20, x: 0, y: 10)
        .padding(.bottom, 12)
    }
}

// MARK: - Profile Scroll View (Hinge-style)

private struct ProfileScrollView: View {
    let card: FeedCard
    @ObservedObject var feedVM: FeedViewModel

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                heroPhotoArea
                identitySection
                scoresSection
                bioSection
                promptsSection
                interestsSection
                aboutSection
                distanceSection
                Spacer().frame(height: 120)
            }
        }
    }

    // MARK: - Hero Photo

    private var heroPhotoArea: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: 0)
                .fill(
                    LinearGradient(
                        colors: [AppTheme.rose.opacity(0.5), AppTheme.roseDark.opacity(0.6), AppTheme.surfaceDark],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 400)
                .overlay(
                    Text(card.user.displayName.initials)
                        .font(.system(size: 80, weight: .bold))
                        .foregroundColor(.white.opacity(0.3))
                )

            LinearGradient(
                colors: [.clear, Color.black.opacity(0.5)],
                startPoint: .center,
                endPoint: .bottom
            )
            .frame(height: 200)
            .frame(maxHeight: .infinity, alignment: .bottom)
        }
        .frame(height: 400)
        .clipped()
    }

    // MARK: - Identity

    private var identitySection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(card.user.displayName)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)

                Text("\(card.user.age)")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))

                if card.user.isVerified {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 18))
                        .foregroundColor(AppTheme.info)
                }
            }

            if let city = card.user.city {
                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 13))
                    Text(city)
                        .font(.system(size: 14))
                }
                .foregroundColor(AppTheme.textSecondary)
            }

            if let intent = card.user.intent {
                intentBadge(intent)
            }
        }
        .padding(.horizontal, AppTheme.spacingMD)
        .padding(.top, AppTheme.spacingMD)
        .padding(.bottom, AppTheme.spacingSM)
    }

    private func intentBadge(_ intent: Intent) -> some View {
        HStack(spacing: 4) {
            Image(systemName: intent.icon)
                .font(.system(size: 11))
            Text(intent.display)
                .font(.system(size: 12, weight: .medium))
        }
        .foregroundColor(AppTheme.roseLight)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(
            Capsule().fill(AppTheme.rose.opacity(0.2))
        )
    }

    // MARK: - Scores

    private var scoresSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                ScoreTag(
                    label: "Cultural",
                    value: "\(card.culturalScore.overallScore)%",
                    color: badgeColor(card.culturalScore.badge),
                    icon: "sparkles"
                )

                if let kundli = card.kundliScore {
                    ScoreTag(
                        label: "Kundli",
                        value: "\(kundli.totalScore)/\(kundli.maxScore)",
                        color: tierColor(kundli.tier),
                        icon: "star.fill"
                    )
                }
            }

            Button {
                feedVM.selectedCard = card
                feedVM.showScoreBreakdown = true
            } label: {
                HStack(spacing: 4) {
                    Text("See breakdown")
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
                    .foregroundColor(AppTheme.textSecondary)
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
                Text("Interests")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)

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

    // MARK: - About

    @ViewBuilder
    private var aboutSection: some View {
        let items = aboutItems
        if !items.isEmpty {
            ContentCard {
                VStack(alignment: .leading, spacing: 12) {
                    Text("About")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)

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
            result.append(("ruler", "Height", "\(h) cm"))
        }
        if let edu = card.user.education {
            result.append(("graduationcap.fill", "Education", edu))
        }
        if let occ = card.user.occupation {
            result.append(("briefcase.fill", "Occupation", occ))
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
                    .foregroundColor(AppTheme.textSecondary)
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
        case .none: return AppTheme.textMuted
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

    var body: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 8) {
                Text(prompt.question)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(AppTheme.gold)

                Text(prompt.answer)
                    .font(.system(size: 15))
                    .foregroundColor(.white)
                    .lineSpacing(3)
            }
            .padding(AppTheme.spacingMD)
        }
    }
}

// MARK: - Interest Capsule

private struct InterestCapsule: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.white)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(AppTheme.surfaceMedium)
                    .overlay(
                        Capsule()
                            .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
                    )
            )
    }
}

// MARK: - About Row

private struct AboutRow: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.rose)
                .frame(width: 20)

            Text(label)
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textMuted)
                .frame(width: 80, alignment: .leading)

            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white)
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
                        .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                )
        }
    }
}

// MARK: - Score Breakdown Sheet

struct ScoreBreakdownSheet: View {
    let card: FeedCard
    @Environment(\.dismiss) var dismiss

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
            .navigationTitle("Compatibility")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
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
                    Text("Cultural Compatibility")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)
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
                        Text("Kundli Match")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.white)
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

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(name)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white)
                Spacer()
                Text("\(score)/\(maxScore)")
                    .font(.system(size: 12))
                    .foregroundColor(AppTheme.textSecondary)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.white.opacity(0.1))
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
    @State private var ageMin: Double = 21
    @State private var ageMax: Double = 35
    @State private var heightMin: Double = 150
    @State private var heightMax: Double = 190
    @State private var selectedGender: ShowMe = .women
    @State private var verifiedOnly = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    genderFilter
                    ageFilter
                    heightFilter
                    verifiedFilter
                    filterButtons
                }
                .padding(AppTheme.spacingMD)
            }
            .appBackground()
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(AppTheme.rose)
                }
            }
        }
        .presentationDetents([.large])
    }

    private var genderFilter: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("Show Me")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)

                Picker("Gender", selection: $selectedGender) {
                    ForEach(ShowMe.allCases) { option in
                        Text(option.display).tag(option)
                    }
                }
                .pickerStyle(.segmented)
            }
            .padding(AppTheme.spacingMD)
        }
    }

    private var ageFilter: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Age Range")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
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
            .padding(AppTheme.spacingMD)
        }
    }

    private var heightFilter: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Height Range")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
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
            .padding(AppTheme.spacingMD)
        }
    }

    private var verifiedFilter: some View {
        ContentCard {
            ToggleRow(title: "Verified Profiles Only", icon: "checkmark.seal.fill", isOn: $verifiedOnly)
        }
    }

    private var filterButtons: some View {
        HStack(spacing: 12) {
            SecondaryButton(title: "Reset") {
                ageMin = 21
                ageMax = 35
                heightMin = 150
                heightMax = 190
                verifiedOnly = false
            }

            PrimaryButton(title: "Apply Filters") {
                dismiss()
            }
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
