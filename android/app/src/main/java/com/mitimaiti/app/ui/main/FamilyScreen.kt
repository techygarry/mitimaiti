@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.animation.*
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
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
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.mitimaiti.app.models.*
import com.mitimaiti.app.ui.components.*
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.FamilyViewModel
import kotlin.math.absoluteValue
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FamilyScreen(viewModel: FamilyViewModel = viewModel()) {
    val colors = LocalAdaptiveColors.current
    val members by viewModel.members.collectAsState()
    val suggestions by viewModel.suggestions.collectAsState()
    val selectedTab by viewModel.selectedTab.collectAsState()
    val selectedMemberId by viewModel.selectedMemberId.collectAsState()
    val showInviteModal by viewModel.showInviteModal.collectAsState()
    val showRevokeAllModal by viewModel.showRevokeAllModal.collectAsState()
    val toastMessage by viewModel.toastMessage.collectAsState()
    val currentInvite by viewModel.currentInvite.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadFamily() }

    val selectedMember = viewModel.selectedMember

    Box(modifier = Modifier.fillMaxSize()) {
        // Permission detail view (full screen overlay)
        if (selectedMember != null) {
            PermissionDetailView(
                member = selectedMember,
                viewModel = viewModel,
                onBack = { viewModel.selectMember(null) }
            )
        } else {
            // Main family content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(colors.backgroundGradient)
                    .statusBarsPadding()
            ) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Family Mode",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            "Let your family help you find the right match",
                            fontSize = 14.sp,
                            color = colors.textSecondary
                        )
                    }
                    TextButton(
                        onClick = { viewModel.toggleRevokeAllModal() },
                        colors = ButtonDefaults.textButtonColors(contentColor = AppColors.Error)
                    ) {
                        Text("Revoke All", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    }
                }

                // Invite card
                GlassCard(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.GroupAdd, null,
                                tint = AppColors.Rose,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    "Invite Family Members",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = colors.textPrimary
                                )
                                Text(
                                    "Up to 3 members can join your family circle",
                                    fontSize = 13.sp,
                                    color = colors.textSecondary
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { viewModel.generateInvite() },
                                modifier = Modifier.weight(1f).height(44.dp),
                                shape = RoundedCornerShape(AppTheme.radiusMd),
                                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
                            ) {
                                Icon(Icons.Default.Link, null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Copy Link", fontSize = 14.sp, color = Color.White)
                            }
                            OutlinedButton(
                                onClick = { viewModel.generateInvite() },
                                modifier = Modifier.weight(1f).height(44.dp),
                                shape = RoundedCornerShape(AppTheme.radiusMd)
                            ) {
                                Icon(
                                    Icons.Default.Share, null,
                                    tint = AppColors.Rose,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Share", fontSize = 14.sp, color = AppColors.Rose)
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "${members.size}/3 members joined",
                            fontSize = 12.sp,
                            color = colors.textMuted,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Lock, null, tint = colors.textMuted, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                "Messages are never visible to family members",
                                fontSize = 11.sp,
                                color = colors.textMuted
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Tab bar with counts
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color.Transparent,
                    contentColor = AppColors.Rose,
                    modifier = Modifier.padding(horizontal = 16.dp)
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { viewModel.selectTab(0) },
                        text = {
                            Text(
                                "Members (${members.size})",
                                fontWeight = if (selectedTab == 0) FontWeight.SemiBold else FontWeight.Normal
                            )
                        },
                        selectedContentColor = AppColors.Rose,
                        unselectedContentColor = colors.textMuted
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { viewModel.selectTab(1) },
                        text = {
                            Text(
                                "Suggestions (${suggestions.size})",
                                fontWeight = if (selectedTab == 1) FontWeight.SemiBold else FontWeight.Normal
                            )
                        },
                        selectedContentColor = AppColors.Rose,
                        unselectedContentColor = colors.textMuted
                    )
                }

                // Content
                when (selectedTab) {
                    0 -> FamilyMembersList(
                        members = members,
                        onMemberClick = { viewModel.selectMember(it.id) }
                    )
                    1 -> FamilySuggestionCards(
                        suggestions = suggestions,
                        onLike = { viewModel.likeSuggestion(it) },
                        onPass = { viewModel.passSuggestion(it) }
                    )
                }
            }
        }

        // Invite modal
        if (showInviteModal) {
            InviteCodeDialog(
                invite = currentInvite,
                onDismiss = { viewModel.toggleInviteModal() }
            )
        }

        // Revoke All confirmation dialog
        if (showRevokeAllModal) {
            AlertDialog(
                onDismissRequest = { viewModel.toggleRevokeAllModal() },
                title = {
                    Text(
                        "Revoke All Access",
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                },
                text = {
                    Text(
                        "This will revoke access for all family members. They will no longer be able to view your profile or suggest matches. This action cannot be undone.",
                        color = colors.textSecondary
                    )
                },
                confirmButton = {
                    Button(
                        onClick = { viewModel.revokeAllMembers() },
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.Error)
                    ) {
                        Text("Revoke All", color = Color.White)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleRevokeAllModal() }) {
                        Text("Cancel", color = colors.textSecondary)
                    }
                },
                containerColor = colors.surface
            )
        }

        // Toast overlay
        AnimatedVisibility(
            visible = toastMessage != null,
            enter = fadeIn() + slideInVertically(initialOffsetY = { it }),
            exit = fadeOut() + slideOutVertically(targetOffsetY = { it }),
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 32.dp)
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.BottomCenter
            ) {
                Surface(
                    shape = RoundedCornerShape(AppTheme.radiusFull),
                    color = colors.cardDark,
                    shadowElevation = 8.dp
                ) {
                    Text(
                        toastMessage ?: "",
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
private fun FamilyMembersList(
    members: List<FamilyMember>,
    onMemberClick: (FamilyMember) -> Unit
) {
    val colors = LocalAdaptiveColors.current
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(members, key = { it.id }) { member ->
            val permCount = countPermissions(member.permissions)
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Surface(
                    onClick = { onMemberClick(member) },
                    color = Color.Transparent
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Avatar with initials and rose background
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(AppColors.Rose.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                member.name.take(1).uppercase(),
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppColors.Rose
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                member.name,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textPrimary
                            )
                            Text(
                                member.relationship,
                                fontSize = 13.sp,
                                color = colors.textSecondary
                            )
                        }

                        // Permission count
                        Text(
                            "$permCount/8",
                            fontSize = 12.sp,
                            color = colors.textMuted,
                            modifier = Modifier.padding(end = 8.dp)
                        )

                        // Status badge (shared component)
                        StatusBadge(
                            text = when (member.status) {
                                FamilyMemberStatus.ACTIVE -> "Active"
                                FamilyMemberStatus.PENDING -> "Pending"
                                FamilyMemberStatus.REVOKED -> "Revoked"
                            },
                            variant = when (member.status) {
                                FamilyMemberStatus.ACTIVE -> BadgeVariant.SUCCESS
                                FamilyMemberStatus.PENDING -> BadgeVariant.WARNING
                                FamilyMemberStatus.REVOKED -> BadgeVariant.DANGER
                            }
                        )

                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            Icons.Default.ChevronRight, null,
                            tint = colors.textMuted,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FamilySuggestionCards(
    suggestions: List<FamilySuggestion>,
    onLike: (String) -> Unit,
    onPass: (String) -> Unit
) {
    val colors = LocalAdaptiveColors.current

    if (suggestions.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            EmptyState(
                icon = Icons.Default.FamilyRestroom,
                title = "No suggestions yet",
                description = "Family members can suggest matches for you"
            )
        }
        return
    }

    // Single card view with swipe (like discover)
    var currentIndex by remember { mutableIntStateOf(0) }
    val currentSuggestion = suggestions.getOrNull(currentIndex)

    if (currentSuggestion == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.CheckCircle, null,
                    tint = AppColors.Success,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    "All caught up!",
                    fontSize = 16.sp,
                    color = colors.textMuted
                )
            }
        }
        return
    }

    var offsetX by remember { mutableFloatStateOf(0f) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        GlassCard(
            modifier = Modifier
                .fillMaxWidth()
                .offset { IntOffset(offsetX.roundToInt(), 0) }
                .graphicsLayer {
                    rotationZ = offsetX / 40f
                    alpha = 1f - (offsetX.absoluteValue / 1000f).coerceAtMost(0.3f)
                }
                .pointerInput(currentSuggestion.id) {
                    detectHorizontalDragGestures(
                        onDragEnd = {
                            if (offsetX > 150f) {
                                onLike(currentSuggestion.id)
                                currentIndex++
                            } else if (offsetX < -150f) {
                                onPass(currentSuggestion.id)
                                currentIndex++
                            }
                            offsetX = 0f
                        },
                        onHorizontalDrag = { _, dragAmount ->
                            offsetX += dragAmount
                        }
                    )
                }
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Photo and info
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AsyncImage(
                        model = currentSuggestion.suggestedUser.primaryPhoto?.urlThumb ?: "",
                        contentDescription = null,
                        modifier = Modifier.size(72.dp).clip(RoundedCornerShape(AppTheme.radiusMd)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            "${currentSuggestion.suggestedUser.displayName}, ${currentSuggestion.suggestedUser.age ?: ""}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            currentSuggestion.suggestedUser.city,
                            fontSize = 14.sp,
                            color = colors.textSecondary
                        )
                    }
                }

                // Note in gold-tinted quote card
                currentSuggestion.note?.let { note ->
                    Spacer(modifier = Modifier.height(12.dp))
                    Surface(
                        shape = RoundedCornerShape(AppTheme.radiusMd),
                        color = AppColors.Gold.copy(alpha = 0.1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(
                                Icons.Default.FormatQuote, null,
                                tint = AppColors.Gold,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                note,
                                fontSize = 14.sp,
                                color = colors.textSecondary,
                                fontStyle = FontStyle.Italic,
                                lineHeight = 20.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Suggested by
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Person, null,
                        tint = colors.textMuted,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        "Suggested by ${currentSuggestion.suggestedBy.name} (${currentSuggestion.suggestedBy.relationship})",
                        fontSize = 13.sp,
                        color = colors.textMuted
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Like / Pass buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            onPass(currentSuggestion.id)
                            currentIndex++
                            offsetX = 0f
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(AppTheme.radiusMd)
                    ) {
                        Icon(
                            Icons.Default.Close, null,
                            tint = colors.textSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Pass", fontSize = 15.sp, color = colors.textSecondary)
                    }
                    Button(
                        onClick = {
                            onLike(currentSuggestion.id)
                            currentIndex++
                            offsetX = 0f
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(AppTheme.radiusMd),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
                    ) {
                        Icon(
                            Icons.Default.Favorite, null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Like", fontSize = 15.sp, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
private fun PermissionDetailView(
    member: FamilyMember,
    viewModel: FamilyViewModel,
    onBack: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val perms = member.permissions
    val permCount = countPermissions(perms)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.backgroundGradient)
            .statusBarsPadding()
            .padding(horizontal = 20.dp)
    ) {
        // Back button + header
        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    member.name,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
                Text(
                    member.relationship,
                    fontSize = 14.sp,
                    color = colors.textSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            "Permissions ($permCount/8)",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = colors.textPrimary,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        // 8 permission toggles
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            item {
                PermissionToggleRow(
                    "View Profile",
                    "Can see your profile overview",
                    perms.canViewProfile
                ) { viewModel.updatePermission(member.id, "canViewProfile", it) }
            }
            item {
                PermissionToggleRow(
                    "View Photos",
                    "Can see your uploaded photos",
                    perms.canViewPhotos
                ) { viewModel.updatePermission(member.id, "canViewPhotos", it) }
            }
            item {
                PermissionToggleRow(
                    "View Basics",
                    "Can see your basic info like age, city",
                    perms.canViewBasics
                ) { viewModel.updatePermission(member.id, "canViewBasics", it) }
            }
            item {
                PermissionToggleRow(
                    "View Sindhi Details",
                    "Can see your community details",
                    perms.canViewSindhi
                ) { viewModel.updatePermission(member.id, "canViewSindhi", it) }
            }
            item {
                PermissionToggleRow(
                    "View Matches",
                    "Can see your current matches",
                    perms.canViewMatches
                ) { viewModel.updatePermission(member.id, "canViewMatches", it) }
            }
            item {
                PermissionToggleRow(
                    "Suggest Profiles",
                    "Can suggest potential matches for you",
                    perms.canSuggest
                ) { viewModel.updatePermission(member.id, "canSuggest", it) }
            }
            item {
                PermissionToggleRow(
                    "View Cultural Score",
                    "Can see cultural compatibility scores",
                    perms.canViewCulturalScore
                ) { viewModel.updatePermission(member.id, "canViewCulturalScore", it) }
            }
            item {
                PermissionToggleRow(
                    "View Kundli",
                    "Can see kundli compatibility details",
                    perms.canViewKundli
                ) { viewModel.updatePermission(member.id, "canViewKundli", it) }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Enable All / Disable All
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = { viewModel.disableAllPermissions(member.id) },
                modifier = Modifier.weight(1f).height(44.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd)
            ) {
                Text("Disable All", fontSize = 14.sp, color = colors.textSecondary)
            }
            Button(
                onClick = { viewModel.enableAllPermissions(member.id) },
                modifier = Modifier.weight(1f).height(44.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
            ) {
                Text("Enable All", fontSize = 14.sp, color = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Revoke Access button (red)
        Button(
            onClick = { viewModel.revokeMember(member.id) },
            modifier = Modifier.fillMaxWidth().height(48.dp),
            shape = RoundedCornerShape(AppTheme.radiusLg),
            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Error)
        ) {
            Icon(Icons.Default.Block, null, tint = Color.White, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                "Revoke Access",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun PermissionToggleRow(
    title: String,
    description: String,
    enabled: Boolean,
    onToggle: (Boolean) -> Unit
) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                title,
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = colors.textPrimary
            )
            Text(
                description,
                fontSize = 12.sp,
                color = colors.textMuted
            )
        }
        Switch(
            checked = enabled,
            onCheckedChange = onToggle,
            colors = SwitchDefaults.colors(
                checkedTrackColor = AppColors.Rose,
                checkedThumbColor = Color.White
            )
        )
    }
}

@Composable
private fun InviteCodeDialog(
    invite: FamilyInvite?,
    onDismiss: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = colors.surface,
        title = {
            Text(
                "Family Invite Code",
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Spacer(modifier = Modifier.height(8.dp))
                // Large code in monospace gold text
                Surface(
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = AppColors.Gold.copy(alpha = 0.1f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        invite?.code ?: "MM-000000",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.Gold,
                        textAlign = TextAlign.Center,
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                        modifier = Modifier.padding(vertical = 20.dp, horizontal = 16.dp)
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    "Expires in 48 hours",
                    fontSize = 13.sp,
                    color = colors.textMuted
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "Share this code with your family member to invite them to your circle",
                    fontSize = 13.sp,
                    color = colors.textSecondary,
                    textAlign = TextAlign.Center
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(AppTheme.radiusLg),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
            ) {
                Text("Done", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }
        }
    )
}

private fun countPermissions(perms: FamilyPermissions): Int {
    var count = 0
    if (perms.canViewProfile) count++
    if (perms.canViewPhotos) count++
    if (perms.canViewBasics) count++
    if (perms.canViewSindhi) count++
    if (perms.canViewMatches) count++
    if (perms.canSuggest) count++
    if (perms.canViewCulturalScore) count++
    if (perms.canViewKundli) count++
    return count
}
