import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    @StateObject private var feedVM = FeedViewModel()
    @StateObject private var inboxVM = InboxViewModel()
    @StateObject private var profileVM = ProfileViewModel()
    @StateObject private var familyVM = FamilyViewModel()
    @ObservedObject private var notificationManager = NotificationManager.shared

    var body: some View {
        TabView(selection: $selectedTab) {
            DiscoverView()
                .environmentObject(feedVM)
                .environmentObject(profileVM)
                .tabItem {
                    Label("Discover", systemImage: "sparkle.magnifyingglass")
                }
                .tag(0)

            LikedYouView()
                .environmentObject(inboxVM)
                .tabItem {
                    Label("Liked You", systemImage: "heart.fill")
                }
                .tag(1)
                .badge(likeBadgeCount)

            MatchesView()
                .environmentObject(inboxVM)
                .tabItem {
                    Label("Matches", systemImage: "message.fill")
                }
                .tag(2)
                .badge(matchBadgeCount)

            FamilyView()
                .tabItem {
                    Label("Family", systemImage: "person.3.fill")
                }
                .tag(3)
                .badge(familyBadgeCount)

            ProfileView()
                .environmentObject(profileVM)
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(4)
        }
        .tint(AppTheme.rose)
        .onAppear {
            feedVM.loadFeed()
            inboxVM.loadInbox()
            profileVM.loadProfile()
            notificationManager.initialize()
        }
        .onChange(of: notificationManager.selectedTab) { _, newTab in
            selectedTab = newTab
        }
    }

    // MARK: - Badge Counts (combining inbox counts with unread notification counts)

    private var likeBadgeCount: Int {
        let inboxLikes = inboxVM.totalLikes
        let notifLikes = notificationManager.notifications
            .filter { !$0.isRead && ($0.type == .like || $0.type == .profileView) }
            .count
        return max(inboxLikes, notifLikes)
    }

    private var matchBadgeCount: Int {
        let unread = inboxVM.unreadMessages
        let notifMatches = notificationManager.notifications
            .filter { !$0.isRead && ($0.type == .match || $0.type == .message || $0.type == .expiry || $0.type == .icebreaker) }
            .count
        return max(unread, notifMatches)
    }

    private var familyBadgeCount: Int {
        notificationManager.notifications
            .filter { !$0.isRead && ($0.type == .family || $0.type == .familySuggestion) }
            .count
    }
}
