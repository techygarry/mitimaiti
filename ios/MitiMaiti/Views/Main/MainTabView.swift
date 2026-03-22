import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    @StateObject private var feedVM = FeedViewModel()
    @StateObject private var inboxVM = InboxViewModel()
    @StateObject private var profileVM = ProfileViewModel()
    @StateObject private var familyVM = FamilyViewModel()

    var body: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $selectedTab) {
                DiscoverView()
                    .environmentObject(feedVM)
                    .tag(0)

                InboxView()
                    .environmentObject(inboxVM)
                    .tag(1)

                FamilyView()
                    .environmentObject(familyVM)
                    .tag(2)

                ProfileView()
                    .environmentObject(profileVM)
                    .tag(3)
            }

            // Custom Glass Tab Bar
            GlassTabBar(selectedTab: $selectedTab, unreadLikes: inboxVM.totalLikes, unreadMessages: inboxVM.unreadMessages)
        }
        .onAppear {
            UITabBar.appearance().isHidden = true
            feedVM.loadFeed()
            inboxVM.loadInbox()
            profileVM.loadProfile()
            familyVM.loadFamily()
        }
    }
}

// MARK: - Glass Tab Bar
struct GlassTabBar: View {
    @Binding var selectedTab: Int
    var unreadLikes: Int
    var unreadMessages: Int

    let tabs: [(String, String, String)] = [
        ("sparkle.magnifyingglass", "Discover", "sparkle.magnifyingglass"),
        ("heart.fill", "Likes", "heart"),
        ("person.3.fill", "Family", "person.3"),
        ("person.crop.circle.fill", "Profile", "person.crop.circle")
    ]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(tabs.enumerated()), id: \.offset) { index, tab in
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedTab = index
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }
                } label: {
                    VStack(spacing: 4) {
                        ZStack(alignment: .topTrailing) {
                            Image(systemName: selectedTab == index ? tab.0 : tab.2)
                                .font(.system(size: 22, weight: selectedTab == index ? .semibold : .regular))
                                .foregroundColor(selectedTab == index ? AppTheme.rose : AppTheme.textMuted)
                                .scaleEffect(selectedTab == index ? 1.1 : 1.0)

                            // Badge
                            if index == 1 && unreadLikes > 0 {
                                BadgeView(count: unreadLikes)
                            }
                        }

                        Text(tab.1)
                            .font(.system(size: 10, weight: selectedTab == index ? .semibold : .regular))
                            .foregroundColor(selectedTab == index ? AppTheme.rose : AppTheme.textMuted)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.top, 10)
        .padding(.bottom, 20)
        .background(
            ZStack {
                Rectangle()
                    .fill(.ultraThinMaterial)
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [Color.white.opacity(0.08), Color.white.opacity(0.02)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                Rectangle()
                    .fill(Color.clear)
                    .overlay(alignment: .top) {
                        Rectangle()
                            .fill(Color.white.opacity(0.15))
                            .frame(height: 0.5)
                    }
            }
            .ignoresSafeArea()
        )
    }
}

struct BadgeView: View {
    let count: Int
    var body: some View {
        Text("\(min(count, 99))")
            .font(.system(size: 9, weight: .bold))
            .foregroundColor(.white)
            .padding(.horizontal, 5)
            .padding(.vertical, 2)
            .background(AppTheme.rose)
            .clipShape(Capsule())
            .offset(x: 8, y: -6)
    }
}
