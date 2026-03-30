import SwiftUI

struct InboxView: View {
    @EnvironmentObject var inboxVM: InboxViewModel
    @Environment(\.adaptiveColors) private var colors
    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                inboxHeader
                segmentedControl
                tabContent
            }
            .appBackground()
            .navigationDestination(for: Match.self) { match in
                ChatView(match: match)
            }
            .onAppear {
                inboxVM.loadInbox()
            }
        }
    }

    // MARK: - Header

    private var inboxHeader: some View {
        HStack {
            Text("Inbox")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(colors.textPrimary)
            Spacer()
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }

    // MARK: - Segmented Control

    private var segmentedControl: some View {
        HStack(spacing: 0) {
            InboxSegmentButton(
                title: "Liked You",
                count: inboxVM.totalLikes,
                isSelected: selectedTab == 0
            ) {
                withAnimation(.easeInOut(duration: 0.25)) {
                    selectedTab = 0
                }
            }

            InboxSegmentButton(
                title: "Matches",
                count: inboxVM.totalMatches,
                isSelected: selectedTab == 1
            ) {
                withAnimation(.easeInOut(duration: 0.25)) {
                    selectedTab = 1
                }
            }
        }
        .padding(4)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(colors.surfaceDark)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(colors.border, lineWidth: 0.5)
                )
        )
        .padding(.horizontal)
        .padding(.top, 12)
    }

    // MARK: - Tab Content

    @ViewBuilder
    private var tabContent: some View {
        if inboxVM.isLoading {
            Spacer()
            ProgressView()
                .tint(AppTheme.rose)
            Spacer()
        } else {
            TabView(selection: $selectedTab) {
                LikedYouTabView(likes: inboxVM.likes)
                    .tag(0)

                MatchesTabView(matches: inboxVM.matches)
                    .tag(1)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
        }
    }
}

// MARK: - Segment Button

private struct InboxSegmentButton: View {
    let title: String
    let count: Int
    let isSelected: Bool
    let action: () -> Void
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(title)
                    .font(.system(size: 14, weight: isSelected ? .semibold : .regular))

                if count > 0 {
                    Text("\(count)")
                        .font(.system(size: 11, weight: .bold))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(
                            Capsule()
                                .fill(isSelected ? AppTheme.rose.opacity(0.3) : colors.border)
                        )
                }
            }
            .foregroundColor(isSelected ? .white : colors.textSecondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(
                Group {
                    if isSelected {
                        RoundedRectangle(cornerRadius: 11)
                            .fill(AppTheme.rose)
                    }
                }
            )
        }
    }
}

// MARK: - Liked You Tab (used by InboxView internal tabs)

private struct LikedYouTabView: View {
    let likes: [LikedYouCard]

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        if likes.isEmpty {
            EmptyStateView(
                icon: "heart",
                title: "No likes yet",
                message: "When someone likes your profile, they will appear here. Keep your profile fresh!"
            )
        } else {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 14) {
                    ForEach(likes) { like in
                        LikedYouCardView(like: like)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 16)
                .padding(.bottom, 100)
            }
        }
    }
}

// MARK: - Matches Tab (used by InboxView internal tabs)

private struct MatchesTabView: View {
    let matches: [Match]

    var body: some View {
        if matches.isEmpty {
            EmptyStateView(
                icon: "person.2",
                title: "No matches yet",
                message: "Start swiping on profiles to find your perfect match!"
            )
        } else {
            ScrollView {
                LazyVStack(spacing: 10) {
                    ForEach(matches) { match in
                        NavigationLink(value: match) {
                            MatchRowView(match: match)
                        }
                    }
                }
                .padding(.top, 12)
                .padding(.bottom, 100)
            }
        }
    }
}
