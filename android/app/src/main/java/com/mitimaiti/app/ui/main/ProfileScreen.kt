@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.models.Intent
import com.mitimaiti.app.models.User
import com.mitimaiti.app.services.PhotoRepository
import com.mitimaiti.app.ui.components.*
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.ProfileViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel,
    onEditProfile: () -> Unit,
    onSettings: () -> Unit,
    onLogout: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val user by viewModel.user.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val repoPhotos by PhotoRepository.photos.collectAsState()
    var showPhotoPicker by remember { mutableStateOf(false) }

    if (isLoading || user == null) {
        Column(
            modifier = Modifier.fillMaxSize().statusBarsPadding().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            ShimmerProfileCard()
        }
        return
    }

    val profile = user!!
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.backgroundGradient)
            .statusBarsPadding()
            .verticalScroll(scrollState)
    ) {
        // Top bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Profile",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary
            )
            IconButton(onClick = onSettings) {
                Icon(Icons.Default.Settings, "Settings", tint = colors.textSecondary)
            }
        }

        // Profile card with gradient header + avatar
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(AppTheme.radiusCard),
            color = colors.surface,
            shadowElevation = 4.dp
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                // Gradient header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .background(
                            Brush.linearGradient(listOf(AppColors.Rose, AppColors.RoseDark))
                        ),
                    contentAlignment = Alignment.BottomCenter
                ) {
                    // Avatar overlapping the gradient
                    Box(
                        modifier = Modifier
                            .offset(y = 40.dp)
                            .size(88.dp)
                            .clip(CircleShape)
                            .background(Color.White, CircleShape)
                            .border(3.dp, Color.White, CircleShape)
                            .clickable { showPhotoPicker = true },
                        contentAlignment = Alignment.Center
                    ) {
                        AsyncImage(
                            model = PhotoRepository.primaryPhotoUri
                                ?: profile.primaryPhoto?.url
                                ?: "",
                            contentDescription = profile.displayName,
                            modifier = Modifier
                                .size(82.dp)
                                .clip(CircleShape),
                            contentScale = ContentScale.Crop
                        )
                    }
                }

                // Camera badge
                Box(
                    modifier = Modifier
                        .offset(x = 30.dp, y = (-4).dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(AppColors.Rose, CircleShape)
                        .border(2.dp, Color.White, CircleShape)
                        .clickable { showPhotoPicker = true },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.CameraAlt, null,
                        tint = Color.White,
                        modifier = Modifier.size(14.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Name, age, verified
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        profile.displayName,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    profile.age?.let {
                        Text(", $it", fontSize = 20.sp, color = colors.textSecondary)
                    }
                    if (profile.isVerified) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            Icons.Default.Verified, "Verified",
                            tint = AppColors.Info,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                // Location
                if (profile.city.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.LocationOn, null,
                            tint = colors.textMuted,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            "${profile.city}, ${profile.country}",
                            fontSize = 14.sp,
                            color = colors.textSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Edit Profile button
                OutlinedButton(
                    onClick = onEditProfile,
                    shape = RoundedCornerShape(AppTheme.radiusFull),
                    border = BorderStroke(1.dp, AppColors.Rose),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = AppColors.Rose),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Edit, null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Edit Profile", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Profile Completeness card
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(AppTheme.radiusMd),
            color = colors.surface,
            shadowElevation = 2.dp
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Profile Completeness",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textPrimary
                    )
                    Text(
                        "${profile.profileCompleteness}%",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.Rose
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                LinearProgressIndicator(
                    progress = { profile.profileCompleteness / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = AppColors.Rose,
                    trackColor = colors.border,
                    drawStopIndicator = {}
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    "Complete your profile to get better matches",
                    fontSize = 12.sp,
                    color = colors.textMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Stats row
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(AppTheme.radiusMd),
            color = colors.surface,
            shadowElevation = 2.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatItem(Icons.Default.Visibility, "Views", viewModel.profileStats.views.toString())
                StatItem(Icons.Default.FavoriteBorder, "Likes", viewModel.profileStats.likes.toString())
                StatItem(Icons.Default.ChatBubbleOutline, "Matches", viewModel.profileStats.matches.toString())
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Profile sections with field counts
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(AppTheme.radiusMd),
            color = colors.surface,
            shadowElevation = 2.dp
        ) {
            Column {
                val basicsFields = listOf(profile.education, profile.occupation, profile.company,
                    profile.heightCm?.toString(), profile.religion, profile.smoking, profile.drinking, profile.exercise)
                val basicsCount = basicsFields.count { !it.isNullOrEmpty() }

                val sindhiFields = listOf(profile.sindhiFluency?.displayName, profile.sindhiDialect,
                    profile.generation, profile.gotra, profile.familyOriginCity)
                val sindhiCount = sindhiFields.count { !it.isNullOrEmpty() }

                val chattiFields = listOf(profile.wantKids, profile.settlingTimeline, profile.exercise,
                    profile.smoking, profile.drinking, profile.religion, profile.bio.ifEmpty { null })
                val chattiCount = chattiFields.count { !it.isNullOrEmpty() }

                val cultureFields = listOf(profile.familyValues?.displayName,
                    profile.foodPreference?.displayName, profile.festivalsCelebrated.ifEmpty { null }?.toString())
                val cultureCount = cultureFields.count { it != null }

                val personalityFields = listOf(
                    profile.interests.ifEmpty { null }?.toString(),
                    profile.musicPreferences.ifEmpty { null }?.toString(),
                    profile.movieGenres.ifEmpty { null }?.toString(),
                    profile.travelStyle,
                    profile.languages.ifEmpty { null }?.toString()
                )
                val personalityCount = personalityFields.count { !it.isNullOrEmpty() }

                ProfileSectionRow("My Basics", "$basicsCount/8 fields", onEditProfile)
                HorizontalDivider(color = colors.border.copy(alpha = 0.5f))
                ProfileSectionRow("My Sindhi Identity", "$sindhiCount/5 fields", onEditProfile)
                HorizontalDivider(color = colors.border.copy(alpha = 0.5f))
                ProfileSectionRow("My Chatti", "$chattiCount/7 fields", onEditProfile)
                HorizontalDivider(color = colors.border.copy(alpha = 0.5f))
                ProfileSectionRow("My Culture", "$cultureCount/3 fields", onEditProfile)
                HorizontalDivider(color = colors.border.copy(alpha = 0.5f))
                ProfileSectionRow("My Personality", "$personalityCount/5 fields", onEditProfile)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }

    // Primary photo picker sheet
    if (showPhotoPicker) {
        PrimaryPhotoPickerSheet(
            existingPhotos = repoPhotos,
            onDismiss = { showPhotoPicker = false },
            onNewPhotoFromGallery = { uri ->
                viewModel.addPhoto(uri)
                val newIndex = PhotoRepository.photos.value.indexOf(uri)
                if (newIndex > 0) viewModel.setPrimaryPhoto(newIndex)
            },
            onSetPrimary = { index -> viewModel.setPrimaryPhoto(index) }
        )
    }
}

@Composable
private fun StatItem(icon: ImageVector, label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, null, tint = AppColors.Rose, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            value,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = LocalAdaptiveColors.current.textPrimary
        )
        Text(
            label,
            fontSize = 12.sp,
            color = AppColors.Rose
        )
    }
}

@Composable
private fun ProfileSectionRow(title: String, subtitle: String, onClick: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                title,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = colors.textPrimary
            )
            Text(
                subtitle,
                fontSize = 13.sp,
                color = colors.textMuted
            )
        }
        Icon(
            Icons.Default.ChevronRight, null,
            tint = colors.textMuted,
            modifier = Modifier.size(20.dp)
        )
    }
}
