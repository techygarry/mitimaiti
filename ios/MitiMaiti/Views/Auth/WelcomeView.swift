import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @State private var showAuth = false
    @State private var animateHeart = false
    @State private var animateFeatures = false

    let features: [(String, String, String)] = [
        ("heart.circle.fill", "Cultural Match", "Scored on Sindhi values & traditions"),
        ("person.3.fill", "Family Mode", "Let family participate respectfully"),
        ("checkmark.shield.fill", "Verified Profiles", "Real people, real connections"),
        ("globe.asia.australia.fill", "Global Network", "Sindhis worldwide"),
        ("star.circle.fill", "Kundli Match", "Traditional compatibility scoring"),
        ("bubble.left.and.bubble.right.fill", "Respect-First Chat", "Thoughtful conversations")
    ]

    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            // Floating particles
            ForEach(0..<6, id: \.self) { i in
                Circle()
                    .fill(AppTheme.rose.opacity(0.08))
                    .frame(width: CGFloat.random(in: 40...120))
                    .offset(
                        x: CGFloat.random(in: -150...150),
                        y: animateHeart ? CGFloat.random(in: -300...300) : CGFloat.random(in: -200...200)
                    )
                    .blur(radius: 20)
                    .animation(.easeInOut(duration: Double.random(in: 4...8)).repeatForever(autoreverses: true), value: animateHeart)
            }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 32) {
                    Spacer().frame(height: 60)

                    // Logo & Title
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(AppTheme.rose.opacity(0.2))
                                .frame(width: 100, height: 100)
                                .scaleEffect(animateHeart ? 1.1 : 0.95)
                                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: animateHeart)

                            Image(systemName: "heart.fill")
                                .font(.system(size: 44))
                                .foregroundStyle(AppTheme.roseGradient)
                                .scaleEffect(animateHeart ? 1.05 : 1.0)
                                .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: animateHeart)
                        }

                        Text("MitiMaiti")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                            .foregroundColor(.white)

                        Text("Where Sindhi Hearts Meet")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(AppTheme.gold)
                    }

                    // Features Grid
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(Array(features.enumerated()), id: \.offset) { index, feature in
                            GlassCard(cornerRadius: 16) {
                                VStack(spacing: 8) {
                                    Image(systemName: feature.0)
                                        .font(.system(size: 24))
                                        .foregroundStyle(AppTheme.roseGradient)

                                    Text(feature.1)
                                        .font(.system(size: 13, weight: .semibold))
                                        .foregroundColor(.white)

                                    Text(feature.2)
                                        .font(.system(size: 11))
                                        .foregroundColor(AppTheme.textSecondary)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                }
                                .padding(14)
                                .frame(maxWidth: .infinity)
                            }
                            .opacity(animateFeatures ? 1 : 0)
                            .offset(y: animateFeatures ? 0 : 20)
                            .animation(.spring(response: 0.5, dampingFraction: 0.8).delay(Double(index) * 0.1), value: animateFeatures)
                        }
                    }
                    .padding(.horizontal)

                    // How it works
                    GlassCard(cornerRadius: 16) {
                        VStack(spacing: 16) {
                            Text("How It Works")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.white)

                            ForEach(Array([
                                ("1", "Create Profile", "Share your story & Sindhi identity"),
                                ("2", "Discover Matches", "Culturally scored compatibility"),
                                ("3", "Connect & Chat", "Respect-first conversations")
                            ].enumerated()), id: \.offset) { _, step in
                                HStack(spacing: 14) {
                                    Text(step.0)
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.white)
                                        .frame(width: 28, height: 28)
                                        .background(AppTheme.roseGradient)
                                        .clipShape(Circle())

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(step.1)
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(.white)
                                        Text(step.2)
                                            .font(.system(size: 12))
                                            .foregroundColor(AppTheme.textSecondary)
                                    }
                                    Spacer()
                                }
                            }
                        }
                        .padding(20)
                    }
                    .padding(.horizontal)

                    // CTA Buttons
                    VStack(spacing: 12) {
                        GlassButton("Get Started", icon: "arrow.right", action: { showAuth = true })
                            .padding(.horizontal)

                        Button("Already have an account? Sign In") {
                            showAuth = true
                        }
                        .font(.system(size: 14))
                        .foregroundColor(AppTheme.textSecondary)
                    }

                    Spacer().frame(height: 40)
                }
            }
        }
        .onAppear {
            animateHeart = true
            withAnimation { animateFeatures = true }
        }
        .fullScreenCover(isPresented: $showAuth) {
            PhoneAuthView()
                .environmentObject(authVM)
        }
    }
}
