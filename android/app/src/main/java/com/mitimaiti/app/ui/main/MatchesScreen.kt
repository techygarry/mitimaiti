package com.mitimaiti.app.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.InboxViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MatchesScreen(
    viewModel: InboxViewModel,
    onNavigateToChat: (String) -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val matches by viewModel.matches.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize().background(colors.backgroundGradient).statusBarsPadding()
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
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AppColors.Rose)
            }
        } else if (matches.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                    Icon(Icons.Default.ChatBubbleOutline, "No matches", tint = colors.textMuted, modifier = Modifier.size(64.dp))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("No matches yet", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Start swiping to find your match!", fontSize = 15.sp, color = colors.textSecondary, textAlign = TextAlign.Center)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
            ) {
                // New matches (pending first message)
                val newMatches = matches.filter { it.status == MatchStatus.PENDING_FIRST_MESSAGE }
                if (newMatches.isNotEmpty()) {
                    item {
                        Text("New", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = colors.textMuted, modifier = Modifier.padding(horizontal = 8.dp, vertical = 8.dp))
                    }
                    items(newMatches, key = { it.id }) { match ->
                        MatchRow(match = match, onClick = { onNavigateToChat(match.id) })
                    }
                }

                // Active conversations
                val activeMatches = matches.filter { it.status == MatchStatus.ACTIVE }
                if (activeMatches.isNotEmpty()) {
                    item {
                        Text("Conversations", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = colors.textMuted, modifier = Modifier.padding(horizontal = 8.dp, vertical = 8.dp))
                    }
                    items(activeMatches, key = { it.id }) { match ->
                        MatchRow(match = match, onClick = { onNavigateToChat(match.id) })
                    }
                }
            }
        }
    }
}

@Composable
@OptIn(ExperimentalMaterial3Api::class)
fun MatchRow(match: Match, onClick: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    val user = match.otherUser

    Surface(
        modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
        shape = RoundedCornerShape(AppTheme.radiusMd),
        color = if (match.unreadCount > 0) colors.surfaceMedium else Color.Transparent,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar with online indicator
            Box {
                AsyncImage(
                    model = user.primaryPhoto?.urlThumb ?: user.primaryPhoto?.url ?: "",
                    contentDescription = user.displayName,
                    modifier = Modifier.size(56.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                if (user.isOnline) {
                    Box(
                        modifier = Modifier
                            .size(14.dp)
                            .clip(CircleShape)
                            .background(AppColors.Success)
                            .align(Alignment.BottomEnd)
                    )
                }
                // Expiring indicator
                if (match.isExpiringSoon) {
                    Box(
                        modifier = Modifier
                            .size(14.dp)
                            .clip(CircleShape)
                            .background(AppColors.Warning)
                            .align(Alignment.TopEnd)
                    ) {
                        Icon(Icons.Default.Schedule, null, tint = Color.White, modifier = Modifier.size(10.dp).align(Alignment.Center))
                    }
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Text info
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        user.displayName,
                        fontSize = 16.sp,
                        fontWeight = if (match.unreadCount > 0) FontWeight.Bold else FontWeight.SemiBold,
                        color = colors.textPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (user.isVerified) {
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.Verified, "Verified", tint = AppColors.Info, modifier = Modifier.size(14.dp))
                    }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    match.lastMessage ?: "Send the first message!",
                    fontSize = 14.sp,
                    color = if (match.lastMessage == null) AppColors.Rose else colors.textSecondary,
                    fontWeight = if (match.unreadCount > 0) FontWeight.Medium else FontWeight.Normal,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    fontStyle = if (match.lastMessage == null) androidx.compose.ui.text.font.FontStyle.Italic else androidx.compose.ui.text.font.FontStyle.Normal
                )
            }

            // Right side: unread badge or time
            Column(horizontalAlignment = Alignment.End) {
                if (match.unreadCount > 0) {
                    Badge(containerColor = AppColors.Rose) {
                        Text(
                            match.unreadCount.toString(),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                if (match.showCountdown) {
                    val hours = match.timeRemaining / (60 * 60 * 1000)
                    Text(
                        "${hours}h left",
                        fontSize = 12.sp,
                        color = if (match.isExpiringSoon) AppColors.Error else colors.textMuted
                    )
                }
            }
        }
    }
}
