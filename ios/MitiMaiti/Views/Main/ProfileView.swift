import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var profileVM: ProfileViewModel
    private let localization = LocalizationManager.shared
    @Environment(\.adaptiveColors) private var colors
    @State private var showEditProfile = false
    @State private var showSettings = false
    @State private var showFamily = false

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: AppTheme.spacingLG) {
                    headerSection
                    completenessRing
                    statsRow
                    bioSection
                    promptsSection
                    aboutMeSection
                    sindhiIdentitySection
                    interestsSection
                    actionButtons
                    Spacer().frame(height: 100)
                }
                .padding(.horizontal, AppTheme.spacingMD)
            }
            .appBackground()
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { showSettings = true } label: {
                        Image(systemName: "gearshape.fill")
                            .foregroundColor(colors.textPrimary)
                    }
                }
            }
            .navigationDestination(isPresented: $showEditProfile) {
                EditProfileView()
                    .environmentObject(profileVM)
            }
            .navigationDestination(isPresented: $showSettings) {
                SettingsView()
            }
            .navigationDestination(isPresented: $showFamily) {
                FamilyView()
            }
            .onAppear { profileVM.loadProfile() }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: 0) {
            // Rose gradient header background
            ZStack(alignment: .bottom) {
                LinearGradient(
                    colors: [AppTheme.rose.opacity(0.3), AppTheme.roseDark.opacity(0.4)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .frame(height: 120)
                .clipShape(RoundedRectangle(cornerRadius: 16))

                // Avatar with progress ring, centered and overlapping the gradient
                avatarWithProgressRing
                    .offset(y: 50)
            }
            .padding(.horizontal, 0)

            Spacer().frame(height: 58)

            nameAndLocation

            Spacer().frame(height: AppTheme.spacingSM)

            // Edit Profile button
            Button { showEditProfile = true } label: {
                HStack(spacing: 6) {
                    Image(systemName: "pencil")
                        .font(.system(size: 14, weight: .semibold))
                    Text(localization.t("profile.editProfile"))
                        .font(.system(size: 14, weight: .semibold))
                }
                .foregroundColor(AppTheme.rose)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(
                    Capsule()
                        .fill(AppTheme.rose.opacity(0.12))
                        .overlay(
                            Capsule()
                                .stroke(AppTheme.rose.opacity(0.3), lineWidth: 0.5)
                        )
                )
            }
        }
        .padding(.top, AppTheme.spacingSM)
    }

    private var avatarWithProgressRing: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(colors.border, lineWidth: 4)
                .frame(width: 118, height: 118)

            // Progress ring
            Circle()
                .trim(from: 0, to: completenessProgress)
                .stroke(
                    AppTheme.roseGradient,
                    style: StrokeStyle(lineWidth: 4, lineCap: .round)
                )
                .frame(width: 118, height: 118)
                .rotationEffect(.degrees(-90))

            ProfileAvatar(
                url: nil,
                name: profileVM.user.displayName,
                size: 106,
                isOnline: profileVM.user.isOnline,
                showBorder: false
            )

            // Camera button overlay
            Button { showEditProfile = true } label: {
                Image(systemName: "camera.fill")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 32, height: 32)
                    .background(
                        Circle()
                            .fill(AppTheme.roseGradient)
                    )
            }
            .offset(x: 38, y: 38)

            if profileVM.user.isVerified {
                verifiedBadge
                    .offset(x: -38, y: 38)
            }
        }
    }

    private var verifiedBadge: some View {
        Image(systemName: "checkmark.seal.fill")
            .font(.system(size: 24))
            .foregroundColor(AppTheme.info)
            .background(
                Circle()
                    .fill(colors.background)
                    .frame(width: 28, height: 28)
            )
    }

    private var nameAndLocation: some View {
        VStack(spacing: 4) {
            HStack(spacing: 6) {
                Text(profileVM.user.displayName)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(colors.textPrimary)

                if profileVM.user.age > 0 {
                    Text(", \(profileVM.user.age)")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundColor(colors.textSecondary)
                }
            }

            if let city = profileVM.user.city {
                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 12))
                    Text(city)
                        .font(.system(size: 14))
                }
                .foregroundColor(colors.textSecondary)
            }
        }
    }

    // MARK: - Completeness Ring

    private var completenessRing: some View {
        ContentCard {
            HStack(spacing: AppTheme.spacingMD) {
                completenessCircle
                completenessText
                Spacer()
            }
            .padding(AppTheme.spacingMD)
        }
    }

    private var completenessCircle: some View {
        ZStack {
            Circle()
                .stroke(colors.border, lineWidth: 6)
                .frame(width: 56, height: 56)

            Circle()
                .trim(from: 0, to: completenessProgress)
                .stroke(
                    AppTheme.roseGradient,
                    style: StrokeStyle(lineWidth: 6, lineCap: .round)
                )
                .frame(width: 56, height: 56)
                .rotationEffect(.degrees(-90))

            Text("\(profileVM.user.profileCompleteness)%")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(AppTheme.rose)
        }
    }

    private var completenessProgress: Double {
        Double(profileVM.user.profileCompleteness) / 100.0
    }

    private var completenessText: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(localization.t("profile.completeness"))
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(colors.textPrimary)
            Text(localization.t("profile.completeForMatches"))
                .font(.system(size: 12))
                .foregroundColor(colors.textSecondary)
        }
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        ContentCard {
            HStack(spacing: 0) {
                ForEach(Array(profileVM.profileStats.enumerated()), id: \.offset) { index, stat in
                    if index > 0 {
                        Divider()
                            .frame(height: 40)
                            .background(colors.border)
                    }
                    VStack(spacing: 6) {
                        Image(systemName: stat.0)
                            .font(.system(size: 16))
                            .foregroundColor(AppTheme.rose)
                        Text(stat.1)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(colors.textPrimary)
                        Text(stat.2)
                            .font(.system(size: 12))
                            .foregroundColor(colors.textSecondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppTheme.spacingSM)
                }
            }
            .padding(.horizontal, AppTheme.spacingSM)
        }
    }

    // MARK: - Bio Section

    @ViewBuilder
    private var bioSection: some View {
        if let bio = profileVM.user.bio, !bio.isEmpty {
            ContentCard {
                VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                    sectionLabel(icon: "text.quote", title: localization.t("profile.bio"))
                    Text(bio)
                        .font(.system(size: 15))
                        .foregroundColor(colors.textPrimary)
                        .lineSpacing(4)
                }
                .padding(AppTheme.spacingMD)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    // MARK: - Prompts Section

    @ViewBuilder
    private var promptsSection: some View {
        if !profileVM.user.prompts.isEmpty {
            VStack(spacing: AppTheme.spacingSM) {
                ForEach(profileVM.user.prompts) { prompt in
                    promptCard(prompt: prompt)
                }
            }
        }
    }

    private func promptCard(prompt: UserPrompt) -> some View {
        ContentCard {
            VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                Text(prompt.question)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(AppTheme.gold)
                Text(prompt.answer)
                    .font(.system(size: 15))
                    .foregroundColor(colors.textPrimary)
                    .lineSpacing(3)
            }
            .padding(AppTheme.spacingMD)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    // MARK: - About Me Section

    private var aboutMeSection: some View {
        profileSectionRow(
            icon: "person.fill",
            title: localization.t("profile.aboutMe"),
            filledCount: aboutMeFilledCount,
            totalCount: aboutMeTotalCount
        ) {
            showEditProfile = true
        }
    }

    private var aboutMeFilledCount: Int {
        var count = 0
        if profileVM.user.heightCm != nil { count += 1 }
        if profileVM.user.education != nil { count += 1 }
        if profileVM.user.occupation != nil { count += 1 }
        if profileVM.user.company != nil { count += 1 }
        if profileVM.user.religion != nil { count += 1 }
        if profileVM.user.smoking != nil { count += 1 }
        if profileVM.user.drinking != nil { count += 1 }
        if profileVM.user.exercise != nil { count += 1 }
        if profileVM.user.wantKids != nil { count += 1 }
        return count
    }

    private var aboutMeTotalCount: Int { 9 }

    // MARK: - Sindhi Identity Section

    private var sindhiIdentitySection: some View {
        profileSectionRow(
            icon: "globe.asia.australia.fill",
            title: localization.t("profile.sindhiIdentity"),
            filledCount: sindhiFilledCount,
            totalCount: sindhiTotalCount
        ) {
            showEditProfile = true
        }
    }

    private var sindhiFilledCount: Int {
        var count = 0
        if profileVM.user.sindhiFluency != nil { count += 1 }
        if profileVM.user.sindhiDialect != nil { count += 1 }
        if profileVM.user.motherTongue != nil { count += 1 }
        if profileVM.user.gotra != nil { count += 1 }
        if profileVM.user.generation != nil { count += 1 }
        if profileVM.user.familyValues != nil { count += 1 }
        if profileVM.user.foodPreference != nil { count += 1 }
        return count
    }

    private var sindhiTotalCount: Int { 7 }

    // MARK: - Interests Section

    private var interestsSection: some View {
        profileSectionRow(
            icon: "heart.fill",
            title: localization.t("profile.interests"),
            filledCount: profileVM.user.interests.count,
            totalCount: max(profileVM.user.interests.count, 5)
        ) {
            showEditProfile = true
        }
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        VStack(spacing: AppTheme.spacingSM) {
            SecondaryButton(title: localization.t("family.familyMode"), icon: "person.3.fill") {
                showFamily = true
            }
        }
    }

    // MARK: - Profile Section Row

    private func profileSectionRow(icon: String, title: String, filledCount: Int, totalCount: Int, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            ContentCard {
                HStack(spacing: AppTheme.spacingSM) {
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(AppTheme.rose)
                        .frame(width: 28)

                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(colors.textPrimary)

                    Spacer()

                    Text("\(filledCount)/\(totalCount) fields")
                        .font(.system(size: 13))
                        .foregroundColor(colors.textMuted)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(colors.textMuted)
                }
                .padding(AppTheme.spacingMD)
            }
        }
        .buttonStyle(.plain)
    }

    // MARK: - Helpers

    private func sectionLabel(icon: String, title: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(AppTheme.rose)
            Text(title)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(colors.textPrimary)
        }
    }

    private func infoRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: AppTheme.spacingSM) {
            Image(systemName: icon)
                .font(.system(size: 13))
                .foregroundColor(AppTheme.rose)
                .frame(width: 22)

            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(colors.textSecondary)
                .frame(width: 110, alignment: .leading)

            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(colors.textPrimary)

            Spacer()
        }
        .padding(.vertical, 8)
    }
}
