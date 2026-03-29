import SwiftUI

struct OnboardingContainerView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @StateObject private var vm = OnboardingViewModel()

    var body: some View {
        VStack(spacing: 0) {
            progressSection
            headerSection
            stepContent
            Spacer(minLength: 0)
            navigationButtons
        }
        .appBackground()
        .animation(.easeInOut(duration: 0.35), value: vm.currentStep)
    }

    // MARK: - Progress Bar

    private var progressSection: some View {
        VStack(spacing: 8) {
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 4)

                    Capsule()
                        .fill(AppTheme.roseGradient)
                        .frame(width: geo.size.width * vm.progress, height: 4)
                        .animation(.spring(response: 0.4), value: vm.progress)
                }
            }
            .frame(height: 4)

            Text("\(vm.currentStep.rawValue + 1) of \(OnboardingStep.allCases.count)")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(AppTheme.textMuted)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(.horizontal, AppTheme.spacingMD)
        .padding(.top, 12)
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: 8) {
            Text(vm.currentStep.title)
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)

            Text(vm.currentStep.subtitle)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, AppTheme.spacingMD)
        .padding(.top, AppTheme.spacingLG)
        .padding(.bottom, AppTheme.spacingMD)
    }

    // MARK: - Step Content

    private var stepContent: some View {
        ScrollView {
            VStack(spacing: 0) {
                stepView(for: vm.currentStep)
            }
            .padding(.horizontal, AppTheme.spacingMD)
        }
        .transition(.asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        ))
        .id(vm.currentStep)
    }

    @ViewBuilder
    private func stepView(for step: OnboardingStep) -> some View {
        switch step {
        case .name: NameStepContent(vm: vm)
        case .birthday: BirthdayStepContent(vm: vm)
        case .gender: GenderStepContent(vm: vm)
        case .photos: PhotosStepContent(vm: vm)
        case .intent: IntentStepContent(vm: vm)
        case .showMe: ShowMeStepContent(vm: vm)
        case .location: LocationStepContent(vm: vm)
        case .ready: ReadyStepContent(vm: vm, onComplete: { authVM.completeOnboarding() })
        }
    }

    // MARK: - Navigation Buttons

    @ViewBuilder
    private var navigationButtons: some View {
        if vm.currentStep == .ready {
            EmptyView()
        } else {
            HStack(spacing: 12) {
                if vm.currentStep != .name {
                    SecondaryButton(title: "Back", icon: "chevron.left") {
                        vm.previousStep()
                    }
                }

                PrimaryButton(title: "Next", icon: "chevron.right", isLoading: vm.isLoading) {
                    vm.nextStep()
                }
                .opacity(vm.canProceed ? 1.0 : 0.5)
                .disabled(!vm.canProceed)
            }
            .padding(.horizontal, AppTheme.spacingMD)
            .padding(.bottom, AppTheme.spacingLG)
        }
    }
}

// MARK: - Name Step

private struct NameStepContent: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        VStack(spacing: AppTheme.spacingMD) {
            AppTextField(placeholder: "First name", text: $vm.firstName, icon: "person.fill")

            Text("\(vm.firstName.count)/50")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textMuted)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
    }
}

// MARK: - Birthday Step

private struct BirthdayStepContent: View {
    @ObservedObject var vm: OnboardingViewModel
    @State private var dateOfBirth = Calendar.current.date(
        from: DateComponents(year: 1998, month: 6, day: 15)
    ) ?? Date()

    var body: some View {
        VStack(spacing: AppTheme.spacingMD) {
            DatePicker(
                "Date of Birth",
                selection: $dateOfBirth,
                in: ...Date(),
                displayedComponents: .date
            )
            .datePickerStyle(.wheel)
            .labelsHidden()
            .colorScheme(.dark)
            .onChange(of: dateOfBirth) { _, newValue in
                updateViewModel(from: newValue)
            }

            ageIndicator
        }
        .onAppear {
            updateViewModel(from: dateOfBirth)
        }
    }

    private var ageIndicator: some View {
        let isValid = vm.isAgeValid
        return HStack(spacing: 8) {
            Image(systemName: isValid ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                .foregroundColor(isValid ? AppTheme.success : AppTheme.error)
            Text(isValid ? "You're \(vm.age) years old" : "Must be 18+")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(isValid ? AppTheme.textPrimary : AppTheme.error)
            Spacer()
        }
        .padding(AppTheme.spacingMD)
        .cardStyle()
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusCard))
    }

    private func updateViewModel(from date: Date) {
        let comps = Calendar.current.dateComponents([.year, .month, .day], from: date)
        vm.birthYear = comps.year ?? 1998
        vm.birthMonth = comps.month ?? 6
        vm.birthDay = comps.day ?? 15
    }
}

// MARK: - Gender Step

private struct GenderStepContent: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        VStack(spacing: 12) {
            ForEach(Gender.allCases) { gender in
                GenderCard(gender: gender, isSelected: vm.selectedGender == gender) {
                    withAnimation(.spring(response: 0.3)) {
                        vm.selectedGender = gender
                    }
                }
            }
        }
    }
}

private struct GenderCard: View {
    let gender: Gender
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: gender.icon)
                    .font(.system(size: 24))
                    .foregroundColor(isSelected ? AppTheme.rose : AppTheme.textMuted)
                    .frame(width: 40)

                Text(gender.display)
                    .font(.system(size: 17, weight: .medium))
                    .foregroundColor(.white)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(AppTheme.rose)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(18)
        }
        .cardStyle()
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusCard))
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                .stroke(isSelected ? AppTheme.rose : Color.clear, lineWidth: 1.5)
        )
    }
}

// MARK: - Photos Step

private struct PhotosStepContent: View {
    @ObservedObject var vm: OnboardingViewModel
    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        VStack(spacing: AppTheme.spacingMD) {
            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(0..<6, id: \.self) { index in
                    if index < vm.selectedPhotos.count {
                        filledPhotoSlot(at: index)
                    } else {
                        emptyPhotoSlot
                    }
                }
            }

            photoCountLabel
        }
    }

    private func filledPhotoSlot(at index: Int) -> some View {
        ZStack(alignment: .topTrailing) {
            RoundedRectangle(cornerRadius: AppTheme.radiusLG)
                .fill(
                    LinearGradient(
                        colors: [AppTheme.rose.opacity(0.3), AppTheme.roseDark.opacity(0.2)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .aspectRatio(3.0 / 4.0, contentMode: .fill)
                .overlay(
                    Image(systemName: "person.fill")
                        .font(.system(size: 30))
                        .foregroundColor(.white.opacity(0.5))
                )

            Button { vm.removePhoto(at: index) } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(.white)
                    .shadow(radius: 4)
            }
            .offset(x: 4, y: -4)

            if index == 0 {
                mainBadge
            }
        }
    }

    private var mainBadge: some View {
        Text("Main")
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(AppTheme.roseGradient)
            .clipShape(Capsule())
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding(8)
    }

    private var emptyPhotoSlot: some View {
        Button { vm.addPhoto() } label: {
            RoundedRectangle(cornerRadius: AppTheme.radiusLG)
                .strokeBorder(
                    Color.white.opacity(0.2),
                    style: StrokeStyle(lineWidth: 1.5, dash: [8])
                )
                .aspectRatio(3.0 / 4.0, contentMode: .fill)
                .overlay(
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(AppTheme.textMuted)
                )
        }
    }

    private var photoCountLabel: some View {
        HStack {
            Text("\(vm.selectedPhotos.count)/6 photos")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(AppTheme.textSecondary)
            Spacer()
            Text("Min 1 required")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textMuted)
        }
    }
}

// MARK: - Intent Step

private struct IntentStepContent: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        VStack(spacing: 12) {
            ForEach(Intent.allCases) { intent in
                IntentCard(intent: intent, isSelected: vm.selectedIntent == intent) {
                    withAnimation(.spring(response: 0.3)) {
                        vm.selectedIntent = intent
                    }
                }
            }
        }
    }
}

private struct IntentCard: View {
    let intent: Intent
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: intent.icon)
                    .font(.system(size: 24))
                    .foregroundColor(isSelected ? AppTheme.rose : AppTheme.textMuted)
                    .frame(width: 40)

                Text(intent.display)
                    .font(.system(size: 17, weight: .medium))
                    .foregroundColor(.white)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(AppTheme.rose)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(18)
        }
        .cardStyle()
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.radiusCard))
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.radiusCard)
                .stroke(isSelected ? AppTheme.rose : Color.clear, lineWidth: 1.5)
        )
    }
}

// MARK: - ShowMe Step

private struct ShowMeStepContent: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        VStack(spacing: 12) {
            ForEach(ShowMe.allCases) { pref in
                ShowMeCapsule(pref: pref, isSelected: vm.selectedShowMe == pref) {
                    withAnimation(.spring(response: 0.3)) {
                        vm.selectedShowMe = pref
                    }
                }
            }
        }
    }
}

private struct ShowMeCapsule: View {
    let pref: ShowMe
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: pref == .everyone ? "person.2.fill" : "person.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(isSelected ? .white : AppTheme.textSecondary)

                Text(pref.display)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(isSelected ? .white : AppTheme.textSecondary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                Capsule()
                    .fill(isSelected ? AppTheme.rose : AppTheme.surfaceMedium)
            )
            .overlay(
                Capsule()
                    .stroke(
                        isSelected ? AppTheme.rose : Color.white.opacity(0.08),
                        lineWidth: isSelected ? 1.5 : 0.5
                    )
            )
        }
    }
}

// MARK: - Location Step

private struct LocationStepContent: View {
    @ObservedObject var vm: OnboardingViewModel
    @State private var city = ""
    @State private var state = ""
    @State private var country = ""

    var body: some View {
        VStack(spacing: AppTheme.spacingMD) {
            AppTextField(placeholder: "City", text: $city, icon: "mappin.circle.fill")
                .onChange(of: city) { _, newValue in
                    vm.selectedCity = newValue.isEmpty ? nil : newValue
                }

            AppTextField(placeholder: "State / Province", text: $state, icon: "map.fill")

            AppTextField(placeholder: "Country", text: $country, icon: "globe")
        }
    }
}

// MARK: - Ready Step

private struct ReadyStepContent: View {
    @ObservedObject var vm: OnboardingViewModel
    let onComplete: () -> Void
    @State private var animateCheckmark = false

    var body: some View {
        VStack(spacing: AppTheme.spacingLG) {
            Spacer().frame(height: 40)

            checkmarkCircle

            Text("You're all set!")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)

            Text("Welcome to the Sindhi community, \(vm.firstName)!")
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)

            profilePreview

            Spacer().frame(height: 20)

            PrimaryButton(title: "Start Discovering", icon: "heart.circle.fill") {
                onComplete()
            }
        }
    }

    private var checkmarkCircle: some View {
        ZStack {
            Circle()
                .fill(AppTheme.rose.opacity(0.15))
                .frame(width: 140, height: 140)
                .scaleEffect(animateCheckmark ? 1.1 : 0.95)
                .animation(
                    .easeInOut(duration: 1.5).repeatForever(autoreverses: true),
                    value: animateCheckmark
                )

            Circle()
                .fill(AppTheme.roseGradient)
                .frame(width: 100, height: 100)

            Image(systemName: "checkmark")
                .font(.system(size: 44, weight: .bold))
                .foregroundColor(.white)
                .scaleEffect(animateCheckmark ? 1.0 : 0.5)
                .animation(
                    .spring(response: 0.5, dampingFraction: 0.6),
                    value: animateCheckmark
                )
        }
        .onAppear { animateCheckmark = true }
    }

    private var profilePreview: some View {
        ContentCard {
            HStack(spacing: 14) {
                ProfileAvatar(url: nil, name: vm.firstName, size: 56, showBorder: true)

                VStack(alignment: .leading, spacing: 4) {
                    Text("\(vm.firstName), \(vm.age)")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)

                    Text(vm.selectedCity ?? "")
                        .font(.system(size: 13))
                        .foregroundColor(AppTheme.textSecondary)
                }
                Spacer()
            }
            .padding(16)
        }
    }
}
