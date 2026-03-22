import SwiftUI

struct GlassCard<Content: View>: View {
    let cornerRadius: CGFloat
    let content: Content

    init(cornerRadius: CGFloat = AppTheme.glassCornerRadius, @ViewBuilder content: () -> Content) {
        self.cornerRadius = cornerRadius
        self.content = content()
    }

    var body: some View {
        content
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .fill(.ultraThinMaterial)
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.12),
                                    Color.white.opacity(0.04)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.35),
                                    Color.white.opacity(0.1),
                                    Color.white.opacity(0.05)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 0.5
                        )
                }
            )
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .shadow(color: Color.black.opacity(0.25), radius: 20, x: 0, y: 10)
    }
}

// MARK: - Glass Button
struct GlassButton: View {
    let title: String
    let icon: String?
    let style: Style
    let isLoading: Bool
    let action: () -> Void

    enum Style {
        case primary, secondary, danger, small
    }

    init(_ title: String, icon: String? = nil, style: Style = .primary, isLoading: Bool = false, action: @escaping () -> Void) {
        self.title = title
        self.icon = icon
        self.style = style
        self.isLoading = isLoading
        self.action = action
    }

    var body: some View {
        Button(action: {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
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
                            .font(.system(size: style == .small ? 14 : 16, weight: .semibold))
                    }
                    Text(title)
                        .font(.system(size: style == .small ? 14 : 16, weight: .semibold))
                }
            }
            .foregroundColor(.white)
            .frame(maxWidth: style == .small ? nil : .infinity)
            .padding(.horizontal, style == .small ? 20 : 24)
            .padding(.vertical, style == .small ? 10 : 16)
            .background(
                Group {
                    switch style {
                    case .primary:
                        AppTheme.roseGradient
                    case .secondary:
                        LinearGradient(colors: [Color.white.opacity(0.15), Color.white.opacity(0.05)], startPoint: .top, endPoint: .bottom)
                    case .danger:
                        LinearGradient(colors: [AppTheme.error, AppTheme.error.opacity(0.8)], startPoint: .top, endPoint: .bottom)
                    case .small:
                        AppTheme.roseGradient
                    }
                }
            )
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(Color.white.opacity(style == .secondary ? 0.2 : 0.1), lineWidth: 0.5)
            )
            .shadow(color: style == .primary ? AppTheme.rose.opacity(0.4) : Color.clear, radius: 12, x: 0, y: 6)
        }
        .disabled(isLoading)
    }
}

// MARK: - Glass Text Field
struct GlassTextField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String?
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        HStack(spacing: 12) {
            if let icon {
                Image(systemName: icon)
                    .foregroundColor(AppTheme.textMuted)
                    .frame(width: 20)
            }
            TextField(placeholder, text: $text)
                .foregroundColor(.white)
                .keyboardType(keyboardType)
                .autocorrectionDisabled()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                        .fill(Color.white.opacity(0.06))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.radiusMD)
                        .stroke(Color.white.opacity(0.12), lineWidth: 0.5)
                )
        )
    }
}

// MARK: - Glass Toggle Row
struct GlassToggleRow: View {
    let title: String
    let icon: String
    @Binding var isOn: Bool

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(AppTheme.rose)
                .frame(width: 24)
            Text(title)
                .foregroundColor(.white)
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
struct ScoreTagView: View {
    let label: String
    let value: String
    let color: Color
    let icon: String?

    init(label: String, value: String, color: Color, icon: String? = nil) {
        self.label = label
        self.value = value
        self.color = color
        self.icon = icon
    }

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

// MARK: - Countdown Timer Badge
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
struct ProfileAvatar: View {
    let url: String?
    let name: String
    let size: CGFloat
    var isOnline: Bool = false
    var showBorder: Bool = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [AppTheme.rose.opacity(0.6), AppTheme.roseDark.opacity(0.4)],
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
                .overlay(
                    showBorder ?
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [AppTheme.rose, AppTheme.gold],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 2
                        )
                    : nil
                )

            if isOnline {
                Circle()
                    .fill(AppTheme.success)
                    .frame(width: size * 0.25, height: size * 0.25)
                    .overlay(Circle().stroke(AppTheme.background, lineWidth: 2))
            }
        }
    }
}

// MARK: - Message Bubble
struct MessageBubbleView: View {
    let message: Message
    let showTimestamp: Bool

    init(_ message: Message, showTimestamp: Bool = true) {
        self.message = message
        self.showTimestamp = showTimestamp
    }

    var body: some View {
        HStack {
            if message.isFromMe { Spacer(minLength: 60) }

            VStack(alignment: message.isFromMe ? .trailing : .leading, spacing: 4) {
                if message.msgType == .icebreaker {
                    HStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 10))
                        Text("Icebreaker")
                            .font(.system(size: 10, weight: .semibold))
                    }
                    .foregroundColor(AppTheme.gold)
                }

                Text(message.content)
                    .font(.system(size: 15))
                    .foregroundColor(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(
                        message.isFromMe
                        ? AnyShapeStyle(AppTheme.roseGradient)
                        : AnyShapeStyle(Color.white.opacity(0.1))
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 18))
                    .overlay(
                        RoundedRectangle(cornerRadius: 18)
                            .stroke(
                                message.isFromMe
                                ? Color.clear
                                : Color.white.opacity(0.1),
                                lineWidth: 0.5
                            )
                    )

                if showTimestamp {
                    HStack(spacing: 4) {
                        Text(message.createdAt.messageTime)
                            .font(.system(size: 10))
                            .foregroundColor(AppTheme.textMuted)

                        if message.isFromMe {
                            Image(systemName: statusIcon)
                                .font(.system(size: 10))
                                .foregroundColor(statusColor)
                        }
                    }
                }
            }

            if !message.isFromMe { Spacer(minLength: 60) }
        }
    }

    var statusIcon: String {
        switch message.status {
        case .sending: return "clock"
        case .sent: return "checkmark"
        case .delivered: return "checkmark"
        case .read: return "checkmark.circle.fill"
        }
    }

    var statusColor: Color {
        message.status == .read ? AppTheme.info : AppTheme.textMuted
    }
}

// MARK: - Empty State
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(AppTheme.textMuted)

            Text(title)
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(.white)

            Text(message)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            if let actionTitle, let action {
                GlassButton(actionTitle, style: .small, action: action)
                    .padding(.top, 8)
            }
        }
        .padding(40)
    }
}

// MARK: - Typing Indicator
struct TypingIndicator: View {
    @State private var dotScale: [CGFloat] = [1, 1, 1]

    var body: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(AppTheme.textMuted)
                        .frame(width: 6, height: 6)
                        .scaleEffect(dotScale[i])
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(Color.white.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 18))
            Spacer()
        }
        .onAppear { animate() }
    }

    private func animate() {
        for i in 0..<3 {
            withAnimation(.easeInOut(duration: 0.4).repeatForever().delay(Double(i) * 0.15)) {
                dotScale[i] = 1.5
            }
        }
    }
}
