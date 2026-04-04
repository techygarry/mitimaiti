package com.mitimaiti.app.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.AuthViewModel

@Composable
fun PhoneAuthScreen(viewModel: AuthViewModel, onOTPSent: () -> Unit, onBack: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    val phone by viewModel.phone.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val otpSent by viewModel.otpSent.collectAsState()
    LaunchedEffect(otpSent) { if (otpSent) onOTPSent() }
    Box(modifier = Modifier.fillMaxSize().background(colors.backgroundGradient)) {
        Column(modifier = Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(horizontal = 24.dp)) {
            IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary) }
            Spacer(modifier = Modifier.height(32.dp))
            Text("What's your\nphone number?", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary, lineHeight = 36.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Text("We'll send you a verification code", fontSize = 16.sp, color = colors.textSecondary)
            Spacer(modifier = Modifier.height(32.dp))
            OutlinedTextField(value = phone, onValueChange = { viewModel.updatePhone(it) }, modifier = Modifier.fillMaxWidth(), placeholder = { Text("+91 98765 43210", color = colors.textMuted) }, leadingIcon = { Icon(Icons.Default.Phone, "Phone", tint = AppColors.Rose) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), shape = RoundedCornerShape(AppTheme.radiusMd), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AppColors.Rose, unfocusedBorderColor = colors.border, focusedTextColor = colors.textPrimary, unfocusedTextColor = colors.textPrimary), singleLine = true)
            error?.let { Spacer(modifier = Modifier.height(8.dp)); Text(it, color = AppColors.Error, fontSize = 14.sp) }
            Spacer(modifier = Modifier.weight(1f))
            Button(onClick = { viewModel.sendOTP() }, modifier = Modifier.fillMaxWidth().height(56.dp), enabled = phone.length >= 10 && !isLoading, shape = RoundedCornerShape(AppTheme.radiusLg), colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose, disabledContainerColor = AppColors.Rose.copy(alpha = 0.4f))) {
                if (isLoading) CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White, strokeWidth = 2.dp) else Text("Send Code", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
