package com.mitimaiti.app.utils

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

enum class NotificationType(val icon: String, val destinationTab: Int) {
    MATCH("\u2764\uFE0F", 2),
    LIKE("\uD83D\uDC4D", 1),
    MESSAGE("\uD83D\uDCAC", 2),
    FAMILY("\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", 3),
    FAMILY_SUGGESTION("\uD83D\uDCA1", 3),
    EXPIRY("\u23F0", 2),
    SYSTEM("\u2139\uFE0F", 0),
    PROFILE_VIEW("\uD83D\uDC40", 4),
    ICEBREAKER("\uD83E\uDDCA", 2),
    FEATURE("\u2728", 0)
}

data class AppNotification(
    val id: String = UUID.randomUUID().toString(),
    val type: NotificationType,
    val title: String,
    val body: String,
    val createdAt: Long = System.currentTimeMillis(),
    val isRead: Boolean = false,
    val actionData: String? = null
)

data class NotificationSettings(
    var matches: Boolean = true,
    var messages: Boolean = true,
    var likes: Boolean = true,
    var family: Boolean = true,
    var expiry: Boolean = true,
    var safetyAlerts: Boolean = true,
    var dailyPrompts: Boolean = true,
    var newFeatures: Boolean = true
)

class AppNotificationManager {
    private val _notifications = MutableStateFlow<List<AppNotification>>(emptyList())
    val notifications: StateFlow<List<AppNotification>> = _notifications.asStateFlow()

    private val _selectedTab = MutableStateFlow(0)
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    val settings = NotificationSettings()

    val unreadCount: Int
        get() = _notifications.value.count { !it.isRead }

    fun unreadCountForTypes(types: List<NotificationType>): Int {
        return _notifications.value.count { !it.isRead && it.type in types }
    }

    fun addNotification(notification: AppNotification) {
        _notifications.value = listOf(notification) + _notifications.value
    }

    fun markAsRead(id: String) {
        _notifications.value = _notifications.value.map {
            if (it.id == id) it.copy(isRead = true) else it
        }
    }

    fun markAllRead() {
        _notifications.value = _notifications.value.map { it.copy(isRead = true) }
    }

    fun dismiss(id: String) {
        _notifications.value = _notifications.value.filter { it.id != id }
    }

    fun clearAll() {
        _notifications.value = emptyList()
    }

    fun setSelectedTab(tab: Int) {
        _selectedTab.value = tab
    }

    companion object {
        val shared = AppNotificationManager()
    }
}
