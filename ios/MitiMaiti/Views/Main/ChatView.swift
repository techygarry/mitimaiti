import SwiftUI

struct ChatView: View {
    let match: Match
    @StateObject private var vm = ChatViewModel()
    @FocusState private var isInputFocused: Bool
    @State private var showUnlockToast = false

    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                // MARK: - Countdown Banner
                // Shows when: waiting for first message OR waiting for reply (timer active)
                // Hides when: both users have exchanged messages (chat unlocked)
                if vm.showCountdown, let exp = vm.match?.expiresAt {
                    CountdownBannerView(
                        expiresAt: exp,
                        bannerMessage: vm.lockBannerMessage,
                        isLocked: vm.isLockedForMe
                    )
                }

                // MARK: - Lock Status Banner (after first message sent, waiting for reply)
                if vm.isLockedForMe, !vm.showCountdown {
                    // Fallback lock banner when countdown is gone but still locked
                    lockBanner
                }

                // MARK: - Chat Unlocked Toast
                if showUnlockToast {
                    HStack(spacing: 8) {
                        Image(systemName: "lock.open.fill")
                            .font(.system(size: 12))
                        Text("Chat unlocked! You can now message freely")
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundColor(AppTheme.success)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(AppTheme.success.opacity(0.1))
                    .transition(.move(edge: .top).combined(with: .opacity))
                }

                // MARK: - Messages
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 8) {
                            // System message for new matches
                            if vm.match?.hasFirstMessage == false {
                                systemMessage("You matched! Send a message to start the conversation.")
                            }

                            ForEach(vm.messages) { msg in
                                MessageBubbleView(msg)
                                    .id(msg.id)
                            }

                            // Lock indicator after first message
                            if vm.isLockedForMe {
                                systemMessage("Waiting for \(match.otherUser.displayName) to reply...")
                            }

                            if vm.isOtherTyping {
                                TypingIndicator()
                                    .id("typing")
                            }
                        }
                        .padding(.horizontal)
                        .padding(.top, 12)
                        .padding(.bottom, 8)
                    }
                    .onChange(of: vm.messages.count) { _, _ in
                        withAnimation {
                            proxy.scrollTo(vm.messages.last?.id ?? "typing", anchor: .bottom)
                        }
                    }
                }

                // MARK: - Icebreakers (only when no messages yet)
                if !vm.hasMessages && !vm.isLockedForMe {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(MockData.icebreakers.prefix(4)) { ice in
                                Button {
                                    vm.sendIcebreaker(ice.question)
                                } label: {
                                    Text(ice.question)
                                        .font(.system(size: 13))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 8)
                                        .background(
                                            Capsule()
                                                .fill(.ultraThinMaterial)
                                                .overlay(Capsule().stroke(AppTheme.gold.opacity(0.3), lineWidth: 0.5))
                                        )
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                    }
                }

                // MARK: - Input Bar
                inputBar
            }
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                chatHeader
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                chatMenu
            }
        }
        .onAppear {
            vm.loadMessages(for: match)
        }
        .onChange(of: vm.chatUnlocked) { _, unlocked in
            if unlocked {
                withAnimation(.spring(response: 0.4)) {
                    showUnlockToast = true
                }
                // Hide toast after 3 seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    withAnimation { showUnlockToast = false }
                }
            }
        }
    }

    // MARK: - Lock Banner
    var lockBanner: some View {
        HStack(spacing: 10) {
            Image(systemName: "lock.fill")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.rose)

            VStack(alignment: .leading, spacing: 2) {
                Text("Waiting for reply...")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                Text("You can send another message once \(match.otherUser.displayName) replies")
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textSecondary)
            }

            Spacer()

            Image(systemName: "hourglass")
                .font(.system(size: 16))
                .foregroundColor(AppTheme.rose.opacity(0.6))
                .symbolEffect(.pulse)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(AppTheme.rose.opacity(0.08))
        .overlay(alignment: .bottom) {
            Rectangle().fill(AppTheme.rose.opacity(0.15)).frame(height: 0.5)
        }
    }

    // MARK: - Input Bar
    var inputBar: some View {
        VStack(spacing: 0) {
            if vm.isLockedForMe {
                // Locked state: show disabled input with lock icon
                HStack(spacing: 10) {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 16))
                        .foregroundColor(AppTheme.textMuted)

                    Text(vm.inputPlaceholder)
                        .font(.system(size: 15))
                        .foregroundColor(AppTheme.textMuted)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 22)
                        .fill(Color.white.opacity(0.04))
                        .overlay(
                            RoundedRectangle(cornerRadius: 22)
                                .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                        )
                )
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(
                    Rectangle()
                        .fill(.ultraThinMaterial)
                        .ignoresSafeArea()
                )
            } else {
                // Active state: normal input
                HStack(spacing: 10) {
                    Button {} label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(AppTheme.textMuted)
                    }

                    HStack {
                        TextField(vm.inputPlaceholder, text: $vm.messageText, axis: .vertical)
                            .font(.system(size: 15))
                            .foregroundColor(.white)
                            .lineLimit(1...4)
                            .focused($isInputFocused)

                        if !vm.messageText.isEmpty {
                            Button {
                                vm.sendMessage()
                            } label: {
                                Image(systemName: "arrow.up.circle.fill")
                                    .font(.system(size: 30))
                                    .foregroundStyle(AppTheme.roseGradient)
                            }
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 22)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: 22)
                                    .stroke(Color.white.opacity(0.12), lineWidth: 0.5)
                            )
                    )
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(
                    Rectangle()
                        .fill(.ultraThinMaterial)
                        .ignoresSafeArea()
                )
            }
        }
    }

    // MARK: - Chat Header
    var chatHeader: some View {
        HStack(spacing: 10) {
            ProfileAvatar(url: nil, name: match.otherUser.displayName, size: 32, isOnline: match.otherUser.isOnline)

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 4) {
                    Text(match.otherUser.displayName)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
                    Text("\(match.otherUser.age)")
                        .font(.system(size: 13))
                        .foregroundColor(AppTheme.textSecondary)
                }
                HStack(spacing: 4) {
                    Text(match.otherUser.isOnline ? "Online" : (match.otherUser.lastActive?.timeAgoShort ?? ""))
                        .font(.system(size: 11))
                        .foregroundColor(match.otherUser.isOnline ? AppTheme.success : AppTheme.textMuted)

                    // Lock indicator in header
                    if vm.isLockedForMe {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 8))
                            .foregroundColor(AppTheme.rose)
                    } else if vm.match?.callsUnlocked == true {
                        Image(systemName: "lock.open.fill")
                            .font(.system(size: 8))
                            .foregroundColor(AppTheme.success)
                    }
                }
            }
        }
    }

    // MARK: - Chat Menu
    var chatMenu: some View {
        Menu {
            if vm.match?.callsUnlocked == true {
                Button {} label: {
                    Label("Voice Call", systemImage: "phone.fill")
                }
                Button {} label: {
                    Label("Video Call", systemImage: "video.fill")
                }
                Divider()
            }
            Button(role: .destructive) {} label: {
                Label("Report", systemImage: "exclamationmark.triangle")
            }
            Button(role: .destructive) {} label: {
                Label("Block", systemImage: "hand.raised")
            }
            Button(role: .destructive) {} label: {
                Label("Unmatch", systemImage: "person.badge.minus")
            }
        } label: {
            Image(systemName: "ellipsis")
                .foregroundColor(.white)
        }
    }

    // MARK: - System Message
    func systemMessage(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(AppTheme.textMuted)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 30)
            .padding(.vertical, 8)
    }
}

// MARK: - Countdown Banner View
struct CountdownBannerView: View {
    let expiresAt: Date
    let bannerMessage: (title: String, subtitle: String)?
    let isLocked: Bool
    @State private var remaining: TimeInterval = 0
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var bannerColor: Color {
        if isLocked { return AppTheme.rose }
        if remaining < 4 * 3600 { return AppTheme.error }
        if remaining < 12 * 3600 { return AppTheme.warning }
        return AppTheme.info
    }

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: isLocked ? "lock.fill" : "clock.fill")
                .font(.system(size: 14))
                .foregroundColor(bannerColor)

            VStack(alignment: .leading, spacing: 2) {
                Text(bannerMessage?.title ?? "Timer active")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                Text(bannerMessage?.subtitle ?? "")
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textSecondary)
                    .lineLimit(2)
            }

            Spacer()

            // Circular countdown
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 3)
                    .frame(width: 40, height: 40)

                Circle()
                    .trim(from: 0, to: min(1, remaining / (24 * 3600)))
                    .stroke(bannerColor, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .frame(width: 40, height: 40)
                    .rotationEffect(.degrees(-90))

                Text(remaining.shortCountdown)
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(bannerColor)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(bannerColor.opacity(0.08))
        .overlay(alignment: .bottom) {
            Rectangle().fill(bannerColor.opacity(0.15)).frame(height: 0.5)
        }
        .onAppear { remaining = max(0, expiresAt.timeIntervalSinceNow) }
        .onReceive(timer) { _ in
            remaining = max(0, expiresAt.timeIntervalSinceNow)
        }
    }
}
