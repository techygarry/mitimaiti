package com.mitimaiti.app.services

import android.net.Uri
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Singleton repository for user photos.
 * Holds photo URIs from onboarding and makes them available app-wide.
 */
object PhotoRepository {
    private val _photos = MutableStateFlow<List<Uri>>(emptyList())
    val photos: StateFlow<List<Uri>> = _photos.asStateFlow()

    val primaryPhotoUri: Uri?
        get() = _photos.value.firstOrNull()

    fun setPhotos(uris: List<Uri>) {
        _photos.value = uris
    }

    fun addPhoto(uri: Uri) {
        if (_photos.value.size < 6) {
            _photos.value = _photos.value + uri
        }
    }

    fun removePhoto(index: Int) {
        val list = _photos.value.toMutableList()
        if (index in list.indices) {
            list.removeAt(index)
            _photos.value = list
        }
    }

    fun setPrimaryPhoto(index: Int) {
        val list = _photos.value.toMutableList()
        if (index in list.indices && index != 0) {
            val photo = list.removeAt(index)
            list.add(0, photo)
            _photos.value = list
        }
    }

    fun clear() {
        _photos.value = emptyList()
    }
}
