import SwiftUI

struct OTPVerificationView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @Environment(\.dismiss) var dismiss

    @FocusState private var focusedField: OTPField?
    @State private var digits: [String] = Array(repeating: "", count: 6)
    @State private var shakeOffset: CGFloat = 0
    @State private var animateIn = false

    // MARK: - Focus Enum

    enum OTPField: Int, CaseIterable {
        case d0, d1, d2, d3, d4, d5
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            // Ambient accent glow
            Circle()
                .fill(AppTheme.gold.opacity(0.05))
                .frame(width: 250, height: 250)
                .blur(radius: 60)
                .offset(x: 80, y: -250)

            VStack(spacing: 28) {
                Spacer().frame(height: 20)
                headerSection
                otpFieldsRow
                demoHint
                errorView
                verifyButton
                resendSection
                Spacer()
            }
        }
        .appBackground()
        .navigationBarBackButtonHidden(true)
        .toolbar { backButton }
        .onAppear {
            focusedField = .d0
            withAnimation(.easeOut(duration: 0.5)) {
                animateIn = true
            }
        }
        .onChange(of: authVM.error) { _, newError in
            if newError != nil {
                triggerShake()
            }
        }
    }

    // MARK: - Back Button

    private var backButton: some ToolbarContent {
        ToolbarItem(placement: .navigationBarLeading) {
            Button {
                authVM.otpSent = false
                dismiss()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(AppTheme.textPrimary)
                    .frame(width: 36, height: 36)
                    .background(AppTheme.surfaceMedium)
                    .clipShape(Circle())
            }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(AppTheme.gold.opacity(0.12))
                    .frame(width: 80, height: 80)

                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(AppTheme.goldGradient)
                    .shadow(color: AppTheme.gold.opacity(0.4), radius: 10)
            }
            .opacity(animateIn ? 1 : 0)
            .scaleEffect(animateIn ? 1 : 0.7)
            .animation(.spring(response: 0.6, dampingFraction: 0.7), value: animateIn)

            Text("Verify your number")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(AppTheme.textPrimary)

            Text("Enter the 6-digit code sent to")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)

            Text(maskedPhone)
                .font(.system(size: 15, weight: .semibold, design: .monospaced))
                .foregroundColor(AppTheme.gold)
        }
    }

    // MARK: - OTP Fields

    private var otpFieldsRow: some View {
        HStack(spacing: 10) {
            ForEach(OTPField.allCases, id: \.rawValue) { field in
                otpDigitBox(field: field)
            }
        }
        .padding(.horizontal, AppTheme.spacingMD)
        .offset(x: shakeOffset)
    }

    private func otpDigitBox(field: OTPField) -> some View {
        let index = field.rawValue
        let isFocused = focusedField == field
        let hasValue = !digits[index].isEmpty

        let borderColor: Color = {
            if isFocused { return AppTheme.rose }
            if hasValue { return AppTheme.rose.opacity(0.4) }
            return Color.white.opacity(0.08)
        }()

        let borderWidth: CGFloat = isFocused ? 1.5 : 0.5

        return TextField("", text: $digits[index])
            .font(.system(size: 26, weight: .bold, design: .monospaced))
            .foregroundColor(AppTheme.textPrimary)
            .multilineTextAlignment(.center)
            .keyboardType(.numberPad)
            .textContentType(.oneTimeCode)
            .frame(width: 48, height: 58)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(AppTheme.surfaceMedium)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
            .shadow(
                color: isFocused ? AppTheme.rose.opacity(0.2) : Color.clear,
                radius: 8, x: 0, y: 4
            )
            .focused($focusedField, equals: field)
            .onChange(of: digits[index]) { _, newValue in
                handleDigitChange(index: index, value: newValue)
            }
            .opacity(animateIn ? 1 : 0)
            .offset(y: animateIn ? 0 : 15)
            .animation(
                .spring(response: 0.4, dampingFraction: 0.75)
                    .delay(Double(index) * 0.05),
                value: animateIn
            )
    }

    // MARK: - Demo Hint

    private var demoHint: some View {
        HStack(spacing: 6) {
            Image(systemName: "info.circle")
                .font(.system(size: 11))
            Text("Demo code: 123456")
                .font(.system(size: 12, weight: .medium))
        }
        .foregroundColor(AppTheme.gold)
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(
            Capsule()
                .fill(AppTheme.gold.opacity(0.1))
                .overlay(
                    Capsule()
                        .stroke(AppTheme.gold.opacity(0.2), lineWidth: 0.5)
                )
        )
    }

    // MARK: - Error View

    @ViewBuilder
    private var errorView: some View {
        if let error = authVM.error {
            HStack(spacing: 6) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 12))
                Text(error)
                    .font(.system(size: 13))
            }
            .foregroundColor(AppTheme.error)
            .transition(.opacity.combined(with: .move(edge: .top)))
        }
    }

    // MARK: - Verify Button

    private var verifyButton: some View {
        PrimaryButton(
            title: "Verify",
            icon: "checkmark.circle.fill",
            isLoading: authVM.isLoading
        ) {
            authVM.otpCode = digits.joined()
            authVM.verifyOTP()
        }
        .padding(.horizontal, AppTheme.spacingMD)
    }

    // MARK: - Resend Section

    private var resendSection: some View {
        VStack(spacing: 8) {
            if authVM.resendCooldown > 0 {
                cooldownRow
            } else {
                resendButton
            }

            if authVM.resendCount >= 3 {
                Text("Maximum resend attempts reached")
                    .font(.system(size: 12))
                    .foregroundColor(AppTheme.error)
            }
        }
    }

    private var cooldownRow: some View {
        HStack(spacing: 6) {
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 2)
                    .frame(width: 22, height: 22)

                Circle()
                    .trim(from: 0, to: CGFloat(authVM.resendCooldown) / 30.0)
                    .stroke(
                        AppTheme.rose,
                        style: StrokeStyle(lineWidth: 2, lineCap: .round)
                    )
                    .frame(width: 22, height: 22)
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 1), value: authVM.resendCooldown)
            }

            Text("Resend code in \(authVM.resendCooldown)s")
                .font(.system(size: 14, design: .monospaced))
                .foregroundColor(AppTheme.textMuted)
        }
    }

    private var resendButton: some View {
        Button {
            authVM.sendOTP()
            digits = Array(repeating: "", count: 6)
            focusedField = .d0
        } label: {
            HStack(spacing: 4) {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 12, weight: .medium))
                Text("Resend Code")
                    .font(.system(size: 14, weight: .medium))
            }
            .foregroundColor(AppTheme.rose)
        }
        .disabled(authVM.resendCount >= 3)
        .opacity(authVM.resendCount >= 3 ? 0.4 : 1)
    }

    // MARK: - Helpers

    private var maskedPhone: String {
        let phone = authVM.phone
        if phone.count >= 10 {
            let masked = String(repeating: "*", count: phone.count - 4)
            return masked + phone.suffix(4)
        }
        return phone
    }

    private func handleDigitChange(index: Int, value: String) {
        // Handle paste of full OTP code
        if value.count > 1 {
            let cleaned = value.filter { $0.isNumber }
            if cleaned.count == 6 {
                for i in 0..<6 {
                    let charIndex = cleaned.index(cleaned.startIndex, offsetBy: i)
                    digits[i] = String(cleaned[charIndex])
                }
                focusedField = .d5
                submitAfterDelay()
                return
            }
            // Keep only last character
            digits[index] = String(cleaned.last ?? Character(""))
        }

        // Auto-advance to next field
        if !digits[index].isEmpty && index < 5 {
            focusedField = OTPField(rawValue: index + 1)
        }

        // Handle backspace: move to previous field
        if digits[index].isEmpty && index > 0 {
            focusedField = OTPField(rawValue: index - 1)
        }

        // Auto-verify when all 6 digits entered
        let allFilled = digits.allSatisfy { !$0.isEmpty }
        if allFilled {
            submitAfterDelay()
        }
    }

    private func submitAfterDelay() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
            authVM.otpCode = digits.joined()
            authVM.verifyOTP()
        }
    }

    private func triggerShake() {
        withAnimation(.default) { shakeOffset = 10 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.08) {
            withAnimation(.default) { shakeOffset = -8 }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.16) {
            withAnimation(.default) { shakeOffset = 6 }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.24) {
            withAnimation(.default) { shakeOffset = -4 }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.32) {
            withAnimation(.spring()) { shakeOffset = 0 }
        }
    }
}
