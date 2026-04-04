package com.mitimaiti.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mitimaiti.app.models.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SettingsViewModel : ViewModel() {
    val discoveryEnabled = MutableStateFlow(true); val incognitoMode = MutableStateFlow(false)
    val showFullName = MutableStateFlow(false); val isSnoozed = MutableStateFlow(false)
    val ageMin = MutableStateFlow(21); val ageMax = MutableStateFlow(35)
    val heightMin = MutableStateFlow(150); val heightMax = MutableStateFlow(190)
    val genderPreference = MutableStateFlow(ShowMe.WOMEN); val intentFilter = MutableStateFlow<Intent?>(null)
    val verifiedOnly = MutableStateFlow(false)
    val fluencyFilter = MutableStateFlow<SindhiFluency?>(null); val generationFilter = MutableStateFlow<String?>(null)
    val religionFilter = MutableStateFlow<String?>(null); val gotraFilter = MutableStateFlow<String?>(null)
    val dietaryFilter = MutableStateFlow<FoodPreference?>(null)
    val educationFilter = MutableStateFlow<String?>(null); val smokingFilter = MutableStateFlow<String?>(null)
    val drinkingFilter = MutableStateFlow<String?>(null); val familyPlansFilter = MutableStateFlow<String?>(null)
    val notifyMatches = MutableStateFlow(true); val notifyMessages = MutableStateFlow(true)
    val notifyLikes = MutableStateFlow(true); val notifyFamily = MutableStateFlow(true)
    val notifyExpiry = MutableStateFlow(true); val notifySafety = MutableStateFlow(true)
    val notifyDailyPrompts = MutableStateFlow(true); val notifyNewFeatures = MutableStateFlow(true)
    val theme = MutableStateFlow(AppThemeMode.SYSTEM)
    val showDeleteConfirmation = MutableStateFlow(false); val showLogoutConfirmation = MutableStateFlow(false)
    val showDeleteSheet = MutableStateFlow(false)
    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()
    fun showToast(message: String) { _toastMessage.value = message; viewModelScope.launch { delay(2000); _toastMessage.value = null } }
}
