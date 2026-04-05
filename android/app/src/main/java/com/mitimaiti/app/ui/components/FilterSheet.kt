package com.mitimaiti.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.models.*
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

data class FilterState(
    val ageMin: Int = 21,
    val ageMax: Int = 35,
    val heightMin: Int = 150,
    val heightMax: Int = 190,
    val genderPreference: ShowMe = ShowMe.EVERYONE,
    val intentFilter: Intent? = null,
    val verifiedOnly: Boolean = false,
    val fluencyFilter: SindhiFluency? = null,
    val generationFilter: String? = null,
    val religionFilter: String? = null,
    val gotraFilter: String? = null,
    val dietaryFilter: FoodPreference? = null,
    val educationFilter: String? = null,
    val smokingFilter: String? = null,
    val drinkingFilter: String? = null,
    val familyPlansFilter: String? = null,
    val exerciseFilter: String? = null
)

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun FilterSheet(
    filterState: FilterState,
    onFilterChanged: (FilterState) -> Unit,
    onDismiss: () -> Unit,
    onReset: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    var state by remember { mutableStateOf(filterState) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = colors.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 12.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(colors.textMuted.copy(alpha = 0.3f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Filters",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    TextButton(onClick = {
                        state = FilterState()
                        onReset()
                    }) {
                        Text("Reset", color = colors.textMuted)
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, "Close", tint = colors.textSecondary)
                    }
                }
            }

            // Age Range
            FilterSection(title = "Age Range") {
                Text(
                    text = "${state.ageMin} - ${state.ageMax}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = AppColors.Rose
                )
                RangeSlider(
                    value = state.ageMin.toFloat()..state.ageMax.toFloat(),
                    onValueChange = { range ->
                        state = state.copy(ageMin = range.start.toInt(), ageMax = range.endInclusive.toInt())
                    },
                    valueRange = 18f..60f,
                    steps = 41,
                    colors = SliderDefaults.colors(
                        thumbColor = AppColors.Rose,
                        activeTrackColor = AppColors.Rose,
                        inactiveTrackColor = AppColors.Rose.copy(alpha = 0.15f)
                    )
                )
            }

            // Height Range
            FilterSection(title = "Height Range") {
                Text(
                    text = "${state.heightMin} cm - ${state.heightMax} cm",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = AppColors.Rose
                )
                RangeSlider(
                    value = state.heightMin.toFloat()..state.heightMax.toFloat(),
                    onValueChange = { range ->
                        state = state.copy(heightMin = range.start.toInt(), heightMax = range.endInclusive.toInt())
                    },
                    valueRange = 140f..210f,
                    steps = 69,
                    colors = SliderDefaults.colors(
                        thumbColor = AppColors.Rose,
                        activeTrackColor = AppColors.Rose,
                        inactiveTrackColor = AppColors.Rose.copy(alpha = 0.15f)
                    )
                )
            }

            // Show Me
            FilterSection(title = "Show Me") {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ShowMe.entries.forEach { option ->
                        FilterChip(
                            selected = state.genderPreference == option,
                            onClick = { state = state.copy(genderPreference = option) },
                            label = { Text(option.displayName) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Intent
            FilterSection(title = "Intent") {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Intent.entries.forEach { option ->
                        FilterChip(
                            selected = state.intentFilter == option,
                            onClick = {
                                state = state.copy(intentFilter = if (state.intentFilter == option) null else option)
                            },
                            label = { Text(option.displayName) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(option.color).copy(alpha = 0.15f),
                                selectedLabelColor = Color(option.color)
                            )
                        )
                    }
                }
            }

            // Verified Only
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Verified Only", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                Switch(
                    checked = state.verifiedOnly,
                    onCheckedChange = { state = state.copy(verifiedOnly = it) },
                    colors = SwitchDefaults.colors(checkedTrackColor = AppColors.Rose)
                )
            }

            HorizontalDivider(color = colors.borderSubtle)

            // Sindhi Fluency
            FilterSection(title = "Sindhi Fluency") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SindhiFluency.entries.forEach { option ->
                        FilterChip(
                            selected = state.fluencyFilter == option,
                            onClick = { state = state.copy(fluencyFilter = if (state.fluencyFilter == option) null else option) },
                            label = { Text(option.displayName, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Generation
            FilterSection(title = "Generation") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("1st", "2nd", "3rd", "4th+").forEach { gen ->
                        FilterChip(
                            selected = state.generationFilter == gen,
                            onClick = { state = state.copy(generationFilter = if (state.generationFilter == gen) null else gen) },
                            label = { Text(gen, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Religion
            FilterSection(title = "Religion") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Hindu", "Muslim", "Sikh", "Christian", "Other").forEach { religion ->
                        FilterChip(
                            selected = state.religionFilter == religion,
                            onClick = { state = state.copy(religionFilter = if (state.religionFilter == religion) null else religion) },
                            label = { Text(religion, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Dietary
            FilterSection(title = "Dietary Preference") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    FoodPreference.entries.forEach { option ->
                        FilterChip(
                            selected = state.dietaryFilter == option,
                            onClick = { state = state.copy(dietaryFilter = if (state.dietaryFilter == option) null else option) },
                            label = { Text(option.displayName, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            HorizontalDivider(color = colors.borderSubtle)

            // Education
            FilterSection(title = "Education") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("High School", "Bachelor's", "Master's", "Doctorate", "Other").forEach { edu ->
                        FilterChip(
                            selected = state.educationFilter == edu,
                            onClick = { state = state.copy(educationFilter = if (state.educationFilter == edu) null else edu) },
                            label = { Text(edu, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Smoking
            FilterSection(title = "Smoking") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Never", "Sometimes", "Regularly").forEach { option ->
                        FilterChip(
                            selected = state.smokingFilter == option,
                            onClick = { state = state.copy(smokingFilter = if (state.smokingFilter == option) null else option) },
                            label = { Text(option, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Drinking
            FilterSection(title = "Drinking") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Never", "Sometimes", "Regularly").forEach { option ->
                        FilterChip(
                            selected = state.drinkingFilter == option,
                            onClick = { state = state.copy(drinkingFilter = if (state.drinkingFilter == option) null else option) },
                            label = { Text(option, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Family Plans
            FilterSection(title = "Family Plans") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Want kids", "Don't want kids", "Open to kids", "Have kids").forEach { option ->
                        FilterChip(
                            selected = state.familyPlansFilter == option,
                            onClick = { state = state.copy(familyPlansFilter = if (state.familyPlansFilter == option) null else option) },
                            label = { Text(option, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Exercise
            FilterSection(title = "Exercise") {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Active", "Sometimes", "Rarely", "Never").forEach { option ->
                        FilterChip(
                            selected = state.exerciseFilter == option,
                            onClick = { state = state.copy(exerciseFilter = if (state.exerciseFilter == option) null else option) },
                            label = { Text(option, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AppColors.Rose.copy(alpha = 0.15f),
                                selectedLabelColor = AppColors.Rose
                            )
                        )
                    }
                }
            }

            // Apply Button
            Button(
                onClick = {
                    onFilterChanged(state)
                    onDismiss()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
            ) {
                Text("Apply Filters", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun FilterSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    val colors = LocalAdaptiveColors.current
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = title,
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = colors.textPrimary
        )
        content()
    }
}
