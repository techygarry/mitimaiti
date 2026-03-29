import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var profileVM: ProfileViewModel
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
                            .foregroundColor(.white)
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
        VStack(spacing: AppTheme.spacingMD) {
            avatarWithBadge
            nameAndLocation
        }
        .padding(.top, AppTheme.spacingLG)
    }

    private var avatarWithBadge: some View {
        ZStack(alignment: .bottomTrailing) {
            ProfileAvatar(
                url: nil,
                name: profileVM.user.displayName,
                size: 110,
                isOnline: profileVM.user.isOnline,
                showBorder: true
            )

            if profileVM.user.isVerified {
                verifiedBadge
            }
        }
    }

    private var verifiedBadge: some View {
        Image(systemName: "checkmark.seal.fill")
            .font(.system(size: 24))
            .foregroundColor(AppTheme.info)
            .background(
                Circle()
                    .fill(AppTheme.background)
                    .frame(width: 28, height: 28)
            )
            .offset(x: 4, y: 4)
    }

    private var nameAndLocation: some View {
        VStack(spacing: 4) {
            HStack(spacing: 6) {
                Text(profileVM.user.displayName)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(AppTheme.textPrimary)

                if profileVM.user.age > 0 {
                    Text(", \(profileVM.user.age)")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundColor(AppTheme.textSecondary)
                }
            }

            if let city = profileVM.user.city {
                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 12))
                    Text(city)
                        .font(.system(size: 14))
                }
                .foregroundColor(AppTheme.textSecondary)
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
                .stroke(Color.white.opacity(0.1), lineWidth: 6)
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
            Text("Profile Completeness")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(AppTheme.textPrimary)
            Text("Complete your profile to get more matches")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textSecondary)
        }
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: AppTheme.spacingSM) {
            statPill(
                text: "\(profileVM.user.profileCompleteness)% Complete",
                icon: "chart.bar.fill",
                color: AppTheme.rose
            )

            if let intent = profileVM.user.intent {
                statPill(
                    text: intent.display,
                    icon: intent.icon,
                    color: AppTheme.saffron
                )
            }

            if let city = profileVM.user.city {
                statPill(
                    text: city,
                    icon: "mappin",
                    color: AppTheme.gold
                )
            }
        }
    }

    private func statPill(text: String, icon: String, color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .semibold))
            Text(text)
                .font(.system(size: 11, weight: .medium))
        }
        .foregroundColor(color)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(color.opacity(0.15))
                .overlay(
                    Capsule()
                        .stroke(color.opacity(0.3), lineWidth: 0.5)
                )
        )
    }

    // MARK: - Bio Section

    @ViewBuilder
    private var bioSection: some View {
        if let bio = profileVM.user.bio, !bio.isEmpty {
            ContentCard {
                VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                    sectionLabel(icon: "text.quote", title: "Bio")
                    Text(bio)
                        .font(.system(size: 15))
                        .foregroundColor(AppTheme.textPrimary)
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
                    .foregroundColor(AppTheme.textPrimary)
                    .lineSpacing(3)
            }
            .padding(AppTheme.spacingMD)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    // MARK: - About Me Section

    private var aboutMeSection: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                sectionLabel(icon: "person.fill", title: "About Me")
                aboutMeRows
            }
            .padding(AppTheme.spacingMD)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var aboutMeRows: some View {
        VStack(spacing: 2) {
            aboutMeBasicRows
            aboutMeLifestyleRows
        }
    }

    @ViewBuilder
    private var aboutMeBasicRows: some View {
        if let height = profileVM.user.heightCm {
            infoRow(icon: "ruler", label: "Height", value: "\(height) cm")
        }
        if let education = profileVM.user.education {
            infoRow(icon: "graduationcap.fill", label: "Education", value: education)
        }
        if let occupation = profileVM.user.occupation {
            infoRow(icon: "briefcase.fill", label: "Occupation", value: occupation)
        }
        if let company = profileVM.user.company {
            infoRow(icon: "building.2.fill", label: "Company", value: company)
        }
        if let religion = profileVM.user.religion {
            infoRow(icon: "sparkles", label: "Religion", value: religion)
        }
    }

    @ViewBuilder
    private var aboutMeLifestyleRows: some View {
        if let smoking = profileVM.user.smoking {
            infoRow(icon: "smoke.fill", label: "Smoking", value: smoking.capitalized)
        }
        if let drinking = profileVM.user.drinking {
            infoRow(icon: "wineglass.fill", label: "Drinking", value: drinking.capitalized)
        }
        if let exercise = profileVM.user.exercise {
            infoRow(icon: "figure.run", label: "Exercise", value: exercise.capitalized)
        }
        if let wantKids = profileVM.user.wantKids {
            infoRow(icon: "figure.and.child.holdinghands", label: "Want Kids", value: wantKids.capitalized)
        }
    }

    // MARK: - Sindhi Identity Section

    private var sindhiIdentitySection: some View {
        ContentCard {
            VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                sectionLabel(icon: "globe.asia.australia.fill", title: "Sindhi Identity")
                sindhiRows
            }
            .padding(AppTheme.spacingMD)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var sindhiRows: some View {
        VStack(spacing: 2) {
            sindhiLanguageRows
            sindhiCommunityRows
        }
    }

    @ViewBuilder
    private var sindhiLanguageRows: some View {
        if let fluency = profileVM.user.sindhiFluency {
            infoRow(icon: "text.bubble.fill", label: "Sindhi Fluency", value: fluency.display)
        }
        if let dialect = profileVM.user.sindhiDialect {
            infoRow(icon: "waveform", label: "Dialect", value: dialect)
        }
        if let motherTongue = profileVM.user.motherTongue {
            infoRow(icon: "character.bubble.fill", label: "Mother Tongue", value: motherTongue)
        }
        if let gotra = profileVM.user.gotra {
            infoRow(icon: "leaf.fill", label: "Gotra", value: gotra)
        }
    }

    @ViewBuilder
    private var sindhiCommunityRows: some View {
        if let generation = profileVM.user.generation {
            infoRow(icon: "clock.arrow.circlepath", label: "Generation", value: generation)
        }
        if let familyValues = profileVM.user.familyValues {
            infoRow(icon: "house.fill", label: "Family Values", value: familyValues.display)
        }
        if let foodPref = profileVM.user.foodPreference {
            infoRow(icon: "fork.knife", label: "Food Preference", value: foodPref.display)
        }
    }

    // MARK: - Interests Section

    @ViewBuilder
    private var interestsSection: some View {
        if !profileVM.user.interests.isEmpty {
            ContentCard {
                VStack(alignment: .leading, spacing: AppTheme.spacingSM) {
                    sectionLabel(icon: "heart.fill", title: "Interests")
                    interestsPills
                }
                .padding(AppTheme.spacingMD)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private var interestsPills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(profileVM.user.interests, id: \.self) { interest in
                    interestCapsule(interest)
                }
            }
        }
    }

    private func interestCapsule(_ interest: String) -> some View {
        Text(interest)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(AppTheme.rose)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(AppTheme.surfaceMedium)
                    .overlay(
                        Capsule()
                            .stroke(AppTheme.rose.opacity(0.3), lineWidth: 0.5)
                    )
            )
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        VStack(spacing: AppTheme.spacingSM) {
            PrimaryButton(title: "Edit Profile", icon: "pencil") {
                showEditProfile = true
            }

            SecondaryButton(title: "Family Mode", icon: "person.3.fill") {
                showFamily = true
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

    private func infoRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: AppTheme.spacingSM) {
            Image(systemName: icon)
                .font(.system(size: 13))
                .foregroundColor(AppTheme.rose)
                .frame(width: 22)

            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(AppTheme.textSecondary)
                .frame(width: 110, alignment: .leading)

            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(AppTheme.textPrimary)

            Spacer()
        }
        .padding(.vertical, 8)
    }
}
