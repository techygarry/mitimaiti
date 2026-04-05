package com.mitimaiti.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.models.CulturalBadge
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

enum class BadgeVariant {
    SUCCESS, WARNING, DANGER, INFO, MUTED, GOLD, ROSE
}

@Composable
fun StatusBadge(
    text: String,
    variant: BadgeVariant = BadgeVariant.MUTED,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (variant) {
        BadgeVariant.SUCCESS -> AppColors.Success.copy(alpha = 0.15f) to AppColors.Success
        BadgeVariant.WARNING -> AppColors.Warning.copy(alpha = 0.15f) to AppColors.Warning
        BadgeVariant.DANGER -> AppColors.Error.copy(alpha = 0.15f) to AppColors.Error
        BadgeVariant.INFO -> AppColors.Info.copy(alpha = 0.15f) to AppColors.Info
        BadgeVariant.MUTED -> LocalAdaptiveColors.current.textMuted.copy(alpha = 0.15f) to LocalAdaptiveColors.current.textMuted
        BadgeVariant.GOLD -> AppColors.Gold.copy(alpha = 0.15f) to AppColors.Gold
        BadgeVariant.ROSE -> AppColors.Rose.copy(alpha = 0.15f) to AppColors.Rose
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = bgColor
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = textColor
        )
    }
}

@Composable
fun CulturalScoreBadge(
    score: Int,
    badge: CulturalBadge,
    modifier: Modifier = Modifier
) {
    val badgeColor = when (badge) {
        CulturalBadge.GOLD -> AppColors.BadgeGold
        CulturalBadge.GREEN -> AppColors.BadgeGreen
        CulturalBadge.ORANGE -> AppColors.BadgeOrange
        CulturalBadge.NONE -> LocalAdaptiveColors.current.textMuted
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = badgeColor.copy(alpha = 0.15f)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            // Dot indicator
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(badgeColor)
            )
            Text(
                text = "${score}%",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = badgeColor
            )
        }
    }
}

@Composable
fun CountBadge(
    count: Int,
    modifier: Modifier = Modifier,
    color: Color = AppColors.Rose,
    size: Dp = 20.dp
) {
    if (count <= 0) return

    Box(
        modifier = modifier
            .defaultMinSize(minWidth = size, minHeight = size)
            .clip(CircleShape)
            .background(color),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = if (count > 99) "99+" else count.toString(),
            color = Color.White,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 4.dp)
        )
    }
}

@Composable
fun OnlineIndicator(
    isOnline: Boolean,
    modifier: Modifier = Modifier,
    size: Dp = 12.dp
) {
    if (!isOnline) return

    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(Color.White)
            .padding(2.dp)
            .clip(CircleShape)
            .background(AppColors.Success)
    )
}

@Composable
fun VerifiedBadge(
    modifier: Modifier = Modifier,
    size: Dp = 20.dp
) {
    Surface(
        modifier = modifier.size(size),
        shape = CircleShape,
        color = AppColors.Info
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = "\u2713",
                color = Color.White,
                fontSize = (size.value * 0.6f).sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
