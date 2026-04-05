package com.mitimaiti.app.ui.theme

import android.view.HapticFeedbackConstants
import android.view.View
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

data class AdaptiveColors(
    val background: Color,
    val surface: Color,
    val surfaceMedium: Color,
    val cardDark: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val border: Color,
    val borderSubtle: Color,
    val backgroundGradient: Brush,
    val cardShadowColor: Color,
    val elevatedShadowColor: Color,
    val shimmerGradient: Brush,
    val success: Color,
    val warning: Color,
    val error: Color,
    val info: Color,
    val scoreGold: Color,
    val scoreGreen: Color,
    val scoreOrange: Color
)

val LocalAdaptiveColors = compositionLocalOf {
    AdaptiveColors(
        background = AppColors.LightBackground,
        surface = AppColors.LightSurface,
        surfaceMedium = AppColors.LightSurfaceMedium,
        cardDark = AppColors.LightCardDark,
        textPrimary = AppColors.LightTextPrimary,
        textSecondary = AppColors.LightTextSecondary,
        textMuted = AppColors.LightTextMuted,
        border = AppColors.LightBorder,
        borderSubtle = AppColors.LightBorderSubtle,
        backgroundGradient = Brush.verticalGradient(
            listOf(AppColors.LightBackground, AppColors.LightSurfaceMedium)
        ),
        cardShadowColor = Color.Black.copy(alpha = 0.06f),
        elevatedShadowColor = Color.Black.copy(alpha = 0.08f),
        shimmerGradient = Brush.horizontalGradient(
            listOf(Color.Black.copy(alpha = 0f), Color.Black.copy(alpha = 0.04f), Color.Black.copy(alpha = 0f))
        ),
        success = Color(0xFF388E3C),
        warning = Color(0xFFF57C00),
        error = Color(0xFFD32F2F),
        info = Color(0xFF1976D2),
        scoreGold = Color(0xFFF9A825),
        scoreGreen = Color(0xFF388E3C),
        scoreOrange = Color(0xFFEF6C00)
    )
}

object AppTheme {
    val spacingXs = 4.dp
    val spacingSm = 8.dp
    val spacingMd = 16.dp
    val spacingLg = 24.dp
    val spacingXl = 32.dp
    val spacingXxl = 48.dp

    val radiusSm = 8.dp
    val radiusMd = 12.dp
    val radiusLg = 16.dp
    val radiusXl = 24.dp
    val radiusCard = 20.dp
    val radiusFull = 100.dp

    val buttonHeightPrimary = 52.dp
    val buttonHeightSecondary = 44.dp
    val iconButtonSize = 40.dp

    val roseGradient = Brush.linearGradient(listOf(AppColors.Rose, AppColors.RoseDark))
    val goldGradient = Brush.linearGradient(listOf(AppColors.Gold, Color(0xFFC4944A)))
    val saffronGradient = Brush.linearGradient(listOf(AppColors.Saffron, Color(0xFFD4850E)))
    val roseGoldGradient = Brush.linearGradient(listOf(AppColors.Rose, AppColors.Gold))

    val backgroundGradientLight = Brush.verticalGradient(
        colorStops = arrayOf(
            0.0f to AppColors.LightBackground,
            0.5f to AppColors.LightSurface,
            1.0f to AppColors.LightSurfaceMedium
        )
    )

    val backgroundGradientDark = Brush.verticalGradient(
        colorStops = arrayOf(
            0.0f to AppColors.DarkBackground,
            0.5f to AppColors.DarkSurface,
            1.0f to AppColors.DarkSurfaceMedium
        )
    )

    object Animation {
        const val standardDuration = 300
        const val springResponse = 0.5f
        const val springDamping = 0.7f
        const val cardSwipeDuration = 400
    }

    enum class Shadow {
        Card, Button, Subtle;

        val radius get() = when (this) {
            Card -> 12.dp
            Button -> 8.dp
            Subtle -> 4.dp
        }

        val y get() = when (this) {
            Card -> 6.dp
            Button -> 4.dp
            Subtle -> 2.dp
        }
    }
}

object HapticHelper {
    enum class HapticType { Light, Medium, Heavy }

    fun performHaptic(view: View, type: HapticType) {
        val constant = when (type) {
            HapticType.Light -> HapticFeedbackConstants.CLOCK_TICK
            HapticType.Medium -> HapticFeedbackConstants.CONTEXT_CLICK
            HapticType.Heavy -> HapticFeedbackConstants.LONG_PRESS
        }
        view.performHapticFeedback(constant)
    }
}

private val LightColorScheme = lightColorScheme(
    primary = AppColors.Rose,
    secondary = AppColors.Gold,
    tertiary = AppColors.Saffron,
    background = AppColors.LightBackground,
    surface = AppColors.LightSurface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = AppColors.LightTextPrimary,
    onSurface = AppColors.LightTextPrimary
)

private val DarkColorScheme = darkColorScheme(
    primary = AppColors.Rose,
    secondary = AppColors.Gold,
    tertiary = AppColors.Saffron,
    background = AppColors.DarkBackground,
    surface = AppColors.DarkSurface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = AppColors.DarkTextPrimary,
    onSurface = AppColors.DarkTextPrimary
)

@Composable
fun MitiMaitiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val adaptiveColors = if (darkTheme) {
        AdaptiveColors(
            background = AppColors.DarkBackground,
            surface = AppColors.DarkSurface,
            surfaceMedium = AppColors.DarkSurfaceMedium,
            cardDark = AppColors.DarkCardDark,
            textPrimary = AppColors.DarkTextPrimary,
            textSecondary = AppColors.DarkTextSecondary,
            textMuted = AppColors.DarkTextMuted,
            border = AppColors.DarkBorder,
            borderSubtle = AppColors.DarkBorderSubtle,
            backgroundGradient = Brush.verticalGradient(
                listOf(AppColors.DarkBackground, AppColors.DarkSurfaceMedium)
            ),
            cardShadowColor = Color.Black.copy(alpha = 0.25f),
            elevatedShadowColor = Color.Black.copy(alpha = 0.35f),
            shimmerGradient = Brush.horizontalGradient(
                listOf(Color.White.copy(alpha = 0f), Color.White.copy(alpha = 0.08f), Color.White.copy(alpha = 0f))
            ),
            success = Color(0xFF4CAF50),
            warning = Color(0xFFFFA726),
            error = Color(0xFFEF4444),
            info = Color(0xFF42A5F5),
            scoreGold = Color(0xFFFFD700),
            scoreGreen = Color(0xFF4CAF50),
            scoreOrange = Color(0xFFFF9800)
        )
    } else {
        AdaptiveColors(
            background = AppColors.LightBackground,
            surface = AppColors.LightSurface,
            surfaceMedium = AppColors.LightSurfaceMedium,
            cardDark = AppColors.LightCardDark,
            textPrimary = AppColors.LightTextPrimary,
            textSecondary = AppColors.LightTextSecondary,
            textMuted = AppColors.LightTextMuted,
            border = AppColors.LightBorder,
            borderSubtle = AppColors.LightBorderSubtle,
            backgroundGradient = Brush.verticalGradient(
                listOf(AppColors.LightBackground, AppColors.LightSurfaceMedium)
            ),
            cardShadowColor = Color.Black.copy(alpha = 0.06f),
            elevatedShadowColor = Color.Black.copy(alpha = 0.08f),
            shimmerGradient = Brush.horizontalGradient(
                listOf(Color.Black.copy(alpha = 0f), Color.Black.copy(alpha = 0.04f), Color.Black.copy(alpha = 0f))
            ),
            success = Color(0xFF388E3C),
            warning = Color(0xFFF57C00),
            error = Color(0xFFD32F2F),
            info = Color(0xFF1976D2),
            scoreGold = Color(0xFFF9A825),
            scoreGreen = Color(0xFF388E3C),
            scoreOrange = Color(0xFFEF6C00)
        )
    }

    CompositionLocalProvider(LocalAdaptiveColors provides adaptiveColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            content = content
        )
    }
}
