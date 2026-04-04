package com.mitimaiti.app.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
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
    onNavigateToChat: (String) -> Unit,
    onNavigateToEditProfile: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onLogout: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    var selectedTab by remember { mutableStateOf(MainTab.DISCOVER) }
    val totalLikes = inboxViewModel.totalLikes
    val unreadMessages = inboxViewModel.unreadMessages

    LaunchedEffect(Unit) {
        feedViewModel.loadFeed()
        inboxViewModel.loadInbox()
        profileViewModel.loadProfile()
    }

    Scaffold(
        containerColor = colors.background,
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
            when (selectedTab) {
                MainTab.DISCOVER -> DiscoverScreen(viewModel = feedViewModel)
                MainTab.LIKED_YOU -> LikedYouScreen(viewModel = inboxViewModel)
                MainTab.MATCHES -> MatchesScreen(
                    viewModel = inboxViewModel,
                    onNavigateToChat = onNavigateToChat
                )
                MainTab.FAMILY -> FamilyScreen()
                MainTab.PROFILE -> ProfileScreen(
                    viewModel = profileViewModel,
                    onEditProfile = onNavigateToEditProfile,
                    onSettings = onNavigateToSettings,
                    onLogout = onLogout
                )
            }
        }
    }
}
