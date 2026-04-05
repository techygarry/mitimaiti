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
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.sp
import android.view.HapticFeedbackConstants
import coil.compose.AsyncImage
import com.mitimaiti.app.models.*
import com.mitimaiti.app.services.MockData
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.ChatViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

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

    // Live countdown tick
    var tick by remember { mutableLongStateOf(0L) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000L)
            tick++
        }
    }

    LaunchedEffect(match) { viewModel.loadMessages(match) }
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1)
    }

    // Detect if user has scrolled up from bottom
    val showScrollToBottom by remember {
        derivedStateOf {
            val lastVisible = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            val totalItems = listState.layoutInfo.totalItemsCount
            totalItems > 0 && lastVisible < totalItems - 2
        }
    }

    // Group messages by date
    val groupedMessages = remember(messages) {
        groupMessagesByDate(messages)
    }

    // Chat unlock toast visibility with slide animation
    var showUnlockToast by remember { mutableStateOf(false) }
    LaunchedEffect(chatUnlocked) {
        if (chatUnlocked) {
            showUnlockToast = true
            delay(3000L)
            showUnlockToast = false
        }
    }

    Scaffold(
        containerColor = colors.background,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box {
                            AsyncImage(
                                model = match.otherUser.primaryPhoto?.urlThumb ?: "",
                                contentDescription = null,
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                            if (match.otherUser.isOnline) {
                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .align(Alignment.BottomEnd)
                                        .clip(CircleShape)
                                        .background(Color.White)
                                        .padding(1.5.dp)
                                        .clip(CircleShape)
                                        .background(AppColors.Success)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                match.otherUser.displayName,
                                fontSize = 17.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textPrimary
                            )
                            if (match.otherUser.isOnline) {
                                Text("Online", fontSize = 12.sp, color = AppColors.Success)
                            } else {
                                val lastActiveText = match.otherUser.lastActive?.let {
                                    com.mitimaiti.app.utils.timeAgoShort(it)
                                } ?: "Offline"
                                Text(lastActiveText, fontSize = 12.sp, color = colors.textMuted)
                            }
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary)
                    }
                },
                actions = {
                    val callTint = if (viewModel.callsUnlocked) AppColors.Rose else colors.textMuted.copy(alpha = 0.4f)
                    IconButton(onClick = { }, enabled = viewModel.callsUnlocked) {
                        Icon(Icons.Default.Phone, "Call", tint = callTint)
                    }
                    IconButton(onClick = { }, enabled = viewModel.callsUnlocked) {
                        Icon(Icons.Default.Videocam, "Video", tint = callTint)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colors.surface)
            )
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            Column(modifier = Modifier.fillMaxSize()) {
                // ── Lock banner with live countdown ──
                viewModel.lockBannerMessage?.let { banner ->
                    @Suppress("UNUSED_EXPRESSION")
                    tick // reference so banner recomposes with new time
                    LockBanner(
                        title = banner.title,
                        subtitle = banner.subtitle,
                        isLocked = banner.isLocked,
                        timeRemaining = chatMatch?.timeRemaining
                    )
                }

                // ── Match announcement capsule ──
                MatchAnnouncementCapsule(match = match)

                // ── Chat unlock toast (slides in from top) ──
                AnimatedVisibility(
                    visible = showUnlockToast,
                    enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
                    exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut()
                ) {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        shape = RoundedCornerShape(AppTheme.radiusMd),
                        color = AppColors.Success.copy(alpha = 0.12f)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                Icons.Default.LockOpen, null,
                                tint = AppColors.Success,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Chat unlocked! You can now send more messages.",
                                fontSize = 14.sp,
                                color = AppColors.Success,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                // ── Messages list ──
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp),
                    state = listState,
                    verticalArrangement = Arrangement.spacedBy(2.dp),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    // Icebreaker chips when chat is new
                    if (messages.isEmpty() && !isLoading) {
                        item {
                            IcebreakerSection(
                                icebreakers = MockData.icebreakers,
                                onSelect = { viewModel.sendIcebreaker(it) }
                            )
                        }
                    }

                    // Messages grouped by date
                    groupedMessages.forEach { (dateLabel, dateMessages) ->
                        // Date header
                        item(key = "date_header_$dateLabel") {
                            DateHeader(label = dateLabel)
                        }
                        // Messages in this group
                        items(dateMessages, key = { it.id }) { message ->
                            MessageBubble(message = message)
                        }
                    }

                    // Typing indicator
                    if (isOtherTyping) {
                        item(key = "typing_indicator") { TypingIndicator() }
                    }
                }

                // ── Input area ──
                ChatInputBar(
                    messageText = messageText,
                    onTextChange = { viewModel.updateMessageText(it) },
                    onSend = { viewModel.sendMessage() },
                    disabled = viewModel.inputDisabled,
                    placeholder = viewModel.inputPlaceholder,
                    isLocked = viewModel.isLockedForMe
                )
            }

            // ── Scroll-to-bottom FAB ──
            if (showScrollToBottom) {
                Surface(
                    onClick = {
                        scope.launch {
                            if (messages.isNotEmpty()) {
                                listState.animateScrollToItem(messages.size - 1)
                            }
                        }
                    },
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(end = 16.dp, bottom = 80.dp)
                        .size(40.dp),
                    color = colors.surface,
                    shape = CircleShape,
                    shadowElevation = 6.dp,
                    border = BorderStroke(1.dp, colors.border)
                ) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                        Icon(
                            Icons.Default.KeyboardArrowDown, "Scroll to bottom",
                            tint = AppColors.Rose,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}

/**
 * Match announcement capsule at top of chat.
 * "You matched with X on date"
 */
@Composable
fun MatchAnnouncementCapsule(match: Match) {
    val colors = LocalAdaptiveColors.current
    val dateFormat = remember { SimpleDateFormat("MMM d, yyyy", Locale.getDefault()) }
    val matchDateStr = dateFormat.format(Date(match.matchedAt))

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 40.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(AppTheme.radiusFull),
            color = AppColors.Rose.copy(alpha = 0.08f)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.Favorite, null,
                    tint = AppColors.Rose,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    "You matched with ${match.otherUser.displayName.split(" ").first()} on $matchDateStr",
                    fontSize = 12.sp,
                    color = AppColors.Rose,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

/**
 * Lock banner with rose tint (locked for me) or gold (awaiting first message).
 * Live countdown timer updates every second.
 */
@Composable
fun LockBanner(title: String, subtitle: String, isLocked: Boolean, timeRemaining: Long?) {
    val colors = LocalAdaptiveColors.current
    val bannerColor = if (isLocked) AppColors.Rose.copy(alpha = 0.1f) else AppColors.Gold.copy(alpha = 0.1f)
    val accentColor = if (isLocked) AppColors.Rose else AppColors.Gold

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = bannerColor
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    if (isLocked) Icons.Default.Lock else Icons.Default.ChatBubble,
                    null,
                    tint = accentColor,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.textPrimary
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(subtitle, fontSize = 13.sp, color = colors.textSecondary)

            // Live countdown timer
            timeRemaining?.let { remaining ->
                if (remaining > 0) {
                    Spacer(modifier = Modifier.height(6.dp))
                    val hours = TimeUnit.MILLISECONDS.toHours(remaining)
                    val minutes = TimeUnit.MILLISECONDS.toMinutes(remaining) % 60
                    val seconds = TimeUnit.MILLISECONDS.toSeconds(remaining) % 60
                    Text(
                        "Expires in ${hours}h ${minutes}m ${seconds}s",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (remaining < 4 * 60 * 60 * 1000L) AppColors.Error else colors.textMuted
                    )
                }
            }
        }
    }
}

/**
 * Icebreaker section with horizontal scroll chips, rose border styling.
 */
@Composable
fun IcebreakerSection(icebreakers: List<Icebreaker>, onSelect: (String) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        Text(
            "Break the ice!",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            modifier = Modifier.padding(horizontal = 4.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            "Tap a question to send it",
            fontSize = 14.sp,
            color = colors.textSecondary,
            modifier = Modifier.padding(horizontal = 4.dp)
        )
        Spacer(modifier = Modifier.height(12.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(icebreakers) { icebreaker ->
                Surface(
                    onClick = { onSelect(icebreaker.question) },
                    shape = RoundedCornerShape(AppTheme.radiusLg),
                    color = AppColors.Rose.copy(alpha = 0.06f),
                    modifier = Modifier
                        .shadow(
                            elevation = 4.dp,
                            shape = RoundedCornerShape(AppTheme.radiusLg),
                            ambientColor = AppColors.Rose.copy(alpha = 0.1f),
                            spotColor = AppColors.Rose.copy(alpha = 0.1f)
                        )
                        .border(
                            width = 1.dp,
                            brush = Brush.linearGradient(
                                listOf(
                                    AppColors.Rose.copy(alpha = 0.3f),
                                    AppColors.Rose.copy(alpha = 0.1f)
                                )
                            ),
                            shape = RoundedCornerShape(AppTheme.radiusLg)
                        )
                ) {
                    Column(
                        modifier = Modifier
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                            .widthIn(max = 200.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "\u2728",
                                fontSize = 10.sp
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                "ICEBREAKER",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppColors.Rose,
                                letterSpacing = 1.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            icebreaker.question,
                            fontSize = 14.sp,
                            color = AppColors.Rose,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

/**
 * Date header for message grouping ("Today", "Yesterday", "MMM d").
 */
@Composable
fun DateHeader(label: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(AppTheme.radiusFull),
            color = LocalAdaptiveColors.current.surfaceMedium
        ) {
            Text(
                label,
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 5.dp),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = LocalAdaptiveColors.current.textMuted
            )
        }
    }
}

/**
 * Message bubble with read receipts:
 * - Single check (sent)
 * - Double check white (delivered)
 * - Double check blue (read)
 */
@Composable
fun MessageBubble(message: Message) {
    val isFromMe = message.isFromMe
    val colors = LocalAdaptiveColors.current
    val timeFormat = remember { SimpleDateFormat("h:mm a", Locale.getDefault()) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = if (isFromMe) Arrangement.End else Arrangement.Start
    ) {
        Surface(
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isFromMe) 16.dp else 4.dp,
                bottomEnd = if (isFromMe) 4.dp else 16.dp
            ),
            color = if (isFromMe) AppColors.Rose else colors.surfaceMedium,
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)) {
                Text(
                    message.content,
                    fontSize = 15.sp,
                    color = if (isFromMe) Color.White else colors.textPrimary,
                    lineHeight = 20.sp
                )
                Spacer(modifier = Modifier.height(3.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        timeFormat.format(Date(message.createdAt)),
                        fontSize = 11.sp,
                        color = if (isFromMe) Color.White.copy(alpha = 0.6f) else colors.textMuted
                    )
                    // Read receipts for sent messages
                    if (isFromMe) {
                        Spacer(modifier = Modifier.width(4.dp))
                        when (message.status) {
                            MessageStatus.SENDING -> {
                                // Clock icon for sending
                                Icon(
                                    Icons.Default.Schedule, "Sending",
                                    modifier = Modifier.size(14.dp),
                                    tint = Color.White.copy(alpha = 0.5f)
                                )
                            }
                            MessageStatus.SENT -> {
                                // Single check
                                Icon(
                                    Icons.Default.Check, "Sent",
                                    modifier = Modifier.size(14.dp),
                                    tint = Color.White.copy(alpha = 0.6f)
                                )
                            }
                            MessageStatus.DELIVERED -> {
                                // Double check white
                                Icon(
                                    Icons.Default.DoneAll, "Delivered",
                                    modifier = Modifier.size(14.dp),
                                    tint = Color.White.copy(alpha = 0.6f)
                                )
                            }
                            MessageStatus.READ -> {
                                // Double check blue
                                Icon(
                                    Icons.Default.DoneAll, "Read",
                                    modifier = Modifier.size(14.dp),
                                    tint = AppColors.Info
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Typing indicator with 3 animated dots (scale + opacity).
 */
@Composable
fun TypingIndicator() {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = Modifier.padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.Start
    ) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = colors.surfaceMedium
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                repeat(3) { index ->
                    val infiniteTransition = rememberInfiniteTransition(label = "dot$index")
                    val alpha by infiniteTransition.animateFloat(
                        initialValue = 0.3f,
                        targetValue = 1f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(600, delayMillis = index * 200),
                            repeatMode = RepeatMode.Reverse
                        ),
                        label = "alpha$index"
                    )
                    val dotScale by infiniteTransition.animateFloat(
                        initialValue = 0.7f,
                        targetValue = 1.0f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(600, delayMillis = index * 200),
                            repeatMode = RepeatMode.Reverse
                        ),
                        label = "scale$index"
                    )
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .scale(dotScale)
                            .clip(CircleShape)
                            .background(colors.textMuted.copy(alpha = alpha))
                    )
                }
            }
        }
    }
}

/**
 * Enhanced chat input bar with camera, emoji, and mic/send toggle buttons.
 * Shows lock icon when input is disabled.
 */
@Composable
fun ChatInputBar(
    messageText: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    disabled: Boolean,
    placeholder: String,
    isLocked: Boolean = false
) {
    val colors = LocalAdaptiveColors.current
    val view = LocalView.current

    Surface(
        color = colors.surface,
        shadowElevation = 4.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp)
                .navigationBarsPadding(),
            verticalAlignment = Alignment.Bottom
        ) {
            // Camera button
            IconButton(
                onClick = { },
                enabled = !disabled,
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    Icons.Default.CameraAlt, "Camera",
                    tint = if (disabled) colors.textMuted.copy(alpha = 0.4f) else colors.textMuted,
                    modifier = Modifier.size(22.dp)
                )
            }

            // Text field with emoji button inside
            OutlinedTextField(
                value = messageText,
                onValueChange = onTextChange,
                modifier = Modifier.weight(1f),
                placeholder = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (isLocked) {
                            Icon(
                                Icons.Default.Lock, null,
                                tint = colors.textMuted.copy(alpha = 0.5f),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                        }
                        Text(placeholder, color = colors.textMuted, fontSize = 15.sp)
                    }
                },
                enabled = !disabled,
                shape = RoundedCornerShape(AppTheme.radiusFull),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AppColors.Rose,
                    unfocusedBorderColor = colors.border,
                    focusedTextColor = colors.textPrimary,
                    unfocusedTextColor = colors.textPrimary,
                    disabledBorderColor = colors.border.copy(alpha = 0.5f),
                    disabledTextColor = colors.textMuted
                ),
                leadingIcon = {
                    IconButton(
                        onClick = { },
                        enabled = !disabled,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            Icons.Default.EmojiEmotions, "Emoji",
                            tint = if (disabled) colors.textMuted.copy(alpha = 0.4f) else AppColors.Gold,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                },
                maxLines = 4,
                singleLine = false
            )

            Spacer(modifier = Modifier.width(4.dp))

            // Mic/Send toggle button
            if (messageText.isNotBlank()) {
                // Send button
                FilledIconButton(
                    onClick = {
                        view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
                        onSend()
                    },
                    enabled = !disabled,
                    modifier = Modifier.size(40.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = AppColors.Rose,
                        disabledContainerColor = AppColors.Rose.copy(alpha = 0.4f)
                    )
                ) {
                    Icon(Icons.Default.Send, "Send", tint = Color.White, modifier = Modifier.size(20.dp))
                }
            } else {
                // Mic button
                FilledIconButton(
                    onClick = { },
                    enabled = !disabled,
                    modifier = Modifier.size(40.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = if (disabled) colors.surfaceMedium else AppColors.Rose.copy(alpha = 0.1f),
                        disabledContainerColor = colors.surfaceMedium
                    )
                ) {
                    Icon(
                        Icons.Default.Mic, "Voice",
                        tint = if (disabled) colors.textMuted.copy(alpha = 0.4f) else AppColors.Rose,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

/**
 * Groups messages by date, returning a list of (label, messages) pairs.
 * Labels are "Today", "Yesterday", or "MMM d" format.
 */
private fun groupMessagesByDate(messages: List<Message>): List<Pair<String, List<Message>>> {
    if (messages.isEmpty()) return emptyList()

    val calendar = Calendar.getInstance()
    val today = Calendar.getInstance()
    val yesterday = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }
    val dateFormat = SimpleDateFormat("MMM d", Locale.getDefault())

    val groups = mutableListOf<Pair<String, MutableList<Message>>>()

    for (message in messages) {
        calendar.timeInMillis = message.createdAt
        val label = when {
            isSameDay(calendar, today) -> "Today"
            isSameDay(calendar, yesterday) -> "Yesterday"
            else -> dateFormat.format(Date(message.createdAt))
        }

        val lastGroup = groups.lastOrNull()
        if (lastGroup != null && lastGroup.first == label) {
            lastGroup.second.add(message)
        } else {
            groups.add(label to mutableListOf(message))
        }
    }

    return groups
}

private fun isSameDay(cal1: Calendar, cal2: Calendar): Boolean {
    return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
            cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
}
