import SwiftUI

struct PhoneAuthView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @Environment(\.dismiss) var dismiss
    @State private var selectedCountry = CountryCode.india
    @State private var navigateToOTP = false
    @FocusState private var phoneFieldFocused: Bool

    // MARK: - Country Code

    struct CountryCode: Identifiable, Hashable {
        let id = UUID()
        let flag: String
        let name: String
        let code: String

        static let india = CountryCode(flag: "\u{1F1EE}\u{1F1F3}", name: "India", code: "+91")
        static let all: [CountryCode] = [
            india,
            CountryCode(flag: "\u{1F1E6}\u{1F1EA}", name: "UAE", code: "+971"),
            CountryCode(flag: "\u{1F1EC}\u{1F1E7}", name: "UK", code: "+44"),
            CountryCode(flag: "\u{1F1FA}\u{1F1F8}", name: "USA", code: "+1"),
            CountryCode(flag: "\u{1F1E8}\u{1F1E6}", name: "Canada", code: "+1"),
            CountryCode(flag: "\u{1F1F8}\u{1F1EC}", name: "Singapore", code: "+65"),
            CountryCode(flag: "\u{1F1ED}\u{1F1F0}", name: "Hong Kong", code: "+852"),
            CountryCode(flag: "\u{1F1E6}\u{1F1FA}", name: "Australia", code: "+61"),
            CountryCode(flag: "\u{1F1F0}\u{1F1EA}", name: "Kenya", code: "+254"),
            CountryCode(flag: "\u{1F1F3}\u{1F1EC}", name: "Nigeria", code: "+234")
        ]
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            // Subtle ambient glow
            Circle()
                .fill(AppTheme.rose.opacity(0.06))
                .frame(width: 300, height: 300)
                .blur(radius: 80)
                .offset(y: -200)

            VStack(spacing: 32) {
                Spacer().frame(height: 20)
                headerSection
                phoneInputCard
                errorView
                continueButton
                Spacer()
                legalText
            }
        }
        .appBackground()
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .toolbar { backButton }
        .onChange(of: authVM.otpSent) { _, sent in
            if sent { navigateToOTP = true }
        }
        .navigationDestination(isPresented: $navigateToOTP) {
            OTPVerificationView()
                .environmentObject(authVM)
        }
        .onAppear {
            phoneFieldFocused = true
        }
    }

    // MARK: - Back Button

    private var backButton: some ToolbarContent {
        ToolbarItem(placement: .navigationBarLeading) {
            Button {
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
                    .fill(AppTheme.rose.opacity(0.12))
                    .frame(width: 80, height: 80)

                Image(systemName: "phone.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(AppTheme.roseGradient)
                    .shadow(color: AppTheme.rose.opacity(0.4), radius: 10)
            }

            Text("Enter your phone number")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(AppTheme.textPrimary)

            Text("We'll send you a verification code")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
        }
    }

    // MARK: - Phone Input Card

    private var phoneInputCard: some View {
        ContentCard {
            HStack(spacing: 12) {
                countryPicker
                phoneField
            }
            .padding(16)
        }
        .padding(.horizontal, AppTheme.spacingMD)
    }

    private var countryPicker: some View {
        Menu {
            ForEach(CountryCode.all) { country in
                Button {
                    selectedCountry = country
                } label: {
                    Text("\(country.flag) \(country.name) (\(country.code))")
                }
            }
        } label: {
            HStack(spacing: 6) {
                Text(selectedCountry.flag)
                    .font(.system(size: 20))
                Text(selectedCountry.code)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(AppTheme.textPrimary)
                Image(systemName: "chevron.down")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(AppTheme.textMuted)
            }
            .padding(12)
            .background(AppTheme.surfaceMedium)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
            )
        }
    }

    private var phoneField: some View {
        TextField("Phone number", text: $authVM.phone)
            .font(.system(size: 18, weight: .medium, design: .monospaced))
            .foregroundColor(AppTheme.textPrimary)
            .keyboardType(.phonePad)
            .textContentType(.telephoneNumber)
            .focused($phoneFieldFocused)
            .tint(AppTheme.rose)
    }

    // MARK: - Error

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
            .padding(.horizontal, AppTheme.spacingMD)
            .transition(.opacity.combined(with: .move(edge: .top)))
        }
    }

    // MARK: - Continue Button

    private var continueButton: some View {
        PrimaryButton(
            title: "Continue",
            icon: "arrow.right",
            isLoading: authVM.isLoading
        ) {
            authVM.sendOTP()
        }
        .padding(.horizontal, AppTheme.spacingMD)
    }

    // MARK: - Legal

    private var legalText: some View {
        Text("By continuing, you agree to our Terms of Service and Privacy Policy")
            .font(.system(size: 11))
            .foregroundColor(AppTheme.textMuted)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 32)
            .padding(.bottom, 16)
    }
}
