package com.mitimaiti.app.utils

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.ui.theme.AppColors
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

enum class ToastType {
    SUCCESS, ERROR, INFO, WARNING;

    val icon: ImageVector get() = when (this) {
        SUCCESS -> Icons.Filled.CheckCircle
        ERROR -> Icons.Filled.Cancel
        INFO -> Icons.Filled.Info
        WARNING -> Icons.Filled.Warning
    }

    val color: Color get() = when (this) {
        SUCCESS -> AppColors.Success
        ERROR -> AppColors.Error
        INFO -> AppColors.Info
        WARNING -> AppColors.Warning
    }
}

data class ToastMessage(
    val type: ToastType,
    val message: String,
    val duration: Long = 3000L
)

object ToastManager {
    private val _toasts = MutableSharedFlow<ToastMessage>(extraBufferCapacity = 1)
    val toasts = _toasts.asSharedFlow()

    fun show(message: String, type: ToastType = ToastType.INFO, duration: Long = 3000L) {
        _toasts.tryEmit(ToastMessage(type, message, duration))
    }
}

@Composable
fun ToastOverlay() {
    var currentToast by remember { mutableStateOf<ToastMessage?>(null) }

    LaunchedEffect(Unit) {
        ToastManager.toasts.collect { toast ->
            currentToast = toast
            delay(toast.duration)
            if (currentToast == toast) currentToast = null
        }
    }

    Box(
        modifier = Modifier.fillMaxSize().padding(top = 8.dp),
        contentAlignment = Alignment.TopCenter
    ) {
        AnimatedVisibility(
            visible = currentToast != null,
            enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut()
        ) {
            currentToast?.let { toast ->
                Row(
                    modifier = Modifier
                        .padding(horizontal = 16.dp)
                        .fillMaxWidth()
                        .shadow(20.dp, RoundedCornerShape(14.dp))
                        .background(Color(0xFF2D2426), RoundedCornerShape(14.dp))
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = toast.type.icon,
                        contentDescription = null,
                        tint = toast.type.color,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = toast.message,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        maxLines = 2,
                        modifier = Modifier.weight(1f)
                    )
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Dismiss",
                        tint = Color.White.copy(alpha = 0.6f),
                        modifier = Modifier
                            .size(12.dp)
                            .clickable { currentToast = null }
                    )
                }
            }
        }
    }
}
