import SwiftUI

struct PhoneAuthView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @Environment(\.dismiss) var dismiss
    @Environment(\.adaptiveColors) private var colors
    private let localization = LocalizationManager.shared
    @State private var selectedCountry = CountryCode.india
    @State private var showCountryPicker = false
    @State private var navigateToOTP = false
    @State private var animateIn = false
    @FocusState private var phoneFieldFocused: Bool

    // MARK: - Country Code

    struct CountryCode: Identifiable, Hashable {
        let id = UUID()
        let short: String
        let name: String
        let code: String

        static let india = CountryCode(short: "IN", name: "India", code: "+91")
        static let all: [CountryCode] = [
            india,
            CountryCode(short: "AE", name: "UAE", code: "+971"),
            CountryCode(short: "GB", name: "UK", code: "+44"),
            CountryCode(short: "US", name: "USA", code: "+1"),
            CountryCode(short: "CA", name: "Canada", code: "+1"),
            CountryCode(short: "SG", name: "Singapore", code: "+65"),
            CountryCode(short: "HK", name: "Hong Kong", code: "+852"),
            CountryCode(short: "AU", name: "Australia", code: "+61"),
            CountryCode(short: "KE", name: "Kenya", code: "+254"),
            CountryCode(short: "NG", name: "Nigeria", code: "+234")
        ]
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            colors.background.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    Spacer().frame(height: 60)

                    // White card container (matching web: max-w-md bg-white rounded-2xl shadow-xl p-6)
                    VStack(spacing: 0) {
                        cardHeader
                        cardContent
                    }
                    .background(colors.cardDark)
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                    .shadow(color: colors.elevatedShadowColor, radius: 24, x: 0, y: 8)
                    .padding(.horizontal, AppTheme.spacingMD)
                    .opacity(animateIn ? 1 : 0)
                    .offset(y: animateIn ? 0 : 20)

                    Spacer().frame(height: 40)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .onChange(of: authVM.otpSent) { _, sent in
            if sent { navigateToOTP = true }
        }
        .navigationDestination(isPresented: $navigateToOTP) {
            OTPVerificationView()
                .environmentObject(authVM)
        }
        .onAppear {
            phoneFieldFocused = true
            withAnimation(.easeOut(duration: 0.5).delay(0.1)) {
                animateIn = true
            }
        }
    }

    // MARK: - Card Header (back button + logo)

    private var cardHeader: some View {
        HStack {
            Button { dismiss() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(colors.textPrimary)
                    .frame(width: 36, height: 36)
                    .background(colors.surfaceMedium)
                    .clipShape(Circle())
            }

            Spacer()

            Text("MitiMaiti")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(AppTheme.rose)

            Spacer()

            // Balance spacer
            Color.clear.frame(width: 36, height: 36)
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
        .padding(.bottom, 8)
    }

    // MARK: - Card Content

    private var cardContent: some View {
        VStack(spacing: 20) {
            // Title & subtitle
            VStack(spacing: 8) {
                Text(localization.t("auth.enterPhone"))
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(colors.textPrimary)

                Text(localization.t("auth.sendVerification"))
                    .font(.system(size: 15))
                    .foregroundColor(colors.textSecondary)
            }

            // Phone input section
            VStack(spacing: 12) {
                HStack(spacing: 10) {
                    countryPickerButton
                    phoneInputField
                }
            }

            // Error
            errorView

            // Security note
            securityNote

            // Continue button
            continueButton

            // Divider
            orDivider

            // Social sign-in
            socialButtons

            // Legal
            legalText
        }
        .padding(.horizontal, 20)
        .padding(.top, 12)
        .padding(.bottom, 24)
    }

    // MARK: - Country Picker Button

    private var countryPickerButton: some View {
        Menu {
            ForEach(CountryCode.all) { country in
                Button {
                    selectedCountry = country
                } label: {
                    Text("\(country.short) \(country.name) (\(country.code))")
                }
            }
        } label: {
            HStack(spacing: 6) {
                Text(selectedCountry.short)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 28, height: 28)
                    .background(AppTheme.roseGradient)
                    .clipShape(RoundedRectangle(cornerRadius: 6))
                Text(selectedCountry.code)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(colors.textPrimary)
                Image(systemName: "chevron.down")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(colors.textMuted)
            }
            .frame(height: 52)
            .padding(.horizontal, 12)
            .background(colors.surfaceMedium)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(colors.border, lineWidth: 1)
            )
        }
    }

    // MARK: - Phone Input Field

    private var phoneInputField: some View {
        HStack(spacing: 8) {
            TextField(localization.t("auth.phoneNumber"), text: $authVM.phone)
                .font(.system(size: 17, weight: .medium))
                .foregroundColor(colors.textPrimary)
                .keyboardType(.phonePad)
                .textContentType(.telephoneNumber)
                .focused($phoneFieldFocused)
                .tint(AppTheme.rose)

            if !authVM.phone.isEmpty {
                Image(systemName: "phone.fill")
                    .font(.system(size: 14))
                    .foregroundColor(AppTheme.rose)
            }
        }
        .frame(height: 52)
        .padding(.horizontal, 14)
        .background(colors.surfaceMedium)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(
                    phoneFieldFocused ? AppTheme.rose : colors.border,
                    lineWidth: phoneFieldFocused ? 1.5 : 1
                )
        )
        .animation(.easeInOut(duration: 0.2), value: phoneFieldFocused)
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
            .transition(.opacity.combined(with: .move(edge: .top)))
        }
    }

    // MARK: - Security Note

    private var securityNote: some View {
        HStack(spacing: 6) {
            Image(systemName: "lock.fill")
                .font(.system(size: 11))
            Text(localization.t("auth.securityNote"))
                .font(.system(size: 13))
        }
        .foregroundColor(colors.textMuted)
    }

    // MARK: - Continue Button

    private var continueButton: some View {
        Button {
            authVM.sendOTP()
        } label: {
            HStack(spacing: 8) {
                if authVM.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Text(localization.t("auth.continue"))
                        .font(.system(size: 17, weight: .semibold))
                }
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(AppTheme.rose)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(authVM.isLoading || authVM.phone.count < 7)
        .opacity(authVM.phone.count < 7 ? 0.5 : 1)
    }

    // MARK: - Or Divider

    private var orDivider: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(colors.border)
                .frame(height: 1)
            Text(localization.t("common.or"))
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(colors.textMuted)
            Rectangle()
                .fill(colors.border)
                .frame(height: 1)
        }
    }

    // MARK: - Social Buttons

    private var socialButtons: some View {
        HStack(spacing: 10) {
            socialButton(icon: "g.circle.fill", label: "Google", style: .light)
            socialButton(icon: "apple.logo", label: "Apple", style: .dark)
            socialButton(icon: "envelope.fill", label: "Email", style: .light)
        }
    }

    enum SocialStyle { case light, dark }

    private func socialButton(icon: String, label: String, style: SocialStyle) -> some View {
        Button {} label: {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(label)
                    .font(.system(size: 11, weight: .semibold))
            }
            .foregroundColor(style == .dark ? .white : colors.textPrimary)
            .frame(maxWidth: .infinity)
            .frame(height: 64)
            .background(
                style == .dark
                    ? AnyShapeStyle(Color.black)
                    : AnyShapeStyle(colors.surfaceMedium)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(style == .dark ? Color.clear : colors.border, lineWidth: 1)
            )
        }
    }

    // MARK: - Legal

    private var legalText: some View {
        Text(localization.t("auth.legalText"))
            .font(.system(size: 11))
            .foregroundColor(colors.textMuted)
            .multilineTextAlignment(.center)
    }
}
