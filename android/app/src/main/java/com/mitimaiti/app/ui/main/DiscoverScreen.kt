@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.mitimaiti.app.viewmodels.FeedViewModel
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@Composable
fun DiscoverScreen(viewModel: FeedViewModel) {
    val colors = LocalAdaptiveColors.current
    val cards by viewModel.cards.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val showMatchAlert by viewModel.showMatchAlert.collectAsState()
    val matchedUser by viewModel.matchedUser.collectAsState()

    Box(modifier = Modifier.fillMaxSize().background(colors.backgroundGradient)) {
        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Discover", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("${viewModel.likesRemaining}", fontSize = 14.sp, color = AppColors.Rose, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.Favorite, "Likes remaining", tint = AppColors.Rose, modifier = Modifier.size(16.dp))
                }
            }

            // Card deck
            Box(
                modifier = Modifier.fillMaxWidth().weight(1f).padding(horizontal = 16.dp),
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
                                    ProfileCard(card = card)
                                }
                            }
                        }

                        // Top card with swipe
                        key(visibleCards.first().id) {
                            TopSwipeCard(
                                card = visibleCards.first(),
                                onSwipeRight = { viewModel.likeUser() },
                                onSwipeLeft = { viewModel.passUser() }
                            )
                        }
                    }
                }
            }

            // Action buttons
            if (cards.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 48.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    SmallFloatingActionButton(
                        onClick = { viewModel.rewind() },
                        containerColor = colors.surface, contentColor = AppColors.Gold, shape = CircleShape
                    ) { Icon(Icons.Default.Replay, "Rewind", modifier = Modifier.size(20.dp)) }

                    FloatingActionButton(
                        onClick = { viewModel.passUser() },
                        containerColor = colors.surface, contentColor = AppColors.Error,
                        shape = CircleShape, modifier = Modifier.size(56.dp)
                    ) { Icon(Icons.Default.Close, "Pass", modifier = Modifier.size(28.dp)) }

                    FloatingActionButton(
                        onClick = { viewModel.likeUser() },
                        containerColor = AppColors.Rose, contentColor = Color.White,
                        shape = CircleShape, modifier = Modifier.size(56.dp)
                    ) { Icon(Icons.Default.Favorite, "Like", modifier = Modifier.size(28.dp)) }

                    SmallFloatingActionButton(
                        onClick = { viewModel.likeUser() },
                        containerColor = colors.surface, contentColor = AppColors.Gold, shape = CircleShape
                    ) { Icon(Icons.Default.Star, "Super Like", modifier = Modifier.size(20.dp)) }
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
    }
}

@Composable
fun TopSwipeCard(
    card: FeedCard,
    onSwipeRight: () -> Unit,
    onSwipeLeft: () -> Unit
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
        ProfileCard(card = card)

        // LIKE overlay
        if (likeAlpha > 0f) {
            Box(modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(AppTheme.radiusXl)), contentAlignment = Alignment.TopStart) {
                Text("LIKE", fontSize = 36.sp, fontWeight = FontWeight.Black,
                    color = AppColors.Success.copy(alpha = likeAlpha),
                    modifier = Modifier.padding(24.dp).rotate(-20f))
            }
        }
        // PASS overlay
        if (passAlpha > 0f) {
            Box(modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(AppTheme.radiusXl)), contentAlignment = Alignment.TopEnd) {
                Text("PASS", fontSize = 36.sp, fontWeight = FontWeight.Black,
                    color = AppColors.Error.copy(alpha = passAlpha),
                    modifier = Modifier.padding(24.dp).rotate(20f))
            }
        }
    }
}

@Composable
fun ProfileCard(card: FeedCard) {
    val colors = LocalAdaptiveColors.current
    val user = card.user

    Card(
        modifier = Modifier.fillMaxSize(),
        shape = RoundedCornerShape(AppTheme.radiusXl),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AsyncImage(
                model = user.primaryPhoto?.url ?: "",
                contentDescription = user.displayName,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )

            Box(
                modifier = Modifier.fillMaxWidth().fillMaxHeight(0.5f)
                    .align(Alignment.BottomCenter)
                    .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f))))
            )

            Column(modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(20.dp)) {
                // Score badge
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val badgeColor = when (card.culturalScore.badge) {
                        CulturalBadge.GOLD -> AppColors.BadgeGold
                        CulturalBadge.GREEN -> AppColors.BadgeGreen
                        CulturalBadge.ORANGE -> AppColors.BadgeOrange
                        CulturalBadge.NONE -> colors.textMuted
                    }
                    Surface(shape = RoundedCornerShape(AppTheme.radiusFull), color = badgeColor.copy(alpha = 0.2f)) {
                        Row(modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Stars, "Score", tint = badgeColor, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("${card.culturalScore.overallScore}%", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = badgeColor)
                        }
                    }
                    if (user.isVerified) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(Icons.Default.Verified, "Verified", tint = AppColors.Info, modifier = Modifier.size(16.dp))
                    }
                    if (user.isOnline) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(AppColors.Success))
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(verticalAlignment = Alignment.Bottom) {
                    Text(user.displayName, fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    user.age?.let {
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("$it", fontSize = 22.sp, color = Color.White.copy(alpha = 0.8f))
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (user.city.isNotEmpty()) {
                        Icon(Icons.Default.LocationOn, "Location", tint = Color.White.copy(alpha = 0.7f), modifier = Modifier.size(14.dp))
                        Text(user.city, fontSize = 14.sp, color = Color.White.copy(alpha = 0.7f))
                        card.distanceKm?.let { Text(" - ${it.toInt()}km", fontSize = 14.sp, color = Color.White.copy(alpha = 0.5f)) }
                    }
                }

                user.occupation?.let { occ ->
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Work, "Work", tint = Color.White.copy(alpha = 0.7f), modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(occ, fontSize = 14.sp, color = Color.White.copy(alpha = 0.7f))
                    }
                }

                if (user.bio.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(user.bio, fontSize = 14.sp, color = Color.White.copy(alpha = 0.8f), maxLines = 2, overflow = TextOverflow.Ellipsis)
                }

                if (card.commonInterests > 0) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Interests, "Interests", tint = AppColors.Gold, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${card.commonInterests} common interests", fontSize = 13.sp, color = AppColors.Gold)
                    }
                }

                user.intent?.let { intent ->
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(shape = RoundedCornerShape(AppTheme.radiusFull), color = Color(intent.color).copy(alpha = 0.2f)) {
                        Text(intent.displayName, modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            fontSize = 12.sp, color = Color(intent.color), fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
fun MatchAlertOverlay(user: User, onSendMessage: () -> Unit, onKeepSwiping: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.85f)),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
            Text("It's a Match!", fontSize = 36.sp, fontWeight = FontWeight.Bold, color = AppColors.Rose)
            Spacer(modifier = Modifier.height(8.dp))
            Text("You and ${user.displayName} liked each other", fontSize = 16.sp, color = Color.White.copy(alpha = 0.8f), textAlign = TextAlign.Center)
            Spacer(modifier = Modifier.height(32.dp))
            AsyncImage(model = user.primaryPhoto?.url ?: "", contentDescription = user.displayName,
                modifier = Modifier.size(120.dp).clip(CircleShape), contentScale = ContentScale.Crop)
            Spacer(modifier = Modifier.height(32.dp))
            Button(onClick = onSendMessage, modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)) {
                Text("Send a Message", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }
            Spacer(modifier = Modifier.height(12.dp))
            TextButton(onClick = onKeepSwiping) {
                Text("Keep Swiping", color = Color.White.copy(alpha = 0.7f), fontSize = 16.sp)
            }
        }
    }
}

@Composable
fun EmptyStateView() {
    val colors = LocalAdaptiveColors.current
    Column(
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxSize().padding(32.dp)
    ) {
        Icon(Icons.Default.Explore, "No more profiles", tint = colors.textMuted, modifier = Modifier.size(72.dp))
        Spacer(modifier = Modifier.height(16.dp))
        Text("No more profiles", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Check back later for new Sindhi singles in your area", fontSize = 15.sp, color = colors.textSecondary, textAlign = TextAlign.Center)
    }
}
