import SwiftUI

// MARK: - View Extensions

extension View {

    /// Full-screen deep indigo background gradient, ignoring safe area
    func appBackground() -> some View {
        self.background(AppTheme.backgroundGradient.ignoresSafeArea())
    }

    /// Standard content card: cardDark fill, radiusCard corners, subtle border, soft shadow
    func cardStyle() -> some View {
        self
            .background(
                RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                    .fill(AppTheme.cardDark)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                            .stroke(Color.white.opacity(0.06), lineWidth: 0.5)
                    )
                    .shadow(color: Color.black.opacity(0.25), radius: 12, x: 0, y: 6)
            )
    }

    /// Elevated content card: surfaceMedium fill, slightly more prominent shadow
    func elevatedCard() -> some View {
        self
            .background(
                RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                    .fill(AppTheme.surfaceMedium)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                            .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                    )
                    .shadow(color: Color.black.opacity(0.35), radius: 20, x: 0, y: 10)
                    .shadow(color: AppTheme.rose.opacity(0.04), radius: 30, x: 0, y: 5)
            )
    }

    /// Shimmer loading animation overlay
    func shimmer(isActive: Bool) -> some View {
        self.modifier(ShimmerModifier(isActive: isActive))
    }
}

// MARK: - Shimmer Modifier

struct ShimmerModifier: ViewModifier {
    let isActive: Bool
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                GeometryReader { geo in
                    if isActive {
                        AppTheme.shimmerGradient
                            .frame(width: geo.size.width * 2)
                            .offset(x: phase * geo.size.width * 2 - geo.size.width)
                            .mask(content)
                    }
                }
            )
            .onAppear {
                if isActive {
                    withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                        phase = 1
                    }
                }
            }
    }
}

// MARK: - Date Extensions

extension Date {
    /// Short relative time: "now", "3m", "2h", "5d", "1w"
    var timeAgoShort: String {
        let interval = Date().timeIntervalSince(self)
        if interval < 60 { return "now" }
        if interval < 3600 { return "\(Int(interval / 60))m" }
        if interval < 86400 { return "\(Int(interval / 3600))h" }
        if interval < 604800 { return "\(Int(interval / 86400))d" }
        return "\(Int(interval / 604800))w"
    }

    /// Long relative time: "Just now", "5 minutes ago", "3 hours ago"
    var timeAgoLong: String {
        let interval = Date().timeIntervalSince(self)
        if interval < 60 { return "Just now" }
        if interval < 3600 {
            let mins = Int(interval / 60)
            return "\(mins) minute\(mins == 1 ? "" : "s") ago"
        }
        if interval < 86400 {
            let hrs = Int(interval / 3600)
            return "\(hrs) hour\(hrs == 1 ? "" : "s") ago"
        }
        if interval < 604800 {
            let days = Int(interval / 86400)
            return "\(days) day\(days == 1 ? "" : "s") ago"
        }
        let weeks = Int(interval / 604800)
        return "\(weeks) week\(weeks == 1 ? "" : "s") ago"
    }

    /// Chat list timestamp: time if today, "Yesterday", or "MMM d"
    var chatTimestamp: String {
        let formatter = DateFormatter()
        let calendar = Calendar.current
        if calendar.isDateInToday(self) {
            formatter.dateFormat = "h:mm a"
        } else if calendar.isDateInYesterday(self) {
            return "Yesterday"
        } else {
            formatter.dateFormat = "MMM d"
        }
        return formatter.string(from: self)
    }

    /// Message time in "h:mm a" format
    var messageTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: self)
    }

    /// Create a Date representing a given age in years from now
    static func fromAge(_ age: Int) -> Date {
        Calendar.current.date(byAdding: .year, value: -age, to: Date()) ?? Date()
    }
}

// MARK: - String Extensions

extension String {
    /// First letters of each word, uppercased, max 2 characters
    var initials: String {
        let components = self.split(separator: " ")
        let initials = components.compactMap { $0.first }.prefix(2)
        return String(initials).uppercased()
    }
}

// MARK: - TimeInterval Extensions

extension TimeInterval {
    /// Full countdown: "2h 15m" or "8m 30s"
    var countdownString: String {
        let totalSeconds = Int(self)
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        let seconds = totalSeconds % 60
        if hours > 0 {
            return String(format: "%dh %dm", hours, minutes)
        }
        return String(format: "%dm %ds", minutes, seconds)
    }

    /// Short countdown: "2h 15m" or "8m"
    var shortCountdown: String {
        let totalSeconds = Int(self)
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }
        return "\(minutes)m"
    }
}
