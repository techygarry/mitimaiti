package com.mitimaiti.app.services

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * In-memory store for profile values captured during onboarding so they
 * survive navigation from OnboardingViewModel to ProfileViewModel (two
 * separate ViewModel instances). Mirrors PhotoRepository's pattern.
 */
object UserPrefs {
    private val _firstName = MutableStateFlow("")
    val firstName: StateFlow<String> = _firstName.asStateFlow()

    fun setFirstName(name: String) {
        _firstName.value = name.trim()
    }
}
