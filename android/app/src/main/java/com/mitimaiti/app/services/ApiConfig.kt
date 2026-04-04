package com.mitimaiti.app.services

object ApiConfig {
    // Change these for your environment
    const val BASE_URL = "http://10.0.2.2:4000/v1/" // Android emulator → localhost
    const val SOCKET_URL = "http://10.0.2.2:4001"
    const val PROD_BASE_URL = "https://api.mitimaiti.com/v1/"
    const val PROD_SOCKET_URL = "https://ws.mitimaiti.com"

    // Toggle for development
    var useMockData = true // Set false to hit real backend
}
