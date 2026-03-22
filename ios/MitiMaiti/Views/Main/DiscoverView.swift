import SwiftUI

struct DiscoverView: View {
    @EnvironmentObject var feedVM: FeedViewModel
    @State private var dragOffset: CGSize = .zero
    @State private var currentCardRotation: Double = 0
    @State private var showFilters = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Text("Discover")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)

                        Spacer()

                        // Likes remaining
                        HStack(spacing: 4) {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 12))
                            Text("\(feedVM.likesRemaining)")
                                .font(.system(size: 13, weight: .semibold))
                        }
                        .foregroundColor(AppTheme.rose)
                        .glassPill()

                        Button { showFilters = true } label: {
                            Image(systemName: "slider.horizontal.3")
                                .font(.system(size: 18))
                                .foregroundColor(.white)
                                .frame(width: 40, height: 40)
                                .glassCard(cornerRadius: 12)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

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
                    } else {
                        // Card stack
                        ZStack {
                            // Background cards
                            ForEach(Array(feedVM.cards.prefix(3).enumerated().reversed()), id: \.element.id) { index, card in
                                if index > 0 {
                                    DiscoveryCardView(card: card)
                                        .scaleEffect(1 - CGFloat(index) * 0.04)
                                        .offset(y: CGFloat(index) * 8)
                                        .opacity(1 - Double(index) * 0.2)
                                        .allowsHitTesting(false)
                                }
                            }

                            // Top card (swipeable)
                            if let topCard = feedVM.cards.first {
                                DiscoveryCardView(card: topCard)
                                    .offset(x: dragOffset.width)
                                    .rotationEffect(.degrees(currentCardRotation))
                                    .gesture(swipeGesture)
                                    .overlay(swipeOverlay)
                                    .onTapGesture {
                                        feedVM.selectedCard = topCard
                                        feedVM.showScoreBreakdown = true
                                    }
                            }
                        }
                        .padding(.horizontal, 8)
                        .padding(.top, 8)

                        // Action Buttons
                        HStack(spacing: 24) {
                            // Rewind
                            ActionCircle(icon: "arrow.uturn.backward", color: AppTheme.warning, size: 48) {
                                feedVM.rewind()
                            }

                            // Pass
                            ActionCircle(icon: "xmark", color: AppTheme.textMuted, size: 56) {
                                animateSwipe(direction: .left)
                            }

                            // Like
                            ActionCircle(icon: "heart.fill", color: AppTheme.rose, size: 56) {
                                animateSwipe(direction: .right)
                            }

                            // Score info
                            ActionCircle(icon: "star.fill", color: AppTheme.gold, size: 48) {
                                if let top = feedVM.cards.first {
                                    feedVM.selectedCard = top
                                    feedVM.showScoreBreakdown = true
                                }
                            }
                        }
                        .padding(.vertical, 12)
                    }
                }
                .padding(.bottom, 70) // Tab bar space
            }
            .sheet(isPresented: $showFilters) {
                FilterSheetView()
            }
            .sheet(isPresented: $feedVM.showScoreBreakdown) {
                if let card = feedVM.selectedCard {
                    ScoreBreakdownView(card: card)
                }
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

    // MARK: - Swipe Gesture
    var swipeGesture: some Gesture {
        DragGesture()
            .onChanged { value in
                dragOffset = value.translation
                currentCardRotation = Double(value.translation.width / 20)
            }
            .onEnded { value in
                let threshold: CGFloat = 120
                if value.translation.width > threshold {
                    animateSwipe(direction: .right)
                } else if value.translation.width < -threshold {
                    animateSwipe(direction: .left)
                } else {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                        dragOffset = .zero
                        currentCardRotation = 0
                    }
                }
            }
    }

    @ViewBuilder
    var swipeOverlay: some View {
        ZStack {
            // Like overlay
            Text("LIKE")
                .font(.system(size: 36, weight: .black))
                .foregroundColor(AppTheme.success)
                .padding(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(AppTheme.success, lineWidth: 4)
                )
                .rotationEffect(.degrees(-15))
                .opacity(max(0, Double(dragOffset.width / 100)))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(30)

            // Pass overlay
            Text("NOPE")
                .font(.system(size: 36, weight: .black))
                .foregroundColor(AppTheme.error)
                .padding(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(AppTheme.error, lineWidth: 4)
                )
                .rotationEffect(.degrees(15))
                .opacity(max(0, Double(-dragOffset.width / 100)))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .padding(30)
        }
    }

    enum SwipeDirection { case left, right }

    func animateSwipe(direction: SwipeDirection) {
        let offsetX: CGFloat = direction == .right ? 500 : -500
        withAnimation(.easeOut(duration: 0.3)) {
            dragOffset = CGSize(width: offsetX, height: 0)
            currentCardRotation = direction == .right ? 15 : -15
        }

        UIImpactFeedbackGenerator(style: .medium).impactOccurred()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            dragOffset = .zero
            currentCardRotation = 0
            if direction == .right {
                feedVM.likeUser()
            } else {
                feedVM.passUser()
            }
        }
    }
}

// MARK: - Action Circle Button
struct ActionCircle: View {
    let icon: String
    let color: Color
    let size: CGFloat
    let action: () -> Void

    var body: some View {
        Button {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            action()
        } label: {
            Image(systemName: icon)
                .font(.system(size: size * 0.35, weight: .bold))
                .foregroundColor(color)
                .frame(width: size, height: size)
                .background(
                    Circle()
                        .fill(.ultraThinMaterial)
                        .overlay(
                            Circle()
                                .fill(color.opacity(0.1))
                        )
                        .overlay(
                            Circle()
                                .stroke(color.opacity(0.3), lineWidth: 1)
                        )
                )
                .shadow(color: color.opacity(0.3), radius: 8, x: 0, y: 4)
        }
    }
}

// MARK: - Discovery Card
struct DiscoveryCardView: View {
    let card: FeedCard
    @State private var currentPhotoIndex = 0

    var body: some View {
        GlassCard(cornerRadius: 24) {
            VStack(alignment: .leading, spacing: 0) {
                // Photo area
                ZStack(alignment: .bottom) {
                    // Photo placeholder
                    RoundedRectangle(cornerRadius: 0)
                        .fill(
                            LinearGradient(
                                colors: [
                                    AppTheme.rose.opacity(0.3),
                                    AppTheme.roseDark.opacity(0.5),
                                    AppTheme.surfaceDark
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(height: 340)
                        .overlay(
                            Image(systemName: "person.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.white.opacity(0.3))
                        )

                    // Photo dots
                    HStack(spacing: 4) {
                        ForEach(0..<min(card.user.photos.count, 5), id: \.self) { i in
                            Capsule()
                                .fill(i == currentPhotoIndex ? Color.white : Color.white.opacity(0.3))
                                .frame(height: 3)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 80)

                    // Name overlay
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(alignment: .firstTextBaseline, spacing: 8) {
                            Text(card.user.displayName)
                                .font(.system(size: 26, weight: .bold))
                                .foregroundColor(.white)

                            Text("\(card.user.age)")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundColor(.white.opacity(0.8))

                            if card.user.isVerified {
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(AppTheme.info)
                            }
                        }

                        HStack(spacing: 12) {
                            Label(card.user.city ?? "", systemImage: "mappin")
                            if let intent = card.user.intent {
                                Label(intent.display, systemImage: intent.icon)
                            }
                        }
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.7))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(
                        LinearGradient(
                            colors: [.clear, Color.black.opacity(0.7)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                }
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .contentShape(Rectangle())
                .onTapGesture { location in
                    let width = UIScreen.main.bounds.width
                    if location.x > width / 2 {
                        currentPhotoIndex = min(currentPhotoIndex + 1, card.user.photos.count - 1)
                    } else {
                        currentPhotoIndex = max(currentPhotoIndex - 1, 0)
                    }
                }

                // Details section
                VStack(alignment: .leading, spacing: 12) {
                    // Score tags
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ScoreTagView(
                                label: "Cultural",
                                value: "\(card.culturalScore.overallScore)%",
                                color: scoreColor(card.culturalScore.badge),
                                icon: "sparkles"
                            )

                            if let kundli = card.kundliScore {
                                ScoreTagView(
                                    label: "Kundli",
                                    value: "\(kundli.totalScore)/36",
                                    color: kundliColor(kundli.tier),
                                    icon: "star.fill"
                                )
                            }

                            ScoreTagView(
                                label: "Common",
                                value: "\(card.commonInterests)",
                                color: AppTheme.info,
                                icon: "person.2.fill"
                            )

                            if let dist = card.distanceKm {
                                ScoreTagView(
                                    label: "km",
                                    value: String(format: "%.0f", dist),
                                    color: AppTheme.textSecondary,
                                    icon: "location.fill"
                                )
                            }
                        }
                    }

                    // Bio
                    if let bio = card.user.bio {
                        Text(bio)
                            .font(.system(size: 14))
                            .foregroundColor(AppTheme.textSecondary)
                            .lineLimit(2)
                    }

                    // Basics pills
                    if card.user.occupation != nil || card.user.education != nil {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                if let job = card.user.occupation {
                                    InfoPill(icon: "briefcase.fill", text: job)
                                }
                                if let edu = card.user.education {
                                    InfoPill(icon: "graduationcap.fill", text: edu)
                                }
                                if let h = card.user.heightCm {
                                    InfoPill(icon: "ruler", text: "\(h) cm")
                                }
                            }
                        }
                    }

                    // Interests
                    if !card.user.interests.isEmpty {
                        FlowLayout(spacing: 6) {
                            ForEach(card.user.interests.prefix(6), id: \.self) { interest in
                                Text(interest)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(
                                        Capsule()
                                            .fill(Color.white.opacity(0.1))
                                            .overlay(Capsule().stroke(Color.white.opacity(0.1), lineWidth: 0.5))
                                    )
                            }
                        }
                    }
                }
                .padding(16)
            }
        }
    }

    func scoreColor(_ badge: CulturalBadge) -> Color {
        switch badge {
        case .gold: return AppTheme.scoreGold
        case .green: return AppTheme.scoreGreen
        case .orange: return AppTheme.scoreOrange
        case .none: return AppTheme.textMuted
        }
    }

    func kundliColor(_ tier: KundliTier) -> Color {
        switch tier {
        case .excellent: return AppTheme.scoreGold
        case .good: return AppTheme.scoreGreen
        case .challenging: return AppTheme.scoreOrange
        }
    }
}

// MARK: - Info Pill
struct InfoPill: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10))
            Text(text)
                .font(.system(size: 12))
                .lineLimit(1)
        }
        .foregroundColor(AppTheme.textSecondary)
        .glassPill()
    }
}

// MARK: - Flow Layout
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var maxHeight: CGFloat = 0
        let maxWidth = proposal.width ?? .infinity

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += maxHeight + spacing
                maxHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            maxHeight = max(maxHeight, size.height)
            x += size.width + spacing
        }

        return (positions, CGSize(width: maxWidth, height: y + maxHeight))
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
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Gender
                        GlassCard(cornerRadius: 16) {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Show Me")
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(.white)

                                Picker("Gender", selection: $selectedGender) {
                                    ForEach(ShowMe.allCases) { Text($0.display).tag($0) }
                                }
                                .pickerStyle(.segmented)
                            }
                            .padding(16)
                        }

                        // Age
                        GlassCard(cornerRadius: 16) {
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
                            .padding(16)
                        }

                        // Height
                        GlassCard(cornerRadius: 16) {
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
                            .padding(16)
                        }

                        // Verified only
                        GlassCard(cornerRadius: 16) {
                            GlassToggleRow(title: "Verified Profiles Only", icon: "checkmark.seal.fill", isOn: $verifiedOnly)
                        }

                        // Buttons
                        HStack(spacing: 12) {
                            GlassButton("Reset", style: .secondary) {
                                ageMin = 21; ageMax = 35; heightMin = 150; heightMax = 190
                                verifiedOnly = false
                            }

                            GlassButton("Apply Filters") {
                                dismiss()
                            }
                        }
                    }
                    .padding()
                }
            }
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
}

// MARK: - Score Breakdown
struct ScoreBreakdownView: View {
    let card: FeedCard
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Cultural Score
                        GlassCard(cornerRadius: 16) {
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
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack {
                                            Text(dim.name)
                                                .font(.system(size: 13, weight: .medium))
                                                .foregroundColor(.white)
                                            Spacer()
                                            Text("\(dim.score)/\(dim.maxScore)")
                                                .font(.system(size: 12))
                                                .foregroundColor(AppTheme.textSecondary)
                                        }
                                        ProgressView(value: dim.percentage, total: 100)
                                            .tint(AppTheme.rose)
                                    }
                                }
                            }
                            .padding(16)
                        }

                        // Kundli Score
                        if let kundli = card.kundliScore {
                            GlassCard(cornerRadius: 16) {
                                VStack(alignment: .leading, spacing: 16) {
                                    HStack {
                                        Text("Kundli Match")
                                            .font(.system(size: 17, weight: .semibold))
                                            .foregroundColor(.white)
                                        Spacer()
                                        Text("\(kundli.totalScore)/\(kundli.maxScore)")
                                            .font(.system(size: 24, weight: .bold))
                                            .foregroundColor(AppTheme.gold)
                                        Text(kundli.tier.display)
                                            .font(.system(size: 12, weight: .medium))
                                            .foregroundColor(AppTheme.gold)
                                    }

                                    ForEach(kundli.gunas) { guna in
                                        HStack {
                                            Text(guna.name)
                                                .font(.system(size: 13, weight: .medium))
                                                .foregroundColor(.white)
                                                .frame(width: 90, alignment: .leading)
                                            ProgressView(value: Double(guna.score), total: Double(guna.maxScore))
                                                .tint(AppTheme.gold)
                                            Text("\(guna.score)/\(guna.maxScore)")
                                                .font(.system(size: 12))
                                                .foregroundColor(AppTheme.textSecondary)
                                                .frame(width: 36, alignment: .trailing)
                                        }
                                    }
                                }
                                .padding(16)
                            }
                        }
                    }
                    .padding()
                }
            }
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
}
