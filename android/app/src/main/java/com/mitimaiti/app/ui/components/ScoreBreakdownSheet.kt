package com.mitimaiti.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.models.*
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScoreBreakdownSheet(
    card: FeedCard,
    onDismiss: () -> Unit
) {
    val colors = LocalAdaptiveColors.current

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = colors.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 12.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(colors.textMuted.copy(alpha = 0.3f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Header
            Text(
                text = "Score Breakdown",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary
            )

            // Cultural Score Section
            CulturalScoreSection(card.culturalScore)

            // Kundli Score Section
            if (card.kundliScore != null) {
                HorizontalDivider(color = colors.borderSubtle)
                KundliScoreSection(card.kundliScore)
            }

            // Common Interests
            if (card.commonInterests > 0) {
                HorizontalDivider(color = colors.borderSubtle)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Common Interests",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textPrimary
                    )
                    Text(
                        text = "${card.commonInterests} shared",
                        fontSize = 14.sp,
                        color = AppColors.Rose,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
private fun CulturalScoreSection(score: CulturalScore) {
    val colors = LocalAdaptiveColors.current
    val badgeColor = when (score.badge) {
        CulturalBadge.GOLD -> AppColors.BadgeGold
        CulturalBadge.GREEN -> AppColors.BadgeGreen
        CulturalBadge.ORANGE -> AppColors.BadgeOrange
        CulturalBadge.NONE -> colors.textMuted
    }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Cultural Match",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = colors.textPrimary
            )
            ScoreBadge(
                score = score.overallScore,
                badge = score.badge
            )
        }

        score.dimensions.forEach { dimension ->
            ScoreDimensionRow(
                name = dimension.name,
                score = dimension.score,
                maxScore = dimension.maxScore,
                color = badgeColor
            )
        }
    }
}

@Composable
private fun KundliScoreSection(score: KundliScore) {
    val colors = LocalAdaptiveColors.current
    val tierColor = when (score.tier) {
        KundliTier.EXCELLENT -> AppColors.Success
        KundliTier.GOOD -> AppColors.Gold
        KundliTier.CHALLENGING -> AppColors.Warning
    }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Kundli Match",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = colors.textPrimary
            )
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = tierColor.copy(alpha = 0.15f)
            ) {
                Text(
                    text = "${score.totalScore}/${score.maxScore.toInt()} • ${score.tier.displayName}",
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = tierColor
                )
            }
        }

        score.gunas.forEach { guna ->
            ScoreDimensionRow(
                name = guna.name,
                score = guna.obtained.toInt(),
                maxScore = guna.maxPoints.toInt(),
                color = tierColor,
                subtitle = guna.description.takeIf { it.isNotEmpty() }
            )
        }
    }
}

@Composable
private fun ScoreDimensionRow(
    name: String,
    score: Int,
    maxScore: Int,
    color: Color,
    subtitle: String? = null
) {
    val colors = LocalAdaptiveColors.current
    val fraction = if (maxScore > 0) score.toFloat() / maxScore else 0f

    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = name,
                fontSize = 14.sp,
                color = colors.textSecondary
            )
            Text(
                text = "$score/$maxScore",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = colors.textPrimary
            )
        }
        if (subtitle != null) {
            Text(
                text = subtitle,
                fontSize = 12.sp,
                color = colors.textMuted
            )
        }
        // Progress bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(color.copy(alpha = 0.12f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(3.dp))
                    .background(color)
            )
        }
    }
}

@Composable
fun ScoreBadge(
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
        Text(
            text = "${score}%",
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = badgeColor
        )
    }
}
