package com.mitimaiti.app.services

import com.mitimaiti.app.BuildConfig

object ApiConfig {
    val BASE_URL: String = BuildConfig.BASE_URL
    val SOCKET_URL: String = BuildConfig.SOCKET_URL
    var useMockData: Boolean = BuildConfig.USE_MOCK_DATA
}
