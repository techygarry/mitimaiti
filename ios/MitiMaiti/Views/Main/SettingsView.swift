import SwiftUI

struct SettingsView: View {
    @StateObject private var vm = SettingsViewModel()
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: AppTheme.spacingMD) {
                discoverySection
                notificationsSection
                privacySection
                appearanceSection
                accountSection
                aboutSection
                Spacer().frame(height: 100)
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.top, AppTheme.spacingSM)
        }
        .appBackground()
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Log Out?", isPresented: $vm.showLogoutConfirmation) {
            Button("Log Out", role: .destructive) { authVM.logout() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You'll need to verify your phone number again to log back in.")
        }
        .alert("Delete Account?", isPresented: $vm.showDeleteConfirmation) {
            Button("Delete", role: .destructive) {}
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Your account will be scheduled for deletion in 30 days. You can recover it by logging back in.")
        }
    }

    // MARK: - Discovery Section

    private var discoverySection: some View {
        settingsSection(title: "Discovery", icon: "magnifyingglass") {
            showMeRow
            ageRangeRow
            ToggleRow(
                title: "Verified Only",
                icon: "checkmark.seal.fill",
                isOn: $vm.verifiedOnly
            )
        }
    }

    private var showMeRow: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "person.2.fill")
                    .foregroundColor(AppTheme.rose)
                    .frame(width: 24)
                Text("Show Me")
                    .font(.system(size: 15))
                    .foregroundColor(AppTheme.textPrimary)
                Spacer()
            }

            Picker("Show Me", selection: $vm.genderPreference) {
                ForEach(ShowMe.allCases) { option in
                    Text(option.display).tag(option)
                }
            }
            .pickerStyle(.segmented)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var ageRangeRow: some View {
        VStack(spacing: 8) {
            ageRangeHeader
            ageRangeSliders
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var ageRangeHeader: some View {
        HStack {
            Image(systemName: "calendar")
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text("Age Range")
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textPrimary)
            Spacer()
            Text("\(Int(vm.ageMin)) - \(Int(vm.ageMax))")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(AppTheme.rose)
        }
    }

    private var ageRangeSliders: some View {
        VStack(spacing: 4) {
            HStack {
                Text("Min")
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textMuted)
                    .frame(width: 28)
                Slider(value: $vm.ageMin, in: 18...50, step: 1) { _ in
                    if vm.ageMin > vm.ageMax { vm.ageMax = vm.ageMin }
                }
                .tint(AppTheme.rose)
            }
            HStack {
                Text("Max")
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textMuted)
                    .frame(width: 28)
                Slider(value: $vm.ageMax, in: 18...50, step: 1) { _ in
                    if vm.ageMax < vm.ageMin { vm.ageMin = vm.ageMax }
                }
                .tint(AppTheme.rose)
            }
        }
    }

    // MARK: - Notifications Section

    private var notificationsSection: some View {
        settingsSection(title: "Notifications", icon: "bell.fill") {
            ToggleRow(title: "Matches", icon: "heart.circle.fill", isOn: $vm.notifyMatches)
            ToggleRow(title: "Messages", icon: "message.fill", isOn: $vm.notifyMessages)
            ToggleRow(title: "Likes", icon: "heart.fill", isOn: $vm.notifyLikes)
            ToggleRow(title: "Family Updates", icon: "person.3.fill", isOn: $vm.notifyFamily)
        }
    }

    // MARK: - Privacy Section

    private var privacySection: some View {
        settingsSection(title: "Privacy", icon: "lock.fill") {
            ToggleRow(title: "Show in Discovery", icon: "eye.fill", isOn: $vm.discoveryEnabled)
            ToggleRow(title: "Incognito Mode", icon: "eye.slash.fill", isOn: $vm.incognitoMode)
            ToggleRow(title: "Display Full Name", icon: "person.text.rectangle", isOn: $vm.showFullName)
            ToggleRow(title: "Snooze Profile", icon: "moon.zzz.fill", isOn: $vm.isSnoozed)
        }
    }

    // MARK: - Appearance Section

    private var appearanceSection: some View {
        settingsSection(title: "Appearance", icon: "paintbrush.fill") {
            themePickerRow
            languageRow
        }
    }

    private var themePickerRow: some View {
        HStack {
            Image(systemName: "circle.lefthalf.filled")
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text("Theme")
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textPrimary)
            Spacer()
            Picker("", selection: $vm.theme) {
                ForEach(SettingsViewModel.AppearanceTheme.allCases) { theme in
                    Label(theme.display, systemImage: theme.icon).tag(theme)
                }
            }
            .tint(AppTheme.rose)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var languageRow: some View {
        HStack {
            Image(systemName: "globe")
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text("Language")
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textPrimary)
            Spacer()
            Text("English")
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    // MARK: - Account Section

    private var accountSection: some View {
        settingsSection(title: "Account", icon: "person.crop.circle.fill") {
            NavigationLink {
                EditProfileView()
            } label: {
                settingsRow(icon: "pencil", title: "Edit Profile", color: AppTheme.rose)
            }

            NavigationLink {
                FamilyView()
            } label: {
                settingsRow(icon: "person.3.fill", title: "Family Mode", color: AppTheme.rose)
            }

            Divider()
                .background(Color.white.opacity(0.08))
                .padding(.horizontal, 16)

            accountDangerButtons
        }
    }

    private var accountDangerButtons: some View {
        VStack(spacing: 0) {
            Button { vm.showLogoutConfirmation = true } label: {
                settingsRow(icon: "rectangle.portrait.and.arrow.forward", title: "Log Out", color: AppTheme.warning)
            }

            Button { vm.showDeleteConfirmation = true } label: {
                settingsRow(icon: "trash.fill", title: "Delete Account", color: AppTheme.error)
            }
        }
    }

    // MARK: - About Section

    private var aboutSection: some View {
        settingsSection(title: "About", icon: "info.circle.fill") {
            aboutRow(icon: "app.badge", title: "App Version", detail: "2.0.0")
            settingsLinkRow(icon: "doc.text.fill", title: "Terms of Service")
            settingsLinkRow(icon: "hand.raised.fill", title: "Privacy Policy")
            settingsLinkRow(icon: "shield.lefthalf.filled", title: "Community Guidelines")
        }
    }

    private func aboutRow(icon: String, title: String, detail: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text(title)
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textPrimary)
            Spacer()
            Text(detail)
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    // MARK: - Shared Helpers

    private func settingsSection<Content: View>(
        title: String,
        icon: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        ContentCard {
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 8) {
                    Image(systemName: icon)
                        .font(.system(size: 14))
                        .foregroundColor(AppTheme.rose)
                    Text(title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(AppTheme.textSecondary)
                }
                .padding(.horizontal, 16)
                .padding(.top, 14)
                .padding(.bottom, 8)

                content()
            }
            .padding(.bottom, 8)
        }
    }

    private func settingsRow(icon: String, title: String, color: Color) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 24)
            Text(title)
                .font(.system(size: 15))
                .foregroundColor(color)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private func settingsLinkRow(icon: String, title: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text(title)
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textPrimary)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}
