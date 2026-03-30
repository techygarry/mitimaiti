import SwiftUI

// MARK: - Content Card Container
// Clean solid card for content — NO glass effect. Glass is reserved for navigation only.

struct ContentCard<Content: View>: View {
    let content: Content
    @Environment(\.adaptiveColors) private var colors

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .background(
                RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                    .fill(colors.cardDark)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                            .stroke(colors.border, lineWidth: 0.5)
                    )
            )
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusCard))
            .shadow(color: colors.cardShadowColor, radius: 12, x: 0, y: 6)
    }
}

// MARK: - Primary Button
// Rose gradient capsule with glow shadow and haptic feedback

struct PrimaryButton: View {
    let title: String
    var icon: String?
    var isLoading: Bool = false
    let action: () -> Void

    @State private var tapTrigger: Bool = false

    var body: some View {
        Button(action: {
            tapTrigger.toggle()
            action()
        }) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    if let icon {
                        Image(systemName: icon)
                            .font(.system(size: 16, weight: .semibold))
                    }
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                }
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(AppTheme.roseGradient)
            .clipShape(Capsule())
            .shadow(color: AppTheme.rose.opacity(0.45), radius: 14, x: 0, y: 6)
        }
        .sensoryFeedback(.impact, trigger: tapTrigger)
        .disabled(isLoading)
    }
}

// MARK: - Secondary Button
// Outline style with rose border, clear background

struct SecondaryButton: View {
    let title: String
    var icon: String?
    var isLoading: Bool = false
    let action: () -> Void

    @State private var tapTrigger: Bool = false

    var body: some View {
        Button(action: {
            tapTrigger.toggle()
            action()
        }) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: AppTheme.rose))
                        .scaleEffect(0.8)
                } else {
                    if let icon {
                        Image(systemName: icon)
                            .font(.system(size: 16, weight: .semibold))
                    }
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                }
            }
            .foregroundColor(AppTheme.rose)
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(Color.clear)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(AppTheme.rose, lineWidth: 1.5)
            )
        }
        .sensoryFeedback(.impact, trigger: tapTrigger)
        .disabled(isLoading)
    }
}

// MARK: - Danger Button
// Error color gradient for destructive actions

struct DangerButton: View {
    let title: String
    var icon: String?
    var isLoading: Bool = false
    let action: () -> Void

    @State private var tapTrigger: Bool = false

    var body: some View {
        Button(action: {
            tapTrigger.toggle()
            action()
        }) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    if let icon {
                        Image(systemName: icon)
                            .font(.system(size: 16, weight: .semibold))
                    }
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                }
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(
                LinearGradient(
                    colors: [AppTheme.error, AppTheme.error.opacity(0.8)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(Capsule())
            .shadow(color: AppTheme.error.opacity(0.35), radius: 14, x: 0, y: 6)
        }
        .sensoryFeedback(.impact, trigger: tapTrigger)
        .disabled(isLoading)
    }
}

// MARK: - Small Button
// Compact rose gradient capsule

struct SmallButton: View {
    let title: String
    var icon: String?
    let action: () -> Void

    @State private var tapTrigger: Bool = false

    var body: some View {
        Button(action: {
            tapTrigger.toggle()
            action()
        }) {
            HStack(spacing: 6) {
                if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .semibold))
                }
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
            }
            .foregroundColor(.white)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(AppTheme.roseGradient)
            .clipShape(Capsule())
            .shadow(color: AppTheme.rose.opacity(0.35), radius: 10, x: 0, y: 4)
        }
        .sensoryFeedback(.impact, trigger: tapTrigger)
    }
}

// MARK: - App Text Field
// Adaptive background with rose highlight on focus

struct AppTextField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String?
    var keyboardType: UIKeyboardType = .default
    @FocusState private var isFocused: Bool
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack(spacing: 12) {
            if let icon {
                Image(systemName: icon)
                    .foregroundColor(isFocused ? AppTheme.rose : colors.textMuted)
                    .frame(width: 20)
                    .animation(.easeInOut(duration: 0.2), value: isFocused)
            }
            TextField(placeholder, text: $text)
                .foregroundColor(colors.textPrimary)
                .keyboardType(keyboardType)
                .autocorrectionDisabled()
                .focused($isFocused)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                .fill(colors.cardDark)
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                        .stroke(
                            isFocused
                                ? AppTheme.rose
                                : colors.border,
                            lineWidth: isFocused ? 1.5 : 1
                        )
                        .animation(.easeInOut(duration: 0.2), value: isFocused)
                )
                .shadow(color: colors.cardShadowColor, radius: 4, x: 0, y: 2)
        )
    }
}

// MARK: - Toggle Row
// Icon in rose, toggle tinted rose

struct ToggleRow: View {
    let title: String
    let icon: String
    @Binding var isOn: Bool
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text(title)
                .foregroundColor(colors.textPrimary)
                .font(.system(size: 15))
            Spacer()
            Toggle("", isOn: $isOn)
                .tint(AppTheme.rose)
                .labelsHidden()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

// MARK: - Score Tag
// Capsule with color background at 0.15 opacity

struct ScoreTag: View {
    let label: String
    let value: String
    let color: Color
    var icon: String?

    var body: some View {
        HStack(spacing: 4) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 10, weight: .bold))
            }
            Text(value)
                .font(.system(size: 12, weight: .bold))
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .opacity(0.8)
        }
        .foregroundColor(color)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(color.opacity(0.15))
                .overlay(
                    Capsule()
                        .stroke(color.opacity(0.3), lineWidth: 0.5)
                )
        )
    }
}

// MARK: - Countdown Badge
// Live timer that changes color by urgency

struct CountdownBadge: View {
    let expiresAt: Date
    @State private var remaining: TimeInterval = 0
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var color: Color {
        if remaining < 4 * 3600 { return AppTheme.error }
        if remaining < 12 * 3600 { return AppTheme.warning }
        return AppTheme.success
    }

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "clock.fill")
                .font(.system(size: 10))
            Text(remaining.shortCountdown)
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
        }
        .foregroundColor(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill(color.opacity(0.15))
                .overlay(Capsule().stroke(color.opacity(0.3), lineWidth: 0.5))
        )
        .onAppear { remaining = max(0, expiresAt.timeIntervalSinceNow) }
        .onReceive(timer) { _ in
            remaining = max(0, expiresAt.timeIntervalSinceNow)
        }
    }
}

// MARK: - Profile Avatar
// Rose gradient circle with initials, online green dot

struct ProfileAvatar: View {
    let url: String?
    let name: String
    let size: CGFloat
    var isOnline: Bool = false
    var showBorder: Bool = false
    var useProfileImage: Bool = false
    @Environment(\.adaptiveColors) private var colors
    @ObservedObject private var imageStore = UserImageStore.shared

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            // Show real profile photo if available and requested, or load from URL
            if useProfileImage, let img = imageStore.profileImage {
                Image(uiImage: img)
                    .resizable()
                    .scaledToFill()
                    .frame(width: size, height: size)
                    .clipShape(Circle())
                    .overlay(borderOverlay)
            } else if let url, let imageURL = URL(string: url), url.hasPrefix("http") {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                            .frame(width: size, height: size)
                            .clipShape(Circle())
                    default:
                        initialsCircle
                    }
                }
                .overlay(borderOverlay)
            } else {
                initialsCircle
                    .overlay(borderOverlay)
            }

            if isOnline {
                Circle()
                    .fill(AppTheme.success)
                    .frame(width: size * 0.25, height: size * 0.25)
                    .overlay(Circle().stroke(colors.background, lineWidth: 2))
            }
        }
    }

    private var initialsCircle: some View {
        Circle()
            .fill(
                LinearGradient(
                    colors: [AppTheme.rose.opacity(0.7), AppTheme.roseDark.opacity(0.5)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(width: size, height: size)
            .overlay(
                Text(name.initials)
                    .font(.system(size: size * 0.35, weight: .semibold))
                    .foregroundColor(.white)
            )
    }

    @ViewBuilder
    private var borderOverlay: some View {
        if showBorder {
            Circle()
                .stroke(
                    LinearGradient(
                        colors: [AppTheme.rose, AppTheme.gold],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 2
                )
                .frame(width: size, height: size)
        }
    }
}

// MARK: - Message Bubble
// "My" messages = rose gradient, "Their" = adaptive surfaceMedium, Icebreaker label in gold

struct MessageBubble: View {
    let message: Message
    var showTimestamp: Bool = true
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack {
            if message.isFromMe { Spacer(minLength: 60) }

            VStack(alignment: message.isFromMe ? .trailing : .leading, spacing: 4) {
                // Icebreaker label
                if message.msgType == .icebreaker {
                    HStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 10))
                        Text("Icebreaker")
                            .font(.system(size: 10, weight: .semibold))
                    }
                    .foregroundColor(AppTheme.gold)
                }

                // System message styling
                if message.msgType == .system {
                    Text(message.content)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(colors.textMuted)
                        .italic()
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                } else {
                    // Regular message bubble
                    Text(message.content)
                        .font(.system(size: 15))
                        .foregroundColor(message.isFromMe ? .white : colors.textPrimary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(bubbleBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 18))
                        .overlay(
                            RoundedRectangle(cornerRadius: 18)
                                .stroke(
                                    message.isFromMe
                                        ? Color.white.opacity(0.1)
                                        : colors.border,
                                    lineWidth: 0.5
                                )
                        )
                        .shadow(
                            color: message.isFromMe
                                ? AppTheme.rose.opacity(0.15)
                                : Color.clear,
                            radius: 8,
                            x: 0,
                            y: 4
                        )
                }

                // Timestamp row
                if showTimestamp {
                    HStack(spacing: 4) {
                        Text(message.createdAt.messageTime)
                            .font(.system(size: 10))
                            .foregroundColor(colors.textMuted)

                        if message.isFromMe {
                            readReceiptIcon
                        }
                    }
                }
            }

            if !message.isFromMe { Spacer(minLength: 60) }
        }
    }

    @ViewBuilder
    private var bubbleBackground: some View {
        if message.isFromMe {
            // "My" messages: rose gradient
            AppTheme.roseGradient
        } else {
            // "Their" messages: adaptive surface
            colors.surfaceMedium
        }
    }

    @ViewBuilder
    private var readReceiptIcon: some View {
        switch message.status {
        case .sending:
            Image(systemName: "clock")
                .font(.system(size: 10))
                .foregroundColor(colors.textMuted)
        case .sent:
            Image(systemName: "checkmark")
                .font(.system(size: 10))
                .foregroundColor(colors.textMuted)
        case .delivered:
            ZStack(alignment: .leading) {
                Image(systemName: "checkmark")
                    .font(.system(size: 10))
                    .foregroundColor(colors.textMuted)
                Image(systemName: "checkmark")
                    .font(.system(size: 10))
                    .foregroundColor(colors.textMuted)
                    .offset(x: 4)
            }
            .frame(width: 18)
        case .read:
            ZStack(alignment: .leading) {
                Image(systemName: "checkmark")
                    .font(.system(size: 10))
                    .foregroundColor(AppTheme.rose)
                Image(systemName: "checkmark")
                    .font(.system(size: 10))
                    .foregroundColor(AppTheme.rose)
                    .offset(x: 4)
            }
            .frame(width: 18)
        }
    }
}

// MARK: - Empty State View

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundStyle(
                    LinearGradient(
                        colors: [AppTheme.rose.opacity(0.6), AppTheme.gold.opacity(0.4)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            Text(title)
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(colors.textPrimary)

            Text(message)
                .font(.system(size: 14))
                .foregroundColor(colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            if let actionTitle, let action {
                SmallButton(title: actionTitle, action: action)
                    .padding(.top, 8)
            }
        }
        .padding(40)
    }
}

// MARK: - Typing Indicator
// Three animated dots

struct TypingIndicator: View {
    @State private var dotScale: [CGFloat] = [1, 1, 1]
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(colors.textMuted)
                        .frame(width: 6, height: 6)
                        .scaleEffect(dotScale[i])
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(colors.surfaceMedium)
            .clipShape(RoundedRectangle(cornerRadius: 18))
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(colors.border, lineWidth: 0.5)
            )
            Spacer()
        }
        .onAppear { animate() }
    }

    private func animate() {
        for i in 0..<3 {
            withAnimation(
                .easeInOut(duration: 0.4)
                .repeatForever()
                .delay(Double(i) * 0.15)
            ) {
                dotScale[i] = 1.5
            }
        }
    }
}
