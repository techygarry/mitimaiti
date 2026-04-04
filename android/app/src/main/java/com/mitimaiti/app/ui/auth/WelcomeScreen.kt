package com.mitimaiti.app.ui.auth

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import kotlinx.coroutines.delay

@Composable
fun WelcomeScreen(onGetStarted: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    var isVisible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(300); isVisible = true }
    Box(modifier = Modifier.fillMaxSize().background(colors.backgroundGradient)) {
        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 32.dp).statusBarsPadding().navigationBarsPadding(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Spacer(modifier = Modifier.weight(1f))
            AnimatedVisibility(visible = isVisible, enter = fadeIn() + slideInVertically { -40 }) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("MitiMaiti", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = AppColors.Rose)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Where Sindhi Hearts Connect", fontSize = 18.sp, color = colors.textSecondary, textAlign = TextAlign.Center)
                }
            }
            Spacer(modifier = Modifier.height(48.dp))
            AnimatedVisibility(visible = isVisible, enter = fadeIn() + slideInVertically { 40 }) {
                Text("Find meaningful connections rooted in Sindhi culture, values, and traditions", fontSize = 16.sp, color = colors.textMuted, textAlign = TextAlign.Center, lineHeight = 24.sp)
            }
            Spacer(modifier = Modifier.weight(1f))
            AnimatedVisibility(visible = isVisible, enter = fadeIn() + slideInVertically { 60 }) {
                Button(onClick = onGetStarted, modifier = Modifier.fillMaxWidth().height(56.dp), shape = RoundedCornerShape(AppTheme.radiusLg), colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)) {
                    Text("Get Started", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            AnimatedVisibility(visible = isVisible, enter = fadeIn()) {
                TextButton(onClick = onGetStarted) { Text("Already have an account? Sign in", color = AppColors.Rose, fontSize = 15.sp) }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
