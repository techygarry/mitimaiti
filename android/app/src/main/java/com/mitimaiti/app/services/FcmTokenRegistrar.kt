package com.mitimaiti.app.services

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * To enable real push notifications:
 *   1. Add Firebase BOM and firebase-messaging to dependencies in build.gradle.kts:
 *        implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
 *        implementation("com.google.firebase:firebase-messaging-ktx")
 *   2. Drop google-services.json into app/.
 *   3. Apply the google-services plugin and call:
 *        FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
 *            FcmTokenRegistrar.register(token)
 *        }
 *
 * This registrar is wired today; only the token source needs Firebase.
 */
object FcmTokenRegistrar {
    private val scope = CoroutineScope(Dispatchers.IO)

    fun register(token: String) {
        scope.launch {
            APIService.registerFcmToken(token).onFailure {
                android.util.Log.w("FcmTokenRegistrar", "FCM token registration failed: $it")
            }
        }
    }
}
