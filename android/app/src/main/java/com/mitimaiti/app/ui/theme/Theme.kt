package com.mitimaiti.app.ui.theme

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
    val backgroundGradient: Brush
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
        )
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
    val radiusFull = 100.dp

    val roseGradient = Brush.linearGradient(listOf(AppColors.Rose, AppColors.RoseLight))
    val goldGradient = Brush.linearGradient(listOf(AppColors.Gold, AppColors.GoldLight))
    val saffronGradient = Brush.linearGradient(listOf(AppColors.Saffron, AppColors.Gold))
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
            )
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
            )
        )
    }

    CompositionLocalProvider(LocalAdaptiveColors provides adaptiveColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            content = content
        )
    }
}
