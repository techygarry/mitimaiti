import SwiftUI

// MARK: - Adaptive Colors
// Provides colors that switch based on the current color scheme.

struct AdaptiveColors {
    let colorScheme: ColorScheme

    var isDark: Bool { colorScheme == .dark }

    // Backgrounds
    var background: Color { isDark ? Color(hex: "0D0D2B") : Color(hex: "FFF8F0") }
    var surfaceDark: Color { isDark ? Color(hex: "161633") : Color(hex: "F5F0EB") }
    var surfaceMedium: Color { isDark ? Color(hex: "1C1C40") : Color(hex: "EDE7E1") }
    var cardDark: Color { isDark ? Color(hex: "1E1E45") : Color.white }

    // Text
    var textPrimary: Color { isDark ? Color.white : Color(hex: "3D2B33") }
    var textSecondary: Color { isDark ? Color(hex: "A0A0B8") : Color(hex: "7A6670") }
    var textMuted: Color { isDark ? Color(hex: "6A6A85") : Color(hex: "A89BA0") }

    // Borders & overlays
    var border: Color { isDark ? Color.white.opacity(0.06) : Color(hex: "E8E0E4") }
    var borderSubtle: Color { isDark ? Color.white.opacity(0.08) : Color(hex: "E8E0E4").opacity(0.7) }

    // Shadows
    var cardShadowColor: Color { isDark ? Color.black.opacity(0.25) : Color.black.opacity(0.06) }
    var elevatedShadowColor: Color { isDark ? Color.black.opacity(0.35) : Color.black.opacity(0.08) }

    // Gradients
    var backgroundGradient: LinearGradient {
        if isDark {
            return LinearGradient(
                colors: [Color(hex: "0D0D2B"), Color(hex: "161633"), Color(hex: "0A0A22")],
                startPoint: .top,
                endPoint: .bottom
            )
        } else {
            return LinearGradient(
                colors: [Color(hex: "FFF8F0"), Color(hex: "FFF5EA"), Color(hex: "FFF8F0")],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }

    var shimmerGradient: LinearGradient {
        if isDark {
            return LinearGradient(
                colors: [
                    Color.white.opacity(0.0),
                    Color.white.opacity(0.08),
                    Color.white.opacity(0.0)
                ],
                startPoint: .leading,
                endPoint: .trailing
            )
        } else {
            return LinearGradient(
                colors: [
                    Color.black.opacity(0.0),
                    Color.black.opacity(0.04),
                    Color.black.opacity(0.0)
                ],
                startPoint: .leading,
                endPoint: .trailing
            )
        }
    }
}

// MARK: - Environment Key for AdaptiveColors

private struct AdaptiveColorsKey: EnvironmentKey {
    static let defaultValue = AdaptiveColors(colorScheme: .dark)
}

extension EnvironmentValues {
    var adaptiveColors: AdaptiveColors {
        get { self[AdaptiveColorsKey.self] }
        set { self[AdaptiveColorsKey.self] = newValue }
    }
}

// MARK: - View modifier to inject adaptive colors from the environment colorScheme

struct AdaptiveColorsModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content
            .environment(\.adaptiveColors, AdaptiveColors(colorScheme: colorScheme))
    }
}

extension View {
    func withAdaptiveColors() -> some View {
        self.modifier(AdaptiveColorsModifier())
    }
}

struct AppTheme {
    // MARK: - Primary Colors (same in both modes)
    static let rose = Color(hex: "B5336A")
    static let roseDark = Color(hex: "8A1A4A")
    static let roseLight = Color(hex: "E8A0BE")
    static let gold = Color(hex: "D4A853")
    static let goldLight = Color(hex: "F0DEB0")
    static let saffron = Color(hex: "ED9C16")

    // MARK: - Dark-mode Backgrounds (legacy static references)
    static let background = Color(hex: "0D0D2B")
    static let surfaceDark = Color(hex: "161633")
    static let surfaceMedium = Color(hex: "1C1C40")
    static let cardDark = Color(hex: "1E1E45")

    // MARK: - Dark-mode Text (legacy static references)
    static let textPrimary = Color.white
    static let textSecondary = Color(hex: "A0A0B8")
    static let textMuted = Color(hex: "6A6A85")

    // MARK: - Status (same in both modes)
    static let success = Color(hex: "4CAF50")
    static let warning = Color(hex: "FFA726")
    static let error = Color(hex: "EF4444")
    static let info = Color(hex: "42A5F5")

    // MARK: - Score Colors (same in both modes)
    static let scoreGold = Color(hex: "FFD700")
    static let scoreGreen = Color(hex: "4CAF50")
    static let scoreOrange = Color(hex: "FF9800")

    // MARK: - Gradients (same in both modes)
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

    // Legacy dark-only gradients (kept for compatibility)
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

    // MARK: - Button Sizes
    static let buttonHeightPrimary: CGFloat = 52
    static let buttonHeightSecondary: CGFloat = 44
    static let iconButtonSize: CGFloat = 40

    // MARK: - Animation Constants
    enum Animation {
        static let standardDuration: Double = 0.3
        static let springResponse: Double = 0.5
        static let springDamping: Double = 0.7
        static let cardSwipeDuration: Double = 0.4

        static var standard: SwiftUI.Animation {
            .easeInOut(duration: standardDuration)
        }

        static var spring: SwiftUI.Animation {
            .spring(response: springResponse, dampingFraction: springDamping)
        }

        static var cardSwipe: SwiftUI.Animation {
            .easeOut(duration: cardSwipeDuration)
        }
    }

    // MARK: - Shadow Presets
    enum Shadow {
        case card
        case button
        case subtle

        var radius: CGFloat {
            switch self {
            case .card: return 12
            case .button: return 8
            case .subtle: return 4
            }
        }

        var x: CGFloat { 0 }

        var y: CGFloat {
            switch self {
            case .card: return 6
            case .button: return 4
            case .subtle: return 2
            }
        }
    }
}

// MARK: - Adaptive Shadow Colors

extension AdaptiveColors {
    func shadowColor(for preset: AppTheme.Shadow) -> Color {
        switch preset {
        case .card:
            return cardShadowColor
        case .button:
            return isDark ? Color.black.opacity(0.30) : Color.black.opacity(0.10)
        case .subtle:
            return isDark ? Color.black.opacity(0.15) : Color.black.opacity(0.04)
        }
    }
}

// MARK: - Shadow View Modifier

struct ShadowPresetModifier: ViewModifier {
    let preset: AppTheme.Shadow
    @Environment(\.adaptiveColors) private var colors

    func body(content: Content) -> some View {
        content.shadow(
            color: colors.shadowColor(for: preset),
            radius: preset.radius,
            x: preset.x,
            y: preset.y
        )
    }
}

extension View {
    func shadowPreset(_ preset: AppTheme.Shadow) -> some View {
        self.modifier(ShadowPresetModifier(preset: preset))
    }
}

// MARK: - Typography

enum Typography {
    case heroTitle
    case title
    case subtitle
    case body
    case bodySmall
    case caption
    case label

    var font: Font {
        switch self {
        case .heroTitle:  return .system(size: 34, weight: .bold, design: .rounded)
        case .title:      return .system(size: 24, weight: .bold, design: .rounded)
        case .subtitle:   return .system(size: 18, weight: .semibold, design: .rounded)
        case .body:       return .system(size: 16, weight: .regular)
        case .bodySmall:  return .system(size: 14, weight: .regular)
        case .caption:    return .system(size: 12, weight: .medium)
        case .label:      return .system(size: 13, weight: .semibold)
        }
    }

    var lineSpacing: CGFloat {
        switch self {
        case .heroTitle:  return 4
        case .title:      return 2
        case .subtitle:   return 2
        case .body:       return 4
        case .bodySmall:  return 3
        case .caption:    return 2
        case .label:      return 0
        }
    }
}

struct TypographyModifier: ViewModifier {
    let style: Typography

    func body(content: Content) -> some View {
        content
            .font(style.font)
            .lineSpacing(style.lineSpacing)
    }
}

extension View {
    func typography(_ style: Typography) -> some View {
        self.modifier(TypographyModifier(style: style))
    }
}

// MARK: - Adaptive Status & Score Colors

extension AdaptiveColors {
    var success: Color { isDark ? Color(hex: "4CAF50") : Color(hex: "388E3C") }
    var warning: Color { isDark ? Color(hex: "FFA726") : Color(hex: "F57C00") }
    var error: Color { isDark ? Color(hex: "EF4444") : Color(hex: "D32F2F") }
    var info: Color { isDark ? Color(hex: "42A5F5") : Color(hex: "1976D2") }

    var scoreGold: Color { isDark ? Color(hex: "FFD700") : Color(hex: "F9A825") }
    var scoreGreen: Color { isDark ? Color(hex: "4CAF50") : Color(hex: "388E3C") }
    var scoreOrange: Color { isDark ? Color(hex: "FF9800") : Color(hex: "EF6C00") }
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
