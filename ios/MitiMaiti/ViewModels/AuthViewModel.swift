import SwiftUI
import Combine

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var hasCompletedOnboarding = false
    @Published var phone = ""
    @Published var otpCode = ""
    @Published var isLoading = false
    @Published var error: String?
    @Published var otpSent = false
    @Published var resendCooldown = 0
    @Published var resendCount = 0

    private let api = APIService.shared
    private var timer: Timer?

    func sendOTP() {
        guard phone.count >= 10 else {
            error = "Please enter a valid phone number"
            return
        }
        isLoading = true
        error = nil

        Task {
            do {
                let success = try await api.sendOTP(phone: phone)
                isLoading = false
                if success {
                    otpSent = true
                    resendCount += 1
                    startResendTimer()
                }
            } catch {
                isLoading = false
                self.error = error.localizedDescription
            }
        }
    }

    func verifyOTP() {
        guard otpCode.count == 6 else {
            error = "Please enter the 6-digit code"
            return
        }
        isLoading = true
        error = nil

        Task {
            do {
                let result = try await api.verifyOTP(phone: phone, code: otpCode)
                isLoading = false
                if result.isNew {
                    hasCompletedOnboarding = false
                } else {
                    hasCompletedOnboarding = true
                }
                isAuthenticated = true
            } catch {
                isLoading = false
                self.error = error.localizedDescription
            }
        }
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
    }

    func logout() {
        isAuthenticated = false
        hasCompletedOnboarding = false
        phone = ""
        otpCode = ""
        otpSent = false
        Task {
            await api.clearTokens()
        }
    }

    private func startResendTimer() {
        resendCooldown = 30
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] t in
            Task { @MainActor in
                guard let self else { t.invalidate(); return }
                if self.resendCooldown > 0 {
                    self.resendCooldown -= 1
                } else {
                    t.invalidate()
                }
            }
        }
    }
}
