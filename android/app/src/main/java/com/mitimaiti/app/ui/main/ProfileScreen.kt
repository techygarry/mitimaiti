package com.mitimaiti.app.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.models.User
import com.mitimaiti.app.ui.components.GlassCard
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.ProfileViewModel

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

    if (isLoading || user == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = AppColors.Rose)
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
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Profile", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
            Row {
                IconButton(onClick = onSettings) { Icon(Icons.Default.Settings, "Settings", tint = colors.textSecondary) }
            }
        }

        // Avatar with completeness ring
        Box(
            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            val completeness = profile.profileCompleteness / 100f
            val roseColor = AppColors.Rose
            val borderColor = colors.border

            Box(
                modifier = Modifier.size(120.dp).drawBehind {
                    drawArc(color = borderColor, startAngle = -90f, sweepAngle = 360f, useCenter = false, style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round))
                    drawArc(color = roseColor, startAngle = -90f, sweepAngle = completeness * 360f, useCenter = false, style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round))
                },
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = profile.primaryPhoto?.url ?: "",
                    contentDescription = profile.displayName,
                    modifier = Modifier.size(104.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }

            // Completeness badge
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusFull),
                color = AppColors.Rose,
                modifier = Modifier.align(Alignment.BottomCenter).offset(y = 12.dp)
            ) {
                Text(
                    "${profile.profileCompleteness}% complete",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Name and basic info
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(profile.displayName, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                profile.age?.let { Text(", $it", fontSize = 22.sp, color = colors.textSecondary) }
                if (profile.isVerified) {
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(Icons.Default.Verified, "Verified", tint = AppColors.Info, modifier = Modifier.size(20.dp))
                }
            }
            if (profile.city.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, null, tint = colors.textMuted, modifier = Modifier.size(14.dp))
                    Text("${profile.city}, ${profile.country}", fontSize = 14.sp, color = colors.textSecondary)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Stats row
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 32.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatItem("Views", viewModel.profileStats.views.toString())
            StatItem("Likes", viewModel.profileStats.likes.toString())
            StatItem("Matches", viewModel.profileStats.matches.toString())
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Photo carousel
        if (profile.photos.isNotEmpty()) {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(profile.photos) { photo ->
                    AsyncImage(
                        model = photo.url,
                        contentDescription = null,
                        modifier = Modifier.size(width = 140.dp, height = 180.dp).clip(RoundedCornerShape(AppTheme.radiusMd)),
                        contentScale = ContentScale.Crop
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Bio section
        if (profile.bio.isNotEmpty()) {
            GlassCard(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("About Me", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(profile.bio, fontSize = 15.sp, color = colors.textSecondary, lineHeight = 22.sp)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Prompts
        if (profile.prompts.isNotEmpty()) {
            profile.prompts.forEach { prompt ->
                GlassCard(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(prompt.question, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = AppColors.Rose)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(prompt.answer, fontSize = 15.sp, color = colors.textPrimary, lineHeight = 22.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Details section
        GlassCard(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Details", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                Spacer(modifier = Modifier.height(12.dp))
                profile.occupation?.let { DetailRow(Icons.Default.Work, "Occupation", it) }
                profile.education?.let { DetailRow(Icons.Default.School, "Education", it) }
                profile.company?.let { DetailRow(Icons.Default.Business, "Company", it) }
                profile.heightCm?.let { DetailRow(Icons.Default.Height, "Height", "${it}cm") }
                profile.religion?.let { DetailRow(Icons.Default.TempleBuddhist, "Religion", it) }
                profile.smoking?.let { DetailRow(Icons.Default.SmokeFree, "Smoking", it) }
                profile.drinking?.let { DetailRow(Icons.Default.LocalBar, "Drinking", it) }
                profile.exercise?.let { DetailRow(Icons.Default.FitnessCenter, "Exercise", it) }
                profile.intent?.let { DetailRow(Icons.Default.Favorite, "Looking for", it.displayName) }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Sindhi Identity section
        GlassCard(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Sindhi Identity", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                Spacer(modifier = Modifier.height(12.dp))
                profile.sindhiFluency?.let { DetailRow(Icons.Default.Language, "Sindhi Fluency", it.displayName) }
                profile.motherTongue?.let { DetailRow(Icons.Default.RecordVoiceOver, "Mother Tongue", it) }
                profile.sindhiDialect?.let { DetailRow(Icons.Default.Translate, "Dialect", it) }
                profile.communitySubGroup?.let { DetailRow(Icons.Default.Groups, "Community", it) }
                profile.gotra?.let { DetailRow(Icons.Default.AccountTree, "Gotra", it) }
                profile.generation?.let { DetailRow(Icons.Default.Timeline, "Generation", it) }
                profile.familyValues?.let { DetailRow(Icons.Default.FamilyRestroom, "Family Values", it.displayName) }
                profile.foodPreference?.let { DetailRow(Icons.Default.Restaurant, "Food Preference", it.displayName) }
                profile.familyOriginCity?.let { city ->
                    val country = profile.familyOriginCountry ?: ""
                    DetailRow(Icons.Default.Home, "Family Origin", "$city, $country")
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Interests
        if (profile.interests.isNotEmpty()) {
            GlassCard(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Interests", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                    Spacer(modifier = Modifier.height(12.dp))
                    FlowRowInterests(interests = profile.interests)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Action buttons
        Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            Button(
                onClick = onEditProfile,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
            ) {
                Icon(Icons.Default.Edit, null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Edit Profile", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AppColors.Error)
            ) {
                Icon(Icons.Default.Logout, null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sign Out", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun StatItem(label: String, value: String) {
    val colors = LocalAdaptiveColors.current
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
        Text(label, fontSize = 13.sp, color = colors.textMuted)
    }
}

@Composable
fun DetailRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, label, tint = AppColors.Rose, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Text(label, fontSize = 14.sp, color = colors.textMuted, modifier = Modifier.width(110.dp))
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = colors.textPrimary, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FlowRowInterests(interests: List<String>) {
    val colors = LocalAdaptiveColors.current
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        interests.forEach { interest ->
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusFull),
                color = AppColors.Rose.copy(alpha = 0.1f)
            ) {
                Text(
                    interest,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    fontSize = 13.sp,
                    color = AppColors.Rose,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
