import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    @StateObject private var feedVM = FeedViewModel()
    @StateObject private var inboxVM = InboxViewModel()
    @StateObject private var profileVM = ProfileViewModel()

    var body: some View {
        TabView(selection: $selectedTab) {
            DiscoverView()
                .environmentObject(feedVM)
                .tabItem {
                    Label("Discover", systemImage: "sparkle.magnifyingglass")
                }
                .tag(0)

            InboxView()
                .environmentObject(inboxVM)
                .tabItem {
                    Label("Inbox", systemImage: "tray.fill")
                }
                .tag(1)

            ProfileView()
                .environmentObject(profileVM)
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(2)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
                .tag(3)
        }
        .tint(AppTheme.rose)
        .onAppear {
            feedVM.loadFeed()
            inboxVM.loadInbox()
            profileVM.loadProfile()
        }
    }
}
