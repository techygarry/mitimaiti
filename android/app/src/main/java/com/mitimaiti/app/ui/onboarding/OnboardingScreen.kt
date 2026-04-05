@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.onboarding

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mitimaiti.app.models.Gender
import com.mitimaiti.app.models.Intent
import com.mitimaiti.app.models.ShowMe
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.OnboardingStep
import com.mitimaiti.app.viewmodels.OnboardingViewModel

@Composable
fun OnboardingScreen(onComplete: () -> Unit) {
    val viewModel: OnboardingViewModel = viewModel()
    val colors = LocalAdaptiveColors.current
    val currentStep by viewModel.currentStep.collectAsState()
    val totalSteps = OnboardingStep.entries.size
    val stepIndex = OnboardingStep.entries.indexOf(currentStep)

    val firstName by viewModel.firstName.collectAsState()
    val birthDay by viewModel.birthDay.collectAsState()
    val birthMonth by viewModel.birthMonth.collectAsState()
    val birthYear by viewModel.birthYear.collectAsState()
    val selectedGender by viewModel.selectedGender.collectAsState()
    val selectedPhotos by viewModel.selectedPhotos.collectAsState()
    val selectedIntent by viewModel.selectedIntent.collectAsState()
    val selectedShowMe by viewModel.selectedShowMe.collectAsState()
    val selectedCity by viewModel.selectedCity.collectAsState()
    val progress by remember { derivedStateOf { viewModel.progress } }
    val canProceed by remember { derivedStateOf { viewModel.canProceed } }
    val age by remember { derivedStateOf { viewModel.age } }

    // Track direction for slide animation
    var lastStep by remember { mutableIntStateOf(0) }
    val isForward = stepIndex >= lastStep
    LaunchedEffect(stepIndex) { lastStep = stepIndex }

    Box(modifier = Modifier.fillMaxSize().background(colors.backgroundGradient)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp)
        ) {
            // Top bar: back button + step counter
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (stepIndex > 0) {
                    IconButton(onClick = { viewModel.previousStep() }) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary)
                    }
                } else {
                    Spacer(modifier = Modifier.size(48.dp))
                }
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    "${stepIndex + 1}/$totalSteps",
                    fontSize = 14.sp,
                    color = colors.textMuted
                )
            }

            // Progress bar (rose colored, animated)
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp)),
                color = AppColors.Rose,
                trackColor = colors.border,
                drawStopIndicator = {}
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Step content with animated transitions (slide left/right)
            Box(modifier = Modifier.weight(1f)) {
                AnimatedContent(
                    targetState = currentStep,
                    transitionSpec = {
                        if (isForward) {
                            (slideInHorizontally(
                                initialOffsetX = { it },
                                animationSpec = spring(stiffness = Spring.StiffnessMediumLow)
                            ) + fadeIn(animationSpec = tween(300)))
                                .togetherWith(
                                    slideOutHorizontally(
                                        targetOffsetX = { -it },
                                        animationSpec = spring(stiffness = Spring.StiffnessMediumLow)
                                    ) + fadeOut(animationSpec = tween(300))
                                )
                        } else {
                            (slideInHorizontally(
                                initialOffsetX = { -it },
                                animationSpec = spring(stiffness = Spring.StiffnessMediumLow)
                            ) + fadeIn(animationSpec = tween(300)))
                                .togetherWith(
                                    slideOutHorizontally(
                                        targetOffsetX = { it },
                                        animationSpec = spring(stiffness = Spring.StiffnessMediumLow)
                                    ) + fadeOut(animationSpec = tween(300))
                                )
                        }
                    },
                    label = "onboarding_step"
                ) { step ->
                    when (step) {
                        OnboardingStep.NAME -> NameStep(
                            name = firstName,
                            onNameChange = { viewModel.firstName.value = it }
                        )
                        OnboardingStep.BIRTHDAY -> BirthdayStep(
                            day = birthDay,
                            month = birthMonth,
                            year = birthYear,
                            age = age,
                            onDayChange = { viewModel.birthDay.value = it },
                            onMonthChange = { viewModel.birthMonth.value = it },
                            onYearChange = { viewModel.birthYear.value = it }
                        )
                        OnboardingStep.GENDER -> GenderStep(
                            selected = selectedGender,
                            onSelect = { viewModel.selectedGender.value = it }
                        )
                        OnboardingStep.PHOTOS -> PhotosStep(
                            count = selectedPhotos.size,
                            onAddPhoto = {
                                // Simulate adding a photo with a dummy URI
                                viewModel.addPhoto(android.net.Uri.parse("content://photo/${selectedPhotos.size}"))
                            }
                        )
                        OnboardingStep.INTENT -> IntentStep(
                            selected = selectedIntent,
                            onSelect = { viewModel.selectedIntent.value = it }
                        )
                        OnboardingStep.SHOW_ME -> ShowMeStep(
                            selected = selectedShowMe,
                            onSelect = { viewModel.selectedShowMe.value = it }
                        )
                        OnboardingStep.LOCATION -> LocationStep(
                            location = selectedCity,
                            onLocationChange = { viewModel.selectedCity.value = it }
                        )
                        OnboardingStep.READY -> ReadyStep(name = firstName)
                    }
                }
            }

            // Next / Let's Go button
            Button(
                onClick = {
                    if (currentStep == OnboardingStep.READY) onComplete() else viewModel.nextStep()
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                enabled = canProceed,
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AppColors.Rose,
                    disabledContainerColor = AppColors.Rose.copy(alpha = 0.4f)
                )
            ) {
                Text(
                    if (currentStep == OnboardingStep.READY) "Start Discovering" else "Continue",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun NameStep(name: String, onNameChange: (String) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text(
            "What's your\nfirst name?",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            lineHeight = 36.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "This is how you'll appear on MitiMaiti",
            fontSize = 16.sp,
            color = colors.textSecondary
        )
        Spacer(modifier = Modifier.height(32.dp))
        OutlinedTextField(
            value = name,
            onValueChange = onNameChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Your first name", color = colors.textMuted) },
            shape = RoundedCornerShape(AppTheme.radiusMd),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AppColors.Rose,
                unfocusedBorderColor = colors.border,
                focusedTextColor = colors.textPrimary,
                unfocusedTextColor = colors.textPrimary
            ),
            singleLine = true
        )
    }
}

@Composable
private fun BirthdayStep(
    day: String,
    month: String,
    year: String,
    age: Int?,
    onDayChange: (String) -> Unit,
    onMonthChange: (String) -> Unit,
    onYearChange: (String) -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val isUnderage = age != null && age < 18

    Column {
        Text(
            "When's your\nbirthday?",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            lineHeight = 36.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Your age will be shown on your profile",
            fontSize = 16.sp,
            color = colors.textSecondary
        )
        Spacer(modifier = Modifier.height(32.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
                value = day,
                onValueChange = { if (it.length <= 2 && it.all { c -> c.isDigit() }) onDayChange(it) },
                modifier = Modifier.weight(1f),
                placeholder = { Text("DD", color = colors.textMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AppColors.Rose,
                    unfocusedBorderColor = colors.border,
                    focusedTextColor = colors.textPrimary,
                    unfocusedTextColor = colors.textPrimary
                ),
                singleLine = true
            )
            OutlinedTextField(
                value = month,
                onValueChange = { if (it.length <= 2 && it.all { c -> c.isDigit() }) onMonthChange(it) },
                modifier = Modifier.weight(1f),
                placeholder = { Text("MM", color = colors.textMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AppColors.Rose,
                    unfocusedBorderColor = colors.border,
                    focusedTextColor = colors.textPrimary,
                    unfocusedTextColor = colors.textPrimary
                ),
                singleLine = true
            )
            OutlinedTextField(
                value = year,
                onValueChange = { if (it.length <= 4 && it.all { c -> c.isDigit() }) onYearChange(it) },
                modifier = Modifier.weight(1.5f),
                placeholder = { Text("YYYY", color = colors.textMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AppColors.Rose,
                    unfocusedBorderColor = colors.border,
                    focusedTextColor = colors.textPrimary,
                    unfocusedTextColor = colors.textPrimary
                ),
                singleLine = true
            )
        }

        // Show calculated age
        if (age != null) {
            Spacer(modifier = Modifier.height(12.dp))
            if (isUnderage) {
                Text(
                    "You must be at least 18 years old to use MitiMaiti",
                    fontSize = 14.sp,
                    color = AppColors.Error,
                    fontWeight = FontWeight.Medium
                )
            } else {
                Text(
                    "Age: $age years old",
                    fontSize = 14.sp,
                    color = AppColors.Success,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
private fun GenderStep(selected: Gender?, onSelect: (Gender) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text(
            "What's your\ngender?",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            lineHeight = 36.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Select how you identify",
            fontSize = 16.sp,
            color = colors.textSecondary
        )
        Spacer(modifier = Modifier.height(32.dp))

        Gender.entries.forEach { gender ->
            val isSelected = gender == selected
            Surface(
                onClick = { onSelect(gender) },
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = if (isSelected) AppColors.Rose.copy(alpha = 0.1f) else colors.surface,
                border = if (isSelected) BorderStroke(2.dp, AppColors.Rose)
                else BorderStroke(1.dp, colors.border)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        gender.displayName,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isSelected) AppColors.Rose else colors.textPrimary
                    )
                    if (isSelected) {
                        Icon(
                            Icons.Default.CheckCircle, null,
                            tint = AppColors.Rose,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PhotosStep(count: Int, onAddPhoto: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text(
            "Add your\nbest photos",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            lineHeight = 36.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Add at least 1 photo to continue. Profiles with 3+ photos get more matches!",
            fontSize = 16.sp,
            color = colors.textSecondary
        )
        Spacer(modifier = Modifier.height(32.dp))

        // 3x2 grid of photo slots
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            for (row in 0..1) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    for (col in 0..2) {
                        val index = row * 3 + col
                        val hasFilled = index < count
                        Surface(
                            onClick = { if (!hasFilled) onAddPhoto() },
                            modifier = Modifier.weight(1f).aspectRatio(0.8f),
                            shape = RoundedCornerShape(AppTheme.radiusMd),
                            color = if (hasFilled) AppColors.Rose.copy(alpha = 0.1f) else colors.surfaceMedium,
                            border = if (hasFilled) null
                            else BorderStroke(2.dp, colors.border.copy(alpha = 0.5f))
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                if (hasFilled) {
                                    Icon(
                                        Icons.Default.Check,
                                        "Photo added",
                                        tint = AppColors.Rose,
                                        modifier = Modifier.size(32.dp)
                                    )
                                } else {
                                    Icon(
                                        Icons.Default.CameraAlt,
                                        "Add photo",
                                        tint = colors.textMuted,
                                        modifier = Modifier.size(32.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Text(
            "$count/6 photos added",
            fontSize = 14.sp,
            color = colors.textMuted,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun IntentStep(selected: Intent?, onSelect: (Intent) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text(
            "What are you\nlooking for?",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            lineHeight = 36.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "This helps us find better matches for you",
            fontSize = 16.sp,
            color = colors.textSecondary
        )
        Spacer(modifier = Modifier.height(32.dp))

        Intent.entries.forEach { intent ->
            val isSelected = intent == selected
            val intentColor = Color(intent.color)
            Surface(
                onClick = { onSelect(intent) },
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = if (isSelected) intentColor.copy(alpha = 0.1f) else colors.surface,
                border = if (isSelected) BorderStroke(2.dp, intentColor)
                else BorderStroke(1.dp, colors.border)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        intent.displayName,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isSelected) intentColor else colors.textPrimary
                    )
                    if (isSelected) {
                        Icon(
                            Icons.Default.CheckCircle, null,
                            tint = intentColor,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ShowMeStep(selected: ShowMe?, onSelect: (ShowMe) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text(
            "Show me",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Who would you like to see?",
            fontSize = 16.sp,
            color = colors.textSecondary
        )
        Spacer(modifier = Modifier.height(32.dp))

        ShowMe.entries.forEach { option ->
            val isSelected = option == selected
            Surface(
                onClick = { onSelect(option) },
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = if (isSelected) AppColors.Rose.copy(alpha = 0.1f) else colors.surface,
                border = if (isSelected) BorderStroke(2.dp, AppColors.Rose)
                else BorderStroke(1.dp, colors.border)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        option.displayName,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isSelected) AppColors.Rose else colors.textPrimary
                    )
                    if (isSelected) {
                        Icon(
                            Icons.Default.CheckCircle, null,
                            tint = AppColors.Rose,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun LocationStep(location: String, onLocationChange: (String) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text(
            "Where are\nyou based?",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            lineHeight = 36.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "We'll show you people nearby",
            fontSize = 16.sp,
            color = colors.textSecondary
        )
        Spacer(modifier = Modifier.height(32.dp))
        OutlinedTextField(
            value = location,
            onValueChange = onLocationChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("City name", color = colors.textMuted) },
            leadingIcon = { Icon(Icons.Default.LocationOn, null, tint = AppColors.Rose) },
            shape = RoundedCornerShape(AppTheme.radiusMd),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AppColors.Rose,
                unfocusedBorderColor = colors.border,
                focusedTextColor = colors.textPrimary,
                unfocusedTextColor = colors.textPrimary
            ),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(12.dp))
        TextButton(onClick = { onLocationChange("Mumbai") }) {
            Icon(
                Icons.Default.MyLocation, null,
                tint = AppColors.Rose,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text("Use current location", color = AppColors.Rose, fontSize = 15.sp)
        }
    }
}

@Composable
private fun ReadyStep(name: String) {
    val colors = LocalAdaptiveColors.current

    // Confetti particles
    val confettiColors = listOf(AppColors.Rose, AppColors.Gold, AppColors.Saffron, AppColors.Success, AppColors.Info)
    val infiniteTransition = rememberInfiniteTransition(label = "confetti")

    Box(modifier = Modifier.fillMaxSize()) {
        // Confetti layer
        repeat(20) { i ->
            val xOffset by infiniteTransition.animateFloat(
                initialValue = (-200..400).random().toFloat(),
                targetValue = (-200..400).random().toFloat(),
                animationSpec = infiniteRepeatable(
                    animation = tween((3000..6000).random(), easing = LinearEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "confettiX$i"
            )
            val yOffset by infiniteTransition.animateFloat(
                initialValue = -50f,
                targetValue = 800f,
                animationSpec = infiniteRepeatable(
                    animation = tween((4000..8000).random(), easing = LinearEasing),
                    repeatMode = RepeatMode.Restart,
                    initialStartOffset = StartOffset((0..3000).random())
                ),
                label = "confettiY$i"
            )
            Box(
                modifier = Modifier
                    .offset(x = xOffset.dp, y = yOffset.dp)
                    .size(if (i % 3 == 0) 8.dp else 6.dp)
                    .background(
                        confettiColors[i % confettiColors.size].copy(alpha = 0.6f),
                        if (i % 2 == 0) CircleShape else RoundedCornerShape(2.dp)
                    )
            )
        }

        // Main content
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Welcome text
            Text(
                "Welcome to the Sindhi community,",
                fontSize = 16.sp,
                color = colors.textSecondary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                name,
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Profile preview card
            Surface(
                modifier = Modifier
                    .padding(horizontal = 32.dp)
                    .fillMaxWidth(),
                shape = RoundedCornerShape(AppTheme.radiusCard),
                color = colors.cardDark,
                shadowElevation = 12.dp
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(
                                Brush.linearGradient(listOf(AppColors.Rose.copy(alpha = 0.7f), AppColors.RoseDark.copy(alpha = 0.5f))),
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            name.take(1).uppercase(),
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(name, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Profile created", fontSize = 14.sp, color = AppColors.Success)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // "Complete your Sindhi Identity" card
            Surface(
                modifier = Modifier
                    .padding(horizontal = 32.dp)
                    .fillMaxWidth(),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = AppColors.Gold.copy(alpha = 0.1f)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.AutoAwesome, null, tint = AppColors.Gold, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Complete your Sindhi Identity",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = AppColors.Gold
                        )
                        Text(
                            "Add fluency, gotra & festivals for 3x more matches",
                            fontSize = 12.sp,
                            color = colors.textSecondary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                "Start discovering meaningful connections!",
                fontSize = 15.sp,
                color = colors.textSecondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 32.dp)
            )
        }
    }
}
