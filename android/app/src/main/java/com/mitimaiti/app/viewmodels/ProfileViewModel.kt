package com.mitimaiti.app.viewmodels

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mitimaiti.app.models.*
import com.mitimaiti.app.services.APIService
import com.mitimaiti.app.services.PhotoRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ProfileStats(val views: Int = 0, val likes: Int = 0, val matches: Int = 0)

class ProfileViewModel : ViewModel() {
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    private val _isSaving = MutableStateFlow(false)
    val isSaving: StateFlow<Boolean> = _isSaving.asStateFlow()
    private val _saveSuccess = MutableStateFlow(false)
    val saveSuccess: StateFlow<Boolean> = _saveSuccess.asStateFlow()

    // Basic fields
    val editBio = MutableStateFlow("")
    val editHeight = MutableStateFlow<Int?>(null)
    val editEducation = MutableStateFlow("")
    val editOccupation = MutableStateFlow("")
    val editCompany = MutableStateFlow("")
    val editReligion = MutableStateFlow("")

    // Lifestyle fields
    val editSmoking = MutableStateFlow("")
    val editDrinking = MutableStateFlow("")
    val editExercise = MutableStateFlow("")
    val editWantKids = MutableStateFlow("")
    val editSettlingTimeline = MutableStateFlow("")

    // Sindhi Identity fields
    val editFluency = MutableStateFlow<SindhiFluency?>(null)
    val editDialect = MutableStateFlow("")
    val editGeneration = MutableStateFlow("")
    val editGotra = MutableStateFlow("")
    val editFamilyOriginCity = MutableStateFlow("")
    val editFamilyOriginCountry = MutableStateFlow("")
    val editCommunitySubGroup = MutableStateFlow("")
    val editMotherTongue = MutableStateFlow("")

    // Cultural fields
    val editFamilyValues = MutableStateFlow<FamilyValues?>(null)
    val editFoodPreference = MutableStateFlow<FoodPreference?>(null)
    val editFestivals = MutableStateFlow<List<String>>(emptyList())
    val editCuisinePreferences = MutableStateFlow<List<String>>(emptyList())

    // Personality fields
    val editInterests = MutableStateFlow<List<String>>(emptyList())
    val editMusicPreferences = MutableStateFlow<List<String>>(emptyList())
    val editMovieGenres = MutableStateFlow<List<String>>(emptyList())
    val editTravelStyle = MutableStateFlow("")
    val editLanguages = MutableStateFlow<List<String>>(emptyList())

    // Prompts editing
    val editPrompts = MutableStateFlow<List<UserPrompt>>(emptyList())

    // Photos from PhotoRepository (shared with onboarding)
    val userPhotos: StateFlow<List<Uri>> = PhotoRepository.photos
    val primaryPhotoUri: Uri? get() = PhotoRepository.primaryPhotoUri

    fun addPhoto(uri: Uri) { PhotoRepository.addPhoto(uri) }
    fun removePhoto(index: Int) { PhotoRepository.removePhoto(index) }
    fun setPrimaryPhoto(index: Int) { PhotoRepository.setPrimaryPhoto(index) }

    val profileStats = ProfileStats(views = 142, likes = 38, matches = 12)

    fun loadProfile() {
        viewModelScope.launch {
            _isLoading.value = true
            APIService.fetchProfile()
                .onSuccess { _user.value = it; populateEditFields(it) }
                .onFailure { _error.value = "Failed to load profile" }
            _isLoading.value = false
        }
    }

    private fun populateEditFields(user: User) {
        editBio.value = user.bio
        editHeight.value = user.heightCm
        editEducation.value = user.education ?: ""
        editOccupation.value = user.occupation ?: ""
        editCompany.value = user.company ?: ""
        editReligion.value = user.religion ?: ""
        editSmoking.value = user.smoking ?: ""
        editDrinking.value = user.drinking ?: ""
        editExercise.value = user.exercise ?: ""
        editWantKids.value = user.wantKids ?: ""
        editSettlingTimeline.value = user.settlingTimeline ?: ""
        editFluency.value = user.sindhiFluency
        editDialect.value = user.sindhiDialect ?: ""
        editGeneration.value = user.generation ?: ""
        editGotra.value = user.gotra ?: ""
        editFamilyOriginCity.value = user.familyOriginCity ?: ""
        editFamilyOriginCountry.value = user.familyOriginCountry ?: ""
        editCommunitySubGroup.value = user.communitySubGroup ?: ""
        editMotherTongue.value = user.motherTongue ?: ""
        editFamilyValues.value = user.familyValues
        editFoodPreference.value = user.foodPreference
        editFestivals.value = user.festivalsCelebrated
        editCuisinePreferences.value = user.cuisinePreferences
        editInterests.value = user.interests
        editMusicPreferences.value = user.musicPreferences
        editMovieGenres.value = user.movieGenres
        editTravelStyle.value = user.travelStyle ?: ""
        editLanguages.value = user.languages
        editPrompts.value = user.prompts
    }

    fun saveProfile() {
        viewModelScope.launch {
            _isSaving.value = true
            APIService.updateProfile(mapOf("bio" to editBio.value))
                .onSuccess {
                    _saveSuccess.value = true
                    _user.value = _user.value?.copy(
                        bio = editBio.value,
                        heightCm = editHeight.value,
                        education = editEducation.value.ifBlank { null },
                        occupation = editOccupation.value.ifBlank { null },
                        company = editCompany.value.ifBlank { null },
                        religion = editReligion.value.ifBlank { null },
                        smoking = editSmoking.value.ifBlank { null },
                        drinking = editDrinking.value.ifBlank { null },
                        exercise = editExercise.value.ifBlank { null },
                        wantKids = editWantKids.value.ifBlank { null },
                        settlingTimeline = editSettlingTimeline.value.ifBlank { null },
                        sindhiFluency = editFluency.value,
                        sindhiDialect = editDialect.value.ifBlank { null },
                        generation = editGeneration.value.ifBlank { null },
                        gotra = editGotra.value.ifBlank { null },
                        familyOriginCity = editFamilyOriginCity.value.ifBlank { null },
                        familyOriginCountry = editFamilyOriginCountry.value.ifBlank { null },
                        communitySubGroup = editCommunitySubGroup.value.ifBlank { null },
                        motherTongue = editMotherTongue.value.ifBlank { null },
                        familyValues = editFamilyValues.value,
                        foodPreference = editFoodPreference.value,
                        festivalsCelebrated = editFestivals.value,
                        cuisinePreferences = editCuisinePreferences.value,
                        interests = editInterests.value,
                        musicPreferences = editMusicPreferences.value,
                        movieGenres = editMovieGenres.value,
                        travelStyle = editTravelStyle.value.ifBlank { null },
                        languages = editLanguages.value,
                        prompts = editPrompts.value
                    )
                }
                .onFailure { _error.value = "Failed to save profile" }
            _isSaving.value = false
        }
    }

    fun dismissSaveSuccess() { _saveSuccess.value = false }
}
