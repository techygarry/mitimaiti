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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import coil.compose.AsyncImage
import com.mitimaiti.app.models.*
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

    // Notification unread count
    val notifications by AppNotificationManager.shared.notifications.collectAsState()
    val unreadCount = notifications.count { !it.isRead }

    // Filter state
    var activeFilterCount by remember { mutableIntStateOf(0) }

    // Profile completeness (from first card's user or current user context)
    val profileCompleteness = cards.firstOrNull()?.user?.profileCompleteness ?: 100

    Box(modifier = Modifier.fillMaxSize().background(colors.backgroundGradient)) {
        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            // Header with notification bell, title, filter button, likes counter
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left: Notification bell with badge
                Box {
                    IconButton(onClick = { /* Navigate to notifications */ }) {
                        Icon(
                            Icons.Default.Notifications,
                            contentDescription = "Notifications",
                            tint = colors.textPrimary,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                    if (unreadCount > 0) {
                        Surface(
                            shape = CircleShape,
                            color = AppColors.Rose,
                            modifier = Modifier
                                .size(18.dp)
                                .align(Alignment.TopEnd)
                                .offset(x = (-2).dp, y = 2.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = if (unreadCount > 9) "9+" else "$unreadCount",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }

                // Center: Title
                Text(
                    "Discover",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )

                // Right: Filter button + Likes counter
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Filter button with count badge
                    Box {
                        IconButton(onClick = { /* Show filters */ }) {
                            Icon(
                                Icons.Default.Tune,
                                contentDescription = "Filters",
                                tint = colors.textPrimary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        if (activeFilterCount > 0) {
                            Surface(
                                shape = CircleShape,
                                color = AppColors.Rose,
                                modifier = Modifier
                                    .size(16.dp)
                                    .align(Alignment.TopEnd)
                                    .offset(x = (-4).dp, y = 4.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        "$activeFilterCount",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    Text(
                        "${viewModel.likesRemaining}",
                        fontSize = 14.sp,
                        color = AppColors.Rose,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        Icons.Default.Favorite,
                        "Likes remaining",
                        tint = AppColors.Rose,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // Card deck
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                when {
                    isLoading -> CircularProgressIndicator(color = AppColors.Rose)
                    cards.isEmpty() -> EmptyStateView()
                    else -> {
                        val visibleCards = cards.take(3)

                        // Background stacked cards (right-side peek)
                        visibleCards.forEachIndexed { index, card ->
                            if (index > 0) {
                                val xOffset = index * 12
                                val scale = 1f - (index * 0.05f)
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(0.9f)
                                        .aspectRatio(0.7f)
                                        .zIndex(-index.toFloat())
                                        .graphicsLayer {
                                            translationX = xOffset.dp.toPx()
                                            scaleX = scale
                                            scaleY = scale
                                            alpha = 1f - (index * 0.2f)
                                        }
                                ) {
                                    ProfileCard(
                                        card = card,
                                        onCulturalBadgeTap = { viewModel.showScoreBreakdown(card) }
                                    )
                                }
                            }
                        }

                        // Top card with swipe
                        key(visibleCards.first().id) {
                            TopSwipeCard(
                                card = visibleCards.first(),
                                onSwipeRight = { viewModel.likeUser() },
                                onSwipeLeft = { viewModel.passUser() },
                                onCulturalBadgeTap = { viewModel.showScoreBreakdown(visibleCards.first()) }
                            )
                        }
                    }
                }
            }

            // Profile completeness banner
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
                            Icon(
                                Icons.Default.TipsAndUpdates,
                                contentDescription = null,
                                tint = AppColors.Saffron,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    "Complete your profile",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = colors.textPrimary
                                )
                                Text(
                                    "${profileCompleteness}% complete - get better matches!",
                                    fontSize = 12.sp,
                                    color = colors.textSecondary
                                )
                            }
                        }
                        Icon(
                            Icons.Default.ChevronRight,
                            contentDescription = null,
                            tint = AppColors.Saffron,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // Action buttons
            if (cards.isNotEmpty()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 48.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    SmallFloatingActionButton(
                        onClick = { viewModel.rewind() },
                        containerColor = colors.surface,
                        contentColor = AppColors.Gold,
                        shape = CircleShape
                    ) {
                        Icon(Icons.Default.Replay, "Rewind", modifier = Modifier.size(20.dp))
                    }

                    FloatingActionButton(
                        onClick = { viewModel.passUser() },
                        containerColor = colors.surface,
                        contentColor = AppColors.Error,
                        shape = CircleShape,
                        modifier = Modifier.size(56.dp)
                    ) {
                        Icon(Icons.Default.Close, "Pass", modifier = Modifier.size(28.dp))
                    }

                    FloatingActionButton(
                        onClick = { viewModel.likeUser() },
                        containerColor = AppColors.Rose,
                        contentColor = Color.White,
                        shape = CircleShape,
                        modifier = Modifier.size(56.dp)
                    ) {
                        Icon(Icons.Default.Favorite, "Like", modifier = Modifier.size(28.dp))
                    }

                    SmallFloatingActionButton(
                        onClick = { viewModel.likeUser() },
                        containerColor = colors.surface,
                        contentColor = AppColors.Gold,
                        shape = CircleShape
                    ) {
                        Icon(Icons.Default.Star, "Super Like", modifier = Modifier.size(20.dp))
                    }
                }
            }
        }

        // Match alert
        if (showMatchAlert && matchedUser != null) {
            MatchAlertOverlay(
                user = matchedUser!!,
                onSendMessage = { viewModel.dismissMatchAlert() },
                onKeepSwiping = { viewModel.dismissMatchAlert() }
            )
        }

        // Score breakdown bottom sheet
        if (showScoreBreakdown && selectedCard != null) {
            ScoreBreakdownSheet(
                card = selectedCard!!,
                onDismiss = { viewModel.hideScoreBreakdown() }
            )
        }
    }
}

@Composable
fun TopSwipeCard(
    card: FeedCard,
    onSwipeRight: () -> Unit,
    onSwipeLeft: () -> Unit,
    onCulturalBadgeTap: () -> Unit = {}
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
            .fillMaxWidth(0.9f)
            .aspectRatio(0.7f)
            .zIndex(1f)
            .offset { IntOffset(animatedOffset.roundToInt(), 0) }
            .rotate(rotation)
            .pointerInput(card.id) {
                detectDragGestures(
                    onDragEnd = {
                        when {
                            offsetX > swipeThreshold -> {
                                swiped = true
                                offsetX = screenWidthPx * 1.5f
                            }
                            offsetX < -swipeThreshold -> {
                                swiped = true
                                offsetX = -screenWidthPx * 1.5f
                            }
                            else -> offsetX = 0f
                        }
                    },
                    onDragCancel = { offsetX = 0f },
                    onDrag = { change, dragAmount ->
                        change.consume()
                        offsetX += dragAmount.x
                    }
                )
            }
    ) {
        ProfileCard(
            card = card,
            onCulturalBadgeTap = onCulturalBadgeTap
        )

        // LIKE overlay
        if (likeAlpha > 0f) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(AppTheme.radiusXl)),
                contentAlignment = Alignment.TopStart
            ) {
                Text(
                    "LIKE",
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Black,
                    color = AppColors.Success.copy(alpha = likeAlpha),
                    modifier = Modifier
                        .padding(24.dp)
                        .rotate(-20f)
                )
            }
        }
        // PASS overlay
        if (passAlpha > 0f) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(AppTheme.radiusXl)),
                contentAlignment = Alignment.TopEnd
            ) {
                Text(
                    "PASS",
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Black,
                    color = AppColors.Error.copy(alpha = passAlpha),
                    modifier = Modifier
                        .padding(24.dp)
                        .rotate(20f)
                )
            }
        }
    }
}

@Composable
fun ProfileCard(
    card: FeedCard,
    onCulturalBadgeTap: () -> Unit = {}
) {
    val colors = LocalAdaptiveColors.current
    val user = card.user

    Card(
        modifier = Modifier.fillMaxSize(),
        shape = RoundedCornerShape(AppTheme.radiusXl),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Scrollable content with photo at top
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
            ) {
                // Photo section
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(0.8f)
                ) {
                    AsyncImage(
                        model = user.primaryPhoto?.url ?: "",
                        contentDescription = user.displayName,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )

                    // Bottom gradient over photo
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .fillMaxHeight(0.5f)
                            .align(Alignment.BottomCenter)
                            .background(
                                Brush.verticalGradient(
                                    listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f))
                                )
                            )
                    )

                    // Name, age, location overlay on photo
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .fillMaxWidth()
                            .padding(20.dp)
                    ) {
                        // Score badges row
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Cultural score badge
                            val badgeColor = when (card.culturalScore.badge) {
                                CulturalBadge.GOLD -> AppColors.BadgeGold
                                CulturalBadge.GREEN -> AppColors.BadgeGreen
                                CulturalBadge.ORANGE -> AppColors.BadgeOrange
                                CulturalBadge.NONE -> colors.textMuted
                            }
                            Surface(
                                shape = RoundedCornerShape(AppTheme.radiusFull),
                                color = badgeColor.copy(alpha = 0.2f),
                                modifier = Modifier.clickable { onCulturalBadgeTap() }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.Stars,
                                        "Cultural Score",
                                        tint = badgeColor,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        "${card.culturalScore.overallScore}%",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = badgeColor
                                    )
                                }
                            }

                            // Kundli score badge
                            card.kundliScore?.let { kundli ->
                                Spacer(modifier = Modifier.width(8.dp))
                                val kundliColor = when (kundli.tier) {
                                    KundliTier.EXCELLENT -> AppColors.BadgeGold
                                    KundliTier.GOOD -> AppColors.BadgeGreen
                                    KundliTier.CHALLENGING -> AppColors.BadgeOrange
                                }
                                Surface(
                                    shape = RoundedCornerShape(AppTheme.radiusFull),
                                    color = kundliColor.copy(alpha = 0.2f),
                                    modifier = Modifier.clickable { onCulturalBadgeTap() }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            "\u0950",
                                            fontSize = 12.sp,
                                            color = kundliColor
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            "${kundli.totalScore.toInt()}/${kundli.maxScore.toInt()}",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = kundliColor
                                        )
                                    }
                                }
                            }

                            if (user.isVerified) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(
                                    Icons.Default.Verified,
                                    "Verified",
                                    tint = AppColors.Info,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            if (user.isOnline) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(AppColors.Success)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(
                                user.displayName,
                                fontSize = 26.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            user.age?.let {
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    "$it",
                                    fontSize = 22.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (user.city.isNotEmpty()) {
                                Icon(
                                    Icons.Default.LocationOn,
                                    "Location",
                                    tint = Color.White.copy(alpha = 0.7f),
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    user.city,
                                    fontSize = 14.sp,
                                    color = Color.White.copy(alpha = 0.7f)
                                )
                                card.distanceKm?.let {
                                    Text(
                                        " - ${it.toInt()}km",
                                        fontSize = 14.sp,
                                        color = Color.White.copy(alpha = 0.5f)
                                    )
                                }
                            }
                        }
                    }
                }

                // Scrollable card content below photo
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(colors.surface)
                        .padding(16.dp)
                ) {
                    // Bio section
                    if (user.bio.isNotEmpty()) {
                        Text(
                            "About",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textMuted,
                            modifier = Modifier.padding(bottom = 4.dp)
                        )
                        Text(
                            user.bio,
                            fontSize = 15.sp,
                            color = colors.textPrimary,
                            lineHeight = 22.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Prompts
                    if (user.prompts.isNotEmpty()) {
                        user.prompts.forEach { prompt ->
                            Surface(
                                shape = RoundedCornerShape(AppTheme.radiusMd),
                                color = colors.surfaceMedium,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 10.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text(
                                        prompt.question,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = AppColors.Rose
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        prompt.answer,
                                        fontSize = 15.sp,
                                        color = colors.textPrimary
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // Basics: Work, Education, Height
                    val basics = mutableListOf<Pair<@Composable () -> Unit, String>>()

                    user.occupation?.let { occ ->
                        basics.add(
                            Pair(
                                { Icon(Icons.Default.Work, "Work", tint = colors.textMuted, modifier = Modifier.size(16.dp)) },
                                if (user.company != null) "$occ at ${user.company}" else occ
                            )
                        )
                    }
                    user.education?.let { edu ->
                        basics.add(
                            Pair(
                                { Icon(Icons.Default.School, "Education", tint = colors.textMuted, modifier = Modifier.size(16.dp)) },
                                edu
                            )
                        )
                    }
                    user.heightCm?.let { h ->
                        val feet = h / 30.48
                        val ft = feet.toInt()
                        val inches = ((feet - ft) * 12).toInt()
                        basics.add(
                            Pair(
                                { Icon(Icons.Default.Straighten, "Height", tint = colors.textMuted, modifier = Modifier.size(16.dp)) },
                                "$ft'$inches\" ($h cm)"
                            )
                        )
                    }

                    if (basics.isNotEmpty()) {
                        Text(
                            "Basics",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textMuted,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        basics.forEach { (icon, label) ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(bottom = 8.dp)
                            ) {
                                icon()
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    label,
                                    fontSize = 14.sp,
                                    color = colors.textPrimary
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // Interests
                    if (user.interests.isNotEmpty()) {
                        Text(
                            "Interests",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textMuted,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            user.interests.forEach { interest ->
                                Surface(
                                    shape = RoundedCornerShape(AppTheme.radiusFull),
                                    color = AppColors.Rose.copy(alpha = 0.1f)
                                ) {
                                    Text(
                                        interest,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                        fontSize = 13.sp,
                                        color = AppColors.Rose,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // Common interests
                    if (card.commonInterests > 0) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Interests,
                                "Interests",
                                tint = AppColors.Gold,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                "${card.commonInterests} common interests",
                                fontSize = 13.sp,
                                color = AppColors.Gold
                            )
                        }
                    }

                    // Intent tag
                    user.intent?.let { intent ->
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            shape = RoundedCornerShape(AppTheme.radiusFull),
                            color = Color(intent.color).copy(alpha = 0.2f)
                        ) {
                            Text(
                                intent.displayName,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                fontSize = 12.sp,
                                color = Color(intent.color),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    // Bottom padding for scroll
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScoreBreakdownSheet(
    card: FeedCard,
    onDismiss: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = colors.surface,
        shape = RoundedCornerShape(topStart = AppTheme.radiusXl, topEnd = AppTheme.radiusXl)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp)
        ) {
            // Header
            Text(
                "Compatibility Breakdown",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "How you match with ${card.user.displayName}",
                fontSize = 14.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(20.dp))

            // Overall cultural score
            val culturalBadgeColor = when (card.culturalScore.badge) {
                CulturalBadge.GOLD -> AppColors.BadgeGold
                CulturalBadge.GREEN -> AppColors.BadgeGreen
                CulturalBadge.ORANGE -> AppColors.BadgeOrange
                CulturalBadge.NONE -> colors.textMuted
            }
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = culturalBadgeColor.copy(alpha = 0.1f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Stars,
                        contentDescription = null,
                        tint = culturalBadgeColor,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Cultural Score",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textPrimary
                        )
                        Text(
                            "${card.culturalScore.badge.displayName} Match",
                            fontSize = 13.sp,
                            color = colors.textSecondary
                        )
                    }
                    Text(
                        "${card.culturalScore.overallScore}%",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = culturalBadgeColor
                    )
                }
            }

            // Cultural dimensions
            if (card.culturalScore.dimensions.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                card.culturalScore.dimensions.forEach { dim ->
                    ScoreDimensionRow(
                        label = dim.name,
                        score = dim.score,
                        maxScore = dim.maxScore,
                        color = culturalBadgeColor
                    )
                }
            }

            // Kundli score section
            card.kundliScore?.let { kundli ->
                Spacer(modifier = Modifier.height(20.dp))
                val kundliColor = when (kundli.tier) {
                    KundliTier.EXCELLENT -> AppColors.BadgeGold
                    KundliTier.GOOD -> AppColors.BadgeGreen
                    KundliTier.CHALLENGING -> AppColors.BadgeOrange
                }
                Surface(
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = kundliColor.copy(alpha = 0.1f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "\u0950",
                            fontSize = 24.sp,
                            color = kundliColor
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Kundli Score",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textPrimary
                            )
                            Text(
                                "${kundli.tier.displayName} Match",
                                fontSize = 13.sp,
                                color = colors.textSecondary
                            )
                        }
                        Text(
                            "${kundli.totalScore.toInt()}/${kundli.maxScore.toInt()}",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = kundliColor
                        )
                    }
                }

                // Guna breakdown
                if (kundli.gunas.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(16.dp))
                    kundli.gunas.forEach { guna ->
                        ScoreDimensionRow(
                            label = guna.name,
                            score = guna.obtained.toInt(),
                            maxScore = guna.maxPoints.toInt(),
                            color = kundliColor
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ScoreDimensionRow(
    label: String,
    score: Int,
    maxScore: Int,
    color: Color
) {
    val colors = LocalAdaptiveColors.current
    val progress = if (maxScore > 0) score.toFloat() / maxScore.toFloat() else 0f

    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(label, fontSize = 13.sp, color = colors.textSecondary)
            Text(
                "$score/$maxScore",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = colors.textPrimary
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
            color = color,
            trackColor = color.copy(alpha = 0.15f)
        )
    }
}

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
            Text(
                "It's a Match!",
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                color = AppColors.Rose
            )
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
                modifier = Modifier
                    .size(120.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.height(32.dp))
            Button(
                onClick = onSendMessage,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
            ) {
                Text(
                    "Send a Message",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            TextButton(onClick = onKeepSwiping) {
                Text(
                    "Keep Swiping",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 16.sp
                )
            }
        }
    }
}

@Composable
fun EmptyStateView() {
    val colors = LocalAdaptiveColors.current
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp)
    ) {
        Icon(
            Icons.Default.Explore,
            "No more profiles",
            tint = colors.textMuted,
            modifier = Modifier.size(72.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "No more profiles",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Check back later for new Sindhi singles in your area",
            fontSize = 15.sp,
            color = colors.textSecondary,
            textAlign = TextAlign.Center
        )
    }
}
