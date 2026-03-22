import SwiftUI

struct PhoneAuthView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @Environment(\.dismiss) var dismiss
    @State private var selectedCountry = CountryCode.india
    @State private var navigateToOTP = false

    struct CountryCode: Identifiable, Hashable {
        let id = UUID()
        let flag: String
        let name: String
        let code: String

        static let india = CountryCode(flag: "🇮🇳", name: "India", code: "+91")
        static let all: [CountryCode] = [
            india,
            CountryCode(flag: "🇦🇪", name: "UAE", code: "+971"),
            CountryCode(flag: "🇬🇧", name: "UK", code: "+44"),
            CountryCode(flag: "🇺🇸", name: "USA", code: "+1"),
            CountryCode(flag: "🇨🇦", name: "Canada", code: "+1"),
            CountryCode(flag: "🇸🇬", name: "Singapore", code: "+65"),
            CountryCode(flag: "🇭🇰", name: "Hong Kong", code: "+852"),
            CountryCode(flag: "🇦🇺", name: "Australia", code: "+61"),
            CountryCode(flag: "🇰🇪", name: "Kenya", code: "+254"),
            CountryCode(flag: "🇳🇬", name: "Nigeria", code: "+234"),
        ]
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 32) {
                    Spacer().frame(height: 20)

                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: "phone.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(AppTheme.roseGradient)

                        Text("Enter your phone number")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)

                        Text("We'll send you a verification code")
                            .font(.system(size: 14))
                            .foregroundColor(AppTheme.textSecondary)
                    }

                    // Phone Input
                    GlassCard(cornerRadius: 16) {
                        HStack(spacing: 12) {
                            // Country picker
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
                                        .foregroundColor(.white)
                                    Image(systemName: "chevron.down")
                                        .font(.system(size: 10))
                                        .foregroundColor(AppTheme.textMuted)
                                }
                                .padding(12)
                                .background(Color.white.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                            }

                            // Phone field
                            TextField("Phone number", text: $authVM.phone)
                                .font(.system(size: 18, weight: .medium))
                                .foregroundColor(.white)
                                .keyboardType(.phonePad)
                                .textContentType(.telephoneNumber)
                        }
                        .padding(16)
                    }
                    .padding(.horizontal)

                    // Error
                    if let error = authVM.error {
                        Text(error)
                            .font(.system(size: 13))
                            .foregroundColor(AppTheme.error)
                            .padding(.horizontal)
                    }

                    // Continue Button
                    GlassButton("Continue", icon: "arrow.right", isLoading: authVM.isLoading) {
                        authVM.sendOTP()
                    }
                    .padding(.horizontal)

                    // Divider
                    HStack {
                        Rectangle().fill(Color.white.opacity(0.1)).frame(height: 0.5)
                        Text("or continue with")
                            .font(.system(size: 12))
                            .foregroundColor(AppTheme.textMuted)
                        Rectangle().fill(Color.white.opacity(0.1)).frame(height: 0.5)
                    }
                    .padding(.horizontal)

                    // Social Login
                    HStack(spacing: 16) {
                        ForEach(["apple.logo", "g.circle.fill", "envelope.fill"], id: \.self) { icon in
                            Button {
                                // Social auth placeholder
                            } label: {
                                Image(systemName: icon)
                                    .font(.system(size: 22))
                                    .foregroundColor(.white)
                                    .frame(width: 56, height: 56)
                                    .glassCard(cornerRadius: 16)
                            }
                        }
                    }

                    Spacer()

                    Text("By continuing, you agree to our Terms of Service and Privacy Policy")
                        .font(.system(size: 11))
                        .foregroundColor(AppTheme.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                        .padding(.bottom, 16)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(.white)
                    }
                }
            }
            .onChange(of: authVM.otpSent) { _, sent in
                if sent { navigateToOTP = true }
            }
            .navigationDestination(isPresented: $navigateToOTP) {
                OTPVerificationView()
                    .environmentObject(authVM)
            }
        }
    }
}
