import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var authVM: AuthViewModel
    private let localization = LocalizationManager.shared
    @Environment(\.adaptiveColors) private var colors
    @State private var animateHeart = false
    @State private var animateFeatures = false
    @State private var animateSteps = false

    // MARK: - Data

    private var features: [(icon: String, titleKey: String, subtitleKey: String)] {
        [
            ("sparkles", "welcome.culturalMatch", "welcome.culturalMatchSub"),
            ("star.fill", "welcome.kundli", "welcome.kundliSub"),
            ("person.3.fill", "welcome.familyMode", "welcome.familyModeSub"),
            ("shield.fill", "welcome.respectFirst", "welcome.respectFirstSub"),
            ("globe.americas.fill", "welcome.sindhiCommunity", "welcome.sindhiCommunitySub"),
            ("checkmark.seal.fill", "welcome.realProfiles", "welcome.realProfilesSub")
        ]
    }

    private var steps: [(number: String, titleKey: String, subtitleKey: String)] {
        [
            ("1", "welcome.step1Title", "welcome.step1Sub"),
            ("2", "welcome.step2Title", "welcome.step2Sub"),
            ("3", "welcome.step3Title", "welcome.step3Sub")
        ]
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 36) {
                    Spacer().frame(height: 50)
                    heroSection
                    featureGrid
                    howItWorksSection
                    ctaButtons
                    Spacer().frame(height: 40)
                }
            }
            .appBackground()
            .onAppear {
                animateHeart = true
                withAnimation(.easeOut(duration: 0.6).delay(0.3)) {
                    animateFeatures = true
                }
                withAnimation(.easeOut(duration: 0.5).delay(0.6)) {
                    animateSteps = true
                }
            }
        }
    }

    // MARK: - Hero Section

    private var heroSection: some View {
        VStack(spacing: 18) {
            // Heart with rose glow
            ZStack {
                Circle()
                    .fill(AppTheme.rose.opacity(0.12))
                    .frame(width: 110, height: 110)
                    .blur(radius: 16)
                    .scaleEffect(animateHeart ? 1.2 : 0.9)
                    .animation(
                        .easeInOut(duration: 2).repeatForever(autoreverses: true),
                        value: animateHeart
                    )

                Image(systemName: "heart.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(AppTheme.roseGradient)
                    .shadow(color: AppTheme.rose.opacity(0.5), radius: 18, x: 0, y: 6)
                    .scaleEffect(animateHeart ? 1.06 : 0.98)
                    .animation(
                        .easeInOut(duration: 1.2).repeatForever(autoreverses: true),
                        value: animateHeart
                    )
            }

            Text(localization.t("welcome.title"))
                .font(.system(size: 38, weight: .bold, design: .rounded))
                .foregroundColor(colors.textPrimary)

            Text(localization.t("welcome.subtitle"))
                .font(.system(size: 17, weight: .medium))
                .foregroundStyle(
                    LinearGradient(
                        colors: [AppTheme.gold, AppTheme.goldLight],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
        }
    }

    // MARK: - Feature Grid

    private var featureGrid: some View {
        LazyVGrid(
            columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ],
            spacing: 12
        ) {
            ForEach(Array(features.enumerated()), id: \.offset) { index, feature in
                featureCard(feature: feature, index: index)
            }
        }
        .padding(.horizontal, AppTheme.spacingMD)
    }

    private func featureCard(
        feature: (icon: String, titleKey: String, subtitleKey: String),
        index: Int
    ) -> some View {
        ContentCard {
            VStack(spacing: 10) {
                Image(systemName: feature.icon)
                    .font(.system(size: 26))
                    .foregroundStyle(AppTheme.roseGradient)
                    .shadow(color: AppTheme.rose.opacity(0.3), radius: 6)

                Text(localization.t(feature.titleKey))
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(colors.textPrimary)

                Text(localization.t(feature.subtitleKey))
                    .font(.system(size: 11))
                    .foregroundColor(colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .padding(.vertical, 16)
            .padding(.horizontal, 10)
            .frame(maxWidth: .infinity)
        }
        .opacity(animateFeatures ? 1 : 0)
        .offset(y: animateFeatures ? 0 : 24)
        .animation(
            .spring(response: 0.5, dampingFraction: 0.75)
                .delay(Double(index) * 0.08),
            value: animateFeatures
        )
    }

    // MARK: - How It Works

    private var howItWorksSection: some View {
        ContentCard {
            VStack(spacing: 18) {
                Text(localization.t("welcome.howItWorks"))
                    .font(.system(size: 19, weight: .bold))
                    .foregroundColor(colors.textPrimary)

                ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                    stepRow(step: step, index: index)

                    if index < steps.count - 1 {
                        Divider()
                            .background(colors.borderSubtle)
                            .padding(.leading, 44)
                    }
                }
            }
            .padding(20)
        }
        .padding(.horizontal, AppTheme.spacingMD)
    }

    private func stepRow(
        step: (number: String, titleKey: String, subtitleKey: String),
        index: Int
    ) -> some View {
        HStack(spacing: 14) {
            Text(step.number)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 30, height: 30)
                .background(AppTheme.roseGradient)
                .clipShape(Circle())
                .shadow(color: AppTheme.rose.opacity(0.35), radius: 6, x: 0, y: 3)

            VStack(alignment: .leading, spacing: 3) {
                Text(localization.t(step.titleKey))
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(colors.textPrimary)

                Text(localization.t(step.subtitleKey))
                    .font(.system(size: 12))
                    .foregroundColor(colors.textSecondary)
                    .lineLimit(2)
            }

            Spacer()
        }
        .opacity(animateSteps ? 1 : 0)
        .offset(x: animateSteps ? 0 : -20)
        .animation(
            .spring(response: 0.4, dampingFraction: 0.8)
                .delay(Double(index) * 0.12),
            value: animateSteps
        )
    }

    // MARK: - CTA Buttons

    private var ctaButtons: some View {
        VStack(spacing: 14) {
            NavigationLink {
                PhoneAuthView()
                    .environmentObject(authVM)
            } label: {
                getStartedLabel
            }
            .padding(.horizontal, AppTheme.spacingMD)

            NavigationLink {
                PhoneAuthView()
                    .environmentObject(authVM)
            } label: {
                haveAccountLabel
            }
            .padding(.horizontal, AppTheme.spacingMD)
        }
    }

    private var getStartedLabel: some View {
        Text(localization.t("welcome.getStarted"))
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.white)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(AppTheme.roseGradient)
        .clipShape(Capsule())
        .shadow(color: AppTheme.rose.opacity(0.45), radius: 14, x: 0, y: 6)
    }

    private var haveAccountLabel: some View {
        Text(localization.t("welcome.haveAccount"))
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(colors.textSecondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                Capsule()
                    .fill(colors.borderSubtle)
                    .overlay(
                        Capsule()
                            .stroke(AppTheme.rose.opacity(0.4), lineWidth: 1)
                    )
            )
    }
}
