@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import android.view.HapticFeedbackConstants
import coil.compose.AsyncImage
import com.mitimaiti.app.models.*
import com.mitimaiti.app.ui.components.*
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.utils.AppNotificationManager
import com.mitimaiti.app.viewmodels.FeedViewModel
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiscoverScreen(viewModel: FeedViewModel) {
    val colors = LocalAdaptiveColors.current
    val cards by viewModel.cards.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val showMatchAlert by viewModel.showMatchAlert.collectAsState()
    val matchedUser by viewModel.matchedUser.collectAsState()
    val showScoreBreakdown by viewModel.showScoreBreakdown.collectAsState()
    val selectedCard by viewModel.selectedCard.collectAsState()

    val notifications by AppNotificationManager.shared.notifications.collectAsState()
    val unreadCount = notifications.count { !it.isRead }

    var showFilters by remember { mutableStateOf(false) }
    var filterState by remember { mutableStateOf(FilterState()) }
    val activeFilterCount = countActiveFilters(filterState)
    val profileCompleteness = cards.firstOrNull()?.user?.profileCompleteness ?: 100

    Box(modifier = Modifier.fillMaxSize().background(colors.backgroundGradient)) {
        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            // ── Header ──
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Notification bell
                Box {
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.Notifications, "Notifications", tint = colors.textPrimary, modifier = Modifier.size(26.dp))
                    }
                    if (unreadCount > 0) {
                        CountBadge(
                            count = unreadCount,
                            modifier = Modifier.align(Alignment.TopEnd).offset(x = (-2).dp, y = 2.dp)
                        )
                    }
                }

                Text("Discover", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        onClick = { showFilters = true },
                        shape = RoundedCornerShape(AppTheme.radiusFull),
                        color = Color.Transparent,
                        border = androidx.compose.foundation.BorderStroke(1.dp, colors.textMuted.copy(alpha = 0.3f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.Tune, "Filters", tint = colors.textPrimary, modifier = Modifier.size(18.dp))
                            Text("Filters", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = colors.textPrimary)
                            if (activeFilterCount > 0) {
                                Surface(
                                    shape = CircleShape,
                                    color = AppColors.Rose,
                                    modifier = Modifier.size(20.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                                        Text("$activeFilterCount", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    }
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("${viewModel.likesRemaining}", fontSize = 14.sp, color = AppColors.Rose, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.Favorite, "Likes remaining", tint = AppColors.Rose, modifier = Modifier.size(16.dp))
                }
            }

            // ── Card Deck ──
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(horizontal = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                when {
                    isLoading -> ShimmerDiscoverCard(modifier = Modifier.fillMaxWidth(0.92f))
                    cards.isEmpty() -> EmptyState(
                        icon = Icons.Default.Explore,
                        title = "No more profiles",
                        description = "Check back later for new Sindhi singles in your area",
                        actionLabel = "Invite Friends",
                        onAction = { }
                    )
                    else -> {
                        val visibleCards = cards.take(3)

                        // Stacked background cards (right-side peek like web)
                        visibleCards.forEachIndexed { index, card ->
                            if (index > 0) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(0.92f)
                                        .fillMaxHeight(0.95f)
                                        .zIndex(-index.toFloat())
                                        .graphicsLayer {
                                            translationX = (index * 12).dp.toPx()
                                            scaleX = 1f - (index * 0.04f)
                                            scaleY = 1f - (index * 0.04f)
                                            alpha = 1f - (index * 0.2f)
                                        }
                                ) {
                                    Card(
                                        shape = RoundedCornerShape(AppTheme.radiusXl),
                                        colors = CardDefaults.cardColors(containerColor = colors.surface),
                                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                                    ) {
                                        Box(modifier = Modifier.fillMaxSize())
                                    }
                                }
                            }
                        }

                        // Top swipeable card
                        key(visibleCards.first().id) {
                            TopSwipeCard(
                                card = visibleCards.first(),
                                onSwipeRight = { viewModel.likeUser() },
                                onSwipeLeft = { viewModel.passUser() },
                                onLike = { viewModel.likeUser() },
                                onPass = { viewModel.passUser() },
                                onScoreTap = { viewModel.showScoreBreakdown(visibleCards.first()) }
                            )
                        }
                    }
                }
            }

            // ── Profile completeness banner ──
            if (cards.isNotEmpty() && profileCompleteness < 90) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = AppColors.Saffron.copy(alpha = 0.15f)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(Icons.Default.TipsAndUpdates, null, tint = AppColors.Saffron, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("Complete your profile", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                                Text("${profileCompleteness}% complete - get better matches!", fontSize = 12.sp, color = colors.textSecondary)
                            }
                        }
                        Icon(Icons.Default.ChevronRight, null, tint = AppColors.Saffron, modifier = Modifier.size(20.dp))
                    }
                }
            }

            // ── Rewind counter ──
            if (cards.isNotEmpty() && viewModel.rewindsRemaining > 0) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Replay, "Rewinds", tint = colors.textMuted, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("${viewModel.rewindsRemaining} rewinds left", fontSize = 12.sp, color = colors.textMuted)
                }
            }

            Spacer(modifier = Modifier.height(4.dp))
        }

        // ── Match Alert ──
        if (showMatchAlert && matchedUser != null) {
            MatchAlertOverlay(
                user = matchedUser!!,
                onSendMessage = { viewModel.dismissMatchAlert() },
                onKeepSwiping = { viewModel.dismissMatchAlert() }
            )
        }

        // ── Score Breakdown (shared component) ──
        if (showScoreBreakdown && selectedCard != null) {
            com.mitimaiti.app.ui.components.ScoreBreakdownSheet(
                card = selectedCard!!,
                onDismiss = { viewModel.hideScoreBreakdown() }
            )
        }

        // ── Filter Sheet (shared component) ──
        if (showFilters) {
            FilterSheet(
                filterState = filterState,
                onFilterChanged = { filterState = it },
                onDismiss = { showFilters = false },
                onReset = { filterState = FilterState() }
            )
        }
    }
}

private fun countActiveFilters(state: FilterState): Int {
    var count = 0
    if (state.ageMin != 21 || state.ageMax != 35) count++
    if (state.heightMin != 150 || state.heightMax != 190) count++
    if (state.genderPreference != ShowMe.EVERYONE) count++
    if (state.intentFilter != null) count++
    if (state.verifiedOnly) count++
    if (state.fluencyFilter != null) count++
    if (state.generationFilter != null) count++
    if (state.religionFilter != null) count++
    if (state.gotraFilter != null) count++
    if (state.dietaryFilter != null) count++
    if (state.educationFilter != null) count++
    if (state.smokingFilter != null) count++
    if (state.drinkingFilter != null) count++
    if (state.familyPlansFilter != null) count++
    if (state.exerciseFilter != null) count++
    return count
}

// ───────────────────────────────────────────
// Top Swipe Card
// ───────────────────────────────────────────
@Composable
fun TopSwipeCard(
    card: FeedCard,
    onSwipeRight: () -> Unit,
    onSwipeLeft: () -> Unit,
    onLike: () -> Unit,
    onPass: () -> Unit,
    onScoreTap: () -> Unit = {}
) {
    val scope = rememberCoroutineScope()
    var offsetX by remember { mutableFloatStateOf(0f) }
    var swiped by remember { mutableStateOf(false) }
    val screenWidthPx = LocalConfiguration.current.screenWidthDp * LocalConfiguration.current.densityDpi / 160f
    val swipeThreshold = screenWidthPx * 0.25f

    val animatedOffset by animateFloatAsState(
        targetValue = offsetX,
        animationSpec = spring(dampingRatio = 0.7f, stiffness = 300f),
        finishedListener = {
            if (swiped) {
                if (offsetX > 0) onSwipeRight() else onSwipeLeft()
                offsetX = 0f
                swiped = false
            }
        },
        label = "swipe"
    )

    val rotation = (animatedOffset / screenWidthPx) * 15f
    val likeAlpha = (animatedOffset / swipeThreshold).coerceIn(0f, 1f)
    val passAlpha = (-animatedOffset / swipeThreshold).coerceIn(0f, 1f)

    Box(
        modifier = Modifier
            .fillMaxWidth(0.92f)
            .fillMaxHeight(0.95f)
            .zIndex(1f)
            .offset { IntOffset(animatedOffset.roundToInt(), 0) }
            .rotate(rotation)
            .pointerInput(card.id) {
                detectDragGestures(
                    onDragEnd = {
                        when {
                            offsetX > swipeThreshold -> { swiped = true; offsetX = screenWidthPx * 1.5f }
                            offsetX < -swipeThreshold -> { swiped = true; offsetX = -screenWidthPx * 1.5f }
                            else -> offsetX = 0f
                        }
                    },
                    onDragCancel = { offsetX = 0f },
                    onDrag = { change, dragAmount -> change.consume(); offsetX += dragAmount.x }
                )
            }
    ) {
        DiscoveryCard(card = card, onLike = onLike, onPass = onPass, onScoreTap = onScoreTap)

        // LIKE overlay
        if (likeAlpha > 0f) {
            Box(
                modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(AppTheme.radiusXl)),
                contentAlignment = Alignment.TopStart
            ) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Transparent,
                    border = androidx.compose.foundation.BorderStroke(3.dp, AppColors.Success.copy(alpha = likeAlpha)),
                    modifier = Modifier.padding(24.dp).rotate(-15f)
                ) {
                    Text(
                        "LIKE",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Black,
                        color = AppColors.Success.copy(alpha = likeAlpha),
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }
            }
        }

        // NOPE overlay
        if (passAlpha > 0f) {
            Box(
                modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(AppTheme.radiusXl)),
                contentAlignment = Alignment.TopEnd
            ) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Transparent,
                    border = androidx.compose.foundation.BorderStroke(3.dp, AppColors.Error.copy(alpha = passAlpha)),
                    modifier = Modifier.padding(24.dp).rotate(15f)
                ) {
                    Text(
                        "NOPE",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Black,
                        color = AppColors.Error.copy(alpha = passAlpha),
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }
            }
        }
    }
}

// ───────────────────────────────────────────
// Discovery Card (matches web DiscoveryCard.tsx)
// ───────────────────────────────────────────
@Composable
fun DiscoveryCard(
    card: FeedCard,
    onLike: () -> Unit = {},
    onPass: () -> Unit = {},
    onScoreTap: () -> Unit = {}
) {
    val colors = LocalAdaptiveColors.current
    val user = card.user
    val view = LocalView.current

    // Entrance animation
    val entranceScale = remember { Animatable(0.95f) }
    val entranceAlpha = remember { Animatable(0f) }
    LaunchedEffect(card.id) {
        launch { entranceScale.animateTo(1f, animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f)) }
        launch { entranceAlpha.animateTo(1f, animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f)) }
    }

    // Pass button press animation
    var isPassPressed by remember { mutableStateOf(false) }
    val passScale by animateFloatAsState(
        targetValue = if (isPassPressed) 0.96f else 1.0f,
        animationSpec = spring(dampingRatio = 0.7f, stiffness = 500f),
        label = "passScale"
    )

    // Like button press animation
    var isLikePressed by remember { mutableStateOf(false) }
    val likeScale by animateFloatAsState(
        targetValue = if (isLikePressed) 0.96f else 1.0f,
        animationSpec = spring(dampingRatio = 0.7f, stiffness = 500f),
        label = "likeScale"
    )

    Card(
        modifier = Modifier
            .fillMaxSize()
            .graphicsLayer {
                scaleX = entranceScale.value
                scaleY = entranceScale.value
                alpha = entranceAlpha.value
            },
        shape = RoundedCornerShape(AppTheme.radiusXl),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Scrollable content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .background(colors.surface)
            ) {
                // ── 1. Hero Photo with Name Overlay ──
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(0.75f)
                ) {
                    AsyncImage(
                        model = user.primaryPhoto?.url ?: "",
                        contentDescription = user.displayName,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                    // Gradient overlay (multi-stop, matching iOS)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .fillMaxHeight(0.55f)
                            .align(Alignment.BottomCenter)
                            .background(Brush.verticalGradient(
                                0.0f to Color.Transparent,
                                0.35f to Color.Black.copy(alpha = 0.05f),
                                0.6f to Color.Black.copy(alpha = 0.25f),
                                0.85f to Color.Black.copy(alpha = 0.65f),
                                1.0f to Color.Black.copy(alpha = 0.80f)
                            ))
                    )
                    // Name + age + location
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .fillMaxWidth()
                            .padding(20.dp)
                    ) {
                        // Score badges row
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CulturalScoreBadge(
                                score = card.culturalScore.overallScore,
                                badge = card.culturalScore.badge,
                                modifier = Modifier.clickable { onScoreTap() }
                            )
                            card.kundliScore?.let { kundli ->
                                val kundliColor = when (kundli.tier) {
                                    KundliTier.EXCELLENT -> AppColors.BadgeGold
                                    KundliTier.GOOD -> AppColors.BadgeGreen
                                    KundliTier.CHALLENGING -> AppColors.BadgeOrange
                                }
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = kundliColor.copy(alpha = 0.2f),
                                    modifier = Modifier.clickable { onScoreTap() }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Text("\u0950", fontSize = 12.sp, color = kundliColor)
                                        Text("${kundli.totalScore.toInt()}/${kundli.maxScore.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = kundliColor)
                                    }
                                }
                            }
                            if (user.isVerified) {
                                Icon(Icons.Default.Verified, "Verified", tint = AppColors.Info, modifier = Modifier.size(18.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(user.displayName, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            user.age?.let {
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("$it", fontSize = 22.sp, color = Color.White.copy(alpha = 0.8f))
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            if (user.city.isNotEmpty()) {
                                Icon(Icons.Default.LocationOn, "Location", tint = Color.White.copy(alpha = 0.7f), modifier = Modifier.size(14.dp))
                                Text(user.city, fontSize = 14.sp, color = Color.White.copy(alpha = 0.7f))
                                card.distanceKm?.let {
                                    Text("- ${it.toInt()}km", fontSize = 14.sp, color = Color.White.copy(alpha = 0.5f))
                                }
                            }
                            user.intent?.let { intent ->
                                Spacer(modifier = Modifier.width(4.dp))
                                Surface(shape = RoundedCornerShape(8.dp), color = Color(intent.color).copy(alpha = 0.3f)) {
                                    Text(intent.displayName, modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp), fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Medium)
                                }
                            }
                        }
                    }
                }

                // ── 2. Bio Section ──
                if (user.bio.isNotEmpty()) {
                    CardSection {
                        Text(user.bio, fontSize = 15.sp, color = colors.textPrimary, lineHeight = 22.sp)
                    }
                }

                // ── 3. Basics (Work, Education, Height) ──
                val basics = buildBasicsList(user)
                if (basics.isNotEmpty()) {
                    CardSection {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            basics.forEach { (icon, label) ->
                                InfoPill(icon = icon, text = label, modifier = Modifier.weight(1f, fill = false))
                            }
                        }
                    }
                }

                // ── 4. First Prompt ──
                user.prompts.getOrNull(0)?.let { prompt ->
                    PromptCard(prompt)
                }

                // ── 5. Second Photo ──
                user.photos.getOrNull(1)?.let { photo ->
                    ProfilePhoto(url = photo.url)
                }

                // ── 6. Score Tags Row ──
                CardSection {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        ScoreTag(
                            label = "Cultural",
                            value = "${card.culturalScore.overallScore}%",
                            badge = card.culturalScore.badge.displayName,
                            color = when (card.culturalScore.badge) {
                                CulturalBadge.GOLD -> AppColors.BadgeGold
                                CulturalBadge.GREEN -> AppColors.BadgeGreen
                                CulturalBadge.ORANGE -> AppColors.BadgeOrange
                                CulturalBadge.NONE -> colors.textMuted
                            },
                            onClick = onScoreTap
                        )
                        card.kundliScore?.let { kundli ->
                            ScoreTag(
                                label = "Kundli",
                                value = "${kundli.totalScore.toInt()}/${kundli.maxScore.toInt()}",
                                badge = kundli.tier.displayName,
                                color = when (kundli.tier) {
                                    KundliTier.EXCELLENT -> AppColors.BadgeGold
                                    KundliTier.GOOD -> AppColors.BadgeGreen
                                    KundliTier.CHALLENGING -> AppColors.BadgeOrange
                                },
                                onClick = onScoreTap
                            )
                        }
                        if (card.commonInterests > 0) {
                            ScoreTag(
                                label = "Interests",
                                value = "${card.commonInterests}",
                                badge = "in common",
                                color = AppColors.Rose,
                                onClick = {}
                            )
                        }
                    }
                }

                // ── 7. Second Prompt ──
                user.prompts.getOrNull(1)?.let { prompt ->
                    PromptCard(prompt)
                }

                // ── 8. Third Photo ──
                user.photos.getOrNull(2)?.let { photo ->
                    ProfilePhoto(url = photo.url)
                }

                // ── 9. Interests Section ──
                if (user.interests.isNotEmpty()) {
                    CardSection {
                        Text("INTERESTS", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = colors.textMuted, letterSpacing = 1.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        FlowChips(items = user.interests, highlightColor = AppColors.Rose)
                    }
                }

                // ── 10. Languages Section ──
                if (user.languages.isNotEmpty()) {
                    CardSection {
                        Text("LANGUAGES", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = colors.textMuted, letterSpacing = 1.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        FlowChips(items = user.languages, highlightColor = null)
                    }
                }

                // ── 11. Third Prompt ──
                user.prompts.getOrNull(2)?.let { prompt ->
                    PromptCard(prompt)
                }

                // Bottom spacer for floating buttons
                Spacer(modifier = Modifier.height(80.dp))
            }

            // ── Floating Action Buttons (over card, at bottom) ──
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, colors.surface.copy(alpha = 0.95f), colors.surface)
                        )
                    )
                    .padding(bottom = 16.dp, top = 24.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Pass button
                    FloatingActionButton(
                        onClick = {
                            view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
                            isPassPressed = true
                            onPass()
                            isPassPressed = false
                        },
                        containerColor = colors.surface,
                        contentColor = colors.textSecondary,
                        shape = CircleShape,
                        modifier = Modifier
                            .size(60.dp)
                            .shadow(8.dp, CircleShape)
                            .graphicsLayer {
                                scaleX = passScale
                                scaleY = passScale
                            },
                        elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp)
                    ) {
                        Icon(Icons.Default.Close, "Pass", modifier = Modifier.size(28.dp))
                    }

                    // Like button
                    FloatingActionButton(
                        onClick = {
                            view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
                            isLikePressed = true
                            onLike()
                            isLikePressed = false
                        },
                        containerColor = AppColors.Rose,
                        contentColor = Color.White,
                        shape = CircleShape,
                        modifier = Modifier
                            .size(60.dp)
                            .shadow(8.dp, CircleShape)
                            .graphicsLayer {
                                scaleX = likeScale
                                scaleY = likeScale
                            },
                        elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp)
                    ) {
                        Icon(Icons.Default.Favorite, "Like", modifier = Modifier.size(28.dp))
                    }
                }
            }
        }
    }
}

// ───────────────────────────────────────────
// Card Sub-Components
// ───────────────────────────────────────────

@Composable
private fun CardSection(content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        content = content
    )
}

@Composable
private fun PromptCard(prompt: UserPrompt) {
    val colors = LocalAdaptiveColors.current
    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 6.dp),
        shape = RoundedCornerShape(AppTheme.radiusMd),
        color = colors.surfaceMedium
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                prompt.question.uppercase(),
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.Rose,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                prompt.answer,
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = colors.textPrimary,
                lineHeight = 24.sp
            )
        }
    }
}

@Composable
private fun ProfilePhoto(url: String) {
    AsyncImage(
        model = url,
        contentDescription = null,
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.75f)
            .padding(horizontal = 20.dp, vertical = 6.dp)
            .clip(RoundedCornerShape(AppTheme.radiusMd)),
        contentScale = ContentScale.Crop
    )
}

@Composable
private fun InfoPill(icon: @Composable () -> Unit, text: String, modifier: Modifier = Modifier) {
    val colors = LocalAdaptiveColors.current
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(AppTheme.radiusXl),
        color = colors.surfaceMedium
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            icon()
            Text(text, fontSize = 13.sp, color = colors.textPrimary, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
private fun ScoreTag(
    label: String,
    value: String,
    badge: String,
    color: Color,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(AppTheme.radiusMd),
        color = color.copy(alpha = 0.1f),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.25f)),
        modifier = Modifier.clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = color)
            Text(label, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = color.copy(alpha = 0.8f))
            Text(badge.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = color.copy(alpha = 0.6f), letterSpacing = 0.5.sp)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowChips(items: List<String>, highlightColor: Color?) {
    val colors = LocalAdaptiveColors.current
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items.forEach { item ->
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusFull),
                color = if (highlightColor != null) highlightColor.copy(alpha = 0.1f) else colors.surfaceMedium
            ) {
                Text(
                    text = item,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = highlightColor ?: colors.textPrimary
                )
            }
        }
    }
}

@Composable
private fun buildBasicsList(user: User): List<Pair<@Composable () -> Unit, String>> {
    val c = LocalAdaptiveColors.current
    val list = mutableListOf<Pair<@Composable () -> Unit, String>>()
    user.occupation?.let { occ ->
        list.add(Pair(
            { Icon(Icons.Default.Work, "Work", tint = c.textMuted, modifier = Modifier.size(16.dp)) },
            if (user.company != null) "$occ, ${user.company}" else occ
        ))
    }
    user.education?.let { edu ->
        list.add(Pair(
            { Icon(Icons.Default.School, "Education", tint = c.textMuted, modifier = Modifier.size(16.dp)) },
            edu
        ))
    }
    user.heightCm?.let { h ->
        val ft = (h / 30.48).toInt()
        val inches = ((h / 30.48 - ft) * 12).toInt()
        list.add(Pair(
            { Icon(Icons.Default.Straighten, "Height", tint = c.textMuted, modifier = Modifier.size(16.dp)) },
            "$ft'$inches\" ($h cm)"
        ))
    }
    return list
}

// ───────────────────────────────────────────
// Match Alert Overlay
// ───────────────────────────────────────────
@Composable
fun MatchAlertOverlay(user: User, onSendMessage: () -> Unit, onKeepSwiping: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.85f)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Text("It's a Match!", fontSize = 36.sp, fontWeight = FontWeight.Bold, color = AppColors.Rose)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "You and ${user.displayName} liked each other",
                fontSize = 16.sp,
                color = Color.White.copy(alpha = 0.8f),
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(32.dp))
            AsyncImage(
                model = user.primaryPhoto?.url ?: "",
                contentDescription = user.displayName,
                modifier = Modifier.size(120.dp).clip(CircleShape),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.height(32.dp))
            Button(
                onClick = onSendMessage,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
            ) {
                Text("Send a Message", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }
            Spacer(modifier = Modifier.height(12.dp))
            TextButton(onClick = onKeepSwiping) {
                Text("Keep Swiping", color = Color.White.copy(alpha = 0.7f), fontSize = 16.sp)
            }
        }
    }
}
