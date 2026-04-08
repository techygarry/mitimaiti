@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.models.*
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.ChatViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    viewModel: ChatViewModel,
    match: Match,
    onBack: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val messages by viewModel.messages.collectAsState()
    val messageText by viewModel.messageText.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isOtherTyping by viewModel.isOtherTyping.collectAsState()
    val chatMatch by viewModel.match.collectAsState()
    val chatUnlocked by viewModel.chatUnlocked.collectAsState()
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    // Menu state
    var showMenu by remember { mutableStateOf(false) }
    var showUnmatchDialog by remember { mutableStateOf(false) }
    var showReportSheet by remember { mutableStateOf(false) }

    // Ice breaker prompts
    var currentPrompts by remember { mutableStateOf(IceBreakerPrompts.getRandomPrompts(3)) }

    LaunchedEffect(match) { viewModel.loadMessages(match) }
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1)
    }

    // Scroll-to-bottom detection
    val showScrollToBottom by remember {
        derivedStateOf {
            val lastVisible = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            val totalItems = listState.layoutInfo.totalItemsCount
            totalItems > 0 && lastVisible < totalItems - 2
        }
    }

    // Group messages by date
    val groupedMessages = remember(messages) { groupMessagesByDate(messages) }

    // Chat unlock toast
    var showUnlockToast by remember { mutableStateOf(false) }
    LaunchedEffect(chatUnlocked) {
        if (chatUnlocked) { showUnlockToast = true; delay(3000L); showUnlockToast = false }
    }

    val otherUser = match.otherUser

    Scaffold(
        containerColor = colors.background,
        topBar = {
            // ── Bumble-style header ──
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable { /* open profile detail */ }
                    ) {
                        // Avatar with online dot
                        Box {
                            AsyncImage(
                                model = otherUser.primaryPhoto?.urlThumb ?: otherUser.primaryPhoto?.url ?: "",
                                contentDescription = null,
                                modifier = Modifier.size(40.dp).clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                            if (otherUser.isOnline) {
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .align(Alignment.BottomEnd)
                                        .clip(CircleShape)
                                        .background(Color.White)
                                        .padding(2.dp)
                                        .clip(CircleShape)
                                        .background(AppColors.Success)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    "${otherUser.displayName}${otherUser.age?.let { ", $it" } ?: ""}",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = colors.textPrimary
                                )
                                if (otherUser.isVerified) {
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(Icons.Default.Verified, null, tint = AppColors.Info, modifier = Modifier.size(16.dp))
                                }
                            }
                            Text(
                                if (otherUser.isOnline) "Online" else "Offline",
                                fontSize = 12.sp,
                                color = if (otherUser.isOnline) AppColors.Success else colors.textMuted
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary)
                    }
                },
                actions = {
                    // Video call
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.Videocam, "Video call", tint = AppColors.Rose)
                    }
                    // Voice call
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.Phone, "Voice call", tint = AppColors.Rose)
                    }
                    // More menu
                    Box {
                        IconButton(onClick = { showMenu = true }) {
                            Icon(Icons.Default.MoreVert, "More", tint = colors.textSecondary)
                        }
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Unmatch") },
                                onClick = { showMenu = false; showUnmatchDialog = true },
                                leadingIcon = { Icon(Icons.Default.HeartBroken, null, tint = colors.textSecondary) }
                            )
                            DropdownMenuItem(
                                text = { Text("Block") },
                                onClick = { showMenu = false; showUnmatchDialog = true },
                                leadingIcon = { Icon(Icons.Default.Block, null, tint = AppColors.Error) }
                            )
                            DropdownMenuItem(
                                text = { Text("Report", color = AppColors.Error) },
                                onClick = { showMenu = false; showReportSheet = true },
                                leadingIcon = { Icon(Icons.Default.Flag, null, tint = AppColors.Error) }
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colors.surface)
            )
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            Column(modifier = Modifier.fillMaxSize()) {
                // ── Lock banner (only during ice breaker phase) ──
                if (viewModel.isLockedForMe) {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = AppColors.Rose.copy(alpha = 0.08f)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Lock, null, tint = AppColors.Rose, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("Message sent!", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                                Text("Waiting for ${otherUser.displayName.split(" ").first()} to reply...", fontSize = 12.sp, color = colors.textSecondary)
                            }
                        }
                    }
                }

                // ── Chat unlock toast ──
                AnimatedVisibility(
                    visible = showUnlockToast,
                    enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
                    exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut()
                ) {
                    Surface(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp),
                        shape = RoundedCornerShape(AppTheme.radiusMd),
                        color = AppColors.Success.copy(alpha = 0.12f)
                    ) {
                        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                            Icon(Icons.Default.LockOpen, null, tint = AppColors.Success, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Chat unlocked! You can now chat freely.", fontSize = 14.sp, color = AppColors.Success, fontWeight = FontWeight.Medium)
                        }
                    }
                }

                // ── Match announcement ──
                MatchAnnouncementCapsule(match = match)

                // ── Messages list ──
                LazyColumn(
                    modifier = Modifier.weight(1f).fillMaxWidth().padding(horizontal = 12.dp),
                    state = listState,
                    verticalArrangement = Arrangement.spacedBy(2.dp),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    // Ice breaker section (only when no messages sent yet)
                    if (messages.isEmpty() && !isLoading && viewModel.awaitingFirstMessage) {
                        item {
                            IceBreakerSection(
                                prompts = currentPrompts,
                                onSelect = { viewModel.sendIcebreaker(it) },
                                onShuffle = { currentPrompts = IceBreakerPrompts.getRandomPrompts(3) }
                            )
                        }
                    }

                    // Messages grouped by date
                    groupedMessages.forEach { (dateLabel, dateMessages) ->
                        item(key = "date_$dateLabel") { DateHeader(label = dateLabel) }
                        items(dateMessages, key = { it.id }) { message ->
                            BumbleMessageBubble(
                                message = message,
                                otherUserPhoto = otherUser.primaryPhoto?.urlThumb ?: otherUser.primaryPhoto?.url ?: ""
                            )
                        }
                    }

                    // Typing indicator
                    if (isOtherTyping) {
                        item(key = "typing") {
                            TypingIndicatorBubble(
                                photoUrl = otherUser.primaryPhoto?.urlThumb ?: otherUser.primaryPhoto?.url ?: ""
                            )
                        }
                    }
                }

                // ── Input bar ──
                ChatInputBar(
                    messageText = messageText,
                    onTextChange = { viewModel.updateMessageText(it) },
                    onSend = { viewModel.sendMessage() },
                    disabled = viewModel.inputDisabled,
                    placeholder = if (viewModel.isLockedForMe) "Waiting for reply..." else if (viewModel.awaitingFirstMessage) "Send the first message!" else "Type a message...",
                    isLocked = viewModel.isLockedForMe
                )
            }

            // ── New message ↓ button ──
            if (showScrollToBottom) {
                Surface(
                    onClick = { scope.launch { if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1) } },
                    modifier = Modifier.align(Alignment.BottomEnd).padding(end = 16.dp, bottom = 80.dp).size(40.dp),
                    color = colors.surface,
                    shape = CircleShape,
                    shadowElevation = 6.dp,
                    border = BorderStroke(1.dp, colors.border)
                ) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                        Icon(Icons.Default.KeyboardArrowDown, "New messages", tint = AppColors.Rose, modifier = Modifier.size(24.dp))
                    }
                }
            }
        }
    }

    // ── Unmatch confirmation dialog ──
    if (showUnmatchDialog) {
        AlertDialog(
            onDismissRequest = { showUnmatchDialog = false },
            title = { Text("Unmatch?", fontWeight = FontWeight.Bold) },
            text = { Text("Are you sure you want to unmatch with ${otherUser.displayName}? This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = { showUnmatchDialog = false; onBack() }) {
                    Text("Unmatch", color = AppColors.Error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showUnmatchDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // ── Report sheet ──
    if (showReportSheet) {
        ReportSheet(
            userName = otherUser.displayName,
            onDismiss = { showReportSheet = false },
            onReport = { showReportSheet = false; onBack() }
        )
    }
}

// ───────────────────────────────────────────
// Ice Breaker Section with Dice Shuffle
// ───────────────────────────────────────────

@Composable
private fun IceBreakerSection(
    prompts: List<IceBreakerPrompt>,
    onSelect: (String) -> Unit,
    onShuffle: () -> Unit
) {
    val colors = LocalAdaptiveColors.current
    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Break the ice!", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                Text("Tap a prompt or type your own", fontSize = 14.sp, color = colors.textSecondary)
            }
            // Dice shuffle button
            IconButton(onClick = onShuffle) {
                Icon(Icons.Default.Casino, "Shuffle prompts", tint = AppColors.Rose, modifier = Modifier.size(28.dp))
            }
        }
        Spacer(modifier = Modifier.height(12.dp))
        prompts.forEach { prompt ->
            Surface(
                onClick = { onSelect(prompt.text) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                shape = RoundedCornerShape(16.dp),
                color = AppColors.Rose.copy(alpha = 0.06f),
                border = BorderStroke(1.dp, AppColors.Rose.copy(alpha = 0.2f))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(prompt.category.emoji, fontSize = 20.sp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            prompt.category.displayName.uppercase(),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = AppColors.Rose,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            prompt.text,
                            fontSize = 14.sp,
                            color = colors.textPrimary,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Icon(Icons.Default.Send, null, tint = AppColors.Rose.copy(alpha = 0.5f), modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

// ───────────────────────────────────────────
// Bumble-style Message Bubble with Profile Photo
// ───────────────────────────────────────────

@Composable
private fun BumbleMessageBubble(message: Message, otherUserPhoto: String) {
    val isFromMe = message.isFromMe
    val colors = LocalAdaptiveColors.current
    val timeFormat = remember { SimpleDateFormat("h:mm a", Locale.getDefault()) }

    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
        horizontalArrangement = if (isFromMe) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Bottom
    ) {
        // Other user's profile photo (left side)
        if (!isFromMe) {
            AsyncImage(
                model = otherUserPhoto,
                contentDescription = null,
                modifier = Modifier.size(32.dp).clip(CircleShape),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(8.dp))
        }

        // Message bubble
        Surface(
            shape = RoundedCornerShape(
                topStart = 18.dp,
                topEnd = 18.dp,
                bottomStart = if (isFromMe) 18.dp else 4.dp,
                bottomEnd = if (isFromMe) 4.dp else 18.dp
            ),
            color = if (isFromMe) AppColors.Rose else colors.surfaceMedium,
            modifier = Modifier.widthIn(max = 260.dp)
        ) {
            Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)) {
                // Ice breaker card styling (if message matches a prompt)
                val isIceBreaker = IceBreakerPrompts.getAll().any { it.text == message.content }
                if (isIceBreaker && isFromMe) {
                    Text(
                        "ICE BREAKER",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.7f),
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }

                Text(
                    message.content,
                    fontSize = 15.sp,
                    color = if (isFromMe) Color.White else colors.textPrimary,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(3.dp))

                // Timestamp + read receipts
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Edited tag
                    if (message.msgType == MessageType.TEXT && message.content.contains("[edited]")) {
                        Text("edited ", fontSize = 10.sp, fontStyle = FontStyle.Italic,
                            color = if (isFromMe) Color.White.copy(alpha = 0.5f) else colors.textMuted)
                    }

                    Text(
                        timeFormat.format(Date(message.createdAt)),
                        fontSize = 10.sp,
                        color = if (isFromMe) Color.White.copy(alpha = 0.6f) else colors.textMuted
                    )

                    // Read receipts (only for sent messages)
                    if (isFromMe) {
                        Spacer(modifier = Modifier.width(4.dp))
                        when (message.status) {
                            MessageStatus.SENT -> Icon(
                                Icons.Default.Check, "Sent",
                                tint = Color.White.copy(alpha = 0.6f),
                                modifier = Modifier.size(14.dp)
                            )
                            MessageStatus.DELIVERED -> Icon(
                                Icons.Default.DoneAll, "Delivered",
                                tint = Color.White.copy(alpha = 0.6f),
                                modifier = Modifier.size(14.dp)
                            )
                            MessageStatus.READ -> Icon(
                                Icons.Default.DoneAll, "Read",
                                tint = Color(0xFF4FC3F7), // Blue ticks
                                modifier = Modifier.size(14.dp)
                            )
                            else -> {}
                        }
                    }
                }
            }
        }

        // Spacer for sent messages (no photo on right)
        if (isFromMe) {
            Spacer(modifier = Modifier.width(4.dp))
        }
    }
}

// ───────────────────────────────────────────
// Typing Indicator Bubble (iMessage-style)
// ───────────────────────────────────────────

@Composable
private fun TypingIndicatorBubble(photoUrl: String) {
    val colors = LocalAdaptiveColors.current
    val infiniteTransition = rememberInfiniteTransition(label = "typing")

    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.Start,
        verticalAlignment = Alignment.Bottom
    ) {
        AsyncImage(
            model = photoUrl,
            contentDescription = null,
            modifier = Modifier.size(32.dp).clip(CircleShape),
            contentScale = ContentScale.Crop
        )
        Spacer(modifier = Modifier.width(8.dp))
        Surface(
            shape = RoundedCornerShape(18.dp, 18.dp, 18.dp, 4.dp),
            color = colors.surfaceMedium
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                repeat(3) { index ->
                    val dotAlpha by infiniteTransition.animateFloat(
                        initialValue = 0.3f,
                        targetValue = 1f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(600, delayMillis = index * 200),
                            repeatMode = RepeatMode.Reverse
                        ),
                        label = "dot$index"
                    )
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(colors.textMuted.copy(alpha = dotAlpha))
                    )
                }
            }
        }
    }
}

// ───────────────────────────────────────────
// Match Announcement Capsule
// ───────────────────────────────────────────

@Composable
private fun MatchAnnouncementCapsule(match: Match) {
    val dateFormat = remember { SimpleDateFormat("MMM d, yyyy", Locale.getDefault()) }
    Box(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 40.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(AppTheme.radiusFull),
            color = AppColors.Rose.copy(alpha = 0.08f)
        ) {
            Row(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Favorite, null, tint = AppColors.Rose, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    "You matched on ${dateFormat.format(Date(match.matchedAt))}",
                    fontSize = 12.sp, color = AppColors.Rose, fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

// ───────────────────────────────────────────
// Date Header
// ───────────────────────────────────────────

@Composable
private fun DateHeader(label: String) {
    Box(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), contentAlignment = Alignment.Center) {
        Surface(shape = RoundedCornerShape(AppTheme.radiusFull), color = LocalAdaptiveColors.current.surfaceMedium) {
            Text(label, modifier = Modifier.padding(horizontal = 14.dp, vertical = 5.dp), fontSize = 12.sp, fontWeight = FontWeight.Medium, color = LocalAdaptiveColors.current.textMuted)
        }
    }
}

// ───────────────────────────────────────────
// Report Sheet
// ───────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ReportSheet(userName: String, onDismiss: () -> Unit, onReport: (String) -> Unit) {
    val colors = LocalAdaptiveColors.current
    val reasons = listOf("Inappropriate behavior", "Fake profile", "Spam", "Underage", "Other")
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = colors.surface) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text("Report $userName", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
            Spacer(modifier = Modifier.height(4.dp))
            Text("Why are you reporting this person?", fontSize = 14.sp, color = colors.textSecondary)
            Spacer(modifier = Modifier.height(16.dp))
            reasons.forEach { reason ->
                Surface(
                    onClick = { onReport(reason) },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = colors.surfaceMedium
                ) {
                    Text(reason, modifier = Modifier.padding(16.dp), fontSize = 15.sp, color = colors.textPrimary)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

// ───────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────

// ───────────────────────────────────────────
// Chat Input Bar (with emoji, camera, mic buttons)
// ───────────────────────────────────────────

@Composable
private fun ChatInputBar(
    messageText: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    disabled: Boolean,
    placeholder: String,
    isLocked: Boolean
) {
    val colors = LocalAdaptiveColors.current
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = colors.surface,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Camera button
            IconButton(onClick = { }, enabled = !disabled) {
                Icon(Icons.Default.CameraAlt, "Photo", tint = if (disabled) colors.textMuted.copy(alpha = 0.3f) else AppColors.Rose)
            }

            // Text field
            OutlinedTextField(
                value = messageText,
                onValueChange = onTextChange,
                modifier = Modifier.weight(1f),
                placeholder = { Text(placeholder, fontSize = 14.sp, color = colors.textMuted) },
                enabled = !disabled,
                shape = RoundedCornerShape(24.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AppColors.Rose,
                    unfocusedBorderColor = colors.border,
                    disabledBorderColor = colors.border.copy(alpha = 0.3f)
                ),
                singleLine = false,
                maxLines = 4,
                trailingIcon = {
                    // Emoji button
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.EmojiEmotions, "Emoji", tint = if (disabled) colors.textMuted.copy(alpha = 0.3f) else colors.textMuted)
                    }
                }
            )

            Spacer(modifier = Modifier.width(4.dp))

            // Send or Mic button
            if (messageText.isNotBlank()) {
                IconButton(
                    onClick = onSend,
                    modifier = Modifier
                        .size(44.dp)
                        .background(AppColors.Rose, CircleShape)
                ) {
                    Icon(Icons.Default.Send, "Send", tint = Color.White, modifier = Modifier.size(20.dp))
                }
            } else {
                IconButton(onClick = { }, enabled = !disabled) {
                    Icon(Icons.Default.Mic, "Voice", tint = if (disabled) colors.textMuted.copy(alpha = 0.3f) else AppColors.Rose)
                }
            }
        }
    }
}

// ───────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────

private fun groupMessagesByDate(messages: List<Message>): List<Pair<String, List<Message>>> {
    val cal = Calendar.getInstance()
    val today = Calendar.getInstance()
    val yesterday = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }
    val dateFormat = SimpleDateFormat("MMM d", Locale.getDefault())

    return messages.groupBy { msg ->
        cal.timeInMillis = msg.createdAt
        when {
            cal.get(Calendar.YEAR) == today.get(Calendar.YEAR) && cal.get(Calendar.DAY_OF_YEAR) == today.get(Calendar.DAY_OF_YEAR) -> "Today"
            cal.get(Calendar.YEAR) == yesterday.get(Calendar.YEAR) && cal.get(Calendar.DAY_OF_YEAR) == yesterday.get(Calendar.DAY_OF_YEAR) -> "Yesterday"
            else -> dateFormat.format(Date(msg.createdAt))
        }
    }.toList()
}
