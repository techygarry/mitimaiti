@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.animation.*
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.view.HapticFeedbackConstants
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

    // IMPORTANT: derive from collected state so Compose recomposes when
    // selectedMemberId or members change. The viewModel.selectedMember
    // property is a plain getter and is NOT a snapshot-aware read.
    val selectedMember = remember(selectedMemberId, members) {
        members.firstOrNull { it.id == selectedMemberId }
    }

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
                // ── Header ──────────────────────────────────────────────────
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "Family Mode",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary,
                        modifier = Modifier.weight(1f)
                    )
                    Button(
                        onClick = { viewModel.toggleRevokeAllModal() },
                        shape = RoundedCornerShape(AppTheme.radiusFull),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.Error),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            Icons.Default.Warning, null,
                            tint = Color.White,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            "Revoke All",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                    }
                }

                // ── Invite card ─────────────────────────────────────────────
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = colors.surface,
                    shadowElevation = 2.dp
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.GroupAdd, null,
                                tint = AppColors.Rose,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    "Invite family to help",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = colors.textPrimary
                                )
                                Text(
                                    "They can view profiles and suggest matches",
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
                                modifier = Modifier.height(40.dp),
                                shape = RoundedCornerShape(AppTheme.radiusFull),
                                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
                            ) {
                                Icon(
                                    Icons.Default.GroupAdd, null,
                                    modifier = Modifier.size(16.dp),
                                    tint = Color.White
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Invite", fontSize = 14.sp, color = Color.White)
                            }
                            OutlinedButton(
                                onClick = { viewModel.generateInvite() },
                                modifier = Modifier.height(40.dp),
                                shape = RoundedCornerShape(AppTheme.radiusFull)
                            ) {
                                Icon(
                                    Icons.Default.Share, null,
                                    tint = colors.textPrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Share Code", fontSize = 14.sp, color = colors.textPrimary)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // ── Join family by code ─────────────────────────────────────
                var showJoinDialog by remember { mutableStateOf(false) }
                var joinCode by remember { mutableStateOf("") }
                var joinRole by remember { mutableStateOf("parent") }
                var joining by remember { mutableStateOf(false) }

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = colors.surface,
                    shadowElevation = 1.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showJoinDialog = true }
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.QrCodeScanner, null, tint = Color(0xFF3478F6), modifier = Modifier.size(24.dp))
                        Spacer(Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Have a code?", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                            Text("Enter an invite code to join a family", fontSize = 12.sp, color = colors.textSecondary)
                        }
                        Text("Enter", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF3478F6))
                    }
                }

                if (showJoinDialog) {
                    AlertDialog(
                        onDismissRequest = { showJoinDialog = false },
                        title = { Text("Join a Family") },
                        text = {
                            Column {
                                Text("Enter the invite code", fontSize = 13.sp, color = colors.textSecondary)
                                Spacer(Modifier.height(8.dp))
                                OutlinedTextField(
                                    value = joinCode,
                                    onValueChange = { joinCode = it.uppercase() },
                                    placeholder = { Text("MM-XXXXXX") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(Modifier.height(12.dp))
                                Text("Your role", fontSize = 13.sp, color = colors.textSecondary)
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf("parent", "sibling", "friend").forEach { role ->
                                        FilterChip(
                                            selected = joinRole == role,
                                            onClick = { joinRole = role },
                                            label = { Text(role.replaceFirstChar { it.uppercase() }) }
                                        )
                                    }
                                }
                            }
                        },
                        confirmButton = {
                            Button(
                                enabled = joinCode.isNotBlank() && !joining,
                                onClick = {
                                    joining = true
                                    viewModel.joinFamily(joinCode, joinRole) { ok ->
                                        joining = false
                                        if (ok) { showJoinDialog = false; joinCode = "" }
                                    }
                                }
                            ) { Text(if (joining) "Joining..." else "Join") }
                        },
                        dismissButton = {
                            TextButton(onClick = { showJoinDialog = false }) { Text("Cancel") }
                        }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // ── Tab bar (pill style) ─────────────────────────────────────
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(AppTheme.radiusFull))
                        .background(colors.surfaceMedium),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    listOf(
                        0 to "Members (${members.size})",
                        1 to "Suggestions (${suggestions.size})"
                    ).forEach { (index, title) ->
                        val isSelected = selectedTab == index
                        Surface(
                            onClick = { viewModel.selectTab(index) },
                            modifier = Modifier
                                .weight(1f)
                                .padding(4.dp),
                            shape = RoundedCornerShape(AppTheme.radiusFull),
                            color = if (isSelected) AppColors.Rose else Color.Transparent
                        ) {
                            Text(
                                title,
                                modifier = Modifier.padding(vertical = 10.dp),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isSelected) Color.White else colors.textMuted,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // ── Content ──────────────────────────────────────────────────
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

        // ── Invite modal ─────────────────────────────────────────────────────
        if (showInviteModal) {
            InviteCodeDialog(
                invite = currentInvite,
                onDismiss = { viewModel.toggleInviteModal() }
            )
        }

        // ── Revoke All confirmation dialog ────────────────────────────────────
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

        // ── Toast overlay ─────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Members tab
// ─────────────────────────────────────────────────────────────────────────────

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
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                color = colors.surface,
                shadowElevation = 2.dp
            ) {
                Surface(
                    onClick = { onMemberClick(member) },
                    color = Color.Transparent
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Pink circle avatar with initial letter
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
                            // Name + status badge on same row
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    member.name,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary
                                )
                                StatusBadge(
                                    text = when (member.status) {
                                        FamilyMemberStatus.ACTIVE  -> "Active"
                                        FamilyMemberStatus.PENDING -> "Pending"
                                        FamilyMemberStatus.REVOKED -> "Revoked"
                                    },
                                    variant = when (member.status) {
                                        FamilyMemberStatus.ACTIVE  -> BadgeVariant.SUCCESS
                                        FamilyMemberStatus.PENDING -> BadgeVariant.WARNING
                                        FamilyMemberStatus.REVOKED -> BadgeVariant.DANGER
                                    }
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            // Relationship · X/8 permissions
                            Text(
                                "${member.relationship} · $permCount/8 permissions",
                                fontSize = 13.sp,
                                color = colors.textSecondary
                            )
                        }

                        Icon(
                            Icons.Default.ChevronRight, null,
                            tint = colors.textMuted,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }

        // Privacy notice footer
        item {
            Spacer(modifier = Modifier.height(4.dp))
            PrivacyNotice(
                message = "Your Privacy — Family can only see what you allow. Messages stay private."
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestions tab
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun FamilySuggestionCards(
    suggestions: List<FamilySuggestion>,
    onLike: (String) -> Unit,
    onPass: (String) -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val view = LocalView.current

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

    var currentIndex by remember { mutableIntStateOf(0) }
    val currentSuggestion = suggestions.getOrNull(currentIndex)

    if (currentSuggestion == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.CheckCircle, null,
                    tint = AppColors.Success,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text("All caught up!", fontSize = 16.sp, color = colors.textMuted)
            }
        }
        return
    }

    var offsetX by remember { mutableFloatStateOf(0f) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            // "Suggested by X" pill badge
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusFull),
                color = AppColors.Rose.copy(alpha = 0.12f)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Default.Person, null,
                        tint = AppColors.Rose,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        "Suggested by ${currentSuggestion.suggestedBy.name}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AppColors.Rose
                    )
                }
            }
        }

        item {
            // Full photo card with name/age/city overlay at bottom
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(3f / 4f)
                    .clip(RoundedCornerShape(AppTheme.radiusLg))
                    .offset { IntOffset(offsetX.roundToInt(), 0) }
                    .graphicsLayer {
                        rotationZ = offsetX / 40f
                        alpha = 1f - (offsetX.absoluteValue / 1000f).coerceAtMost(0.3f)
                    }
                    .pointerInput(currentSuggestion.id) {
                        detectHorizontalDragGestures(
                            onDragEnd = {
                                if (offsetX > 150f) {
                                    view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
                                    onLike(currentSuggestion.id)
                                    currentIndex++
                                } else if (offsetX < -150f) {
                                    view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
                                    onPass(currentSuggestion.id)
                                    currentIndex++
                                }
                                offsetX = 0f
                            },
                            onHorizontalDrag = { _, dragAmount -> offsetX += dragAmount }
                        )
                    }
            ) {
                // Photo
                AsyncImage(
                    model = currentSuggestion.suggestedUser.primaryPhoto?.urlThumb ?: "",
                    contentDescription = currentSuggestion.suggestedUser.displayName,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                // Gradient + name overlay at bottom
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.7f))
                            )
                        )
                        .padding(horizontal = 16.dp, vertical = 16.dp)
                ) {
                    Column {
                        Text(
                            buildString {
                                append(currentSuggestion.suggestedUser.displayName)
                                currentSuggestion.suggestedUser.age?.let { append(", $it") }
                            },
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            currentSuggestion.suggestedUser.city,
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                    }
                }
            }
        }

        // Note from family member
        currentSuggestion.note?.let { note ->
            item {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        "NOTE FROM ${currentSuggestion.suggestedBy.name.uppercase()}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.Rose,
                        letterSpacing = 0.8.sp
                    )
                    Text(
                        "\"$note\"",
                        fontSize = 14.sp,
                        color = colors.textSecondary,
                        fontStyle = FontStyle.Italic,
                        lineHeight = 20.sp
                    )
                }
            }
        }

        item {
            // Pass (X circle) and Like (heart circle) buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Pass button — outlined circle X
                OutlinedButton(
                    onClick = {
                        view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
                        onPass(currentSuggestion.id)
                        currentIndex++
                        offsetX = 0f
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
                    shape = RoundedCornerShape(AppTheme.radiusFull),
                    border = androidx.compose.foundation.BorderStroke(
                        1.5.dp, colors.textMuted.copy(alpha = 0.4f)
                    )
                ) {
                    Icon(
                        Icons.Default.Cancel, null,
                        tint = colors.textSecondary,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Pass",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textSecondary
                    )
                }
                // Like button — rose circle heart
                Button(
                    onClick = {
                        view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
                        onLike(currentSuggestion.id)
                        currentIndex++
                        offsetX = 0f
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
                    shape = RoundedCornerShape(AppTheme.radiusFull),
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
                ) {
                    Icon(
                        Icons.Default.Favorite, null,
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Like",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                }
            }
        }

        // "Up next" horizontal thumbnails with "via X" overlay
        val upNextSuggestions = suggestions.drop(currentIndex + 1).take(3)
        if (upNextSuggestions.isNotEmpty()) {
            item {
                Text(
                    "Up next",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.textMuted
                )
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(upNextSuggestions, key = { it.id }) { suggestion ->
                        Box(
                            modifier = Modifier
                                .width(90.dp)
                                .height(114.dp)
                                .clip(RoundedCornerShape(AppTheme.radiusMd))
                        ) {
                            AsyncImage(
                                model = suggestion.suggestedUser.primaryPhoto?.urlThumb ?: "",
                                contentDescription = suggestion.suggestedUser.displayName,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                            // Name + "via X" overlay at bottom
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .align(Alignment.BottomCenter)
                                    .background(
                                        Brush.verticalGradient(
                                            colors = listOf(
                                                Color.Transparent,
                                                Color.Black.copy(alpha = 0.65f)
                                            )
                                        )
                                    )
                                    .padding(horizontal = 6.dp, vertical = 5.dp)
                            ) {
                                Column {
                                    Text(
                                        suggestion.suggestedUser.displayName.split(" ").first(),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color.White,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        "via ${suggestion.suggestedBy.name}",
                                        fontSize = 10.sp,
                                        color = Color.White.copy(alpha = 0.8f),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Privacy notice
        item {
            Spacer(modifier = Modifier.height(4.dp))
            PrivacyNotice(
                message = "Your Privacy — Family can only see what you allow. Messages stay private."
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission detail view
// ─────────────────────────────────────────────────────────────────────────────

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
    ) {
        // ── Header row: back + title/subtitle + status badge ─────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    "${member.name} — Permissions",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
                Text(
                    "$permCount of 8 enabled",
                    fontSize = 13.sp,
                    color = colors.textSecondary
                )
            }
            // Status badge aligned to right
            StatusBadge(
                text = when (member.status) {
                    FamilyMemberStatus.ACTIVE  -> "Active"
                    FamilyMemberStatus.PENDING -> "Pending"
                    FamilyMemberStatus.REVOKED -> "Revoked"
                },
                variant = when (member.status) {
                    FamilyMemberStatus.ACTIVE  -> BadgeVariant.SUCCESS
                    FamilyMemberStatus.PENDING -> BadgeVariant.WARNING
                    FamilyMemberStatus.REVOKED -> BadgeVariant.DANGER
                }
            )
            Spacer(modifier = Modifier.width(12.dp))
        }

        // ── 8 permission toggles ─────────────────────────────────────────────
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(0.dp)
        ) {
            item {
                PermissionToggleRow(
                    icon = Icons.Default.Person,
                    title = "View Profile",
                    description = "Can see your profile overview",
                    enabled = perms.canViewProfile
                ) { viewModel.updatePermission(member.id, "canViewProfile", it) }
                HorizontalDivider(color = colors.surfaceMedium)
            }
            item {
                PermissionToggleRow(
                    icon = Icons.Default.Photo,
                    title = "View Photos",
                    description = "Can see your uploaded photos",
                    enabled = perms.canViewPhotos
                ) { viewModel.updatePermission(member.id, "canViewPhotos", it) }
                HorizontalDivider(color = colors.surfaceMedium)
            }
            item {
                PermissionToggleRow(
                    icon = Icons.Default.Info,
                    title = "View Basics",
                    description = "Can see your basic info like age, city",
                    enabled = perms.canViewBasics
                ) { viewModel.updatePermission(member.id, "canViewBasics", it) }
                HorizontalDivider(color = colors.surfaceMedium)
            }
            item {
                PermissionToggleRow(
                    icon = Icons.Default.Star,
                    title = "View Sindhi Details",
                    description = "Can see your community details",
                    enabled = perms.canViewSindhi
                ) { viewModel.updatePermission(member.id, "canViewSindhi", it) }
                HorizontalDivider(color = colors.surfaceMedium)
            }
            item {
                PermissionToggleRow(
                    icon = Icons.Default.Favorite,
                    title = "View Matches",
                    description = "Can see your current matches",
                    enabled = perms.canViewMatches
                ) { viewModel.updatePermission(member.id, "canViewMatches", it) }
                HorizontalDivider(color = colors.surfaceMedium)
            }
            item {
                PermissionToggleRow(
                    icon = Icons.Default.GroupAdd,
                    title = "Suggest Profiles",
                    description = "Can suggest potential matches for you",
                    enabled = perms.canSuggest
                ) { viewModel.updatePermission(member.id, "canSuggest", it) }
                HorizontalDivider(color = colors.surfaceMedium)
            }
            item {
                PermissionToggleRow(
                    icon = Icons.Default.BarChart,
                    title = "View Cultural Score",
                    description = "Can see cultural compatibility scores",
                    enabled = perms.canViewCulturalScore
                ) { viewModel.updatePermission(member.id, "canViewCulturalScore", it) }
                HorizontalDivider(color = colors.surfaceMedium)
            }
            item {
                PermissionToggleRow(
                    icon = Icons.Default.AutoAwesome,
                    title = "View Kundli",
                    description = "Can see kundli compatibility details",
                    enabled = perms.canViewKundli
                ) { viewModel.updatePermission(member.id, "canViewKundli", it) }
            }
        }

        // ── Enable All / Disable All buttons ─────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { viewModel.enableAllPermissions(member.id) },
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    shape = RoundedCornerShape(AppTheme.radiusMd)
                ) {
                    Text("Enable All", fontSize = 14.sp, color = colors.textPrimary)
                }
                Button(
                    onClick = { viewModel.disableAllPermissions(member.id) },
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.Error)
                ) {
                    Text("Disable All", fontSize = 14.sp, color = Color.White)
                }
            }

            // Privacy notice
            PrivacyNotice(
                message = "${member.name} can only see what you allow. Your messages always remain private."
            )
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission toggle row (with icon)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun PermissionToggleRow(
    icon: ImageVector,
    title: String,
    description: String,
    enabled: Boolean,
    onToggle: (Boolean) -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val view = LocalView.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Icon on left
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(AppTheme.radiusSm))
                .background(colors.surfaceMedium),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                icon, null,
                tint = AppColors.Rose,
                modifier = Modifier.size(18.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
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
            onCheckedChange = { newValue ->
                view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
                onToggle(newValue)
            },
            colors = SwitchDefaults.colors(
                checkedTrackColor = AppColors.Rose,
                checkedThumbColor = Color.White
            )
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Invite code dialog
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun InviteCodeDialog(
    invite: FamilyInvite?,
    onDismiss: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val clipboard = LocalClipboardManager.current
    val code = invite?.code ?: "MM-7X4K"

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = colors.surface,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Invite Family",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = colors.textPrimary
                )
                IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Close, "Close", tint = colors.textMuted)
                }
            }
        },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    "Share this code with your family member to join your family circle.",
                    fontSize = 14.sp,
                    color = colors.textSecondary,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(16.dp))
                // Large monospace code on gray background
                Surface(
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = colors.surfaceMedium,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        code,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary,
                        textAlign = TextAlign.Center,
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                        modifier = Modifier.padding(vertical = 20.dp, horizontal = 16.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                // Copy Code + Share buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            clipboard.setText(AnnotatedString(code))
                            onDismiss()
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp),
                        shape = RoundedCornerShape(AppTheme.radiusFull)
                    ) {
                        Icon(
                            Icons.Default.ContentCopy, null,
                            modifier = Modifier.size(16.dp),
                            tint = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Copy Code", fontSize = 14.sp, color = colors.textPrimary)
                    }
                    Button(
                        onClick = onDismiss,
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp),
                        shape = RoundedCornerShape(AppTheme.radiusFull),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
                    ) {
                        Icon(
                            Icons.Default.Share, null,
                            modifier = Modifier.size(16.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Share", fontSize = 14.sp, color = Color.White)
                    }
                }
            }
        },
        confirmButton = {}
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared privacy notice
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun PrivacyNotice(message: String) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(AppTheme.radiusMd))
            .background(colors.surfaceMedium)
            .padding(12.dp),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            Icons.Default.Shield, null,
            tint = AppColors.Rose,
            modifier = Modifier.size(16.dp)
        )
        Text(
            message,
            fontSize = 12.sp,
            color = colors.textSecondary,
            lineHeight = 17.sp
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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
