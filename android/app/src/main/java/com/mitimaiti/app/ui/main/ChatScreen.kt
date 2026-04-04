@file:Suppress("DEPRECATION")
package com.mitimaiti.app.ui.main

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.models.*
import com.mitimaiti.app.services.MockData
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.ChatViewModel
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

    LaunchedEffect(match) { viewModel.loadMessages(match) }
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1)
    }

    Scaffold(
        containerColor = colors.background,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(
                            model = match.otherUser.primaryPhoto?.urlThumb ?: "",
                            contentDescription = null,
                            modifier = Modifier.size(36.dp).clip(CircleShape),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(match.otherUser.displayName, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                            if (match.otherUser.isOnline) {
                                Text("Online", fontSize = 12.sp, color = AppColors.Success)
                            }
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary) }
                },
                actions = {
                    if (viewModel.callsUnlocked) {
                        IconButton(onClick = { }) { Icon(Icons.Default.Phone, "Call", tint = AppColors.Rose) }
                        IconButton(onClick = { }) { Icon(Icons.Default.Videocam, "Video", tint = AppColors.Rose) }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colors.surface)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(innerPadding)
        ) {
            // Lock banner
            viewModel.lockBannerMessage?.let { banner ->
                LockBanner(
                    title = banner.title,
                    subtitle = banner.subtitle,
                    isLocked = banner.isLocked,
                    timeRemaining = chatMatch?.timeRemaining
                )
            }

            // Chat unlocked banner
            AnimatedVisibility(visible = chatUnlocked) {
                Surface(
                    modifier = Modifier.fillMaxWidth().padding(8.dp),
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = AppColors.Success.copy(alpha = 0.1f)
                ) {
                    Text(
                        "Chat unlocked! You can now send more messages.",
                        modifier = Modifier.padding(12.dp),
                        fontSize = 14.sp,
                        color = AppColors.Success,
                        textAlign = TextAlign.Center
                    )
                }
            }

            // Messages list
            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth().padding(horizontal = 12.dp),
                state = listState,
                verticalArrangement = Arrangement.spacedBy(4.dp),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                // Icebreakers if no messages yet
                if (messages.isEmpty() && !isLoading) {
                    item {
                        IcebreakerSection(
                            icebreakers = MockData.icebreakers,
                            onSelect = { viewModel.sendIcebreaker(it) }
                        )
                    }
                }

                items(messages, key = { it.id }) { message ->
                    MessageBubble(message = message)
                }

                // Typing indicator
                if (isOtherTyping) {
                    item { TypingIndicator() }
                }
            }

            // Input area
            ChatInputBar(
                messageText = messageText,
                onTextChange = { viewModel.updateMessageText(it) },
                onSend = { viewModel.sendMessage() },
                disabled = viewModel.inputDisabled,
                placeholder = viewModel.inputPlaceholder
            )
        }
    }
}

@Composable
fun LockBanner(title: String, subtitle: String, isLocked: Boolean, timeRemaining: Long?) {
    val colors = LocalAdaptiveColors.current
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = if (isLocked) AppColors.Rose.copy(alpha = 0.1f) else AppColors.Gold.copy(alpha = 0.1f)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    if (isLocked) Icons.Default.Lock else Icons.Default.ChatBubble,
                    null,
                    tint = if (isLocked) AppColors.Rose else AppColors.Gold,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(title, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(subtitle, fontSize = 13.sp, color = colors.textSecondary)

            // Countdown timer
            timeRemaining?.let { remaining ->
                if (remaining > 0) {
                    Spacer(modifier = Modifier.height(6.dp))
                    val hours = remaining / (60 * 60 * 1000)
                    val minutes = (remaining % (60 * 60 * 1000)) / (60 * 1000)
                    Text(
                        "Expires in ${hours}h ${minutes}m",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (remaining < 4 * 60 * 60 * 1000L) AppColors.Error else colors.textMuted
                    )
                }
            }
        }
    }
}

@Composable
fun IcebreakerSection(icebreakers: List<Icebreaker>, onSelect: (String) -> Unit) {
    val colors = LocalAdaptiveColors.current
    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        Text("Break the ice!", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, modifier = Modifier.padding(horizontal = 4.dp))
        Spacer(modifier = Modifier.height(4.dp))
        Text("Tap a question to send it", fontSize = 14.sp, color = colors.textSecondary, modifier = Modifier.padding(horizontal = 4.dp))
        Spacer(modifier = Modifier.height(12.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(icebreakers) { icebreaker ->
                Surface(
                    onClick = { onSelect(icebreaker.question) },
                    shape = RoundedCornerShape(AppTheme.radiusMd),
                    color = colors.surfaceMedium
                ) {
                    Text(
                        icebreaker.question,
                        modifier = Modifier.padding(12.dp).widthIn(max = 200.dp),
                        fontSize = 14.sp,
                        color = colors.textPrimary
                    )
                }
            }
        }
    }
}

@Composable
fun MessageBubble(message: Message) {
    val isFromMe = message.isFromMe
    val timeFormat = remember { SimpleDateFormat("h:mm a", Locale.getDefault()) }

    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
        horizontalArrangement = if (isFromMe) Arrangement.End else Arrangement.Start
    ) {
        Surface(
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isFromMe) 16.dp else 4.dp,
                bottomEnd = if (isFromMe) 4.dp else 16.dp
            ),
            color = if (isFromMe) AppColors.Rose else LocalAdaptiveColors.current.surfaceMedium,
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    message.content,
                    fontSize = 15.sp,
                    color = if (isFromMe) Color.White else LocalAdaptiveColors.current.textPrimary
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        timeFormat.format(Date(message.createdAt)),
                        fontSize = 11.sp,
                        color = if (isFromMe) Color.White.copy(alpha = 0.6f) else LocalAdaptiveColors.current.textMuted
                    )
                    if (isFromMe) {
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            when (message.status) {
                                MessageStatus.SENDING -> Icons.Default.Schedule
                                MessageStatus.SENT -> Icons.Default.Check
                                MessageStatus.DELIVERED -> Icons.Default.DoneAll
                                MessageStatus.READ -> Icons.Default.DoneAll
                            },
                            "Status",
                            modifier = Modifier.size(14.dp),
                            tint = if (message.status == MessageStatus.READ) AppColors.Info else Color.White.copy(alpha = 0.6f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TypingIndicator() {
    val colors = LocalAdaptiveColors.current
    Row(modifier = Modifier.padding(vertical = 4.dp), horizontalArrangement = Arrangement.Start) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = colors.surfaceMedium
        ) {
            Row(modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
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
                    Box(
                        modifier = Modifier.size(8.dp).clip(CircleShape).background(colors.textMuted.copy(alpha = alpha))
                    )
                }
            }
        }
    }
}

@Composable
fun ChatInputBar(
    messageText: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    disabled: Boolean,
    placeholder: String
) {
    val colors = LocalAdaptiveColors.current

    Surface(
        color = colors.surface,
        shadowElevation = 4.dp
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp).navigationBarsPadding(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = messageText,
                onValueChange = onTextChange,
                modifier = Modifier.weight(1f),
                placeholder = { Text(placeholder, color = colors.textMuted, fontSize = 15.sp) },
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
                maxLines = 4,
                singleLine = false
            )
            Spacer(modifier = Modifier.width(8.dp))
            FilledIconButton(
                onClick = onSend,
                enabled = messageText.isNotBlank() && !disabled,
                colors = IconButtonDefaults.filledIconButtonColors(
                    containerColor = AppColors.Rose,
                    disabledContainerColor = AppColors.Rose.copy(alpha = 0.4f)
                )
            ) {
                Icon(Icons.Default.Send, "Send", tint = Color.White)
            }
        }
    }
}
