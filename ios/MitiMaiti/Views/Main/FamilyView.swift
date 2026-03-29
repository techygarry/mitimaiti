import SwiftUI

struct FamilyView: View {
    @StateObject private var familyVM = FamilyViewModel()
    @State private var showInviteSheet = false

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: AppTheme.spacingLG) {
                    headerSection
                    membersSection
                    suggestionsSection
                    Spacer().frame(height: 100)
                }
                .padding(.horizontal, AppTheme.spacingMD)
            }
            .appBackground()
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showInviteSheet) {
                FamilyInviteSheet(familyVM: familyVM)
            }
            .onAppear { familyVM.loadFamily() }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: AppTheme.spacingSM) {
            Image(systemName: "person.3.fill")
                .font(.system(size: 36))
                .foregroundStyle(AppTheme.roseGradient)

            Text("Family Mode")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(AppTheme.textPrimary)

            Text("Involve trusted family members in your match journey. They can view profiles and suggest matches based on your preferences.")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppTheme.spacingMD)
        }
        .padding(.top, AppTheme.spacingLG)
    }

    // MARK: - Members Section

    private var membersSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
            sectionLabel(icon: "person.2.fill", title: "Members")

            if familyVM.isLoading {
                loadingIndicator
            } else if familyVM.members.isEmpty {
                EmptyStateView(
                    icon: "person.3",
                    title: "No family members",
                    message: "Invite up to 3 family members to help with your matches",
                    actionTitle: "Send Invite",
                    action: { showInviteSheet = true }
                )
            } else {
                memberCards
                privacyNotice
            }

            PrimaryButton(title: "Invite Family", icon: "person.badge.plus") {
                familyVM.generateInvite()
                showInviteSheet = true
            }
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

    private var memberCards: some View {
        ForEach(familyVM.members) { member in
            FamilyMemberCardView(member: member, familyVM: familyVM)
        }
    }

    private var privacyNotice: some View {
        ContentCard {
            HStack(spacing: 10) {
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 18))
                    .foregroundColor(AppTheme.info)

                Text("Family members cannot see your chats, matches, or swipe activity.")
                    .font(.system(size: 12))
                    .foregroundColor(AppTheme.textSecondary)
            }
            .padding(14)
        }
    }

    // MARK: - Suggestions Section

    private var suggestionsSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
            sectionLabel(icon: "lightbulb.fill", title: "Family Suggestions")

            if familyVM.suggestions.isEmpty {
                EmptyStateView(
                    icon: "lightbulb",
                    title: "No suggestions yet",
                    message: "Family members with suggest permissions can recommend matches for you"
                )
            } else {
                ForEach(familyVM.suggestions) { suggestion in
                    FamilySuggestionCardView(
                        suggestion: suggestion,
                        onLike: { familyVM.likeSuggestion(id: suggestion.id) },
                        onPass: { familyVM.passSuggestion(id: suggestion.id) }
                    )
                }
            }
        }
    }

    // MARK: - Helpers

    private func sectionLabel(icon: String, title: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(AppTheme.rose)
            Text(title)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(AppTheme.textPrimary)
        }
    }
}

// MARK: - Family Member Card

struct FamilyMemberCardView: View {
    let member: FamilyMember
    @ObservedObject var familyVM: FamilyViewModel
    @State private var showPermissions = false

    var body: some View {
        ContentCard {
            VStack(spacing: 12) {
                memberHeader
                permissionsSummary

                if showPermissions {
                    permissionsDetail
                }
            }
            .padding(AppTheme.spacingMD)
        }
    }

    // MARK: - Member Header

    private var memberHeader: some View {
        HStack(spacing: 12) {
            ProfileAvatar(url: nil, name: member.name, size: 44)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(member.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(AppTheme.textPrimary)

                    statusBadge
                }

                Text(member.relationship)
                    .font(.system(size: 12))
                    .foregroundColor(AppTheme.textSecondary)
            }

            Spacer()

            chevronButton
        }
    }

    private var chevronButton: some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                showPermissions.toggle()
            }
        } label: {
            Image(systemName: showPermissions ? "chevron.up" : "chevron.down")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(AppTheme.textMuted)
                .frame(width: 32, height: 32)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(AppTheme.surfaceMedium)
                )
        }
    }

    private var statusBadge: some View {
        Text(member.status.rawValue.capitalized)
            .font(.system(size: 10, weight: .semibold))
            .foregroundColor(statusColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(
                Capsule()
                    .fill(statusColor.opacity(0.15))
                    .overlay(
                        Capsule()
                            .stroke(statusColor.opacity(0.3), lineWidth: 0.5)
                    )
            )
    }

    private var statusColor: Color {
        switch member.status {
        case .active: return AppTheme.success
        case .pending: return AppTheme.rose
        case .revoked: return AppTheme.error
        }
    }

    // MARK: - Permissions Summary

    private var permissionsSummary: some View {
        HStack {
            Image(systemName: "lock.open.fill")
                .font(.system(size: 11))
                .foregroundColor(AppTheme.gold)
            Text("\(member.permissions.enabledCount) of 8 permissions")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(AppTheme.textSecondary)
            Spacer()
        }
    }

    // MARK: - Permissions Detail

    private var permissionsDetail: some View {
        VStack(spacing: 0) {
            Divider().background(Color.white.opacity(0.1))

            ToggleRow(
                title: "View Profile",
                icon: "person.fill",
                isOn: permissionBinding(for: \.canViewProfile)
            )
            ToggleRow(
                title: "View Photos",
                icon: "photo.fill",
                isOn: permissionBinding(for: \.canViewPhotos)
            )
            ToggleRow(
                title: "View Basics",
                icon: "info.circle.fill",
                isOn: permissionBinding(for: \.canViewBasics)
            )
            ToggleRow(
                title: "View Sindhi Identity",
                icon: "globe.asia.australia.fill",
                isOn: permissionBinding(for: \.canViewSindhi)
            )
            ToggleRow(
                title: "View Matches",
                icon: "heart.circle.fill",
                isOn: permissionBinding(for: \.canViewMatches)
            )
            ToggleRow(
                title: "Suggest Profiles",
                icon: "lightbulb.fill",
                isOn: permissionBinding(for: \.canSuggest)
            )
            ToggleRow(
                title: "Cultural Score",
                icon: "sparkles",
                isOn: permissionBinding(for: \.canViewCulturalScore)
            )
            ToggleRow(
                title: "Kundli Score",
                icon: "star.fill",
                isOn: permissionBinding(for: \.canViewKundli)
            )

            Divider().background(Color.white.opacity(0.1))

            removeMemberButton
        }
        .transition(.opacity.combined(with: .move(edge: .top)))
    }

    private var removeMemberButton: some View {
        DangerButton(title: "Remove Member", icon: "hand.raised.fill") {
            familyVM.revokeMember(memberId: member.id)
        }
        .padding(.top, 8)
    }

    private func permissionBinding(for keyPath: WritableKeyPath<FamilyPermissions, Bool>) -> Binding<Bool> {
        Binding(
            get: {
                familyVM.members.first(where: { $0.id == member.id })?.permissions[keyPath: keyPath] ?? false
            },
            set: { newValue in
                familyVM.updatePermission(memberId: member.id, keyPath: keyPath, value: newValue)
            }
        )
    }
}

// MARK: - Family Suggestion Card

struct FamilySuggestionCardView: View {
    let suggestion: FamilySuggestion
    let onLike: () -> Void
    let onPass: () -> Void

    var body: some View {
        ContentCard {
            VStack(spacing: 12) {
                suggestedByLabel
                suggestedUserRow
                noteSection
                actionButtons
            }
            .padding(AppTheme.spacingMD)
        }
    }

    private var suggestedByLabel: some View {
        HStack(spacing: 6) {
            Image(systemName: "person.fill")
                .font(.system(size: 10))
            Text("Suggested by \(suggestion.suggestedBy.name)")
                .font(.system(size: 12, weight: .medium))
            Text("(\(suggestion.suggestedBy.relationship))")
                .font(.system(size: 11))
                .foregroundColor(AppTheme.textMuted)
        }
        .foregroundColor(AppTheme.gold)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var suggestedUserRow: some View {
        HStack(spacing: 14) {
            ProfileAvatar(
                url: nil,
                name: suggestion.suggestedUser.displayName,
                size: 56
            )

            VStack(alignment: .leading, spacing: 4) {
                userNameAge
                userCity
            }

            Spacer()
        }
    }

    private var userNameAge: some View {
        HStack(spacing: 4) {
            Text(suggestion.suggestedUser.displayName)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(AppTheme.textPrimary)

            if suggestion.suggestedUser.age > 0 {
                Text(", \(suggestion.suggestedUser.age)")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(AppTheme.textSecondary)
            }
        }
    }

    @ViewBuilder
    private var userCity: some View {
        if let city = suggestion.suggestedUser.city {
            HStack(spacing: 4) {
                Image(systemName: "mappin.circle.fill")
                    .font(.system(size: 11))
                Text(city)
                    .font(.system(size: 13))
            }
            .foregroundColor(AppTheme.textSecondary)
        }
    }

    @ViewBuilder
    private var noteSection: some View {
        if let note = suggestion.note, !note.isEmpty {
            HStack(spacing: 8) {
                Image(systemName: "quote.opening")
                    .font(.system(size: 10))
                    .foregroundColor(AppTheme.gold)

                Text(note)
                    .font(.system(size: 13).italic())
                    .foregroundColor(AppTheme.textSecondary)
                    .lineLimit(3)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.radiusSM)
                    .fill(AppTheme.surfaceDark)
            )
        }
    }

    private var actionButtons: some View {
        HStack(spacing: 12) {
            SecondaryButton(title: "Pass", icon: "xmark", action: onPass)
            PrimaryButton(title: "Like", icon: "heart.fill", action: onLike)
        }
    }
}

// MARK: - Invite Sheet

struct FamilyInviteSheet: View {
    @ObservedObject var familyVM: FamilyViewModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

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
                    Button("Done") { dismiss() }
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

            Text("Invite Family Member")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(AppTheme.textPrimary)

            Text("Share this code with a family member to join your match circle.")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: - Invite Content

    @ViewBuilder
    private var inviteContent: some View {
        if let invite = familyVM.currentInvite {
            inviteCodeCard(invite)
        } else {
            PrimaryButton(title: "Generate Invite Code", icon: "plus.circle.fill") {
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
                .foregroundColor(AppTheme.textSecondary)
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
                .fill(AppTheme.surfaceDark)
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.radiusSM)
                        .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                )
        )
    }

    private func inviteActionButtons(_ invite: FamilyInvite) -> some View {
        VStack(spacing: AppTheme.spacingSM) {
            SmallButton(title: "Copy Code", icon: "doc.on.doc") {
                UIPasteboard.general.string = invite.code
            }

            SecondaryButton(title: "Share Invite", icon: "square.and.arrow.up") {
                shareInvite(invite)
            }
        }
    }

    private var memberLimitNote: some View {
        HStack(spacing: 8) {
            Image(systemName: "info.circle.fill")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.info)

            Text("Maximum 3 family members allowed per account.")
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textSecondary)
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
