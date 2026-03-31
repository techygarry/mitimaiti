import SwiftUI

struct FamilyView: View {
    @StateObject private var familyVM = FamilyViewModel()
    private let localization = LocalizationManager.shared
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: AppTheme.spacingLG) {
                        headerSection
                        inviteCard
                        tabBar
                        contentArea
                        Spacer().frame(height: 100)
                    }
                    .padding(.horizontal, AppTheme.spacingMD)
                }

                // Toast overlay
                if let toast = familyVM.toastMessage {
                    toastView(toast)
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .zIndex(100)
                }
            }
            .animation(.easeInOut(duration: 0.3), value: familyVM.toastMessage)
            .appBackground()
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $familyVM.showInviteModal) {
                FamilyInviteSheet(familyVM: familyVM)
            }
            .alert("Revoke all family access?", isPresented: $familyVM.showRevokeAllModal) {
                Button("Cancel", role: .cancel) { }
                Button("Revoke All", role: .destructive) {
                    familyVM.revokeAllMembers()
                }
            } message: {
                Text("This will disable all permissions for every family member. They will no longer be able to view any of your information.")
            }
            .onAppear { familyVM.loadFamily() }
        }
    }

    // MARK: - Toast

    private func toastView(_ message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 14, weight: .semibold))
            Text(message)
                .font(.system(size: 14, weight: .medium))
        }
        .foregroundColor(.white)
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            Capsule()
                .fill(Color.black.opacity(0.8))
        )
        .padding(.top, 8)
    }

    // MARK: - Header

    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(localization.t("family.familyMode"))
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(colors.textPrimary)

                Text(localization.t("family.description"))
                    .font(.system(size: 14))
                    .foregroundColor(colors.textSecondary)
            }

            Spacer()

            if !familyVM.members.isEmpty {
                Button {
                    familyVM.showRevokeAllModal = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "hand.raised.fill")
                            .font(.system(size: 12, weight: .semibold))
                        Text("Revoke All")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundColor(AppTheme.error)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        Capsule()
                            .fill(AppTheme.error.opacity(0.12))
                            .overlay(
                                Capsule()
                                    .stroke(AppTheme.error.opacity(0.3), lineWidth: 0.5)
                            )
                    )
                }
            }
        }
        .padding(.top, AppTheme.spacingLG)
    }

    // MARK: - Invite Card

    private var inviteCard: some View {
        ContentCard {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(AppTheme.rose.opacity(0.15))
                        .frame(width: 48, height: 48)
                    Image(systemName: "heart.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(AppTheme.roseGradient)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(localization.t("family.inviteFamily"))
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(colors.textPrimary)

                    Text(localization.t("family.inviteDescription"))
                        .font(.system(size: 12))
                        .foregroundColor(colors.textSecondary)
                        .lineLimit(2)
                }

                Spacer()
            }
            .padding(AppTheme.spacingMD)

            HStack(spacing: 10) {
                SmallButton(title: "Invite", icon: "person.badge.plus") {
                    familyVM.generateInvite()
                    familyVM.showInviteModal = true
                }

                Button {
                    familyVM.generateInvite()
                    familyVM.shareInviteCode()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 14, weight: .semibold))
                        Text("Share Code")
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundColor(AppTheme.rose)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.clear)
                    .clipShape(Capsule())
                    .overlay(
                        Capsule()
                            .stroke(AppTheme.rose, lineWidth: 1.5)
                    )
                }
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.bottom, AppTheme.spacingMD)
        }
    }

    // MARK: - Tab Bar

    private var tabBar: some View {
        HStack(spacing: 0) {
            tabButton(
                title: "Members (\(familyVM.members.count))",
                index: 0
            )
            tabButton(
                title: "Suggestions (\(familyVM.suggestions.count))",
                index: 1
            )
        }
        .padding(4)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                .fill(colors.surfaceDark)
        )
    }

    private func tabButton(title: String, index: Int) -> some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                familyVM.activeTab = index
            }
        } label: {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(familyVM.activeTab == index ? .white : colors.textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(
                    Group {
                        if familyVM.activeTab == index {
                            Capsule()
                                .fill(AppTheme.roseGradient)
                        }
                    }
                )
        }
    }

    // MARK: - Content Area

    @ViewBuilder
    private var contentArea: some View {
        if familyVM.isLoading {
            loadingIndicator
        } else if familyVM.activeTab == 0 {
            membersTab
        } else {
            suggestionsTab
        }
    }

    private var loadingIndicator: some View {
        HStack {
            Spacer()
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: AppTheme.rose))
            Spacer()
        }
        .padding(.vertical, AppTheme.spacingXL)
    }

    // MARK: - Members Tab

    @ViewBuilder
    private var membersTab: some View {
        if let memberId = familyVM.selectedMemberId,
           let member = familyVM.members.first(where: { $0.id == memberId }) {
            permissionDetailView(member: member)
        } else {
            membersList
        }
    }

    @ViewBuilder
    private var membersList: some View {
        if familyVM.members.isEmpty {
            EmptyStateView(
                icon: "person.3",
                title: localization.t("family.noMembers"),
                message: localization.t("family.noMembersMessage"),
                actionTitle: localization.t("family.sendInvite"),
                action: { familyVM.showInviteModal = true }
            )
        } else {
            VStack(spacing: AppTheme.spacingSM) {
                ForEach(Array(familyVM.members.enumerated()), id: \.element.id) { index, member in
                    memberListItem(member: member)
                        .transition(.asymmetric(
                            insertion: .opacity.combined(with: .offset(y: 20)),
                            removal: .opacity
                        ))
                        .animation(
                            .spring(response: 0.4, dampingFraction: 0.8)
                                .delay(Double(index) * 0.08),
                            value: familyVM.members.count
                        )
                }
            }
        }
    }

    private func memberListItem(member: FamilyMember) -> some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                familyVM.selectedMemberId = member.id
            }
        } label: {
            ContentCard {
                HStack(spacing: 12) {
                    ProfileAvatar(url: nil, name: member.name, size: 48)

                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 6) {
                            Text(member.name)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(colors.textPrimary)

                            memberStatusBadge(member.status)
                        }

                        Text(member.relationship)
                            .font(.system(size: 12))
                            .foregroundColor(colors.textSecondary)

                        HStack(spacing: 4) {
                            Image(systemName: "lock.open.fill")
                                .font(.system(size: 10))
                                .foregroundColor(AppTheme.gold)
                            Text("\(member.permissions.enabledCount)/8 permissions")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(colors.textMuted)
                        }
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(colors.textMuted)
                        .frame(width: 32, height: 32)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(colors.surfaceMedium)
                        )
                }
                .padding(AppTheme.spacingMD)
            }
        }
        .buttonStyle(.plain)
    }

    private func memberStatusBadge(_ status: FamilyMemberStatus) -> some View {
        let color: Color = {
            switch status {
            case .active: return AppTheme.success
            case .pending: return AppTheme.warning
            case .revoked: return AppTheme.error
            }
        }()

        return Text(status.rawValue.capitalized)
            .font(.system(size: 10, weight: .semibold))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(
                Capsule()
                    .fill(color.opacity(0.15))
                    .overlay(
                        Capsule()
                            .stroke(color.opacity(0.3), lineWidth: 0.5)
                    )
            )
    }

    // MARK: - Permission Detail View

    private func permissionDetailView(member: FamilyMember) -> some View {
        VStack(spacing: AppTheme.spacingMD) {
            // Back + header
            HStack(spacing: 12) {
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                        familyVM.selectedMemberId = nil
                    }
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(colors.textPrimary)
                        .frame(width: 36, height: 36)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(colors.surfaceMedium)
                        )
                }

                ProfileAvatar(url: nil, name: member.name, size: 40)

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(member.name)
                            .font(.system(size: 17, weight: .bold))
                            .foregroundColor(colors.textPrimary)
                        memberStatusBadge(member.status)
                    }

                    Text("\(member.permissions.enabledCount) of 8 enabled")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(colors.textSecondary)
                }

                Spacer()
            }

            // Permission toggles
            ContentCard {
                VStack(spacing: 0) {
                    ForEach(Array(FamilyPermissions.permissionDescriptions.enumerated()), id: \.offset) { index, perm in
                        if index > 0 {
                            Divider()
                                .background(colors.border)
                                .padding(.horizontal, AppTheme.spacingMD)
                        }

                        permissionToggleRow(
                            memberId: member.id,
                            keyPath: perm.keyPath,
                            icon: perm.icon,
                            title: perm.title,
                            description: perm.description
                        )
                    }
                }
            }

            // Enable All / Disable All buttons
            HStack(spacing: 10) {
                SecondaryButton(title: "Enable All", icon: "checkmark.circle") {
                    familyVM.enableAllPermissions(memberId: member.id)
                }

                DangerButton(title: "Disable All", icon: "xmark.circle") {
                    familyVM.disableAllPermissions(memberId: member.id)
                }
            }

            // Privacy info
            ContentCard {
                HStack(spacing: 10) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 18))
                        .foregroundColor(AppTheme.info)

                    Text("\(member.name) can only see what you allow. Messages always remain private.")
                        .font(.system(size: 12))
                        .foregroundColor(colors.textSecondary)
                }
                .padding(14)
            }
        }
        .transition(.asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .trailing).combined(with: .opacity)
        ))
    }

    private func permissionToggleRow(
        memberId: String,
        keyPath: WritableKeyPath<FamilyPermissions, Bool>,
        icon: String,
        title: String,
        description: String
    ) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(AppTheme.rose)
                .frame(width: 36, height: 36)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(colors.surfaceMedium)
                )

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(colors.textPrimary)
                Text(description)
                    .font(.system(size: 11))
                    .foregroundColor(colors.textMuted)
            }

            Spacer()

            Toggle("", isOn: Binding(
                get: {
                    familyVM.members.first(where: { $0.id == memberId })?.permissions[keyPath: keyPath] ?? false
                },
                set: { newValue in
                    familyVM.updatePermission(memberId: memberId, keyPath: keyPath, value: newValue)
                }
            ))
            .tint(AppTheme.rose)
            .labelsHidden()
        }
        .padding(.horizontal, AppTheme.spacingMD)
        .padding(.vertical, 12)
    }

    // MARK: - Suggestions Tab

    @ViewBuilder
    private var suggestionsTab: some View {
        if familyVM.suggestions.isEmpty {
            EmptyStateView(
                icon: "lightbulb",
                title: localization.t("family.noSuggestionsYet"),
                message: localization.t("family.noSuggestionsMessage")
            )
        } else {
            VStack(spacing: AppTheme.spacingMD) {
                suggestionCardStack
                suggestionActions
                upNextSection
            }
        }
    }

    // MARK: - Suggestion Card Stack

    @ViewBuilder
    private var suggestionCardStack: some View {
        if let current = familyVM.suggestions.first {
            FamilySuggestionSwipeCard(
                suggestion: current,
                onLike: { familyVM.likeSuggestion(id: current.id) },
                onPass: { familyVM.passSuggestion(id: current.id) }
            )
        }
    }

    private var suggestionActions: some View {
        HStack(spacing: 32) {
            if let current = familyVM.suggestions.first {
                // Pass button
                CircleActionButton(
                    icon: "xmark",
                    color: colors.textMuted,
                    size: 60
                ) {
                    familyVM.passSuggestion(id: current.id)
                }

                // Like button
                CircleActionButton(
                    icon: "heart.fill",
                    color: AppTheme.rose,
                    size: 60
                ) {
                    familyVM.likeSuggestion(id: current.id)
                }
            }
        }
    }

    // MARK: - Up Next

    @ViewBuilder
    private var upNextSection: some View {
        let upcoming = Array(familyVM.suggestions.dropFirst().prefix(3))
        if !upcoming.isEmpty {
            VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                Text("Up Next")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(colors.textSecondary)

                HStack(spacing: 10) {
                    ForEach(upcoming) { suggestion in
                        upNextThumbnail(suggestion)
                    }
                    Spacer()
                }
            }
        }
    }

    private func upNextThumbnail(_ suggestion: FamilySuggestion) -> some View {
        VStack(spacing: 6) {
            if let photo = suggestion.suggestedUser.primaryPhoto,
               let url = URL(string: photo.urlThumb ?? photo.url) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                    default:
                        ProfileAvatar(url: nil, name: suggestion.suggestedUser.displayName, size: 56)
                    }
                }
                .frame(width: 56, height: 56)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            } else {
                ProfileAvatar(url: nil, name: suggestion.suggestedUser.displayName, size: 56)
            }

            Text(suggestion.suggestedUser.displayName.components(separatedBy: " ").first ?? "")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(colors.textSecondary)
                .lineLimit(1)
        }
    }
}

// MARK: - Suggestion Swipe Card

struct FamilySuggestionSwipeCard: View {
    let suggestion: FamilySuggestion
    let onLike: () -> Void
    let onPass: () -> Void
    @Environment(\.adaptiveColors) private var colors

    @State private var offset: CGSize = .zero
    @State private var exitDirection: CGFloat = 0

    var body: some View {
        VStack(spacing: AppTheme.spacingSM) {
            // Suggested by badge
            HStack(spacing: 6) {
                Image(systemName: "person.fill")
                    .font(.system(size: 10))
                Text("Suggested by \(suggestion.suggestedBy.name)")
                    .font(.system(size: 12, weight: .semibold))
            }
            .foregroundColor(AppTheme.gold)
            .padding(.horizontal, 14)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(AppTheme.gold.opacity(0.15))
            )

            // Main card
            ZStack(alignment: .bottom) {
                // Photo or gradient fallback
                if let photo = suggestion.suggestedUser.primaryPhoto,
                   let url = URL(string: photo.urlMedium ?? photo.url) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFill()
                        default:
                            gradientFallback
                        }
                    }
                    .frame(height: 380)
                    .clipped()
                } else {
                    gradientFallback
                        .frame(height: 380)
                }

                // Name + age + location overlay
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Text(suggestion.suggestedUser.displayName)
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)

                        if suggestion.suggestedUser.age > 0 {
                            Text(", \(suggestion.suggestedUser.age)")
                                .font(.system(size: 22, weight: .medium))
                                .foregroundColor(.white.opacity(0.85))
                        }
                    }

                    if let city = suggestion.suggestedUser.city {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 13))
                            Text(city)
                                .font(.system(size: 14, weight: .medium))
                        }
                        .foregroundColor(.white.opacity(0.9))
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(AppTheme.spacingMD)
                .background(
                    LinearGradient(
                        colors: [Color.black.opacity(0.7), Color.clear],
                        startPoint: .bottom,
                        endPoint: .top
                    )
                )
            }
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusCard))
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                    .stroke(colors.border, lineWidth: 0.5)
            )
            .shadow(color: colors.cardShadowColor, radius: 12, x: 0, y: 6)
            .offset(offset)
            .rotationEffect(.degrees(Double(offset.width / 20)))
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        offset = gesture.translation
                    }
                    .onEnded { gesture in
                        if gesture.translation.width > 120 {
                            // Swipe right = like
                            withAnimation(.easeOut(duration: 0.3)) {
                                offset = CGSize(width: 500, height: 0)
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                offset = .zero
                                onLike()
                            }
                        } else if gesture.translation.width < -120 {
                            // Swipe left = pass
                            withAnimation(.easeOut(duration: 0.3)) {
                                offset = CGSize(width: -500, height: 0)
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                offset = .zero
                                onPass()
                            }
                        } else {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                offset = .zero
                            }
                        }
                    }
            )

            // Note section
            if let note = suggestion.note, !note.isEmpty {
                HStack(spacing: 8) {
                    Image(systemName: "quote.opening")
                        .font(.system(size: 10))
                        .foregroundColor(AppTheme.gold)

                    Text("\"\(note)\"")
                        .font(.system(size: 13).italic())
                        .foregroundColor(colors.textSecondary)
                        .lineLimit(3)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: AppTheme.radiusSM)
                        .fill(AppTheme.gold.opacity(0.08))
                        .overlay(
                            RoundedRectangle(cornerRadius: AppTheme.radiusSM)
                                .stroke(AppTheme.gold.opacity(0.15), lineWidth: 0.5)
                        )
                )
            }
        }
    }

    private var gradientFallback: some View {
        LinearGradient(
            colors: [AppTheme.rose.opacity(0.6), AppTheme.roseDark.opacity(0.4)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            Text(suggestion.suggestedUser.displayName.initials)
                .font(.system(size: 64, weight: .bold))
                .foregroundColor(.white.opacity(0.4))
        )
    }
}

// MARK: - Circle Action Button

struct CircleActionButton: View {
    let icon: String
    let color: Color
    var size: CGFloat = 56
    let action: () -> Void

    @State private var tapScale: CGFloat = 1.0
    @State private var tapTrigger: Bool = false

    var body: some View {
        Button {
            tapTrigger.toggle()
            withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                tapScale = 0.85
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                    tapScale = 1.0
                }
            }
            action()
        } label: {
            Image(systemName: icon)
                .font(.system(size: size * 0.4, weight: .bold))
                .foregroundColor(color)
                .frame(width: size, height: size)
                .background(
                    Circle()
                        .fill(color.opacity(0.12))
                        .overlay(
                            Circle()
                                .stroke(color.opacity(0.3), lineWidth: 1.5)
                        )
                )
        }
        .scaleEffect(tapScale)
        .sensoryFeedback(.impact, trigger: tapTrigger)
    }
}

// MARK: - Invite Sheet

struct FamilyInviteSheet: View {
    @ObservedObject var familyVM: FamilyViewModel
    @Environment(\.dismiss) var dismiss
    @Environment(\.adaptiveColors) private var colors
    @State private var showCopiedCheck = false

    var body: some View {
        NavigationStack {
            ZStack {
                colors.backgroundGradient.ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: AppTheme.spacingLG) {
                        inviteHeader
                        inviteContent
                        memberLimitNote
                        Spacer().frame(height: 40)
                    }
                    .padding(AppTheme.spacingMD)
                    .padding(.top, AppTheme.spacingMD)
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(LocalizationManager.shared.t("common.done")) { dismiss() }
                        .foregroundColor(AppTheme.rose)
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: - Invite Header

    private var inviteHeader: some View {
        VStack(spacing: AppTheme.spacingSM) {
            Image(systemName: "person.3.fill")
                .font(.system(size: 48))
                .foregroundStyle(AppTheme.roseGradient)

            Text(LocalizationManager.shared.t("family.inviteFamilyMember"))
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(colors.textPrimary)

            Text(LocalizationManager.shared.t("family.inviteDescription"))
                .font(.system(size: 14))
                .foregroundColor(colors.textSecondary)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: - Invite Content

    @ViewBuilder
    private var inviteContent: some View {
        if let invite = familyVM.currentInvite {
            inviteCodeCard(invite)
        } else {
            PrimaryButton(title: LocalizationManager.shared.t("family.generateInviteCode"), icon: "plus.circle.fill") {
                familyVM.generateInvite()
            }
        }
    }

    private func inviteCodeCard(_ invite: FamilyInvite) -> some View {
        ContentCard {
            VStack(spacing: AppTheme.spacingMD) {
                inviteCodeDisplay(invite)
                CountdownBadge(expiresAt: invite.expiresAt)
                deepLinkRow(invite)
                inviteActionButtons(invite)
            }
            .padding(AppTheme.spacingMD)
            .frame(maxWidth: .infinity)
        }
    }

    private func inviteCodeDisplay(_ invite: FamilyInvite) -> some View {
        Text(invite.code)
            .font(.system(size: 32, weight: .bold, design: .monospaced))
            .foregroundColor(AppTheme.gold)
            .padding(.top, 4)
    }

    private func deepLinkRow(_ invite: FamilyInvite) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "link")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.gold)

            Text(invite.deepLink)
                .font(.system(size: 12, design: .monospaced))
                .foregroundColor(colors.textSecondary)
                .lineLimit(1)
                .truncationMode(.middle)

            Spacer()

            Button {
                UIPasteboard.general.string = invite.deepLink
            } label: {
                Image(systemName: "doc.on.clipboard")
                    .font(.system(size: 13))
                    .foregroundColor(AppTheme.gold)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.radiusSM)
                .fill(colors.surfaceDark)
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.radiusSM)
                        .stroke(colors.borderSubtle, lineWidth: 0.5)
                )
        )
    }

    private func inviteActionButtons(_ invite: FamilyInvite) -> some View {
        VStack(spacing: AppTheme.spacingSM) {
            SmallButton(
                title: showCopiedCheck ? "Copied!" : LocalizationManager.shared.t("family.copyCode"),
                icon: showCopiedCheck ? "checkmark.circle.fill" : "doc.on.doc"
            ) {
                UIPasteboard.general.string = invite.code
                showCopiedCheck = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    showCopiedCheck = false
                }
            }

            SecondaryButton(title: LocalizationManager.shared.t("family.shareInvite"), icon: "square.and.arrow.up") {
                shareInvite(invite)
            }
        }
    }

    private var memberLimitNote: some View {
        HStack(spacing: 8) {
            Image(systemName: "info.circle.fill")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.info)

            Text(LocalizationManager.shared.t("family.memberLimit"))
                .font(.system(size: 13))
                .foregroundColor(colors.textSecondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                .fill(AppTheme.info.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                        .stroke(AppTheme.info.opacity(0.15), lineWidth: 0.5)
                )
        )
    }

    private func shareInvite(_ invite: FamilyInvite) {
        let text = "Join my family circle on MitiMaiti! Use code: \(invite.code)\n\(invite.deepLink)"
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootVC = windowScene.windows.first?.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }
}
