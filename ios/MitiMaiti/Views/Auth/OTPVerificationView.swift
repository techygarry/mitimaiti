import SwiftUI

struct OTPVerificationView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @FocusState private var focusedField: Int?
    @State private var digits: [String] = Array(repeating: "", count: 6)

    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer().frame(height: 20)

                // Header
                VStack(spacing: 12) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(AppTheme.roseGradient)

                    Text("Verify your number")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)

                    Text("Enter the 6-digit code sent to\n\(authVM.phone)")
                        .font(.system(size: 14))
                        .foregroundColor(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
                }

                // OTP Fields
                HStack(spacing: 10) {
                    ForEach(0..<6, id: \.self) { index in
                        TextField("", text: $digits[index])
                            .font(.system(size: 24, weight: .bold, design: .monospaced))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .keyboardType(.numberPad)
                            .frame(width: 48, height: 56)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(.ultraThinMaterial)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(Color.white.opacity(0.06))
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(
                                                focusedField == index ? AppTheme.rose : Color.white.opacity(0.15),
                                                lineWidth: focusedField == index ? 1.5 : 0.5
                                            )
                                    )
                            )
                            .focused($focusedField, equals: index)
                            .onChange(of: digits[index]) { _, newValue in
                                handleDigitChange(index: index, value: newValue)
                            }
                    }
                }
                .padding(.horizontal)

                // Hint
                Text("Demo code: 123456")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(AppTheme.gold)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(AppTheme.gold.opacity(0.1))
                    .clipShape(Capsule())

                // Error
                if let error = authVM.error {
                    Text(error)
                        .font(.system(size: 13))
                        .foregroundColor(AppTheme.error)
                }

                // Verify Button
                GlassButton("Verify", icon: "checkmark.circle.fill", isLoading: authVM.isLoading) {
                    authVM.otpCode = digits.joined()
                    authVM.verifyOTP()
                }
                .padding(.horizontal)

                // Resend
                VStack(spacing: 8) {
                    if authVM.resendCooldown > 0 {
                        Text("Resend code in \(authVM.resendCooldown)s")
                            .font(.system(size: 14))
                            .foregroundColor(AppTheme.textMuted)
                    } else {
                        Button("Resend Code") {
                            authVM.sendOTP()
                            digits = Array(repeating: "", count: 6)
                        }
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(AppTheme.rose)
                        .disabled(authVM.resendCount >= 3)
                    }

                    if authVM.resendCount >= 3 {
                        Text("Max resend attempts reached")
                            .font(.system(size: 12))
                            .foregroundColor(AppTheme.error)
                    }
                }

                Spacer()

                Button("Need help? Contact Support") {}
                    .font(.system(size: 13))
                    .foregroundColor(AppTheme.textMuted)
                    .padding(.bottom, 16)
            }
        }
        .navigationBarBackButtonHidden(false)
        .onAppear { focusedField = 0 }
    }

    private func handleDigitChange(index: Int, value: String) {
        // Only allow single digit
        if value.count > 1 {
            let lastChar = String(value.last!)
            digits[index] = lastChar
        }

        // Auto-advance
        if !value.isEmpty && index < 5 {
            focusedField = index + 1
        }

        // Auto-submit when all filled
        if digits.allSatisfy({ !$0.isEmpty }) {
            authVM.otpCode = digits.joined()
            authVM.verifyOTP()
        }
    }
}
