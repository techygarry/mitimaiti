package com.mitimaiti.app.services

import com.mitimaiti.app.models.Message

/**
 * Singleton repository for chat messages.
 * Persists messages across ViewModel recreations during navigation.
 */
object MessageRepository {
    private val messages = mutableMapOf<String, MutableList<Message>>()

    fun getMessages(matchId: String): List<Message> {
        return messages[matchId]?.toList() ?: emptyList()
    }

    fun setMessages(matchId: String, msgs: List<Message>) {
        messages[matchId] = msgs.toMutableList()
    }

    fun addMessage(matchId: String, message: Message) {
        val list = messages.getOrPut(matchId) { mutableListOf() }
        list.add(message)
    }

    fun hasMessages(matchId: String): Boolean {
        return messages[matchId]?.isNotEmpty() == true
    }

    fun clear(matchId: String) {
        messages.remove(matchId)
    }

    fun clearAll() {
        messages.clear()
    }
}
