import SwiftUI

struct SettingsView: View {
    @StateObject private var vm = SettingsViewModel()
    @EnvironmentObject var authVM: AuthViewModel
    @EnvironmentObject var localization: LocalizationManager
    @EnvironmentObject var themeManager: ThemeManager
    @Environment(\.adaptiveColors) private var colors

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
        .navigationTitle(localization.t("settings.title"))
        .navigationBarTitleDisplayMode(.inline)
        .alert(localization.t("settings.logOutConfirm"), isPresented: $vm.showLogoutConfirmation) {
            Button(localization.t("settings.logOut"), role: .destructive) { authVM.logout() }
            Button(localization.t("common.cancel"), role: .cancel) {}
        } message: {
            Text(localization.t("settings.logOutMessage"))
        }
        .alert(localization.t("settings.deleteAccountConfirm"), isPresented: $vm.showDeleteConfirmation) {
            Button(localization.t("settings.delete"), role: .destructive) {}
            Button(localization.t("common.cancel"), role: .cancel) {}
        } message: {
            Text(localization.t("settings.deleteAccountMessage"))
        }
        .onAppear {
            switch themeManager.preference {
            case .light: vm.theme = .light
            case .dark: vm.theme = .dark
            case .system: vm.theme = .auto
            }
        }
    }

    // MARK: - Discovery Section

    private var discoverySection: some View {
        settingsSection(title: localization.t("settings.discovery"), icon: "magnifyingglass") {
            showMeRow
            ageRangeRow
            ToggleRow(
                title: localization.t("settings.verifiedOnly"),
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
                Text(localization.t("settings.showMe"))
                    .font(.system(size: 15))
                    .foregroundColor(colors.textPrimary)
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
            Text(localization.t("settings.ageRange"))
                .font(.system(size: 15))
                .foregroundColor(colors.textPrimary)
            Spacer()
            Text("\(Int(vm.ageMin)) - \(Int(vm.ageMax))")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(AppTheme.rose)
        }
    }

    private var ageRangeSliders: some View {
        VStack(spacing: 4) {
            HStack {
                Text(localization.t("settings.min"))
                    .font(.system(size: 11))
                    .foregroundColor(colors.textMuted)
                    .frame(width: 28)
                Slider(value: $vm.ageMin, in: 18...50, step: 1) { _ in
                    if vm.ageMin > vm.ageMax { vm.ageMax = vm.ageMin }
                }
                .tint(AppTheme.rose)
            }
            HStack {
                Text(localization.t("settings.max"))
                    .font(.system(size: 11))
                    .foregroundColor(colors.textMuted)
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
        settingsSection(title: localization.t("settings.notifications"), icon: "bell.fill") {
            ToggleRow(
                title: localization.t("settings.matches"),
                icon: "heart.circle.fill",
                isOn: Binding(
                    get: { vm.notifyMatches },
                    set: { vm.notifyMatches = $0 }
                )
            )
            ToggleRow(
                title: localization.t("settings.messages"),
                icon: "message.fill",
                isOn: Binding(
                    get: { vm.notifyMessages },
                    set: { vm.notifyMessages = $0 }
                )
            )
            ToggleRow(
                title: localization.t("settings.likes"),
                icon: "heart.fill",
                isOn: Binding(
                    get: { vm.notifyLikes },
                    set: { vm.notifyLikes = $0 }
                )
            )
            ToggleRow(
                title: localization.t("settings.familyUpdates"),
                icon: "person.3.fill",
                isOn: Binding(
                    get: { vm.notifyFamily },
                    set: { vm.notifyFamily = $0 }
                )
            )
            ToggleRow(
                title: localization.t("settings.expiry"),
                icon: "clock.fill",
                isOn: Binding(
                    get: { vm.notifyExpiry },
                    set: { vm.notifyExpiry = $0 }
                )
            )
            ToggleRow(
                title: localization.t("settings.dailyPrompt"),
                icon: "sparkles",
                isOn: Binding(
                    get: { vm.notifyDailyPrompt },
                    set: { vm.notifyDailyPrompt = $0 }
                )
            )
            ToggleRow(
                title: localization.t("settings.newFeatures"),
                icon: "star.fill",
                isOn: Binding(
                    get: { vm.notifyNewFeatures },
                    set: { vm.notifyNewFeatures = $0 }
                )
            )
        }
    }

    // MARK: - Privacy Section

    private var privacySection: some View {
        settingsSection(title: localization.t("settings.privacy"), icon: "lock.fill") {
            ToggleRow(title: localization.t("settings.showInDiscovery"), icon: "eye.fill", isOn: $vm.discoveryEnabled)
            ToggleRow(title: localization.t("settings.incognitoMode"), icon: "eye.slash.fill", isOn: $vm.incognitoMode)
            ToggleRow(title: localization.t("settings.displayFullName"), icon: "person.text.rectangle", isOn: $vm.showFullName)
            ToggleRow(title: localization.t("settings.snoozeProfile"), icon: "moon.zzz.fill", isOn: $vm.isSnoozed)
        }
    }

    // MARK: - Appearance Section

    private var appearanceSection: some View {
        settingsSection(title: localization.t("settings.appearance"), icon: "paintbrush.fill") {
            themePickerRow
            languageRow
        }
    }

    private var themePickerRow: some View {
        HStack {
            Image(systemName: "circle.lefthalf.filled")
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text(localization.t("settings.theme"))
                .font(.system(size: 15))
                .foregroundColor(colors.textPrimary)
            Spacer()
            Picker("", selection: Binding(
                get: { vm.theme },
                set: { newTheme in
                    vm.theme = newTheme
                    switch newTheme {
                    case .light: themeManager.preference = .light
                    case .dark: themeManager.preference = .dark
                    case .auto: themeManager.preference = .system
                    }
                }
            )) {
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
            Text(localization.t("settings.language"))
                .font(.system(size: 15))
                .foregroundColor(colors.textPrimary)
            Spacer()
            Picker("", selection: $localization.currentLanguage) {
                ForEach(Language.allCases) { lang in
                    Text(lang.displayName).tag(lang)
                }
            }
            .tint(AppTheme.rose)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    // MARK: - Account Section

    private var accountSection: some View {
        settingsSection(title: localization.t("settings.account"), icon: "person.crop.circle.fill") {
            NavigationLink {
                EditProfileView()
            } label: {
                settingsRow(icon: "pencil", title: localization.t("settings.editProfile"), color: AppTheme.rose)
            }

            NavigationLink {
                FamilyView()
            } label: {
                settingsRow(icon: "person.3.fill", title: localization.t("settings.familyMode"), color: AppTheme.rose)
            }

            Divider()
                .background(colors.borderSubtle)
                .padding(.horizontal, 16)

            accountDangerButtons
        }
    }

    private var accountDangerButtons: some View {
        VStack(spacing: 0) {
            Button { vm.showLogoutConfirmation = true } label: {
                settingsRow(icon: "rectangle.portrait.and.arrow.forward", title: localization.t("settings.logOut"), color: AppTheme.warning)
            }

            Button { vm.showDeleteConfirmation = true } label: {
                settingsRow(icon: "trash.fill", title: localization.t("settings.deleteAccount"), color: AppTheme.error)
            }
        }
    }

    // MARK: - About Section

    private var aboutSection: some View {
        settingsSection(title: localization.t("settings.about"), icon: "info.circle.fill") {
            aboutRow(icon: "app.badge", title: localization.t("settings.appVersion"), detail: "2.0.0")
            settingsLinkRow(icon: "doc.text.fill", title: localization.t("settings.termsOfService"))
            settingsLinkRow(icon: "hand.raised.fill", title: localization.t("settings.privacyPolicy"))
            settingsLinkRow(icon: "shield.lefthalf.filled", title: localization.t("settings.communityGuidelines"))
        }
    }

    private func aboutRow(icon: String, title: String, detail: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text(title)
                .font(.system(size: 15))
                .foregroundColor(colors.textPrimary)
            Spacer()
            Text(detail)
                .font(.system(size: 13))
                .foregroundColor(colors.textMuted)
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
                        .foregroundColor(colors.textSecondary)
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
                .foregroundColor(colors.textMuted)
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
                .foregroundColor(colors.textPrimary)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(colors.textMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}
