import SwiftUI

// MARK: - Content Card Container
// Clean solid card for content — NO glass effect. Glass is reserved for navigation only.

struct ContentCard<Content: View>: View {
    enum Style {
        case `default`
        case elevated
        case flat
    }

    let style: Style
    let content: Content
    @Environment(\.adaptiveColors) private var colors

    init(style: Style = .default, @ViewBuilder content: () -> Content) {
        self.style = style
        self.content = content()
    }

    var body: some View {
        content
            .background(
                RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                    .fill(colors.cardDark)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                            .stroke(borderColor, lineWidth: borderWidth)
                    )
            )
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusCard))
            .shadow(color: shadowColor, radius: shadowRadius, x: 0, y: shadowY)
    }

    private var borderColor: Color {
        switch style {
        case .default: colors.border
        case .elevated: colors.border.opacity(0.8)
        case .flat: Color.clear
        }
    }

    private var borderWidth: CGFloat {
        style == .flat ? 0 : 0.5
    }

    private var shadowColor: Color {
        switch style {
        case .default: colors.cardShadowColor
        case .elevated: colors.cardShadowColor.opacity(1.5)
        case .flat: Color.clear
        }
    }

    private var shadowRadius: CGFloat {
        switch style {
        case .default: 12
        case .elevated: 20
        case .flat: 0
        }
    }

    private var shadowY: CGFloat {
        switch style {
        case .default: 6
        case .elevated: 10
        case .flat: 0
        }
    }
}

// MARK: - Shared Button Content
// Extracts the repeated icon/text/loading HStack pattern used by all buttons.

private struct ButtonContent: View {
    let title: String
    let icon: String?
    let isLoading: Bool
    let tint: Color
    let fontSize: CGFloat
    let spacing: CGFloat

    init(
        title: String,
        icon: String?,
        isLoading: Bool,
        tint: Color = .white,
        fontSize: CGFloat = 16,
        spacing: CGFloat = 8
    ) {
        self.title = title
        self.icon = icon
        self.isLoading = isLoading
        self.tint = tint
        self.fontSize = fontSize
        self.spacing = spacing
    }

    var body: some View {
        HStack(spacing: spacing) {
            if isLoading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: tint))
                    .scaleEffect(0.8)
            } else {
                if let icon {
                    Image(systemName: icon)
                        .font(.system(size: fontSize, weight: .semibold))
                }
                Text(title)
                    .font(.system(size: fontSize, weight: .semibold))
            }
        }
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
            ButtonContent(title: title, icon: icon, isLoading: isLoading)
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
            ButtonContent(title: title, icon: icon, isLoading: isLoading, tint: AppTheme.rose)
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
            ButtonContent(title: title, icon: icon, isLoading: isLoading)
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
            ButtonContent(title: title, icon: icon, isLoading: false, fontSize: 14, spacing: 6)
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
    @Environment(\.colorScheme) private var colorScheme
    @State private var appeared = false

    private var bubbleShape: RoundedRectangle {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
    }

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
                        .padding(.horizontal, 16)
                        .padding(.vertical, 11)
                        .background(bubbleBackground)
                        .clipShape(bubbleShape)
                        .overlay(
                            bubbleShape
                                .stroke(
                                    message.isFromMe
                                        ? Color.white.opacity(0.1)
                                        : colors.border,
                                    lineWidth: 0.5
                                )
                        )
                        .shadow(
                            color: message.isFromMe
                                ? AppTheme.rose.opacity(0.18)
                                : colors.cardShadowColor.opacity(0.5),
                            radius: message.isFromMe ? 10 : 6,
                            x: 0,
                            y: message.isFromMe ? 4 : 3
                        )
                }

                // Timestamp + read receipt row
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
        // Entrance animation
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 8)
        .scaleEffect(appeared ? 1 : 0.97)
        .onAppear {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                appeared = true
            }
        }
    }

    @ViewBuilder
    private var bubbleBackground: some View {
        if message.isFromMe {
            AppTheme.roseGradient
        } else {
            colors.surfaceMedium
        }
    }

    /// Read receipt color for the "read" state adapts to color scheme
    private var readColor: Color {
        colorScheme == .dark ? .white : Color(hex: "3478F6")
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
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(colors.textMuted)
        case .delivered:
            ZStack(alignment: .leading) {
                Image(systemName: "checkmark")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(colors.textMuted)
                Image(systemName: "checkmark")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(colors.textMuted)
                    .offset(x: 5)
            }
            .frame(width: 19)
        case .read:
            ZStack(alignment: .leading) {
                Image(systemName: "checkmark")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(readColor)
                Image(systemName: "checkmark")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(readColor)
                    .offset(x: 5)
            }
            .frame(width: 19)
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
    var illustration: Image?
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        VStack(spacing: 16) {
            if let illustration {
                illustration
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: 200, maxHeight: 160)
                    .padding(.bottom, 4)
            }

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

// MARK: - Verified Badge
// Blue checkmark.seal.fill badge for verified profiles and entities

struct VerifiedBadge: View {
    var size: CGFloat = 16

    var body: some View {
        Image(systemName: "checkmark.seal.fill")
            .font(.system(size: size))
            .foregroundStyle(
                LinearGradient(
                    colors: [Color.blue, Color.blue.opacity(0.8)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .accessibilityLabel("Verified")
    }
}

// MARK: - Progress Ring
// Circular progress indicator (e.g. profile completeness)

struct ProgressRing: View {
    let progress: Double
    var size: CGFloat = 60
    var lineWidth: CGFloat = 6
    var color: Color = AppTheme.rose

    var body: some View {
        ZStack {
            // Background track
            Circle()
                .stroke(color.opacity(0.15), lineWidth: lineWidth)

            // Filled arc
            Circle()
                .trim(from: 0, to: clampedProgress)
                .stroke(
                    AngularGradient(
                        colors: [color, color.opacity(0.7), color],
                        center: .center,
                        startAngle: .degrees(0),
                        endAngle: .degrees(360)
                    ),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.5), value: clampedProgress)

            // Percentage label
            Text("\(Int(clampedProgress * 100))%")
                .font(.system(size: size * 0.25, weight: .bold, design: .rounded))
                .foregroundColor(color)
        }
        .frame(width: size, height: size)
    }

    private var clampedProgress: Double {
        min(max(progress, 0), 1)
    }
}

// MARK: - Loading Overlay
// Centered shimmer overlay that can be placed on any view

struct LoadingOverlay: View {
    @State private var shimmerOffset: CGFloat = -1

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.3)

                Text("Loading...")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
            }
            .padding(32)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        shimmerLayer
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusMD))
                    )
            )
        }
        .onAppear {
            withAnimation(
                .linear(duration: 1.5)
                .repeatForever(autoreverses: false)
            ) {
                shimmerOffset = 2
            }
        }
    }

    private var shimmerLayer: some View {
        GeometryReader { geo in
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0),
                            Color.white.opacity(0.08),
                            Color.white.opacity(0),
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(width: geo.size.width * 0.6)
                .offset(x: geo.size.width * shimmerOffset)
        }
    }
}

// MARK: - Stat Row
// Horizontal row of icon + value stats (e.g. "Views: 234 | Likes: 56")

struct StatRow: View {
    struct Item: Identifiable {
        let id = UUID()
        let icon: String
        let label: String
        let value: String
    }

    let items: [Item]
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                if index > 0 {
                    divider
                }
                statItem(item)
            }
        }
    }

    private func statItem(_ item: Item) -> some View {
        HStack(spacing: 4) {
            Image(systemName: item.icon)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(AppTheme.rose)
            Text(item.value)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(colors.textPrimary)
            Text(item.label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(colors.textMuted)
        }
        .frame(maxWidth: .infinity)
    }

    private var divider: some View {
        Rectangle()
            .fill(colors.border)
            .frame(width: 0.5, height: 20)
    }
}

// MARK: - Typing Indicator
// Three animated dots

struct TypingIndicator: View {
    @State private var dotOpacity: [Double] = [0.4, 0.4, 0.4]
    @State private var dotScale: [CGFloat] = [1, 1, 1]
    @Environment(\.adaptiveColors) private var colors

    var body: some View {
        HStack {
            HStack(spacing: 5) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(colors.textMuted)
                        .frame(width: 7, height: 7)
                        .scaleEffect(dotScale[i])
                        .opacity(dotOpacity[i])
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                BubbleTailShape(isFromMe: false)
                    .fill(colors.surfaceMedium)
            )
            .overlay(
                BubbleTailShape(isFromMe: false)
                    .stroke(colors.border, lineWidth: 0.5)
            )
            Spacer()
        }
        .onAppear { animate() }
    }

    private func animate() {
        for i in 0..<3 {
            withAnimation(
                .easeInOut(duration: 1.0)
                .repeatForever(autoreverses: true)
                .delay(Double(i) * 0.2)
            ) {
                dotScale[i] = 1.4
                dotOpacity[i] = 1.0
            }
        }
    }
}

/// A rounded-rect shape with a small tail on the left or right
private struct BubbleTailShape: Shape {
    let isFromMe: Bool

    func path(in rect: CGRect) -> Path {
        let radius: CGFloat = 18
        return RoundedRectangle(cornerRadius: radius, style: .continuous)
            .path(in: rect)
    }
}
