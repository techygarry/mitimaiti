package com.mitimaiti.app.ui.components

import android.view.HapticFeedbackConstants
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.models.Message
import com.mitimaiti.app.models.MessageStatus
import com.mitimaiti.app.models.MessageType
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.utils.initials
import com.mitimaiti.app.utils.messageTime
import com.mitimaiti.app.utils.shortCountdown
import kotlinx.coroutines.delay

// MARK: - GlassCard (legacy - kept for compatibility)

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = AppTheme.radiusLg,
    elevation: Dp = 4.dp,
    content: @Composable ColumnScope.() -> Unit
) {
    val colors = LocalAdaptiveColors.current
    Card(
        modifier = modifier.shadow(elevation, RoundedCornerShape(cornerRadius)),
        shape = RoundedCornerShape(cornerRadius),
        colors = CardDefaults.cardColors(containerColor = colors.surface.copy(alpha = 0.9f)),
        border = BorderStroke(1.dp, colors.border),
        elevation = CardDefaults.cardElevation(defaultElevation = elevation)
    ) {
        Column(content = content)
    }
}

// MARK: - Content Card Container

enum class ContentCardStyle { Default, Elevated, Flat }

@Composable
fun ContentCard(
    modifier: Modifier = Modifier,
    style: ContentCardStyle = ContentCardStyle.Default,
    content: @Composable ColumnScope.() -> Unit
) {
    val colors = LocalAdaptiveColors.current
    val borderColor = when (style) {
        ContentCardStyle.Default -> colors.border
        ContentCardStyle.Elevated -> colors.border.copy(alpha = 0.8f)
        ContentCardStyle.Flat -> Color.Transparent
    }
    val shadowElevation = when (style) {
        ContentCardStyle.Default -> 12.dp
        ContentCardStyle.Elevated -> 20.dp
        ContentCardStyle.Flat -> 0.dp
    }

    Card(
        modifier = modifier.shadow(shadowElevation, RoundedCornerShape(AppTheme.radiusCard)),
        shape = RoundedCornerShape(AppTheme.radiusCard),
        colors = CardDefaults.cardColors(containerColor = colors.cardDark),
        border = if (style != ContentCardStyle.Flat) BorderStroke(0.5.dp, borderColor) else null
    ) {
        Column(content = content)
    }
}

// MARK: - Primary Button (Rose gradient capsule with glow)

@Composable
fun PrimaryButton(
    title: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    isLoading: Boolean = false,
    onClick: () -> Unit
) {
    val view = LocalView.current
    Button(
        onClick = { view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK); onClick() },
        modifier = modifier
            .fillMaxWidth()
            .height(AppTheme.buttonHeightPrimary)
            .shadow(14.dp, RoundedCornerShape(AppTheme.radiusFull), ambientColor = AppColors.Rose.copy(alpha = 0.45f)),
        shape = RoundedCornerShape(AppTheme.radiusFull),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        contentPadding = PaddingValues(0.dp),
        enabled = !isLoading
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(AppTheme.roseGradient, RoundedCornerShape(AppTheme.radiusFull)),
            contentAlignment = Alignment.Center
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    icon?.let {
                        Icon(imageVector = it, contentDescription = null, modifier = Modifier.size(18.dp), tint = Color.White)
                    }
                    Text(title, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

// MARK: - Secondary Button (Outline with rose border)

@Composable
fun SecondaryButton(
    title: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    isLoading: Boolean = false,
    onClick: () -> Unit
) {
    val view = LocalView.current
    OutlinedButton(
        onClick = { view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK); onClick() },
        modifier = modifier
            .fillMaxWidth()
            .height(AppTheme.buttonHeightPrimary),
        shape = RoundedCornerShape(AppTheme.radiusFull),
        border = BorderStroke(1.5.dp, AppColors.Rose),
        enabled = !isLoading
    ) {
        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = AppColors.Rose, strokeWidth = 2.dp)
        } else {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                icon?.let {
                    Icon(imageVector = it, contentDescription = null, modifier = Modifier.size(18.dp), tint = AppColors.Rose)
                }
                Text(title, color = AppColors.Rose, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

// MARK: - Danger Button (Error color gradient)

@Composable
fun DangerButton(
    title: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    isLoading: Boolean = false,
    onClick: () -> Unit
) {
    val view = LocalView.current
    Button(
        onClick = { view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK); onClick() },
        modifier = modifier
            .fillMaxWidth()
            .height(AppTheme.buttonHeightPrimary)
            .shadow(14.dp, RoundedCornerShape(AppTheme.radiusFull), ambientColor = AppColors.Error.copy(alpha = 0.35f)),
        shape = RoundedCornerShape(AppTheme.radiusFull),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        contentPadding = PaddingValues(0.dp),
        enabled = !isLoading
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(listOf(AppColors.Error, AppColors.Error.copy(alpha = 0.8f))),
                    RoundedCornerShape(AppTheme.radiusFull)
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
            } else {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    icon?.let {
                        Icon(imageVector = it, contentDescription = null, modifier = Modifier.size(18.dp), tint = Color.White)
                    }
                    Text(title, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

// MARK: - Small Button (Compact rose gradient capsule)

@Composable
fun SmallButton(
    title: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    onClick: () -> Unit
) {
    val view = LocalView.current
    Button(
        onClick = { view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK); onClick() },
        modifier = modifier
            .shadow(10.dp, RoundedCornerShape(AppTheme.radiusFull), ambientColor = AppColors.Rose.copy(alpha = 0.35f)),
        shape = RoundedCornerShape(AppTheme.radiusFull),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        contentPadding = PaddingValues(0.dp)
    ) {
        Box(
            modifier = Modifier
                .background(AppTheme.roseGradient, RoundedCornerShape(AppTheme.radiusFull))
                .padding(horizontal = 20.dp, vertical = 10.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                icon?.let {
                    Icon(imageVector = it, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                }
                Text(title, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

// MARK: - App Text Field

@Composable
fun AppTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    keyboardType: KeyboardType = KeyboardType.Text
) {
    val colors = LocalAdaptiveColors.current
    var isFocused by remember { mutableStateOf(false) }
    val animatedBorderColor by animateColorAsState(
        targetValue = if (isFocused) AppColors.Rose else colors.border,
        animationSpec = tween(200),
        label = "textFieldBorder"
    )
    val animatedBorderWidth = if (isFocused) 1.5.dp else 1.dp
    val animatedIconColor by animateColorAsState(
        targetValue = if (isFocused) AppColors.Rose else colors.textMuted,
        animationSpec = tween(200),
        label = "textFieldIcon"
    )

    Row(
        modifier = modifier
            .shadow(4.dp, RoundedCornerShape(AppTheme.radiusMd))
            .background(colors.cardDark, RoundedCornerShape(AppTheme.radiusMd))
            .border(animatedBorderWidth, animatedBorderColor, RoundedCornerShape(AppTheme.radiusMd))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        icon?.let {
            Icon(
                imageVector = it,
                contentDescription = null,
                tint = animatedIconColor,
                modifier = Modifier.size(20.dp)
            )
        }
        Box(modifier = Modifier.weight(1f)) {
            if (value.isEmpty()) {
                Text(text = placeholder, color = colors.textMuted, fontSize = 16.sp)
            }
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .onFocusChanged { isFocused = it.isFocused },
                textStyle = LocalTextStyle.current.copy(color = colors.textPrimary, fontSize = 16.sp),
                keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
                singleLine = true
            )
        }
    }
}

// MARK: - Toggle Row

@Composable
fun ToggleRow(
    title: String,
    icon: ImageVector,
    isOn: Boolean,
    onToggle: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(imageVector = icon, contentDescription = null, tint = AppColors.Rose, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Text(title, color = colors.textPrimary, fontSize = 15.sp, modifier = Modifier.weight(1f))
        Switch(
            checked = isOn,
            onCheckedChange = onToggle,
            colors = SwitchDefaults.colors(checkedTrackColor = AppColors.Rose)
        )
    }
}

// MARK: - Score Tag (Capsule with color background)

@Composable
fun ScoreTag(
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null
) {
    Row(
        modifier = modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(AppTheme.radiusFull))
            .padding(horizontal = 10.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        icon?.let {
            Icon(imageVector = it, contentDescription = null, tint = color, modifier = Modifier.size(10.dp))
        }
        Text(value, color = color, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text(label, color = color.copy(alpha = 0.8f), fontSize = 10.sp, fontWeight = FontWeight.Medium)
    }
}

// MARK: - Countdown Badge (Live timer with urgency colors)

@Composable
fun CountdownBadge(
    expiresAt: Long,
    modifier: Modifier = Modifier
) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            now = System.currentTimeMillis()
        }
    }

    val remaining = maxOf(0L, expiresAt - now)
    val color = when {
        remaining < 4 * 3600 * 1000L -> AppColors.Error
        remaining < 12 * 3600 * 1000L -> AppColors.Warning
        else -> AppColors.Success
    }

    Row(
        modifier = modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(AppTheme.radiusFull))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = Icons.Filled.Schedule,
            contentDescription = null,
            tint = color,
            modifier = Modifier.size(10.dp)
        )
        Text(
            text = remaining.shortCountdown(),
            color = color,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            fontFamily = FontFamily.Monospace
        )
    }
}

// MARK: - Profile Avatar (Rose gradient circle with initials, online dot)

@Composable
fun ProfileAvatar(
    url: String?,
    name: String,
    size: Dp,
    modifier: Modifier = Modifier,
    isOnline: Boolean = false,
    showBorder: Boolean = false
) {
    val colors = LocalAdaptiveColors.current

    Box(modifier = modifier, contentAlignment = Alignment.BottomEnd) {
        if (url != null && url.startsWith("http")) {
            AsyncImage(
                model = url,
                contentDescription = name,
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape)
                    .then(
                        if (showBorder) Modifier.background(
                            Brush.linearGradient(listOf(AppColors.Rose, AppColors.Gold)),
                            CircleShape
                        ).padding(2.dp).clip(CircleShape)
                        else Modifier
                    ),
                contentScale = ContentScale.Crop
            )
        } else {
            Box(
                modifier = Modifier
                    .size(size)
                    .then(
                        if (showBorder) Modifier.background(
                            Brush.linearGradient(listOf(AppColors.Rose, AppColors.Gold)),
                            CircleShape
                        ).padding(2.dp)
                        else Modifier
                    )
                    .background(
                        Brush.linearGradient(
                            listOf(AppColors.Rose.copy(alpha = 0.7f), AppColors.RoseDark.copy(alpha = 0.5f))
                        ),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = name.initials(),
                    color = Color.White,
                    fontSize = (size.value * 0.35f).sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        if (isOnline) {
            Box(
                modifier = Modifier
                    .size(size * 0.25f)
                    .background(colors.background, CircleShape)
                    .padding(2.dp)
                    .background(AppColors.Success, CircleShape)
            )
        }
    }
}

// MARK: - Message Bubble

@Composable
fun MessageBubble(
    message: Message,
    modifier: Modifier = Modifier,
    showTimestamp: Boolean = true
) {
    val colors = LocalAdaptiveColors.current

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isFromMe) Arrangement.End else Arrangement.Start
    ) {
        if (message.isFromMe) Spacer(modifier = Modifier.weight(1f).widthIn(min = 60.dp))

        Column(
            horizontalAlignment = if (message.isFromMe) Alignment.End else Alignment.Start
        ) {
            // Icebreaker label
            if (message.msgType == MessageType.ICEBREAKER) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Icon(Icons.Filled.AutoAwesome, null, tint = AppColors.Gold, modifier = Modifier.size(10.dp))
                    Text("Icebreaker", color = AppColors.Gold, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                }
                Spacer(modifier = Modifier.height(4.dp))
            }

            // System message
            if (message.msgType == MessageType.SYSTEM) {
                Text(
                    text = message.content,
                    color = colors.textMuted,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                )
            } else {
                // Regular bubble
                Box(
                    modifier = Modifier
                        .shadow(
                            if (message.isFromMe) 10.dp else 6.dp,
                            RoundedCornerShape(20.dp),
                            ambientColor = if (message.isFromMe) AppColors.Rose.copy(alpha = 0.18f) else colors.cardShadowColor.copy(alpha = 0.5f)
                        )
                        .background(
                            if (message.isFromMe) AppTheme.roseGradient else Brush.linearGradient(listOf(colors.surfaceMedium, colors.surfaceMedium)),
                            RoundedCornerShape(20.dp)
                        )
                        .padding(horizontal = 16.dp, vertical = 11.dp)
                ) {
                    Text(
                        text = message.content,
                        color = if (message.isFromMe) Color.White else colors.textPrimary,
                        fontSize = 15.sp
                    )
                }
            }

            // Timestamp + read receipt
            if (showTimestamp) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = message.createdAt.messageTime(),
                        color = colors.textMuted,
                        fontSize = 10.sp
                    )
                    if (message.isFromMe) {
                        ReadReceiptIcon(status = message.status)
                    }
                }
            }
        }

        if (!message.isFromMe) Spacer(modifier = Modifier.weight(1f).widthIn(min = 60.dp))
    }
}

@Composable
private fun ReadReceiptIcon(status: MessageStatus) {
    val colors = LocalAdaptiveColors.current
    val readColor = AppColors.Info

    when (status) {
        MessageStatus.SENDING -> Icon(Icons.Filled.Schedule, null, tint = colors.textMuted, modifier = Modifier.size(10.dp))
        MessageStatus.SENT -> Icon(Icons.Filled.Check, null, tint = colors.textMuted, modifier = Modifier.size(10.dp))
        MessageStatus.DELIVERED -> Icon(Icons.Filled.DoneAll, null, tint = colors.textMuted, modifier = Modifier.size(13.dp))
        MessageStatus.READ -> Icon(Icons.Filled.DoneAll, null, tint = readColor, modifier = Modifier.size(13.dp))
    }
}

// MARK: - Progress Ring (Circular progress for profile completeness)

@Composable
fun ProgressRing(
    progress: Float,
    modifier: Modifier = Modifier,
    size: Dp = 60.dp,
    lineWidth: Dp = 6.dp,
    color: Color = AppColors.Rose
) {
    val clamped = progress.coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(
        targetValue = clamped,
        animationSpec = tween(500),
        label = "progressRing"
    )

    Box(modifier = modifier.size(size), contentAlignment = Alignment.Center) {
        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
            // Background track
            drawArc(
                color = color.copy(alpha = 0.15f),
                startAngle = 0f,
                sweepAngle = 360f,
                useCenter = false,
                style = Stroke(width = lineWidth.toPx(), cap = StrokeCap.Round)
            )
            // Progress arc
            drawArc(
                color = color,
                startAngle = -90f,
                sweepAngle = animatedProgress * 360f,
                useCenter = false,
                style = Stroke(width = lineWidth.toPx(), cap = StrokeCap.Round)
            )
        }
        Text(
            text = "${(clamped * 100).toInt()}%",
            color = color,
            fontSize = (size.value * 0.25f).sp,
            fontWeight = FontWeight.Bold
        )
    }
}

// MARK: - Loading Overlay

@Composable
fun LoadingOverlay(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")
    val shimmerOffset by infiniteTransition.animateFloat(
        initialValue = -200f,
        targetValue = 200f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerOffset"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.4f)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier
                .shadow(20.dp, RoundedCornerShape(AppTheme.radiusMd))
                .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(AppTheme.radiusMd))
                .padding(32.dp)
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(32.dp),
                color = Color.White,
                strokeWidth = 3.dp
            )
            Text(
                text = "Loading...",
                color = Color.White.copy(alpha = 0.9f),
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

// MARK: - Stat Row

data class StatItem(
    val icon: ImageVector,
    val label: String,
    val value: String
)

@Composable
fun StatRow(
    items: List<StatItem>,
    modifier: Modifier = Modifier
) {
    val colors = LocalAdaptiveColors.current
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        items.forEachIndexed { index, item ->
            if (index > 0) {
                Box(
                    modifier = Modifier
                        .width(0.5.dp)
                        .height(20.dp)
                        .background(colors.border)
                )
            }
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = null,
                    tint = AppColors.Rose,
                    modifier = Modifier.size(12.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(item.value, color = colors.textPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.width(4.dp))
                Text(item.label, color = colors.textMuted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}

// MARK: - Typing Indicator (Three animated dots)

@Composable
fun TypingIndicator(modifier: Modifier = Modifier) {
    val colors = LocalAdaptiveColors.current
    val infiniteTransition = rememberInfiniteTransition(label = "typing")

    Row(modifier = modifier) {
        Row(
            modifier = Modifier
                .background(colors.surfaceMedium, RoundedCornerShape(20.dp))
                .padding(horizontal = 16.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.spacedBy(5.dp)
        ) {
            repeat(3) { i ->
                val scale by infiniteTransition.animateFloat(
                    initialValue = 1f,
                    targetValue = 1.4f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(1000, easing = EaseInOut),
                        repeatMode = RepeatMode.Reverse,
                        initialStartOffset = StartOffset(i * 200)
                    ),
                    label = "dot$i"
                )
                val alpha by infiniteTransition.animateFloat(
                    initialValue = 0.4f,
                    targetValue = 1f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(1000, easing = EaseInOut),
                        repeatMode = RepeatMode.Reverse,
                        initialStartOffset = StartOffset(i * 200)
                    ),
                    label = "dotAlpha$i"
                )
                Box(
                    modifier = Modifier
                        .size((7 * scale).dp)
                        .background(colors.textMuted.copy(alpha = alpha), CircleShape)
                )
            }
        }
        Spacer(modifier = Modifier.weight(1f))
    }
}
