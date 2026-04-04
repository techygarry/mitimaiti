package com.mitimaiti.app

import android.app.Application
import com.mitimaiti.app.services.APIService
import com.mitimaiti.app.services.SocketManager
import com.mitimaiti.app.services.TokenManager
import com.mitimaiti.app.utils.LocalizationManager
import com.mitimaiti.app.utils.ThemeManager

class MitiMaitiApp : Application() {
    lateinit var themeManager: ThemeManager
        private set
    lateinit var localizationManager: LocalizationManager
        private set
    lateinit var tokenManager: TokenManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        themeManager = ThemeManager(this)
        localizationManager = LocalizationManager(this)
        tokenManager = TokenManager(this)

        // Initialize networking
        APIService.init(tokenManager)
        SocketManager.shared.init { tokenManager.getAccessToken() }
    }

    companion object {
        lateinit var instance: MitiMaitiApp
            private set
    }
}
