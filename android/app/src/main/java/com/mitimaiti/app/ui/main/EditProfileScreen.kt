@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.models.FamilyValues
import com.mitimaiti.app.models.FoodPreference
import com.mitimaiti.app.models.SindhiFluency
import com.mitimaiti.app.ui.components.GlassCard
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.ProfileViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    viewModel: ProfileViewModel,
    onBack: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val isSaving by viewModel.isSaving.collectAsState()
    val saveSuccess by viewModel.saveSuccess.collectAsState()
    val bio by viewModel.editBio.collectAsState()
    val education by viewModel.editEducation.collectAsState()
    val occupation by viewModel.editOccupation.collectAsState()
    val company by viewModel.editCompany.collectAsState()
    val religion by viewModel.editReligion.collectAsState()
    val smoking by viewModel.editSmoking.collectAsState()
    val drinking by viewModel.editDrinking.collectAsState()
    val exercise by viewModel.editExercise.collectAsState()
    val fluency by viewModel.editFluency.collectAsState()
    val familyValues by viewModel.editFamilyValues.collectAsState()
    val foodPreference by viewModel.editFoodPreference.collectAsState()
    val scrollState = rememberScrollState()

    LaunchedEffect(saveSuccess) {
        if (saveSuccess) {
            viewModel.dismissSaveSuccess()
            onBack()
        }
    }

    Scaffold(
        containerColor = colors.background,
        topBar = {
            TopAppBar(
                title = { Text("Edit Profile", fontWeight = FontWeight.Bold, color = colors.textPrimary) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary) }
                },
                actions = {
                    TextButton(onClick = { viewModel.saveProfile() }, enabled = !isSaving) {
                        if (isSaving) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = AppColors.Rose, strokeWidth = 2.dp)
                        else Text("Save", color = AppColors.Rose, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colors.surface)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Bio
            SectionHeader("About Me")
            OutlinedTextField(
                value = bio,
                onValueChange = { viewModel.editBio.value = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Tell people about yourself...", color = colors.textMuted) },
                minLines = 3,
                maxLines = 5,
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = editFieldColors()
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Work & Education
            SectionHeader("Work & Education")
            EditField(label = "Occupation", value = occupation, onValueChange = { viewModel.editOccupation.value = it }, icon = Icons.Default.Work)
            EditField(label = "Education", value = education, onValueChange = { viewModel.editEducation.value = it }, icon = Icons.Default.School)
            EditField(label = "Company", value = company, onValueChange = { viewModel.editCompany.value = it }, icon = Icons.Default.Business)

            Spacer(modifier = Modifier.height(20.dp))

            // Lifestyle
            SectionHeader("Lifestyle")
            EditField(label = "Religion", value = religion, onValueChange = { viewModel.editReligion.value = it }, icon = Icons.Default.TempleBuddhist)
            EditField(label = "Smoking", value = smoking, onValueChange = { viewModel.editSmoking.value = it }, icon = Icons.Default.SmokeFree)
            EditField(label = "Drinking", value = drinking, onValueChange = { viewModel.editDrinking.value = it }, icon = Icons.Default.LocalBar)
            EditField(label = "Exercise", value = exercise, onValueChange = { viewModel.editExercise.value = it }, icon = Icons.Default.FitnessCenter)

            Spacer(modifier = Modifier.height(20.dp))

            // Sindhi Identity
            SectionHeader("Sindhi Identity")

            // Fluency selector
            GlassCard(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Sindhi Fluency", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = colors.textSecondary)
                    Spacer(modifier = Modifier.height(8.dp))
                    FlowRowSelector(
                        options = SindhiFluency.entries.map { it.displayName },
                        selected = fluency?.displayName,
                        onSelect = { name -> viewModel.editFluency.value = SindhiFluency.entries.firstOrNull { it.displayName == name } }
                    )
                }
            }

            // Family Values selector
            GlassCard(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Family Values", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = colors.textSecondary)
                    Spacer(modifier = Modifier.height(8.dp))
                    FlowRowSelector(
                        options = FamilyValues.entries.map { it.displayName },
                        selected = familyValues?.displayName,
                        onSelect = { name -> viewModel.editFamilyValues.value = FamilyValues.entries.firstOrNull { it.displayName == name } }
                    )
                }
            }

            // Food Preference selector
            GlassCard(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Food Preference", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = colors.textSecondary)
                    Spacer(modifier = Modifier.height(8.dp))
                    FlowRowSelector(
                        options = FoodPreference.entries.map { it.displayName },
                        selected = foodPreference?.displayName,
                        onSelect = { name -> viewModel.editFoodPreference.value = FoodPreference.entries.firstOrNull { it.displayName == name } }
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun SectionHeader(title: String) {
    val colors = LocalAdaptiveColors.current
    Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, modifier = Modifier.padding(vertical = 8.dp))
}

@Composable
fun EditField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    val colors = LocalAdaptiveColors.current
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        label = { Text(label) },
        leadingIcon = { Icon(icon, label, tint = AppColors.Rose, modifier = Modifier.size(20.dp)) },
        shape = RoundedCornerShape(AppTheme.radiusMd),
        colors = editFieldColors(),
        singleLine = true
    )
}

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun FlowRowSelector(options: List<String>, selected: String?, onSelect: (String) -> Unit) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        options.forEach { option ->
            val isSelected = option == selected
            FilterChip(
                selected = isSelected,
                onClick = { onSelect(option) },
                label = { Text(option, fontSize = 13.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = AppColors.Rose,
                    selectedLabelColor = Color.White
                )
            )
        }
    }
}

@Composable
fun editFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = AppColors.Rose,
    unfocusedBorderColor = LocalAdaptiveColors.current.border,
    focusedTextColor = LocalAdaptiveColors.current.textPrimary,
    unfocusedTextColor = LocalAdaptiveColors.current.textPrimary,
    focusedLabelColor = AppColors.Rose,
    unfocusedLabelColor = LocalAdaptiveColors.current.textMuted
)
