@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.models.AppThemeMode
import com.mitimaiti.app.ui.components.GlassCard
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBack: () -> Unit, onLogout: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    val scrollState = rememberScrollState()

    // State
    var profileVisible by remember { mutableStateOf(true) }
    var showOnlineStatus by remember { mutableStateOf(true) }
    var distanceFilter by remember { mutableFloatStateOf(50f) }
    var ageRangeStart by remember { mutableFloatStateOf(21f) }
    var ageRangeEnd by remember { mutableFloatStateOf(35f) }
    var matchNotifications by remember { mutableStateOf(true) }
    var messageNotifications by remember { mutableStateOf(true) }
    var likeNotifications by remember { mutableStateOf(true) }
    var familyNotifications by remember { mutableStateOf(true) }
    var selectedTheme by remember { mutableStateOf(AppThemeMode.SYSTEM) }

    Scaffold(
        containerColor = colors.background,
        topBar = {
            TopAppBar(
                title = { Text("Settings", fontWeight = FontWeight.Bold, color = colors.textPrimary) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary) }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colors.surface)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Visibility
            SettingsSection(title = "Visibility", icon = Icons.Default.Visibility) {
                SettingsToggle("Profile Visible", "Others can see your profile", profileVisible) { profileVisible = it }
                SettingsToggle("Show Online Status", "Let others know you're online", showOnlineStatus) { showOnlineStatus = it }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Filters
            SettingsSection(title = "Discovery Filters", icon = Icons.Default.FilterList) {
                Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                    Text("Maximum Distance: ${distanceFilter.toInt()} km", fontSize = 14.sp, color = colors.textPrimary)
                    Slider(
                        value = distanceFilter,
                        onValueChange = { distanceFilter = it },
                        valueRange = 5f..500f,
                        colors = SliderDefaults.colors(thumbColor = AppColors.Rose, activeTrackColor = AppColors.Rose)
                    )
                }
                HorizontalDivider(color = colors.borderSubtle)
                Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                    Text("Age Range: ${ageRangeStart.toInt()} - ${ageRangeEnd.toInt()}", fontSize = 14.sp, color = colors.textPrimary)
                    RangeSlider(
                        value = ageRangeStart..ageRangeEnd,
                        onValueChange = { range -> ageRangeStart = range.start; ageRangeEnd = range.endInclusive },
                        valueRange = 18f..60f,
                        colors = SliderDefaults.colors(thumbColor = AppColors.Rose, activeTrackColor = AppColors.Rose)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Notifications
            SettingsSection(title = "Notifications", icon = Icons.Default.Notifications) {
                SettingsToggle("Match Notifications", "When you get a new match", matchNotifications) { matchNotifications = it }
                SettingsToggle("Message Notifications", "When you receive messages", messageNotifications) { messageNotifications = it }
                SettingsToggle("Like Notifications", "When someone likes your profile", likeNotifications) { likeNotifications = it }
                SettingsToggle("Family Notifications", "Family suggestions & activity", familyNotifications) { familyNotifications = it }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Appearance
            SettingsSection(title = "Appearance", icon = Icons.Default.Palette) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Theme", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = colors.textSecondary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        AppThemeMode.entries.forEach { mode ->
                            FilterChip(
                                selected = selectedTheme == mode,
                                onClick = { selectedTheme = mode },
                                label = { Text(mode.displayName) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = AppColors.Rose,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Account
            SettingsSection(title = "Account", icon = Icons.Default.AccountCircle) {
                SettingsAction("Delete Account", Icons.Default.DeleteForever, AppColors.Error) { }
                SettingsAction("Sign Out", Icons.Default.Logout, AppColors.Error) { onLogout() }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // App info
            Text("MitiMaiti v1.0.0", fontSize = 13.sp, color = colors.textMuted, modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun SettingsSection(title: String, icon: ImageVector, content: @Composable ColumnScope.() -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column {
        Row(
            modifier = Modifier.padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = AppColors.Rose, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(title, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
        }
        Spacer(modifier = Modifier.height(4.dp))
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            content()
        }
    }
}

@Composable
fun SettingsToggle(title: String, subtitle: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = colors.textPrimary)
            Text(subtitle, fontSize = 12.sp, color = colors.textMuted)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(checkedTrackColor = AppColors.Rose, checkedThumbColor = Color.White)
        )
    }
}

@Composable
fun SettingsAction(title: String, icon: ImageVector, color: Color, onClick: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    TextButton(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(12.dp))
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = color)
        }
    }
}
