package com.mitimaiti.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

@Composable
fun ShimmerBrush(): Brush {
    val colors = LocalAdaptiveColors.current
    val shimmerColors = listOf(
        colors.surfaceMedium,
        colors.cardDark,
        colors.surfaceMedium
    )
    val transition = rememberInfiniteTransition(label = "shimmer")
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerTranslate"
    )
    return Brush.linearGradient(
        colors = shimmerColors,
        start = Offset(translateAnim - 300f, translateAnim - 300f),
        end = Offset(translateAnim, translateAnim)
    )
}

@Composable
fun ShimmerBox(
    modifier: Modifier = Modifier,
    width: Dp? = null,
    height: Dp = 16.dp,
    cornerRadius: Dp = 8.dp
) {
    val brush = ShimmerBrush()
    val mod = modifier
        .then(if (width != null) Modifier.width(width) else Modifier.fillMaxWidth())
        .height(height)
        .clip(RoundedCornerShape(cornerRadius))
        .background(brush)
    Box(modifier = mod)
}

@Composable
fun ShimmerCircle(
    modifier: Modifier = Modifier,
    size: Dp = 48.dp
) {
    val brush = ShimmerBrush()
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(brush)
    )
}

@Composable
fun ShimmerDiscoverCard(modifier: Modifier = Modifier) {
    val colors = LocalAdaptiveColors.current
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(colors.surface)
    ) {
        // Hero image placeholder
        ShimmerBox(height = 400.dp, cornerRadius = 0.dp)
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Name + age
            ShimmerBox(width = 180.dp, height = 28.dp)
            // Location
            ShimmerBox(width = 140.dp, height = 16.dp)
            Spacer(modifier = Modifier.height(4.dp))
            // Bio lines
            ShimmerBox(height = 14.dp)
            ShimmerBox(width = 220.dp, height = 14.dp)
            Spacer(modifier = Modifier.height(8.dp))
            // Chips
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ShimmerBox(width = 80.dp, height = 32.dp, cornerRadius = 16.dp)
                ShimmerBox(width = 100.dp, height = 32.dp, cornerRadius = 16.dp)
                ShimmerBox(width = 70.dp, height = 32.dp, cornerRadius = 16.dp)
            }
        }
    }
}

@Composable
fun ShimmerMatchItem(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        ShimmerCircle(size = 56.dp)
        Column(verticalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.weight(1f)) {
            ShimmerBox(width = 120.dp, height = 16.dp)
            ShimmerBox(width = 180.dp, height = 12.dp)
        }
        ShimmerBox(width = 40.dp, height = 12.dp)
    }
}

@Composable
fun ShimmerProfileCard(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(LocalAdaptiveColors.current.surface)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        ShimmerCircle(size = 120.dp)
        ShimmerBox(width = 160.dp, height = 24.dp)
        ShimmerBox(width = 100.dp, height = 14.dp)
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            repeat(3) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    ShimmerBox(width = 40.dp, height = 24.dp)
                    ShimmerBox(width = 50.dp, height = 12.dp)
                }
            }
        }
    }
}
