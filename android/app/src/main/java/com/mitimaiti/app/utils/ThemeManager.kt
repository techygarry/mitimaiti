package com.mitimaiti.app.utils

import android.content.Context
import android.content.SharedPreferences
import com.mitimaiti.app.models.AppThemeMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ThemeManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("theme_prefs", Context.MODE_PRIVATE)

    private val _themeMode = MutableStateFlow(
        AppThemeMode.entries.firstOrNull { it.name == prefs.getString("theme", "SYSTEM") } ?: AppThemeMode.SYSTEM
    )
    val themeMode: StateFlow<AppThemeMode> = _themeMode.asStateFlow()

    fun setTheme(mode: AppThemeMode) {
        _themeMode.value = mode
        prefs.edit().putString("theme", mode.name).apply()
    }
}
