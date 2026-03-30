import SwiftUI

enum ToastType {
    case success, error, info, warning

    var icon: String {
        switch self {
        case .success: return "checkmark.circle.fill"
        case .error: return "xmark.circle.fill"
        case .info: return "info.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        }
    }

    var color: Color {
        switch self {
        case .success: return AppTheme.success
        case .error: return AppTheme.error
        case .info: return AppTheme.info
        case .warning: return AppTheme.warning
        }
    }
}

struct ToastMessage: Identifiable, Equatable {
    let id = UUID()
    let type: ToastType
    let message: String
    var duration: Double = 3.0

    static func == (lhs: ToastMessage, rhs: ToastMessage) -> Bool {
        lhs.id == rhs.id
    }
}

@MainActor
class ToastManager: ObservableObject {
    static let shared = ToastManager()
    @Published var currentToast: ToastMessage?

    func show(_ message: String, type: ToastType = .info, duration: Double = 3.0) {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            currentToast = ToastMessage(type: type, message: message, duration: duration)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
            withAnimation(.easeOut(duration: 0.25)) {
                if self.currentToast?.message == message {
                    self.currentToast = nil
                }
            }
        }
    }
}

struct ToastOverlay: View {
    @ObservedObject var toastManager = ToastManager.shared

    var body: some View {
        VStack {
            if let toast = toastManager.currentToast {
                HStack(spacing: 10) {
                    Image(systemName: toast.type.icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(toast.type.color)

                    Text(toast.message)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white)
                        .lineLimit(2)

                    Spacer()

                    Button {
                        withAnimation { toastManager.currentToast = nil }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color(hex: "2D2426"))
                        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
                )
                .padding(.horizontal, 16)
                .transition(.move(edge: .top).combined(with: .opacity))
            }
            Spacer()
        }
        .padding(.top, 8)
        .animation(.spring(response: 0.3, dampingFraction: 0.8), value: toastManager.currentToast)
    }
}
