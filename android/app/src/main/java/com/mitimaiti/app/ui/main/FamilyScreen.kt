package com.mitimaiti.app.ui.main

import androidx.compose.animation.*
import androidx.compose.foundation.background
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
import com.mitimaiti.app.models.*
import com.mitimaiti.app.services.MockData
import com.mitimaiti.app.ui.components.GlassCard
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import kotlinx.coroutines.delay

@Composable
fun FamilyScreen() {
    val colors = LocalAdaptiveColors.current
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Members", "Suggestions")
    val members = remember { MockData.makeFamilyMembers() }
    val suggestions = remember { MockData.makeFamilySuggestions() }
    var showPermissionDetail by remember { mutableStateOf<FamilyMember?>(null) }
    var showToast by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(showToast) {
        if (showToast != null) { delay(3000); showToast = null }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.fillMaxSize().background(colors.backgroundGradient).statusBarsPadding()
        ) {
            // Header
            Text(
                "Family",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
            )

            // Invite card
            GlassCard(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.GroupAdd, null, tint = AppColors.Rose, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Invite Family Members", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                            Text("Up to 3 members can join your family circle", fontSize = 13.sp, color = colors.textSecondary)
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { showToast = "Invite link copied!" },
                            modifier = Modifier.weight(1f).height(44.dp),
                            shape = RoundedCornerShape(AppTheme.radiusMd),
                            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
                        ) {
                            Icon(Icons.Default.Link, null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Copy Link", fontSize = 14.sp, color = Color.White)
                        }
                        OutlinedButton(
                            onClick = { showToast = "Share dialog opened" },
                            modifier = Modifier.weight(1f).height(44.dp),
                            shape = RoundedCornerShape(AppTheme.radiusMd)
                        ) {
                            Icon(Icons.Default.Share, null, tint = AppColors.Rose, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Share", fontSize = 14.sp, color = AppColors.Rose)
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("${members.size}/3 members joined", fontSize = 12.sp, color = colors.textMuted, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Tab bar
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.Transparent,
                contentColor = AppColors.Rose,
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title, fontWeight = if (selectedTab == index) FontWeight.SemiBold else FontWeight.Normal) },
                        selectedContentColor = AppColors.Rose,
                        unselectedContentColor = colors.textMuted
                    )
                }
            }

            // Content
            when (selectedTab) {
                0 -> MembersList(members = members, onMemberClick = { showPermissionDetail = it })
                1 -> SuggestionsList(suggestions = suggestions, onViewProfile = { showToast = "Viewing ${it.displayName}'s profile" })
            }
        }

        // Permission detail bottom sheet
        showPermissionDetail?.let { member ->
            PermissionDetailSheet(
                member = member,
                onDismiss = { showPermissionDetail = null }
            )
        }

        // Toast
        showToast?.let { message ->
            Box(
                modifier = Modifier.fillMaxSize().padding(bottom = 32.dp),
                contentAlignment = Alignment.BottomCenter
            ) {
                Surface(
                    shape = RoundedCornerShape(AppTheme.radiusFull),
                    color = colors.cardDark,
                    shadowElevation = 8.dp
                ) {
                    Text(
                        message,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                        fontSize = 14.sp,
                        color = colors.textPrimary,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
fun MembersList(members: List<FamilyMember>, onMemberClick: (FamilyMember) -> Unit) {
    val colors = LocalAdaptiveColors.current
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(members, key = { it.id }) { member ->
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Surface(onClick = { onMemberClick(member) }, color = Color.Transparent) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Avatar placeholder
                        Box(
                            modifier = Modifier.size(48.dp).clip(CircleShape).background(AppColors.Rose.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(member.name.take(1), fontSize = 20.sp, fontWeight = FontWeight.Bold, color = AppColors.Rose)
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(member.name, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                            Text(member.relationship, fontSize = 13.sp, color = colors.textSecondary)
                        }

                        // Status badge
                        Surface(
                            shape = RoundedCornerShape(AppTheme.radiusFull),
                            color = when (member.status) {
                                FamilyMemberStatus.ACTIVE -> AppColors.Success.copy(alpha = 0.1f)
                                FamilyMemberStatus.PENDING -> AppColors.Warning.copy(alpha = 0.1f)
                                FamilyMemberStatus.REVOKED -> AppColors.Error.copy(alpha = 0.1f)
                            }
                        ) {
                            Text(
                                member.status.value.replaceFirstChar { it.uppercase() },
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = when (member.status) {
                                    FamilyMemberStatus.ACTIVE -> AppColors.Success
                                    FamilyMemberStatus.PENDING -> AppColors.Warning
                                    FamilyMemberStatus.REVOKED -> AppColors.Error
                                }
                            )
                        }

                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.ChevronRight, null, tint = colors.textMuted, modifier = Modifier.size(20.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun SuggestionsList(suggestions: List<FamilySuggestion>, onViewProfile: (User) -> Unit) {
    val colors = LocalAdaptiveColors.current
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(suggestions, key = { it.id }) { suggestion ->
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Suggested by
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Person, null, tint = colors.textMuted, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Suggested by ${suggestion.suggestedBy.name} (${suggestion.suggestedBy.relationship})", fontSize = 12.sp, color = colors.textMuted)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Suggested user
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(
                            model = suggestion.suggestedUser.primaryPhoto?.urlThumb ?: "",
                            contentDescription = null,
                            modifier = Modifier.size(48.dp).clip(CircleShape),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "${suggestion.suggestedUser.displayName}, ${suggestion.suggestedUser.age ?: ""}",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textPrimary
                            )
                            Text(
                                suggestion.suggestedUser.city,
                                fontSize = 13.sp,
                                color = colors.textSecondary
                            )
                        }
                    }

                    // Note
                    suggestion.note?.let { note ->
                        Spacer(modifier = Modifier.height(8.dp))
                        Surface(
                            shape = RoundedCornerShape(AppTheme.radiusMd),
                            color = AppColors.Gold.copy(alpha = 0.1f)
                        ) {
                            Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.Top) {
                                Icon(Icons.Default.FormatQuote, null, tint = AppColors.Gold, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(note, fontSize = 13.sp, color = colors.textSecondary, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Action buttons
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { onViewProfile(suggestion.suggestedUser) },
                            modifier = Modifier.weight(1f).height(40.dp),
                            shape = RoundedCornerShape(AppTheme.radiusMd),
                            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
                        ) {
                            Text("View Profile", fontSize = 14.sp, color = Color.White)
                        }
                        OutlinedButton(
                            onClick = { },
                            modifier = Modifier.weight(1f).height(40.dp),
                            shape = RoundedCornerShape(AppTheme.radiusMd)
                        ) {
                            Text("Dismiss", fontSize = 14.sp, color = colors.textSecondary)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PermissionDetailSheet(member: FamilyMember, onDismiss: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    val perms = member.permissions

    Box(
        modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.5f)),
        contentAlignment = Alignment.BottomCenter
    ) {
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            color = colors.surface
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                // Handle bar
                Box(
                    modifier = Modifier.width(40.dp).height(4.dp).clip(RoundedCornerShape(2.dp)).background(colors.textMuted.copy(alpha = 0.3f)).align(Alignment.CenterHorizontally)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text("${member.name}'s Permissions", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                Text(member.relationship, fontSize = 14.sp, color = colors.textSecondary)

                Spacer(modifier = Modifier.height(20.dp))

                PermissionRow("View Profile", perms.canViewProfile)
                PermissionRow("View Photos", perms.canViewPhotos)
                PermissionRow("View Basic Info", perms.canViewBasics)
                PermissionRow("View Sindhi Details", perms.canViewSindhi)
                PermissionRow("View Matches", perms.canViewMatches)
                PermissionRow("Suggest Matches", perms.canSuggest)
                PermissionRow("View Cultural Score", perms.canViewCulturalScore)
                PermissionRow("View Kundli", perms.canViewKundli)

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(AppTheme.radiusLg),
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
                ) {
                    Text("Done", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun PermissionRow(label: String, enabled: Boolean) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, fontSize = 15.sp, color = colors.textPrimary)
        Icon(
            if (enabled) Icons.Default.CheckCircle else Icons.Default.Cancel,
            null,
            tint = if (enabled) AppColors.Success else AppColors.Error.copy(alpha = 0.5f),
            modifier = Modifier.size(22.dp)
        )
    }
}
