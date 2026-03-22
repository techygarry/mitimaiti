import SwiftUI

struct FamilyView: View {
    @EnvironmentObject var familyVM: FamilyViewModel
    @State private var showInviteSheet = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Text("Family Mode")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                        Spacer()
                        GlassButton("Invite", icon: "person.badge.plus", style: .small) {
                            showInviteSheet = true
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    // Tab selector
                    HStack(spacing: 0) {
                        TabButton(title: "Members (\(familyVM.members.count))", isSelected: familyVM.selectedTab == 0) {
                            withAnimation { familyVM.selectedTab = 0 }
                        }
                        TabButton(title: "Suggestions (\(familyVM.suggestions.count))", isSelected: familyVM.selectedTab == 1) {
                            withAnimation { familyVM.selectedTab = 1 }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    if familyVM.isLoading {
                        Spacer()
                        ProgressView().tint(AppTheme.rose)
                        Spacer()
                    } else {
                        TabView(selection: $familyVM.selectedTab) {
                            membersTab.tag(0)
                            suggestionsTab.tag(1)
                        }
                        .tabViewStyle(.page(indexDisplayMode: .never))
                    }
                }
                .padding(.bottom, 70)
            }
            .sheet(isPresented: $showInviteSheet) {
                InviteSheet(familyVM: familyVM)
            }
        }
    }

    // MARK: - Members Tab
    var membersTab: some View {
        ScrollView {
            VStack(spacing: 12) {
                if familyVM.members.isEmpty {
                    EmptyStateView(
                        icon: "person.3",
                        title: "No family members",
                        message: "Invite up to 3 family members to help with your matches",
                        actionTitle: "Send Invite",
                        action: { showInviteSheet = true }
                    )
                } else {
                    ForEach(familyVM.members) { member in
                        FamilyMemberCard(member: member, familyVM: familyVM)
                    }

                    // Privacy notice
                    GlassCard(cornerRadius: 14) {
                        HStack(spacing: 10) {
                            Image(systemName: "lock.shield.fill")
                                .font(.system(size: 18))
                                .foregroundColor(AppTheme.info)

                            Text("Family members cannot see your chats, matches, or swipe activity")
                                .font(.system(size: 12))
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        .padding(14)
                    }
                }
            }
            .padding()
            .padding(.bottom, 80)
        }
    }

    // MARK: - Suggestions Tab
    var suggestionsTab: some View {
        ScrollView {
            VStack(spacing: 12) {
                if familyVM.suggestions.isEmpty {
                    EmptyStateView(
                        icon: "lightbulb",
                        title: "No suggestions yet",
                        message: "Family members with suggest permissions can recommend matches for you"
                    )
                } else {
                    ForEach(familyVM.suggestions) { suggestion in
                        SuggestionCard(suggestion: suggestion, onLike: {
                            familyVM.likeSuggestion(id: suggestion.id)
                        }, onPass: {
                            familyVM.passSuggestion(id: suggestion.id)
                        })
                    }
                }
            }
            .padding()
            .padding(.bottom, 80)
        }
    }
}

// MARK: - Family Member Card
struct FamilyMemberCard: View {
    let member: FamilyMember
    @ObservedObject var familyVM: FamilyViewModel
    @State private var showPermissions = false

    var body: some View {
        GlassCard(cornerRadius: 16) {
            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    ProfileAvatar(url: nil, name: member.name, size: 44)

                    VStack(alignment: .leading, spacing: 2) {
                        HStack {
                            Text(member.name)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)

                            Text(member.status.rawValue.capitalized)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(member.status == .active ? AppTheme.success : AppTheme.error)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background((member.status == .active ? AppTheme.success : AppTheme.error).opacity(0.15))
                                .clipShape(Capsule())
                        }

                        Text(member.relationship)
                            .font(.system(size: 12))
                            .foregroundColor(AppTheme.textSecondary)
                    }

                    Spacer()

                    Text("\(member.permissions.enabledCount)/8")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(AppTheme.textMuted)

                    Button { showPermissions.toggle() } label: {
                        Image(systemName: showPermissions ? "chevron.up" : "chevron.down")
                            .font(.system(size: 12))
                            .foregroundColor(AppTheme.textMuted)
                    }
                }

                if showPermissions {
                    VStack(spacing: 6) {
                        PermissionToggle(title: "View Profile", isOn: binding(for: \.canViewProfile, memberId: member.id))
                        PermissionToggle(title: "View Photos", isOn: binding(for: \.canViewPhotos, memberId: member.id))
                        PermissionToggle(title: "View Basics", isOn: binding(for: \.canViewBasics, memberId: member.id))
                        PermissionToggle(title: "View Sindhi", isOn: binding(for: \.canViewSindhi, memberId: member.id))
                        PermissionToggle(title: "View Matches", isOn: binding(for: \.canViewMatches, memberId: member.id))
                        PermissionToggle(title: "Suggest Profiles", isOn: binding(for: \.canSuggest, memberId: member.id))
                        PermissionToggle(title: "Cultural Score", isOn: binding(for: \.canViewCulturalScore, memberId: member.id))
                        PermissionToggle(title: "Kundli Score", isOn: binding(for: \.canViewKundli, memberId: member.id))

                        Divider().background(Color.white.opacity(0.1))

                        Button(role: .destructive) {
                            familyVM.revokeMember(memberId: member.id)
                        } label: {
                            HStack {
                                Image(systemName: "hand.raised.fill")
                                Text("Revoke Access")
                            }
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(AppTheme.error)
                        }
                    }
                    .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
            .padding(14)
        }
    }

    private func binding(for keyPath: WritableKeyPath<FamilyPermissions, Bool>, memberId: String) -> Binding<Bool> {
        Binding(
            get: {
                familyVM.members.first(where: { $0.id == memberId })?.permissions[keyPath: keyPath] ?? false
            },
            set: { newValue in
                familyVM.updatePermission(memberId: memberId, keyPath: keyPath, value: newValue)
            }
        )
    }
}

struct PermissionToggle: View {
    let title: String
    @Binding var isOn: Bool

    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 13))
                .foregroundColor(.white)
            Spacer()
            Toggle("", isOn: $isOn)
                .tint(AppTheme.rose)
                .labelsHidden()
                .scaleEffect(0.8)
        }
    }
}

// MARK: - Suggestion Card
struct SuggestionCard: View {
    let suggestion: FamilySuggestion
    let onLike: () -> Void
    let onPass: () -> Void

    var body: some View {
        GlassCard(cornerRadius: 16) {
            VStack(spacing: 12) {
                // Suggested by
                HStack(spacing: 6) {
                    Image(systemName: "person.fill")
                        .font(.system(size: 10))
                    Text("Suggested by \(suggestion.suggestedBy.name)")
                        .font(.system(size: 12, weight: .medium))
                }
                .foregroundColor(AppTheme.gold)
                .frame(maxWidth: .infinity, alignment: .leading)

                // Profile
                HStack(spacing: 14) {
                    ProfileAvatar(url: nil, name: suggestion.suggestedUser.displayName, size: 56)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(suggestion.suggestedUser.displayName), \(suggestion.suggestedUser.age)")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                        Text(suggestion.suggestedUser.city ?? "")
                            .font(.system(size: 13))
                            .foregroundColor(AppTheme.textSecondary)
                    }
                    Spacer()
                }

                // Note
                if let note = suggestion.note {
                    Text("\"\(note)\"")
                        .font(.system(size: 13).italic())
                        .foregroundColor(AppTheme.textSecondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                // Actions
                HStack(spacing: 12) {
                    GlassButton("Pass", icon: "xmark", style: .secondary, action: onPass)
                    GlassButton("Like", icon: "heart.fill", action: onLike)
                }
            }
            .padding(16)
        }
    }
}

// MARK: - Invite Sheet
struct InviteSheet: View {
    @ObservedObject var familyVM: FamilyViewModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 24) {
                    Image(systemName: "person.3.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(AppTheme.roseGradient)

                    Text("Invite Family Member")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)

                    Text("Share this code with a family member (max 3 members)")
                        .font(.system(size: 14))
                        .foregroundColor(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)

                    if let invite = familyVM.currentInvite {
                        GlassCard(cornerRadius: 16) {
                            VStack(spacing: 12) {
                                Text(invite.code)
                                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                                    .foregroundColor(AppTheme.gold)

                                Text("Expires in 48 hours")
                                    .font(.system(size: 12))
                                    .foregroundColor(AppTheme.textMuted)

                                GlassButton("Copy Code", icon: "doc.on.doc", style: .small) {
                                    UIPasteboard.general.string = invite.code
                                }
                            }
                            .padding(20)
                            .frame(maxWidth: .infinity)
                        }
                    } else {
                        GlassButton("Generate Invite Code", icon: "plus.circle.fill") {
                            familyVM.generateInvite()
                        }
                    }

                    Spacer()
                }
                .padding()
                .padding(.top, 20)
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(AppTheme.rose)
                }
            }
        }
        .presentationDetents([.medium])
    }
}
