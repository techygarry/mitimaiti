package com.mitimaiti.app.viewmodels

import android.net.Uri
import androidx.lifecycle.ViewModel
import com.mitimaiti.app.models.Gender
import com.mitimaiti.app.models.Intent
import com.mitimaiti.app.models.ShowMe
import com.mitimaiti.app.services.PhotoRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class OnboardingStep { NAME, BIRTHDAY, GENDER, PHOTOS, INTENT, SHOW_ME, LOCATION, READY }

class OnboardingViewModel : ViewModel() {
    private val _currentStep = MutableStateFlow(OnboardingStep.NAME)
    val currentStep: StateFlow<OnboardingStep> = _currentStep.asStateFlow()
    val firstName = MutableStateFlow(""); val isNonSindhi = MutableStateFlow(false)
    val birthDay = MutableStateFlow(""); val birthMonth = MutableStateFlow(""); val birthYear = MutableStateFlow("")
    val selectedGender = MutableStateFlow<Gender?>(null)
    val selectedPhotos: StateFlow<List<Uri>> = PhotoRepository.photos
    val selectedIntent = MutableStateFlow<Intent?>(null); val selectedShowMe = MutableStateFlow<ShowMe?>(null)
    val selectedCity = MutableStateFlow("")

    val age: Int? get() {
        val y = birthYear.value.toIntOrNull() ?: return null; val m = birthMonth.value.toIntOrNull() ?: return null; val d = birthDay.value.toIntOrNull() ?: return null
        return try { java.time.Period.between(java.time.LocalDate.of(y, m, d), java.time.LocalDate.now()).years } catch (e: Exception) { null }
    }
    val isAgeValid: Boolean get() = (age ?: 0) >= 18
    val progress: Float get() = (OnboardingStep.entries.indexOf(_currentStep.value) + 1).toFloat() / OnboardingStep.entries.size
    val canProceed: Boolean get() = when (_currentStep.value) {
        OnboardingStep.NAME -> firstName.value.isNotBlank(); OnboardingStep.BIRTHDAY -> isAgeValid
        OnboardingStep.GENDER -> selectedGender.value != null; OnboardingStep.PHOTOS -> selectedPhotos.value.isNotEmpty()
        OnboardingStep.INTENT -> selectedIntent.value != null; OnboardingStep.SHOW_ME -> selectedShowMe.value != null
        OnboardingStep.LOCATION -> selectedCity.value.isNotBlank(); OnboardingStep.READY -> true
    }

    fun nextStep() { val s = OnboardingStep.entries; val i = s.indexOf(_currentStep.value); if (i < s.size - 1) _currentStep.value = s[i + 1] }
    fun previousStep() { val s = OnboardingStep.entries; val i = s.indexOf(_currentStep.value); if (i > 0) _currentStep.value = s[i - 1] }
    fun addPhoto(uri: Uri) { PhotoRepository.addPhoto(uri) }
    fun removePhoto(index: Int) { PhotoRepository.removePhoto(index) }
}
