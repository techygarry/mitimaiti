package com.mitimaiti.app.utils

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class AppLanguage(val displayName: String, val code: String) {
    ENGLISH("English", "en"),
    HINDI("\u0939\u093F\u0928\u094D\u0926\u0940", "hi"),
    SINDHI("\u0633\u0646\u068C\u064A", "sd")
}

class LocalizationManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("lang_prefs", Context.MODE_PRIVATE)

    private val _language = MutableStateFlow(
        AppLanguage.entries.firstOrNull { it.code == prefs.getString("language", "en") } ?: AppLanguage.ENGLISH
    )
    val language: StateFlow<AppLanguage> = _language.asStateFlow()

    fun setLanguage(lang: AppLanguage) {
        _language.value = lang
        prefs.edit().putString("language", lang.code).apply()
    }

    fun t(key: String): String {
        return translations[key]?.get(_language.value.code)
            ?: translations[key]?.get("en")
            ?: key
    }

    companion object {
        val translations: Map<String, Map<String, String>> = mapOf(
            "discover.title" to mapOf("en" to "Discover", "hi" to "\u0916\u094B\u091C\u0947\u0902", "sd" to "\u06B3\u0648\u0644\u064A\u0648"),
            "discover.empty" to mapOf("en" to "No more profiles", "hi" to "\u0914\u0930 \u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932 \u0928\u0939\u0940\u0902", "sd" to "\u0648\u068C\u064A\u06AA \u067E\u0631\u0648\u0641\u0627\u0626\u0644 \u0646\u0627\u0647\u0646"),
            "matches.title" to mapOf("en" to "Matches", "hi" to "\u092E\u0948\u091A", "sd" to "\u0645\u064A\u0686"),
            "chat.placeholder" to mapOf("en" to "Type a message...", "hi" to "\u0938\u0902\u0926\u0947\u0936 \u0932\u093F\u0916\u0947\u0902...", "sd" to "\u067E\u064A\u063A\u0627\u0645 \u0644\u06AA\u0648..."),
            "chat.locked" to mapOf("en" to "Waiting for reply...", "hi" to "\u091C\u0935\u093E\u092C \u0915\u093E \u0907\u0902\u0924\u091C\u093C\u093E\u0930...", "sd" to "\u062C\u0648\u0627\u0628 \u062C\u0648 \u0627\u0646\u062A\u0638\u0627\u0631..."),
            "chat.unlocked" to mapOf("en" to "Chat unlocked!", "hi" to "\u091A\u0948\u091F \u0905\u0928\u0932\u0949\u0915!", "sd" to "\u0686\u064A\u0679 \u0627\u0646 \u0644\u0627\u06AA!"),
            "profile.title" to mapOf("en" to "Profile", "hi" to "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932", "sd" to "\u067E\u0631\u0648\u0641\u0627\u0626\u0644"),
            "family.title" to mapOf("en" to "Family Mode", "hi" to "\u092A\u0930\u093F\u0935\u093E\u0930 \u092E\u094B\u0921", "sd" to "\u062E\u0627\u0646\u062F\u0627\u0646 \u0645\u0648\u0688"),
            "settings.title" to mapOf("en" to "Settings", "hi" to "\u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938", "sd" to "\u0633\u064A\u0679\u0646\u06AF\u0632"),
            "settings.logout" to mapOf("en" to "Log Out", "hi" to "\u0932\u0949\u0917 \u0906\u0909\u091F", "sd" to "\u0644\u0627\u06AF \u0622\u0626\u0648\u0679"),
            "common.like" to mapOf("en" to "Like", "hi" to "\u092A\u0938\u0902\u0926", "sd" to "\u067E\u0633\u0646\u062F"),
            "common.pass" to mapOf("en" to "Pass", "hi" to "\u092A\u093E\u0938", "sd" to "\u067E\u0627\u0633"),
            "common.save" to mapOf("en" to "Save", "hi" to "\u0938\u0939\u0947\u091C\u0947\u0902", "sd" to "\u0645\u062D\u0641\u0648\u0638 \u06AA\u0631\u064A\u0648"),
            "common.done" to mapOf("en" to "Done", "hi" to "\u0939\u094B \u0917\u092F\u093E", "sd" to "\u06BE\u064A \u0648\u064A\u0648")
        )
    }
}
