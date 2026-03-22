import SwiftUI

struct EditProfileView: View {
    @EnvironmentObject var profileVM: ProfileViewModel
    @State private var selectedTab = 0

    let tabs = ["Basics", "Sindhi", "Chatti", "Culture", "Personality"]

    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                // Tab selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(tabs.enumerated()), id: \.offset) { i, tab in
                            Button {
                                withAnimation { selectedTab = i }
                            } label: {
                                Text(tab)
                                    .font(.system(size: 14, weight: selectedTab == i ? .semibold : .regular))
                                    .foregroundColor(selectedTab == i ? .white : AppTheme.textMuted)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(
                                        Capsule()
                                            .fill(selectedTab == i ? AppTheme.rose : Color.white.opacity(0.06))
                                    )
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.top, 8)

                ScrollView {
                    VStack(spacing: 14) {
                        switch selectedTab {
                        case 0: basicsSection
                        case 1: sindhiSection
                        case 2: chattiSection
                        case 3: cultureSection
                        case 4: personalitySection
                        default: EmptyView()
                        }
                    }
                    .padding()
                    .padding(.bottom, 100)
                }
            }
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                GlassButton("Save", style: .small, isLoading: profileVM.isSaving) {
                    profileVM.saveProfile()
                }
            }
        }
        .overlay(alignment: .bottom) {
            if profileVM.saveSuccess {
                Text("Saved!")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(AppTheme.success)
                    .clipShape(Capsule())
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .padding(.bottom, 80)
            }
        }
    }

    // MARK: - Basics
    var basicsSection: some View {
        VStack(spacing: 12) {
            EditFieldCard(label: "Bio", icon: "text.quote") {
                TextEditor(text: $profileVM.editBio)
                    .font(.system(size: 14))
                    .foregroundColor(.white)
                    .frame(height: 80)
                    .scrollContentBackground(.hidden)
            }

            EditFieldCard(label: "Height (cm)", icon: "ruler") {
                TextField("Height", text: $profileVM.editHeight)
                    .keyboardType(.numberPad)
                    .foregroundColor(.white)
            }

            EditFieldCard(label: "Education", icon: "graduationcap.fill") {
                TextField("Education", text: $profileVM.editEducation)
                    .foregroundColor(.white)
            }

            EditFieldCard(label: "Occupation", icon: "briefcase.fill") {
                TextField("Job Title", text: $profileVM.editOccupation)
                    .foregroundColor(.white)
            }

            EditFieldCard(label: "Company", icon: "building.2.fill") {
                TextField("Company", text: $profileVM.editCompany)
                    .foregroundColor(.white)
            }

            EditFieldCard(label: "Smoking", icon: "smoke.fill") {
                Picker("", selection: $profileVM.editSmoking) {
                    Text("Select").tag("")
                    Text("Never").tag("never")
                    Text("Socially").tag("socially")
                    Text("Regularly").tag("regularly")
                }
                .pickerStyle(.segmented)
            }

            EditFieldCard(label: "Drinking", icon: "wineglass.fill") {
                Picker("", selection: $profileVM.editDrinking) {
                    Text("Select").tag("")
                    Text("Never").tag("never")
                    Text("Socially").tag("socially")
                    Text("Regularly").tag("regularly")
                }
                .pickerStyle(.segmented)
            }
        }
    }

    // MARK: - Sindhi
    var sindhiSection: some View {
        VStack(spacing: 12) {
            EditFieldCard(label: "Sindhi Fluency", icon: "globe") {
                Picker("", selection: $profileVM.editFluency) {
                    ForEach(SindhiFluency.allCases) { Text($0.display).tag($0) }
                }
                .pickerStyle(.segmented)
            }

            EditFieldCard(label: "Religion", icon: "sparkles") {
                TextField("Religion", text: $profileVM.editReligion)
                    .foregroundColor(.white)
            }

            EditFieldCard(label: "Family Values", icon: "house.fill") {
                Picker("", selection: $profileVM.editFamilyValues) {
                    ForEach(FamilyValues.allCases) { Text($0.display).tag($0) }
                }
                .pickerStyle(.segmented)
            }

            EditFieldCard(label: "Food Preference", icon: "leaf.fill") {
                Picker("", selection: $profileVM.editFoodPreference) {
                    ForEach(FoodPreference.allCases) { Text($0.display).tag($0) }
                }
                .pickerStyle(.menu)
                .tint(.white)
            }
        }
    }

    // MARK: - Chatti
    var chattiSection: some View {
        VStack(spacing: 12) {
            GlassCard(cornerRadius: 16) {
                VStack(spacing: 8) {
                    Image(systemName: "star.circle.fill")
                        .font(.system(size: 36))
                        .foregroundStyle(AppTheme.goldGradient)
                    Text("Kundli/Chatti Details")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    Text("Add your astrological details for better compatibility matching")
                        .font(.system(size: 13))
                        .foregroundColor(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(20)
                .frame(maxWidth: .infinity)
            }

            EditFieldCard(label: "Nakshatra", icon: "star") {
                TextField("Nakshatra", text: .constant(""))
                    .foregroundColor(.white)
            }

            EditFieldCard(label: "Rashi", icon: "moon.stars") {
                TextField("Rashi", text: .constant(""))
                    .foregroundColor(.white)
            }
        }
    }

    // MARK: - Culture
    var cultureSection: some View {
        VStack(spacing: 12) {
            EditFieldCard(label: "Mother Tongue", icon: "text.bubble") {
                TextField("Mother Tongue", text: .constant("Sindhi"))
                    .foregroundColor(.white)
            }

            EditFieldCard(label: "Community Organization", icon: "building.columns") {
                TextField("Community Org", text: .constant(""))
                    .foregroundColor(.white)
            }
        }
    }

    // MARK: - Personality
    var personalitySection: some View {
        VStack(spacing: 12) {
            EditFieldCard(label: "Interests", icon: "heart.fill") {
                FlowLayout(spacing: 6) {
                    ForEach(MockData.allInterests.prefix(15), id: \.self) { interest in
                        let selected = profileVM.user.interests.contains(interest)
                        Text(interest)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(selected ? .white : AppTheme.textSecondary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(
                                Capsule()
                                    .fill(selected ? AppTheme.rose : Color.white.opacity(0.08))
                            )
                    }
                }
            }

            // Prompts
            ForEach(profileVM.user.prompts) { prompt in
                EditFieldCard(label: prompt.question, icon: "text.quote") {
                    Text(prompt.answer)
                        .font(.system(size: 14))
                        .foregroundColor(AppTheme.textSecondary)
                }
            }
        }
    }
}

// MARK: - Edit Field Card
struct EditFieldCard<Content: View>: View {
    let label: String
    let icon: String
    let content: Content

    init(label: String, icon: String, @ViewBuilder content: () -> Content) {
        self.label = label
        self.icon = icon
        self.content = content()
    }

    var body: some View {
        GlassCard(cornerRadius: 14) {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    Image(systemName: icon)
                        .font(.system(size: 14))
                        .foregroundColor(AppTheme.rose)
                    Text(label)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(AppTheme.textSecondary)
                }

                content
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
