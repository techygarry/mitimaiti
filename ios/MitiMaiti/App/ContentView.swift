import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @State private var showSplash = true

    var body: some View {
        ZStack {
            if showSplash {
                SplashView()
                    .transition(.opacity)
            } else if !authVM.isAuthenticated {
                WelcomeView()
                    .transition(.opacity)
            } else if !authVM.hasCompletedOnboarding {
                OnboardingContainerView()
                    .transition(.opacity)
            } else {
                MainTabView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.4), value: showSplash)
        .animation(.easeInOut(duration: 0.4), value: authVM.isAuthenticated)
        .animation(.easeInOut(duration: 0.4), value: authVM.hasCompletedOnboarding)
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation { showSplash = false }
            }
        }
    }
}

// MARK: - Splash Screen
struct SplashView: View {
    @State private var scale: CGFloat = 0.6
    @State private var opacity: Double = 0
    @State private var heartBeat = false

    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            // Animated background circles
            ForEach(0..<3, id: \.self) { i in
                Circle()
                    .fill(AppTheme.rose.opacity(0.05))
                    .frame(width: CGFloat(200 + i * 100))
                    .scaleEffect(heartBeat ? 1.2 : 0.8)
                    .animation(
                        .easeInOut(duration: 1.5)
                        .repeatForever(autoreverses: true)
                        .delay(Double(i) * 0.3),
                        value: heartBeat
                    )
            }

            VStack(spacing: 20) {
                // Heart logo
                ZStack {
                    Circle()
                        .fill(AppTheme.rose.opacity(0.2))
                        .frame(width: 120, height: 120)
                        .scaleEffect(heartBeat ? 1.1 : 0.95)
                        .animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: heartBeat)

                    Image(systemName: "heart.fill")
                        .font(.system(size: 52))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [AppTheme.rose, AppTheme.roseDark],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .shadow(color: AppTheme.rose.opacity(0.5), radius: 20)
                }

                VStack(spacing: 8) {
                    Text("MitiMaiti")
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text("Where Sindhi Hearts Meet")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(AppTheme.gold)
                }
            }
            .scaleEffect(scale)
            .opacity(opacity)
        }
        .onAppear {
            heartBeat = true
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6)) {
                scale = 1
            }
            withAnimation(.easeIn(duration: 0.6)) {
                opacity = 1
            }
        }
    }
}
