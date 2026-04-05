@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import com.mitimaiti.app.ui.components.CountBadge
import com.mitimaiti.app.ui.components.NotificationPanel
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.utils.AppNotificationManager
import com.mitimaiti.app.viewmodels.FamilyViewModel
import com.mitimaiti.app.viewmodels.FeedViewModel
import com.mitimaiti.app.viewmodels.InboxViewModel
import com.mitimaiti.app.viewmodels.ProfileViewModel

enum class MainTab(
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    DISCOVER("Discover", Icons.Filled.Explore, Icons.Outlined.Explore),
    LIKED_YOU("Liked You", Icons.Filled.Favorite, Icons.Outlined.FavoriteBorder),
    MATCHES("Matches", Icons.Filled.ChatBubble, Icons.Outlined.ChatBubbleOutline),
    FAMILY("Family", Icons.Filled.Groups, Icons.Outlined.Groups),
    PROFILE("Profile", Icons.Filled.Person, Icons.Outlined.Person)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainTabScreen(
    feedViewModel: FeedViewModel,
    inboxViewModel: InboxViewModel,
    profileViewModel: ProfileViewModel,
    familyViewModel: FamilyViewModel,
    onNavigateToChat: (String) -> Unit,
    onNavigateToEditProfile: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onLogout: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    var selectedTab by remember { mutableStateOf(MainTab.DISCOVER) }
    val totalLikes = inboxViewModel.totalLikes
    val unreadMessages = inboxViewModel.unreadMessages

    // Notification panel state
    var showNotificationPanel by remember { mutableStateOf(false) }
    val notifications by AppNotificationManager.shared.notifications.collectAsState()
    val unreadNotifCount = notifications.count { !it.isRead }

    LaunchedEffect(Unit) {
        feedViewModel.loadFeed()
        inboxViewModel.loadInbox()
        profileViewModel.loadProfile()
        familyViewModel.loadFamily()
    }

    Scaffold(
        containerColor = colors.background,
        topBar = {
            // Top bar with logo + notification bell
            TopAppBar(
                title = {
                    Text(
                        "MitiMaiti",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.Rose
                    )
                },
                actions = {
                    Box {
                        IconButton(onClick = { showNotificationPanel = !showNotificationPanel }) {
                            Icon(
                                Icons.Default.Notifications,
                                "Notifications",
                                tint = colors.textPrimary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        if (unreadNotifCount > 0) {
                            CountBadge(
                                count = unreadNotifCount,
                                modifier = Modifier.align(Alignment.TopEnd).offset(x = (-4).dp, y = 4.dp),
                                size = 18.dp
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colors.surface)
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = colors.surface,
                contentColor = colors.textPrimary
            ) {
                MainTab.entries.forEach { tab ->
                    val selected = selectedTab == tab
                    val badgeCount = when (tab) {
                        MainTab.LIKED_YOU -> totalLikes
                        MainTab.MATCHES -> unreadMessages
                        else -> 0
                    }
                    NavigationBarItem(
                        selected = selected,
                        onClick = { selectedTab = tab },
                        icon = {
                            if (badgeCount > 0) {
                                BadgedBox(badge = {
                                    Badge(containerColor = AppColors.Rose) {
                                        Text(
                                            if (badgeCount > 99) "99+" else badgeCount.toString(),
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }) {
                                    Icon(
                                        if (selected) tab.selectedIcon else tab.unselectedIcon,
                                        contentDescription = tab.title
                                    )
                                }
                            } else {
                                Icon(
                                    if (selected) tab.selectedIcon else tab.unselectedIcon,
                                    contentDescription = tab.title
                                )
                            }
                        },
                        label = { Text(tab.title, fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = AppColors.Rose,
                            selectedTextColor = AppColors.Rose,
                            unselectedIconColor = colors.textMuted,
                            unselectedTextColor = colors.textMuted,
                            indicatorColor = AppColors.Rose.copy(alpha = 0.1f)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            // Tab content
            when (selectedTab) {
                MainTab.DISCOVER -> DiscoverScreen(viewModel = feedViewModel)
                MainTab.LIKED_YOU -> LikedYouScreen(viewModel = inboxViewModel)
                MainTab.MATCHES -> MatchesScreen(
                    viewModel = inboxViewModel,
                    onNavigateToChat = onNavigateToChat
                )
                MainTab.FAMILY -> FamilyScreen(viewModel = familyViewModel)
                MainTab.PROFILE -> ProfileScreen(
                    viewModel = profileViewModel,
                    onEditProfile = onNavigateToEditProfile,
                    onSettings = onNavigateToSettings,
                    onLogout = onLogout
                )
            }

            // Notification panel overlay (on top of content)
            NotificationPanel(
                visible = showNotificationPanel,
                onDismiss = { showNotificationPanel = false },
                onNotificationTap = { notification ->
                    showNotificationPanel = false
                    // Navigate to relevant tab based on notification type
                    val targetTab = MainTab.entries.getOrNull(notification.type.destinationTab)
                    if (targetTab != null) selectedTab = targetTab
                }
            )
        }
    }
}
