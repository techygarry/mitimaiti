package com.mitimaiti.app.ui.onboarding

import androidx.compose.animation.*
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.models.Gender
import com.mitimaiti.app.models.Intent
import com.mitimaiti.app.models.ShowMe
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

@Composable
fun OnboardingScreen(onComplete: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    var currentStep by remember { mutableIntStateOf(0) }
    val totalSteps = 8

    // State for all steps
    var name by remember { mutableStateOf("") }
    var birthDay by remember { mutableStateOf("") }
    var birthMonth by remember { mutableStateOf("") }
    var birthYear by remember { mutableStateOf("") }
    var selectedGender by remember { mutableStateOf<Gender?>(null) }
    var photoCount by remember { mutableIntStateOf(0) }
    var selectedIntent by remember { mutableStateOf<Intent?>(null) }
    var selectedShowMe by remember { mutableStateOf<ShowMe?>(null) }
    var location by remember { mutableStateOf("") }

    val canContinue = when (currentStep) {
        0 -> name.length >= 2
        1 -> birthDay.isNotEmpty() && birthMonth.isNotEmpty() && birthYear.length == 4
        2 -> selectedGender != null
        3 -> photoCount >= 1
        4 -> selectedIntent != null
        5 -> selectedShowMe != null
        6 -> location.isNotEmpty()
        7 -> true
        else -> false
    }

    Box(modifier = Modifier.fillMaxSize().background(colors.backgroundGradient)) {
        Column(
            modifier = Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(horizontal = 24.dp)
        ) {
            // Top bar with back and progress
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (currentStep > 0) {
                    IconButton(onClick = { currentStep-- }) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary)
                    }
                } else {
                    Spacer(modifier = Modifier.size(48.dp))
                }
                Spacer(modifier = Modifier.weight(1f))
                Text("${currentStep + 1}/$totalSteps", fontSize = 14.sp, color = colors.textMuted)
            }

            // Progress indicator
            @Suppress("DEPRECATION")
            LinearProgressIndicator(
                progress = (currentStep + 1).toFloat() / totalSteps,
                modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp)),
                color = AppColors.Rose,
                trackColor = colors.border
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Step content
            Box(modifier = Modifier.weight(1f)) {
                when (currentStep) {
                    0 -> NameStep(name = name, onNameChange = { name = it })
                    1 -> BirthdayStep(day = birthDay, month = birthMonth, year = birthYear, onDayChange = { birthDay = it }, onMonthChange = { birthMonth = it }, onYearChange = { birthYear = it })
                    2 -> GenderStep(selected = selectedGender, onSelect = { selectedGender = it })
                    3 -> PhotosStep(count = photoCount, onAddPhoto = { photoCount++ })
                    4 -> IntentStep(selected = selectedIntent, onSelect = { selectedIntent = it })
                    5 -> ShowMeStep(selected = selectedShowMe, onSelect = { selectedShowMe = it })
                    6 -> LocationStep(location = location, onLocationChange = { location = it })
                    7 -> ReadyStep(name = name)
                }
            }

            // Continue button
            Button(
                onClick = {
                    if (currentStep < totalSteps - 1) currentStep++ else onComplete()
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                enabled = canContinue,
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose, disabledContainerColor = AppColors.Rose.copy(alpha = 0.4f))
            ) {
                Text(
                    if (currentStep == totalSteps - 1) "Start Discovering" else "Continue",
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
fun NameStep(name: String, onNameChange: (String) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text("What's your\nfirst name?", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, lineHeight = 36.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text("This is how you'll appear on MitiMaiti", fontSize = 16.sp, color = colors.textSecondary)
        Spacer(modifier = Modifier.height(32.dp))
        OutlinedTextField(
            value = name,
            onValueChange = onNameChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Your first name", color = colors.textMuted) },
            shape = RoundedCornerShape(AppTheme.radiusMd),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AppColors.Rose, unfocusedBorderColor = colors.border, focusedTextColor = colors.textPrimary, unfocusedTextColor = colors.textPrimary),
            singleLine = true
        )
    }
}

@Composable
fun BirthdayStep(day: String, month: String, year: String, onDayChange: (String) -> Unit, onMonthChange: (String) -> Unit, onYearChange: (String) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text("When's your\nbirthday?", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, lineHeight = 36.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Your age will be shown on your profile", fontSize = 16.sp, color = colors.textSecondary)
        Spacer(modifier = Modifier.height(32.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
                value = day, onValueChange = { if (it.length <= 2) onDayChange(it) },
                modifier = Modifier.weight(1f), placeholder = { Text("DD", color = colors.textMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AppColors.Rose, unfocusedBorderColor = colors.border, focusedTextColor = colors.textPrimary, unfocusedTextColor = colors.textPrimary),
                singleLine = true
            )
            OutlinedTextField(
                value = month, onValueChange = { if (it.length <= 2) onMonthChange(it) },
                modifier = Modifier.weight(1f), placeholder = { Text("MM", color = colors.textMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AppColors.Rose, unfocusedBorderColor = colors.border, focusedTextColor = colors.textPrimary, unfocusedTextColor = colors.textPrimary),
                singleLine = true
            )
            OutlinedTextField(
                value = year, onValueChange = { if (it.length <= 4) onYearChange(it) },
                modifier = Modifier.weight(1.5f), placeholder = { Text("YYYY", color = colors.textMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AppColors.Rose, unfocusedBorderColor = colors.border, focusedTextColor = colors.textPrimary, unfocusedTextColor = colors.textPrimary),
                singleLine = true
            )
        }
    }
}

@Composable
fun GenderStep(selected: Gender?, onSelect: (Gender) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text("What's your\ngender?", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, lineHeight = 36.sp)
        Spacer(modifier = Modifier.height(32.dp))
        Gender.entries.forEach { gender ->
            val isSelected = gender == selected
            Surface(
                onClick = { onSelect(gender) },
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = if (isSelected) AppColors.Rose.copy(alpha = 0.1f) else colors.surface,
                border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, AppColors.Rose) else androidx.compose.foundation.BorderStroke(1.dp, colors.border)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(gender.displayName, fontSize = 17.sp, fontWeight = FontWeight.Medium, color = if (isSelected) AppColors.Rose else colors.textPrimary)
                    if (isSelected) Icon(Icons.Default.CheckCircle, null, tint = AppColors.Rose, modifier = Modifier.size(24.dp))
                }
            }
        }
    }
}

@Composable
fun PhotosStep(count: Int, onAddPhoto: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text("Add your\nbest photos", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, lineHeight = 36.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Add at least 1 photo to continue. Profiles with 3+ photos get more matches!", fontSize = 16.sp, color = colors.textSecondary)
        Spacer(modifier = Modifier.height(32.dp))

        // Photo grid (3x2)
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            for (row in 0..1) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    for (col in 0..2) {
                        val index = row * 3 + col
                        val hasFilled = index < count
                        Surface(
                            onClick = { if (!hasFilled) onAddPhoto() },
                            modifier = Modifier.weight(1f).aspectRatio(0.8f),
                            shape = RoundedCornerShape(AppTheme.radiusMd),
                            color = if (hasFilled) AppColors.Rose.copy(alpha = 0.1f) else colors.surfaceMedium,
                            border = if (hasFilled) null else androidx.compose.foundation.BorderStroke(2.dp, colors.border.copy(alpha = 0.5f))
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                if (hasFilled) {
                                    Icon(Icons.Default.Check, "Photo added", tint = AppColors.Rose, modifier = Modifier.size(32.dp))
                                } else {
                                    Icon(Icons.Default.Add, "Add photo", tint = colors.textMuted, modifier = Modifier.size(32.dp))
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Text("$count/6 photos added", fontSize = 14.sp, color = colors.textMuted, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
fun IntentStep(selected: Intent?, onSelect: (Intent) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text("What are you\nlooking for?", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, lineHeight = 36.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text("This helps us find better matches for you", fontSize = 16.sp, color = colors.textSecondary)
        Spacer(modifier = Modifier.height(32.dp))
        Intent.entries.forEach { intent ->
            val isSelected = intent == selected
            val intentColor = Color(intent.color)
            Surface(
                onClick = { onSelect(intent) },
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = if (isSelected) intentColor.copy(alpha = 0.1f) else colors.surface,
                border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, intentColor) else androidx.compose.foundation.BorderStroke(1.dp, colors.border)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(intent.displayName, fontSize = 17.sp, fontWeight = FontWeight.Medium, color = if (isSelected) intentColor else colors.textPrimary)
                    if (isSelected) Icon(Icons.Default.CheckCircle, null, tint = intentColor, modifier = Modifier.size(24.dp))
                }
            }
        }
    }
}

@Composable
fun ShowMeStep(selected: ShowMe?, onSelect: (ShowMe) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text("Show me", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Who would you like to see?", fontSize = 16.sp, color = colors.textSecondary)
        Spacer(modifier = Modifier.height(32.dp))
        ShowMe.entries.forEach { option ->
            val isSelected = option == selected
            Surface(
                onClick = { onSelect(option) },
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = if (isSelected) AppColors.Rose.copy(alpha = 0.1f) else colors.surface,
                border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, AppColors.Rose) else androidx.compose.foundation.BorderStroke(1.dp, colors.border)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(option.displayName, fontSize = 17.sp, fontWeight = FontWeight.Medium, color = if (isSelected) AppColors.Rose else colors.textPrimary)
                    if (isSelected) Icon(Icons.Default.CheckCircle, null, tint = AppColors.Rose, modifier = Modifier.size(24.dp))
                }
            }
        }
    }
}

@Composable
fun LocationStep(location: String, onLocationChange: (String) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Text("Where are\nyou based?", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, lineHeight = 36.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text("We'll show you people nearby", fontSize = 16.sp, color = colors.textSecondary)
        Spacer(modifier = Modifier.height(32.dp))
        OutlinedTextField(
            value = location,
            onValueChange = onLocationChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("City name", color = colors.textMuted) },
            leadingIcon = { Icon(Icons.Default.LocationOn, null, tint = AppColors.Rose) },
            shape = RoundedCornerShape(AppTheme.radiusMd),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AppColors.Rose, unfocusedBorderColor = colors.border, focusedTextColor = colors.textPrimary, unfocusedTextColor = colors.textPrimary),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(12.dp))
        TextButton(onClick = { onLocationChange("Mumbai") }) {
            Icon(Icons.Default.MyLocation, null, tint = AppColors.Rose, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Use current location", color = AppColors.Rose, fontSize = 15.sp)
        }
    }
}

@Composable
fun ReadyStep(name: String) {
    val colors = LocalAdaptiveColors.current
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("You're all set,\n$name!", fontSize = 32.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, textAlign = TextAlign.Center, lineHeight = 40.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "Your profile is ready. Start discovering meaningful connections in the Sindhi community!",
            fontSize = 16.sp,
            color = colors.textSecondary,
            textAlign = TextAlign.Center,
            lineHeight = 24.sp,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
        Spacer(modifier = Modifier.height(32.dp))
        Icon(
            Icons.Default.Favorite,
            "Heart",
            tint = AppColors.Rose,
            modifier = Modifier.size(64.dp)
        )
    }
}
