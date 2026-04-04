package com.mitimaiti.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

@Composable
fun GlassCard(modifier: Modifier = Modifier, cornerRadius: Dp = AppTheme.radiusLg, elevation: Dp = 4.dp, content: @Composable ColumnScope.() -> Unit) {
    val colors = LocalAdaptiveColors.current
    Card(modifier = modifier.shadow(elevation, RoundedCornerShape(cornerRadius)), shape = RoundedCornerShape(cornerRadius), colors = CardDefaults.cardColors(containerColor = colors.surface.copy(alpha = 0.9f)), border = BorderStroke(1.dp, colors.border), elevation = CardDefaults.cardElevation(defaultElevation = elevation)) { Column(content = content) }
}
