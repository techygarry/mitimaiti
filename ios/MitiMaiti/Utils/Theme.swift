import SwiftUI

struct AppTheme {
    // MARK: - Primary Colors
    static let rose = Color(hex: "B5336A")
    static let roseDark = Color(hex: "8A1A4A")
    static let roseLight = Color(hex: "E8A0BE")
    static let gold = Color(hex: "D4A853")
    static let goldLight = Color(hex: "F0DEB0")
    static let saffron = Color(hex: "ED9C16")

    // MARK: - Backgrounds (Deep Indigo, NOT pure black)
    static let background = Color(hex: "0D0D2B")
    static let surfaceDark = Color(hex: "161633")
    static let surfaceMedium = Color(hex: "1C1C40")
    static let cardDark = Color(hex: "1E1E45")

    // MARK: - Text
    static let textPrimary = Color.white
    static let textSecondary = Color(hex: "A0A0B8")
    static let textMuted = Color(hex: "6A6A85")

    // MARK: - Status
    static let success = Color(hex: "4CAF50")
    static let warning = Color(hex: "FFA726")
    static let error = Color(hex: "EF4444")
    static let info = Color(hex: "42A5F5")

    // MARK: - Score Colors
    static let scoreGold = Color(hex: "FFD700")
    static let scoreGreen = Color(hex: "4CAF50")
    static let scoreOrange = Color(hex: "FF9800")

    // MARK: - Gradients
    static let roseGradient = LinearGradient(
        colors: [rose, roseDark],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let goldGradient = LinearGradient(
        colors: [gold, Color(hex: "C4944A")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let saffronGradient = LinearGradient(
        colors: [saffron, Color(hex: "D4850E")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let backgroundGradient = LinearGradient(
        colors: [background, surfaceDark, Color(hex: "0A0A22")],
        startPoint: .top,
        endPoint: .bottom
    )

    static let shimmerGradient = LinearGradient(
        colors: [
            Color.white.opacity(0.0),
            Color.white.opacity(0.08),
            Color.white.opacity(0.0)
        ],
        startPoint: .leading,
        endPoint: .trailing
    )

    // MARK: - Spacing
    static let spacingXS: CGFloat = 4
    static let spacingSM: CGFloat = 8
    static let spacingMD: CGFloat = 16
    static let spacingLG: CGFloat = 24
    static let spacingXL: CGFloat = 32
    static let spacingXXL: CGFloat = 48

    // MARK: - Radius
    static let radiusSM: CGFloat = 8
    static let radiusMD: CGFloat = 12
    static let radiusLG: CGFloat = 16
    static let radiusXL: CGFloat = 24
    static let radiusCard: CGFloat = 20
    static let radiusFull: CGFloat = 100
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
