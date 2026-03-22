import SwiftUI

struct OnboardingContainerView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @StateObject private var vm = OnboardingViewModel()

    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress bar
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
                .padding(.horizontal)
                .padding(.top, 8)

                // Back button + step indicator
                HStack {
                    if vm.currentStep != .name {
                        Button { vm.previousStep() } label: {
                            Image(systemName: "arrow.left")
                                .font(.system(size: 18, weight: .medium))
                                .foregroundColor(.white)
                                .frame(width: 40, height: 40)
                        }
                    }
                    Spacer()
                    Text("\(vm.currentStep.rawValue + 1)/\(OnboardingStep.allCases.count)")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppTheme.textMuted)
                }
                .padding(.horizontal)
                .padding(.top, 8)

                // Step content
                TabView(selection: $vm.currentStep) {
                    NameStepView(vm: vm).tag(OnboardingStep.name)
                    BirthdayStepView(vm: vm).tag(OnboardingStep.birthday)
                    GenderStepView(vm: vm).tag(OnboardingStep.gender)
                    PhotosStepView(vm: vm).tag(OnboardingStep.photos)
                    IntentStepView(vm: vm).tag(OnboardingStep.intent)
                    ShowMeStepView(vm: vm).tag(OnboardingStep.showMe)
                    LocationStepView(vm: vm).tag(OnboardingStep.location)
                    ReadyStepView(vm: vm, onComplete: {
                        authVM.completeOnboarding()
                    }).tag(OnboardingStep.ready)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.spring(response: 0.4, dampingFraction: 0.85), value: vm.currentStep)

                // Continue button
                if vm.currentStep != .ready {
                    GlassButton("Continue", icon: "arrow.right") {
                        vm.nextStep()
                    }
                    .disabled(!vm.canProceed)
                    .opacity(vm.canProceed ? 1 : 0.5)
                    .padding(.horizontal)
                    .padding(.bottom, 16)
                }
            }
        }
    }
}

// MARK: - Onboarding Shell
struct OnboardingStepShell<Content: View>: View {
    let step: OnboardingStep
    let content: Content

    init(step: OnboardingStep, @ViewBuilder content: () -> Content) {
        self.step = step
        self.content = content()
    }

    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text(step.title)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)

                Text(step.subtitle)
                    .font(.system(size: 14))
                    .foregroundColor(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, 20)

            content

            Spacer()
        }
        .padding(.horizontal)
    }
}

// MARK: - Name Step
struct NameStepView: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        OnboardingStepShell(step: .name) {
            VStack(spacing: 16) {
                GlassTextField(placeholder: "First name", text: $vm.firstName, icon: "person.fill")

                // Non-Sindhi toggle
                GlassCard(cornerRadius: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Non-Sindhi? No worries!")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white)
                            Text("Skip Sindhi-specific sections")
                                .font(.system(size: 12))
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        Spacer()
                        Toggle("", isOn: $vm.isNonSindhi)
                            .tint(AppTheme.rose)
                            .labelsHidden()
                    }
                    .padding(16)
                }

                // Character count
                Text("\(vm.firstName.count)/50")
                    .font(.system(size: 12))
                    .foregroundColor(AppTheme.textMuted)
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
        }
    }
}

// MARK: - Birthday Step
struct BirthdayStepView: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        OnboardingStepShell(step: .birthday) {
            VStack(spacing: 20) {
                HStack(spacing: 12) {
                    // Day
                    GlassCard(cornerRadius: 12) {
                        Picker("Day", selection: $vm.birthDay) {
                            ForEach(1...31, id: \.self) { Text("\($0)").tag($0) }
                        }
                        .pickerStyle(.wheel)
                        .frame(height: 120)
                        .clipped()
                    }

                    // Month
                    GlassCard(cornerRadius: 12) {
                        Picker("Month", selection: $vm.birthMonth) {
                            ForEach(1...12, id: \.self) {
                                Text(DateFormatter().monthSymbols[$0 - 1]).tag($0)
                            }
                        }
                        .pickerStyle(.wheel)
                        .frame(height: 120)
                        .clipped()
                    }

                    // Year
                    GlassCard(cornerRadius: 12) {
                        Picker("Year", selection: $vm.birthYear) {
                            ForEach((1960...2008).reversed(), id: \.self) { Text("\($0)").tag($0) }
                        }
                        .pickerStyle(.wheel)
                        .frame(height: 120)
                        .clipped()
                    }
                }

                // Age display
                if vm.age > 0 {
                    GlassCard(cornerRadius: 12) {
                        HStack {
                            Image(systemName: vm.isAgeValid ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                                .foregroundColor(vm.isAgeValid ? AppTheme.success : AppTheme.error)
                            Text(vm.isAgeValid ? "You're \(vm.age) years old" : "You must be 18 or older")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(vm.isAgeValid ? .white : AppTheme.error)
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }
}

// MARK: - Gender Step
struct GenderStepView: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        OnboardingStepShell(step: .gender) {
            VStack(spacing: 12) {
                ForEach(Gender.allCases) { gender in
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            vm.selectedGender = gender
                        }
                    } label: {
                        GlassCard(cornerRadius: 16) {
                            HStack(spacing: 16) {
                                Image(systemName: gender.icon)
                                    .font(.system(size: 24))
                                    .foregroundStyle(vm.selectedGender == gender ? AppTheme.roseGradient : LinearGradient(colors: [AppTheme.textMuted, AppTheme.textMuted], startPoint: .top, endPoint: .bottom))
                                    .frame(width: 40)

                                Text(gender.display)
                                    .font(.system(size: 17, weight: .medium))
                                    .foregroundColor(.white)

                                Spacer()

                                if vm.selectedGender == gender {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(AppTheme.rose)
                                        .transition(.scale.combined(with: .opacity))
                                }
                            }
                            .padding(18)
                        }
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(vm.selectedGender == gender ? AppTheme.rose : Color.clear, lineWidth: 1.5)
                        )
                    }
                }
            }
        }
    }
}

// MARK: - Photos Step
struct PhotosStepView: View {
    @ObservedObject var vm: OnboardingViewModel
    let columns = [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        OnboardingStepShell(step: .photos) {
            VStack(spacing: 16) {
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(0..<6, id: \.self) { index in
                        if index < vm.selectedPhotos.count {
                            // Photo cell
                            ZStack(alignment: .topTrailing) {
                                RoundedRectangle(cornerRadius: 14)
                                    .fill(
                                        LinearGradient(
                                            colors: [AppTheme.rose.opacity(0.3), AppTheme.roseDark.opacity(0.2)],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .aspectRatio(3/4, contentMode: .fill)
                                    .overlay(
                                        Image(systemName: "person.fill")
                                            .font(.system(size: 30))
                                            .foregroundColor(.white.opacity(0.5))
                                    )

                                // Remove button
                                Button { vm.removePhoto(at: index) } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 20))
                                        .foregroundColor(.white)
                                        .shadow(radius: 4)
                                }
                                .offset(x: 4, y: -4)

                                // Main badge
                                if index == 0 {
                                    Text("Main")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(AppTheme.roseGradient)
                                        .clipShape(Capsule())
                                        .offset(x: 0, y: 4)
                                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                                        .padding(8)
                                }
                            }
                        } else {
                            // Add photo cell
                            Button { vm.addPhoto() } label: {
                                RoundedRectangle(cornerRadius: 14)
                                    .strokeBorder(Color.white.opacity(0.2), style: StrokeStyle(lineWidth: 1.5, dash: [8]))
                                    .aspectRatio(3/4, contentMode: .fill)
                                    .overlay(
                                        Image(systemName: "plus.circle.fill")
                                            .font(.system(size: 28))
                                            .foregroundColor(AppTheme.textMuted)
                                    )
                            }
                        }
                    }
                }

                // Progress
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
    }
}

// MARK: - Intent Step
struct IntentStepView: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        OnboardingStepShell(step: .intent) {
            VStack(spacing: 12) {
                ForEach(Intent.allCases) { intent in
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            vm.selectedIntent = intent
                        }
                    } label: {
                        GlassCard(cornerRadius: 16) {
                            HStack(spacing: 16) {
                                Image(systemName: intent.icon)
                                    .font(.system(size: 24))
                                    .foregroundColor(vm.selectedIntent == intent ? AppTheme.rose : AppTheme.textMuted)
                                    .frame(width: 40)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(intent.display)
                                        .font(.system(size: 17, weight: .medium))
                                        .foregroundColor(.white)
                                }

                                Spacer()

                                if vm.selectedIntent == intent {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(AppTheme.rose)
                                        .transition(.scale.combined(with: .opacity))
                                }
                            }
                            .padding(18)
                        }
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(vm.selectedIntent == intent ? AppTheme.rose : Color.clear, lineWidth: 1.5)
                        )
                    }
                }
            }
        }
    }
}

// MARK: - ShowMe Step
struct ShowMeStepView: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        OnboardingStepShell(step: .showMe) {
            VStack(spacing: 12) {
                ForEach(ShowMe.allCases) { pref in
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            vm.selectedShowMe = pref
                        }
                    } label: {
                        GlassCard(cornerRadius: 16) {
                            HStack(spacing: 16) {
                                Image(systemName: pref == .everyone ? "person.2.fill" : "person.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(vm.selectedShowMe == pref ? AppTheme.rose : AppTheme.textMuted)
                                    .frame(width: 40)

                                Text(pref.display)
                                    .font(.system(size: 17, weight: .medium))
                                    .foregroundColor(.white)

                                Spacer()

                                if vm.selectedShowMe == pref {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(AppTheme.rose)
                                        .transition(.scale.combined(with: .opacity))
                                }
                            }
                            .padding(18)
                        }
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(vm.selectedShowMe == pref ? AppTheme.rose : Color.clear, lineWidth: 1.5)
                        )
                    }
                }
            }
        }
    }
}

// MARK: - Location Step
struct LocationStepView: View {
    @ObservedObject var vm: OnboardingViewModel
    @State private var searchText = ""

    var filteredCities: [String] {
        if searchText.isEmpty { return MockData.cities }
        return MockData.cities.filter { $0.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        OnboardingStepShell(step: .location) {
            VStack(spacing: 16) {
                // Auto-detect
                GlassButton("Use Current Location", icon: "location.fill", style: .secondary) {
                    vm.selectedCity = "Mumbai"
                }

                // Search
                GlassTextField(placeholder: "Search city...", text: $searchText, icon: "magnifyingglass")

                // City list
                ScrollView {
                    VStack(spacing: 6) {
                        ForEach(filteredCities, id: \.self) { city in
                            Button {
                                withAnimation(.spring(response: 0.3)) {
                                    vm.selectedCity = city
                                }
                            } label: {
                                HStack {
                                    Text(city)
                                        .font(.system(size: 15))
                                        .foregroundColor(.white)
                                    Spacer()
                                    if vm.selectedCity == city {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(AppTheme.rose)
                                    }
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                                .background(
                                    vm.selectedCity == city
                                    ? AppTheme.rose.opacity(0.15)
                                    : Color.white.opacity(0.04)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                            }
                        }
                    }
                }
                .frame(maxHeight: 300)
            }
        }
    }
}

// MARK: - Ready Step
struct ReadyStepView: View {
    @ObservedObject var vm: OnboardingViewModel
    var onComplete: () -> Void
    @State private var showConfetti = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Celebration
            ZStack {
                Circle()
                    .fill(AppTheme.rose.opacity(0.15))
                    .frame(width: 140, height: 140)
                    .scaleEffect(showConfetti ? 1.1 : 0.9)
                    .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: showConfetti)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(AppTheme.roseGradient)
                    .scaleEffect(showConfetti ? 1 : 0.5)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6), value: showConfetti)
            }

            Text("Welcome, \(vm.firstName)!")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)

            Text("You're ready to discover your Sindhi match")
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)

            // Profile preview
            GlassCard(cornerRadius: 16) {
                HStack(spacing: 14) {
                    ProfileAvatar(url: nil, name: vm.firstName, size: 56, showBorder: true)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(vm.firstName), \(vm.age)")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.white)

                        Text(vm.selectedCity ?? "")
                            .font(.system(size: 13))
                            .foregroundColor(AppTheme.textSecondary)

                        // Completeness
                        HStack(spacing: 6) {
                            ProgressView(value: 0.3)
                                .tint(AppTheme.rose)
                                .frame(width: 80)
                            Text("30%")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(AppTheme.textMuted)
                        }
                    }
                    Spacer()
                }
                .padding(16)
            }
            .padding(.horizontal)

            Spacer()

            VStack(spacing: 12) {
                GlassButton("Start Discovering", icon: "heart.circle.fill") {
                    onComplete()
                }
                .padding(.horizontal)

                Button("Complete profile later") {
                    onComplete()
                }
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
            }

            Spacer().frame(height: 20)
        }
        .onAppear { showConfetti = true }
    }
}
