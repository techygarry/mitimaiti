@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.models.Match
import com.mitimaiti.app.models.MatchStatus
import com.mitimaiti.app.ui.components.*
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.InboxViewModel
import kotlinx.coroutines.delay
import java.util.concurrent.TimeUnit

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MatchesScreen(
    viewModel: InboxViewModel,
    onNavigateToChat: (String) -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val matches by viewModel.matches.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    // Tick every second for countdown timers
    var tick by remember { mutableLongStateOf(0L) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000L)
            tick++
        }
    }
    // reference tick so recomposition happens
    @Suppress("UNUSED_EXPRESSION")
    tick

    val newMatches = remember(matches) {
        matches.filter { it.status == MatchStatus.PENDING_FIRST_MESSAGE }
    }
    val activeMatches = remember(matches) {
        matches.filter { it.status == MatchStatus.ACTIVE }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.backgroundGradient)
            .statusBarsPadding()
    ) {
        // Header
        Text(
            "Matches",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
        )

        if (isLoading) {
            Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                repeat(4) { ShimmerMatchItem(); Spacer(modifier = Modifier.height(4.dp)) }
            }
        } else if (matches.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                EmptyState(
                    icon = Icons.Default.ChatBubbleOutline,
                    title = "No matches yet",
                    description = "Start swiping to find your match!",
                    actionLabel = "Discover",
                    onAction = { }
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                // ── "Your Matches" horizontal scroll section ──
                if (newMatches.isNotEmpty()) {
                    item {
                        Column {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 20.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    "Your Matches",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = CircleShape,
                                    color = AppColors.Rose
                                ) {
                                    Text(
                                        "${newMatches.size}",
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }

                            LazyRow(
                                contentPadding = PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                items(newMatches, key = { it.id }) { match ->
                                    TimerAvatar(
                                        match = match,
                                        onClick = { onNavigateToChat(match.id) }
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))
                            Divider(
                                color = colors.borderSubtle,
                                modifier = Modifier.padding(horizontal = 20.dp)
                            )
                        }
                    }
                }

                // ── "Chats" section header ──
                if (activeMatches.isNotEmpty()) {
                    item {
                        Text(
                            "Chats",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary,
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
                        )
                    }
                    items(activeMatches, key = { it.id }) { match ->
                        ChatRow(
                            match = match,
                            onClick = { onNavigateToChat(match.id) }
                        )
                    }
                }

                // Also show new matches in list form if they have messages
                if (newMatches.isNotEmpty() && activeMatches.isEmpty()) {
                    item {
                        Text(
                            "Chats",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary,
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
                        )
                    }
                    item {
                        Text(
                            "Send a message to start chatting!",
                            fontSize = 14.sp,
                            color = colors.textMuted,
                            modifier = Modifier.padding(horizontal = 20.dp)
                        )
                    }
                }
            }
        }
    }
}

/**
 * Circular timer avatar for the "Your Matches" horizontal scroll.
 * Shows profile photo, gold progress ring for expiry, lock/timer icons, unread badge.
 */
@Composable
fun TimerAvatar(match: Match, onClick: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    val user = match.otherUser

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(76.dp)
            .clickable(onClick = onClick)
    ) {
        Box(contentAlignment = Alignment.Center) {
            // Gold circular progress ring (shared component)
            CountdownRing(
                expiresAt = match.expiresAt ?: (System.currentTimeMillis() + 24 * 60 * 60 * 1000L),
                size = 72.dp,
                strokeWidth = 3.dp,
                ringColor = if (match.isExpiringSoon) AppColors.Error else AppColors.Gold,
                showText = false
            ) {
                // Profile photo inside ring
                AsyncImage(
                    model = user.primaryPhoto?.urlThumb ?: user.primaryPhoto?.url ?: "",
                    contentDescription = user.displayName,
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }

            // Lock icon overlay (bottom-right) if firstMsgLocked
            if (match.firstMsgLocked) {
                Box(
                    modifier = Modifier
                        .size(22.dp)
                        .align(Alignment.BottomEnd)
                        .clip(CircleShape)
                        .background(AppColors.Rose),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Lock, null, tint = Color.White, modifier = Modifier.size(12.dp))
                }
            }

            // Timer icon (top-right) for new match
            if (!match.hasFirstMessage) {
                Box(
                    modifier = Modifier
                        .size(22.dp)
                        .align(Alignment.TopEnd)
                        .clip(CircleShape)
                        .background(AppColors.Gold),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Schedule, null, tint = Color.White, modifier = Modifier.size(12.dp))
                }
            }

            // Unread count badge (top-left) - shared component
            CountBadge(count = match.unreadCount, modifier = Modifier.align(Alignment.TopStart))
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            user.displayName.split(" ").first(),
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = colors.textPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        if (match.showCountdown) {
            CountdownBanner(expiresAt = match.expiresAt ?: 0L)
        }
    }
}

/**
 * Chat conversation row for the "Chats" list.
 * Shows avatar with online dot, name+age, last message (bold if unread),
 * relative timestamp, unread badge.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatRow(match: Match, onClick: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    val user = match.otherUser
    val isUnread = match.unreadCount > 0

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 2.dp),
        shape = RoundedCornerShape(AppTheme.radiusMd),
        color = if (isUnread) colors.surfaceMedium else Color.Transparent,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar with online indicator
            Box {
                AsyncImage(
                    model = user.primaryPhoto?.urlThumb ?: user.primaryPhoto?.url ?: "",
                    contentDescription = user.displayName,
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                // Online green dot
                if (user.isOnline) {
                    Box(
                        modifier = Modifier
                            .size(14.dp)
                            .align(Alignment.BottomEnd)
                            .offset(x = (-1).dp, y = (-1).dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .padding(2.dp)
                            .clip(CircleShape)
                            .background(AppColors.Success)
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Name + age + last message
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        buildString {
                            append(user.displayName)
                            user.age?.let { append(", $it") }
                        },
                        fontSize = 16.sp,
                        fontWeight = if (isUnread) FontWeight.Bold else FontWeight.SemiBold,
                        color = colors.textPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (user.isVerified) {
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            Icons.Default.Verified, "Verified",
                            tint = AppColors.Info,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(3.dp))
                Text(
                    match.lastMessage ?: "Send the first message!",
                    fontSize = 14.sp,
                    color = when {
                        match.lastMessage == null -> AppColors.Rose
                        isUnread -> colors.textPrimary
                        else -> colors.textSecondary
                    },
                    fontWeight = if (isUnread) FontWeight.SemiBold else FontWeight.Normal,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    fontStyle = if (match.lastMessage == null)
                        androidx.compose.ui.text.font.FontStyle.Italic
                    else
                        androidx.compose.ui.text.font.FontStyle.Normal
                )
            }

            // Right: timestamp + unread badge
            Column(horizontalAlignment = Alignment.End) {
                // Relative timestamp
                if (match.matchedAt > 0) {
                    Text(
                        formatRelativeTime(match.matchedAt),
                        fontSize = 12.sp,
                        color = if (isUnread) AppColors.Rose else colors.textMuted
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                // Unread badge
                if (isUnread) {
                    Badge(containerColor = AppColors.Rose) {
                        Text(
                            match.unreadCount.toString(),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                // Countdown if applicable
                if (match.showCountdown && !isUnread) {
                    val hours = TimeUnit.MILLISECONDS.toHours(match.timeRemaining)
                    Text(
                        "${hours}h left",
                        fontSize = 11.sp,
                        color = if (match.isExpiringSoon) AppColors.Error else colors.textMuted
                    )
                }
            }
        }
    }
}

/**
 * Formats a timestamp into a relative string (e.g. "Just now", "5m", "2h", "Yesterday").
 */
private fun formatRelativeTime(timestamp: Long): String {
    val now = System.currentTimeMillis()
    val diff = now - timestamp
    val minutes = TimeUnit.MILLISECONDS.toMinutes(diff)
    val hours = TimeUnit.MILLISECONDS.toHours(diff)
    val days = TimeUnit.MILLISECONDS.toDays(diff)
    return when {
        minutes < 1 -> "Just now"
        minutes < 60 -> "${minutes}m"
        hours < 24 -> "${hours}h"
        days < 2 -> "Yesterday"
        days < 7 -> "${days}d"
        else -> "${days / 7}w"
    }
}
