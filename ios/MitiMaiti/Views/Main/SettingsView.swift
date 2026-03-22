import SwiftUI

struct SettingsView: View {
    @StateObject private var vm = SettingsViewModel()
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    // Visibility
                    settingsSection(title: "Visibility", icon: "eye.fill") {
                        GlassToggleRow(title: "Show in Discovery", icon: "magnifyingglass", isOn: $vm.discoveryEnabled)
                        GlassToggleRow(title: "Incognito Mode", icon: "eye.slash.fill", isOn: $vm.incognitoMode)
                        GlassToggleRow(title: "Display Full Name", icon: "person.text.rectangle", isOn: $vm.showFullName)
                        GlassToggleRow(title: "Snooze Profile", icon: "moon.zzz.fill", isOn: $vm.isSnoozed)
                    }

                    // Discovery Filters
                    settingsSection(title: "Discovery Filters", icon: "slider.horizontal.3") {
                        // Gender
                        HStack {
                            Image(systemName: "person.2.fill")
                                .foregroundColor(AppTheme.rose)
                                .frame(width: 24)
                            Text("Show Me")
                                .font(.system(size: 15))
                                .foregroundColor(.white)
                            Spacer()
                            Picker("", selection: $vm.genderPreference) {
                                ForEach(ShowMe.allCases) { Text($0.display).tag($0) }
                            }
                            .tint(AppTheme.rose)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)

                        // Age range
                        VStack(spacing: 4) {
                            HStack {
                                Image(systemName: "calendar")
                                    .foregroundColor(AppTheme.rose)
                                    .frame(width: 24)
                                Text("Age Range")
                                    .font(.system(size: 15))
                                    .foregroundColor(.white)
                                Spacer()
                                Text("\(Int(vm.ageMin)) - \(Int(vm.ageMax))")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(AppTheme.rose)
                            }
                            HStack(spacing: 12) {
                                Slider(value: $vm.ageMin, in: 18...50, step: 1).tint(AppTheme.rose)
                                Slider(value: $vm.ageMax, in: 18...50, step: 1).tint(AppTheme.rose)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)

                        GlassToggleRow(title: "Verified Only", icon: "checkmark.seal.fill", isOn: $vm.verifiedOnly)
                    }

                    // Notifications
                    settingsSection(title: "Notifications", icon: "bell.fill") {
                        GlassToggleRow(title: "Matches", icon: "heart.circle.fill", isOn: $vm.notifyMatches)
                        GlassToggleRow(title: "Messages", icon: "message.fill", isOn: $vm.notifyMessages)
                        GlassToggleRow(title: "Likes", icon: "heart.fill", isOn: $vm.notifyLikes)
                        GlassToggleRow(title: "Family", icon: "person.3.fill", isOn: $vm.notifyFamily)
                        GlassToggleRow(title: "Match Expiry", icon: "clock.fill", isOn: $vm.notifyExpiry)
                        GlassToggleRow(title: "Daily Prompt", icon: "text.bubble.fill", isOn: $vm.notifyDailyPrompt)
                        GlassToggleRow(title: "Safety Alerts", icon: "shield.fill", isOn: $vm.notifySafety)
                    }

                    // Appearance
                    settingsSection(title: "Appearance", icon: "paintbrush.fill") {
                        HStack {
                            Image(systemName: "circle.lefthalf.filled")
                                .foregroundColor(AppTheme.rose)
                                .frame(width: 24)
                            Text("Theme")
                                .font(.system(size: 15))
                                .foregroundColor(.white)
                            Spacer()
                            Picker("", selection: $vm.theme) {
                                ForEach(SettingsViewModel.AppearanceTheme.allCases) {
                                    Label($0.display, systemImage: $0.icon).tag($0)
                                }
                            }
                            .tint(AppTheme.rose)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }

                    // Account
                    settingsSection(title: "Account", icon: "person.crop.circle.fill") {
                        settingsLink(icon: "phone.fill", title: "Change Phone Number")
                        settingsLink(icon: "square.and.arrow.down.fill", title: "Download Data")
                        settingsLink(icon: "hand.raised.fill", title: "Privacy Policy")
                        settingsLink(icon: "doc.text.fill", title: "Terms of Service")
                        settingsLink(icon: "shield.lefthalf.filled", title: "Community Guidelines")
                    }

                    // Danger Zone
                    settingsSection(title: "Account Actions", icon: "exclamationmark.triangle.fill") {
                        Button {
                            vm.showLogoutConfirmation = true
                        } label: {
                            HStack {
                                Image(systemName: "rectangle.portrait.and.arrow.forward")
                                    .foregroundColor(AppTheme.warning)
                                    .frame(width: 24)
                                Text("Log Out")
                                    .font(.system(size: 15))
                                    .foregroundColor(AppTheme.warning)
                                Spacer()
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                        }

                        Button {
                            vm.showDeleteConfirmation = true
                        } label: {
                            HStack {
                                Image(systemName: "trash.fill")
                                    .foregroundColor(AppTheme.error)
                                    .frame(width: 24)
                                Text("Delete Account")
                                    .font(.system(size: 15))
                                    .foregroundColor(AppTheme.error)
                                Spacer()
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                        }
                    }

                    // Version
                    Text("MitiMaiti v2.0.0")
                        .font(.system(size: 12))
                        .foregroundColor(AppTheme.textMuted)
                        .padding(.bottom, 100)
                }
                .padding()
            }
        }
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

    // MARK: - Helpers
    func settingsSection<Content: View>(title: String, icon: String, @ViewBuilder content: () -> Content) -> some View {
        GlassCard(cornerRadius: 16) {
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

    func settingsLink(icon: String, title: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text(title)
                .font(.system(size: 15))
                .foregroundColor(.white)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}
