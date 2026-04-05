package com.mitimaiti.app.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import kotlinx.coroutines.delay

@Composable
fun CountdownRing(
    expiresAt: Long,
    totalDurationMs: Long = 24 * 60 * 60 * 1000L,
    size: Dp = 56.dp,
    strokeWidth: Dp = 3.dp,
    ringColor: Color = AppColors.Gold,
    trackColor: Color = AppColors.Gold.copy(alpha = 0.15f),
    showText: Boolean = true,
    textSize: TextUnit = 11.sp,
    modifier: Modifier = Modifier,
    content: @Composable (BoxScope.() -> Unit)? = null
) {
    val colors = LocalAdaptiveColors.current
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            now = System.currentTimeMillis()
        }
    }

    val remaining = maxOf(0, expiresAt - now)
    val fraction = if (totalDurationMs > 0) (remaining.toFloat() / totalDurationMs).coerceIn(0f, 1f) else 0f
    val animatedFraction by animateFloatAsState(
        targetValue = fraction,
        animationSpec = tween(300),
        label = "ringProgress"
    )

    val hours = (remaining / (1000 * 60 * 60)).toInt()
    val minutes = ((remaining / (1000 * 60)) % 60).toInt()
    val timeText = if (remaining > 0) "${hours}h ${minutes}m" else "Expired"

    Box(modifier = modifier.size(size), contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val stroke = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
            // Track
            drawArc(
                color = trackColor,
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                style = stroke
            )
            // Progress
            drawArc(
                color = ringColor,
                startAngle = -90f,
                sweepAngle = animatedFraction * 360f,
                useCenter = false,
                style = stroke
            )
        }

        if (content != null) {
            content()
        } else if (showText) {
            Text(
                text = timeText,
                color = colors.textSecondary,
                fontSize = textSize,
                fontWeight = FontWeight.Medium,
                maxLines = 1
            )
        }
    }
}

@Composable
fun CountdownBanner(
    expiresAt: Long,
    modifier: Modifier = Modifier
) {
    val colors = LocalAdaptiveColors.current
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            now = System.currentTimeMillis()
        }
    }

    val remaining = maxOf(0, expiresAt - now)
    val hours = (remaining / (1000 * 60 * 60)).toInt()
    val minutes = ((remaining / (1000 * 60)) % 60).toInt()
    val seconds = ((remaining / 1000) % 60).toInt()

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(
            text = if (remaining > 0) String.format("%02d:%02d:%02d", hours, minutes, seconds) else "Expired",
            color = if (remaining > 4 * 60 * 60 * 1000L) AppColors.Gold else AppColors.Error,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}
