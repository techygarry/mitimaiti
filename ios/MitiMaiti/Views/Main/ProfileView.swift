import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var profileVM: ProfileViewModel
    @State private var showEditProfile = false
    @State private var showSettings = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Header with avatar
                        VStack(spacing: 16) {
                            ZStack {
                                // Completeness ring
                                Circle()
                                    .stroke(Color.white.opacity(0.1), lineWidth: 4)
                                    .frame(width: 108, height: 108)

                                Circle()
                                    .trim(from: 0, to: Double(profileVM.user.profileCompleteness) / 100)
                                    .stroke(AppTheme.roseGradient, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                                    .frame(width: 108, height: 108)
                                    .rotationEffect(.degrees(-90))

                                ProfileAvatar(url: nil, name: profileVM.user.displayName, size: 96, isOnline: true)
                            }

                            VStack(spacing: 4) {
                                HStack(spacing: 6) {
                                    Text("\(profileVM.user.displayName), \(profileVM.user.age)")
                                        .font(.system(size: 22, weight: .bold))
                                        .foregroundColor(.white)
                                    if profileVM.user.isVerified {
                                        Image(systemName: "checkmark.seal.fill")
                                            .foregroundColor(AppTheme.info)
                                    }
                                }

                                Text(profileVM.user.city ?? "")
                                    .font(.system(size: 14))
                                    .foregroundColor(AppTheme.textSecondary)
                            }

                            GlassButton("Edit Profile", icon: "pencil", style: .secondary) {
                                showEditProfile = true
                            }
                            .frame(width: 180)
                        }
                        .padding(.top, 20)

                        // Completeness
                        GlassCard(cornerRadius: 16) {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text("Profile Completeness")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.white)
                                    Spacer()
                                    Text("\(profileVM.user.profileCompleteness)%")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(AppTheme.rose)
                                }
                                ProgressView(value: Double(profileVM.user.profileCompleteness), total: 100)
                                    .tint(AppTheme.rose)
                            }
                            .padding(16)
                        }
                        .padding(.horizontal)

                        // Stats
                        HStack(spacing: 12) {
                            ForEach(profileVM.profileStats, id: \.0) { stat in
                                GlassCard(cornerRadius: 14) {
                                    VStack(spacing: 6) {
                                        Image(systemName: stat.0)
                                            .font(.system(size: 18))
                                            .foregroundColor(AppTheme.rose)
                                        Text(stat.1)
                                            .font(.system(size: 20, weight: .bold))
                                            .foregroundColor(.white)
                                        Text(stat.2)
                                            .font(.system(size: 11))
                                            .foregroundColor(AppTheme.textSecondary)
                                    }
                                    .padding(14)
                                    .frame(maxWidth: .infinity)
                                }
                            }
                        }
                        .padding(.horizontal)

                        // Profile Sections
                        VStack(spacing: 8) {
                            ProfileSectionRow(icon: "person.fill", title: "My Basics", subtitle: "5/8 fields", progress: 0.625)
                            ProfileSectionRow(icon: "globe.asia.australia.fill", title: "My Sindhi Identity", subtitle: "3/5 fields", progress: 0.6)
                            ProfileSectionRow(icon: "star.fill", title: "My Chatti", subtitle: "0/7 fields", progress: 0)
                            ProfileSectionRow(icon: "paintpalette.fill", title: "My Culture", subtitle: "0/3 fields", progress: 0)
                            ProfileSectionRow(icon: "heart.fill", title: "My Personality", subtitle: "2/5 fields", progress: 0.4)
                        }
                        .padding(.horizontal)

                        Spacer().frame(height: 100)
                    }
                }
            }
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
        }
    }
}

struct ProfileSectionRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let progress: Double

    var body: some View {
        GlassCard(cornerRadius: 14) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(AppTheme.rose)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.white)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(AppTheme.textSecondary)
                }

                Spacer()

                CircularProgress(value: progress, size: 32)

                Image(systemName: "chevron.right")
                    .font(.system(size: 12))
                    .foregroundColor(AppTheme.textMuted)
            }
            .padding(14)
        }
    }
}

struct CircularProgress: View {
    let value: Double
    let size: CGFloat

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.1), lineWidth: 3)
            Circle()
                .trim(from: 0, to: value)
                .stroke(AppTheme.rose, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
        .frame(width: size, height: size)
    }
}
