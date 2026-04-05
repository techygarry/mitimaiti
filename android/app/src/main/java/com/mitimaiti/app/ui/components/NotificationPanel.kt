package com.mitimaiti.app.ui.components

import androidx.compose.animation.*
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.utils.AppNotification
import com.mitimaiti.app.utils.AppNotificationManager
import com.mitimaiti.app.utils.NotificationType

@Composable
fun NotificationPanel(
    visible: Boolean,
    onDismiss: () -> Unit,
    onNotificationTap: (AppNotification) -> Unit = {}
) {
    val colors = LocalAdaptiveColors.current
    val manager = AppNotificationManager.shared
    val notifications by manager.notifications.collectAsState()
    val unreadCount = notifications.count { !it.isRead }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + slideInVertically(initialOffsetY = { -it / 2 }),
        exit = fadeOut() + slideOutVertically(targetOffsetY = { -it / 2 })
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp)
                .heightIn(max = 420.dp),
            shape = RoundedCornerShape(AppTheme.radiusLg),
            color = colors.surface,
            shadowElevation = 16.dp,
            tonalElevation = 4.dp
        ) {
            Column {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            "Notifications",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        if (unreadCount > 0) {
                            Spacer(modifier = Modifier.width(8.dp))
                            CountBadge(count = unreadCount)
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        if (unreadCount > 0) {
                            TextButton(onClick = { manager.markAllRead() }) {
                                Text("Mark all read", fontSize = 13.sp, color = AppColors.Rose)
                            }
                        }
                        if (notifications.isNotEmpty()) {
                            IconButton(onClick = { manager.clearAll() }, modifier = Modifier.size(32.dp)) {
                                Icon(Icons.Default.DeleteSweep, "Clear all", tint = colors.textMuted, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }

                HorizontalDivider(color = colors.borderSubtle)

                if (notifications.isEmpty()) {
                    // Empty state
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.NotificationsNone,
                                null,
                                tint = colors.textMuted,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("No notifications", fontSize = 14.sp, color = colors.textMuted)
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        contentPadding = PaddingValues(vertical = 4.dp)
                    ) {
                        items(notifications.take(20), key = { it.id }) { notification ->
                            NotificationItem(
                                notification = notification,
                                onClick = {
                                    manager.markAsRead(notification.id)
                                    onNotificationTap(notification)
                                },
                                onDismiss = { manager.dismiss(notification.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationItem(
    notification: AppNotification,
    onClick: () -> Unit,
    onDismiss: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val bgColor = if (!notification.isRead) AppColors.Rose.copy(alpha = 0.05f) else Color.Transparent

    val (iconColor, icon) = when (notification.type) {
        NotificationType.MATCH -> AppColors.Rose to Icons.Default.Favorite
        NotificationType.LIKE -> AppColors.Rose to Icons.Default.ThumbUp
        NotificationType.MESSAGE -> AppColors.Info to Icons.Default.ChatBubble
        NotificationType.FAMILY -> AppColors.Gold to Icons.Default.FamilyRestroom
        NotificationType.FAMILY_SUGGESTION -> AppColors.Gold to Icons.Default.Lightbulb
        NotificationType.EXPIRY -> AppColors.Warning to Icons.Default.Timer
        NotificationType.SYSTEM -> AppColors.Info to Icons.Default.Info
        NotificationType.PROFILE_VIEW -> AppColors.Success to Icons.Default.Visibility
        NotificationType.ICEBREAKER -> AppColors.Info to Icons.Default.AcUnit
        NotificationType.FEATURE -> AppColors.Gold to Icons.Default.AutoAwesome
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(bgColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.Top
    ) {
        // Icon circle
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(iconColor.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, null, tint = iconColor, modifier = Modifier.size(18.dp))
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                notification.title,
                fontSize = 14.sp,
                fontWeight = if (!notification.isRead) FontWeight.SemiBold else FontWeight.Normal,
                color = colors.textPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                notification.body,
                fontSize = 13.sp,
                color = colors.textSecondary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 18.sp
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                formatNotificationTime(notification.createdAt),
                fontSize = 11.sp,
                color = colors.textMuted
            )
        }

        // Unread dot
        if (!notification.isRead) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(AppColors.Rose)
            )
        }
    }
}

private fun formatNotificationTime(timestamp: Long): String {
    val diff = System.currentTimeMillis() - timestamp
    val minutes = diff / (1000 * 60)
    val hours = minutes / 60
    val days = hours / 24
    return when {
        minutes < 1 -> "Just now"
        minutes < 60 -> "${minutes}m ago"
        hours < 24 -> "${hours}h ago"
        days < 7 -> "${days}d ago"
        else -> "${days / 7}w ago"
    }
}
