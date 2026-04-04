@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.models.Intent
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

    // Staggered fade-in animations
    val sectionCount = 12
    val alphaValues = remember {
        List(sectionCount) { Animatable(0f) }
    }
    LaunchedEffect(Unit) {
        alphaValues.forEach { animatable ->
            animatable.animateTo(1f, animationSpec = tween(durationMillis = 300))
        }
    }

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

        // Section 0: Avatar with animated completeness ring + verified badge
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
                .alpha(alphaValues[0].value),
            contentAlignment = Alignment.Center
        ) {
            val completeness = profile.profileCompleteness / 100f
            val animatedCompleteness = remember { Animatable(0f) }
            LaunchedEffect(completeness) {
                animatedCompleteness.animateTo(
                    completeness,
                    animationSpec = tween(durationMillis = 1000)
                )
            }
            val roseColor = AppColors.Rose
            val borderColor = colors.border

            Box(
                modifier = Modifier
                    .size(120.dp)
                    .drawBehind {
                        // Background track
                        drawArc(
                            color = borderColor,
                            startAngle = -90f,
                            sweepAngle = 360f,
                            useCenter = false,
                            style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round)
                        )
                        // Completeness arc
                        drawArc(
                            color = roseColor,
                            startAngle = -90f,
                            sweepAngle = animatedCompleteness.value * 360f,
                            useCenter = false,
                            style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round)
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = profile.primaryPhoto?.url ?: "",
                    contentDescription = profile.displayName,
                    modifier = Modifier
                        .size(104.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }

            // Verified badge overlay at bottom-right of avatar
            if (profile.isVerified) {
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .offset(x = 40.dp, y = 40.dp)
                ) {
                    Surface(
                        shape = CircleShape,
                        color = AppColors.Info,
                        modifier = Modifier.size(28.dp),
                        shadowElevation = 2.dp
                    ) {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = "Verified",
                            tint = Color.White,
                            modifier = Modifier
                                .padding(4.dp)
                                .size(20.dp)
                        )
                    }
                }
            }

            // Completeness label below avatar
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusFull),
                color = AppColors.Rose,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .offset(y = 12.dp)
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

        // Name, age, location, intent badge
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .alpha(alphaValues[0].value),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    profile.displayName,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
                profile.age?.let {
                    Text(", $it", fontSize = 22.sp, color = colors.textSecondary)
                }
                if (profile.isVerified) {
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(
                        Icons.Default.Verified,
                        "Verified",
                        tint = AppColors.Info,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            if (profile.city.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.LocationOn,
                        null,
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

            // Intent badge with color coding
            profile.intent?.let { intent ->
                Spacer(modifier = Modifier.height(8.dp))
                val badgeColor = when (intent) {
                    Intent.CASUAL -> Color(0xFF4ECDC4)
                    Intent.OPEN -> Color(0xFFFFBE0B)
                    Intent.MARRIAGE -> AppColors.Rose
                }
                Surface(
                    shape = RoundedCornerShape(AppTheme.radiusFull),
                    color = badgeColor.copy(alpha = 0.15f),
                    border = BorderStroke(1.dp, badgeColor.copy(alpha = 0.3f))
                ) {
                    Text(
                        intent.displayName,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 5.dp),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = badgeColor
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Section 1: Stats row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp)
                .alpha(alphaValues[1].value),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatItem("Views", viewModel.profileStats.views.toString())
            StatItem("Likes", viewModel.profileStats.likes.toString())
            StatItem("Matches", viewModel.profileStats.matches.toString())
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Section 2: Photo carousel with gold border on primary
        if (profile.photos.isNotEmpty()) {
            Box(modifier = Modifier.alpha(alphaValues[2].value)) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    itemsIndexed(profile.photos) { _, photo ->
                        val isPrimary = photo.isPrimary
                        Box {
                            AsyncImage(
                                model = photo.url,
                                contentDescription = null,
                                modifier = Modifier
                                    .size(width = 140.dp, height = 180.dp)
                                    .clip(RoundedCornerShape(AppTheme.radiusMd))
                                    .then(
                                        if (isPrimary) Modifier.border(
                                            2.dp,
                                            AppColors.Gold,
                                            RoundedCornerShape(AppTheme.radiusMd)
                                        ) else Modifier
                                    ),
                                contentScale = ContentScale.Crop
                            )
                            if (isPrimary) {
                                Surface(
                                    shape = RoundedCornerShape(
                                        bottomStart = 0.dp,
                                        bottomEnd = 0.dp,
                                        topStart = AppTheme.radiusMd,
                                        topEnd = 0.dp
                                    ),
                                    color = AppColors.Gold,
                                    modifier = Modifier.align(Alignment.TopStart)
                                ) {
                                    Text(
                                        "MAIN",
                                        modifier = Modifier.padding(
                                            horizontal = 8.dp,
                                            vertical = 3.dp
                                        ),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Section 3: Profile completeness card (if < 100%)
        if (profile.profileCompleteness < 100) {
            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .alpha(alphaValues[3].value)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            "Complete Your Profile",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textPrimary
                        )
                        Text(
                            "${profile.profileCompleteness}%",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = AppColors.Rose
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    LinearProgressIndicator(
                        progress = { profile.profileCompleteness / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = AppColors.Rose,
                        trackColor = colors.border,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "A complete profile gets 3x more matches!",
                        fontSize = 12.sp,
                        color = colors.textMuted
                    )
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Section 4: Bio section
        if (profile.bio.isNotEmpty()) {
            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .alpha(alphaValues[4].value)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Bio",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        profile.bio,
                        fontSize = 15.sp,
                        color = colors.textSecondary,
                        lineHeight = 22.sp
                    )
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Section 5: Prompts section
        Box(modifier = Modifier.alpha(alphaValues[5].value)) {
            Column {
                if (profile.prompts.isNotEmpty()) {
                    profile.prompts.forEach { prompt ->
                        GlassCard(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 4.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    prompt.question,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = AppColors.Rose
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    prompt.answer,
                                    fontSize = 15.sp,
                                    color = colors.textPrimary,
                                    lineHeight = 22.sp
                                )
                            }
                        }
                    }
                }
                if (profile.prompts.size < 3) {
                    TextButton(
                        onClick = onEditProfile,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    ) {
                        Icon(
                            Icons.Default.Add,
                            null,
                            tint = AppColors.Rose,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            "Add prompts (${profile.prompts.size}/3)",
                            color = AppColors.Rose,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
            }
        }

        // Section 6: About Me section with completion counter (X/9)
        Box(modifier = Modifier.alpha(alphaValues[6].value)) {
            val aboutMeFields = listOf(
                profile.education,
                profile.occupation,
                profile.company,
                profile.heightCm?.toString(),
                profile.religion,
                profile.smoking,
                profile.drinking,
                profile.exercise,
                profile.wantKids
            )
            val filledAboutMe = aboutMeFields.count { it != null && it.isNotEmpty() }

            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "About Me",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textPrimary
                        )
                        Surface(
                            shape = RoundedCornerShape(AppTheme.radiusFull),
                            color = if (filledAboutMe == 9) AppColors.Success.copy(alpha = 0.15f) else AppColors.Rose.copy(alpha = 0.15f)
                        ) {
                            Text(
                                "$filledAboutMe/9",
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (filledAboutMe == 9) AppColors.Success else AppColors.Rose
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    profile.education?.let { DetailRow(Icons.Default.School, "Education", it) }
                    profile.occupation?.let { DetailRow(Icons.Default.Work, "Occupation", it) }
                    profile.company?.let { DetailRow(Icons.Default.Business, "Company", it) }
                    profile.heightCm?.let { DetailRow(Icons.Default.Height, "Height", "${it}cm") }
                    profile.religion?.let {
                        DetailRow(Icons.Default.TempleBuddhist, "Religion", it)
                    }
                    profile.smoking?.let { DetailRow(Icons.Default.SmokeFree, "Smoking", it) }
                    profile.drinking?.let { DetailRow(Icons.Default.LocalBar, "Drinking", it) }
                    profile.exercise?.let {
                        DetailRow(Icons.Default.FitnessCenter, "Exercise", it)
                    }
                    profile.wantKids?.let {
                        DetailRow(Icons.Default.ChildCare, "Want Kids", it)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Section 7: Sindhi Identity section with completion counter (X/7)
        Box(modifier = Modifier.alpha(alphaValues[7].value)) {
            val sindhiFields = listOf(
                profile.sindhiFluency?.displayName,
                profile.sindhiDialect,
                profile.generation,
                profile.gotra,
                profile.familyOriginCity,
                profile.communitySubGroup,
                profile.motherTongue
            )
            val filledSindhi = sindhiFields.count { it != null && it.isNotEmpty() }

            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Sindhi Identity",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textPrimary
                        )
                        Surface(
                            shape = RoundedCornerShape(AppTheme.radiusFull),
                            color = if (filledSindhi == 7) AppColors.Success.copy(alpha = 0.15f) else AppColors.Rose.copy(alpha = 0.15f)
                        ) {
                            Text(
                                "$filledSindhi/7",
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (filledSindhi == 7) AppColors.Success else AppColors.Rose
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    profile.sindhiFluency?.let {
                        DetailRow(Icons.Default.Language, "Fluency", it.displayName)
                    }
                    profile.sindhiDialect?.let {
                        DetailRow(Icons.Default.Translate, "Dialect", it)
                    }
                    profile.generation?.let {
                        DetailRow(Icons.Default.Timeline, "Generation", it)
                    }
                    profile.gotra?.let {
                        DetailRow(Icons.Default.AccountTree, "Gotra", it)
                    }
                    profile.familyOriginCity?.let { city ->
                        val country = profile.familyOriginCountry ?: ""
                        DetailRow(Icons.Default.Home, "Family Origin", "$city, $country")
                    }
                    profile.communitySubGroup?.let {
                        DetailRow(Icons.Default.Groups, "Community", it)
                    }
                    profile.motherTongue?.let {
                        DetailRow(Icons.Default.RecordVoiceOver, "Mother Tongue", it)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Section 8: Interests as FlowRow with rose-tinted chips
        if (profile.interests.isNotEmpty()) {
            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .alpha(alphaValues[8].value)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Interests",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    FlowRowInterests(interests = profile.interests)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Section 9: Languages section
        if (profile.languages.isNotEmpty()) {
            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .alpha(alphaValues[9].value)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Languages",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    FlowRowLanguages(languages = profile.languages)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Section 10: Action buttons
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .alpha(alphaValues[10].value)
        ) {
            // Edit Profile (rose filled)
            Button(
                onClick = onEditProfile,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
            ) {
                Icon(Icons.Default.Edit, null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Edit Profile",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Settings (outlined)
            OutlinedButton(
                onClick = onSettings,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                border = BorderStroke(1.dp, AppColors.Rose.copy(alpha = 0.5f)),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AppColors.Rose)
            ) {
                Icon(Icons.Default.Settings, null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Settings",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Family Mode (outlined)
            OutlinedButton(
                onClick = { /* Navigate to Family Mode */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                border = BorderStroke(1.dp, AppColors.Rose.copy(alpha = 0.5f)),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AppColors.Rose)
            ) {
                Icon(Icons.Default.FamilyRestroom, null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Family Mode",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            value,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = AppColors.Rose
        )
        Text(
            label,
            fontSize = 13.sp,
            color = LocalAdaptiveColors.current.textMuted
        )
    }
}

@Composable
private fun DetailRow(icon: ImageVector, label: String, value: String) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, label, tint = AppColors.Rose, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            label,
            fontSize = 14.sp,
            color = colors.textMuted,
            modifier = Modifier.width(110.dp)
        )
        Text(
            value,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = colors.textPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowRowInterests(interests: List<String>, commonInterests: Set<String> = emptySet()) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        interests.forEach { interest ->
            val isCommon = commonInterests.contains(interest)
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusFull),
                color = AppColors.Rose.copy(alpha = if (isCommon) 0.2f else 0.1f)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (isCommon) {
                        Icon(
                            Icons.Default.Star,
                            contentDescription = "Common interest",
                            tint = AppColors.Gold,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                    }
                    Text(
                        interest,
                        fontSize = 13.sp,
                        color = AppColors.Rose,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowRowLanguages(languages: List<String>) {
    val colors = LocalAdaptiveColors.current
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        languages.forEach { language ->
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusFull),
                color = colors.surfaceMedium,
                border = BorderStroke(1.dp, colors.border)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Language,
                        null,
                        tint = AppColors.Rose,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        language,
                        fontSize = 13.sp,
                        color = colors.textPrimary,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}
