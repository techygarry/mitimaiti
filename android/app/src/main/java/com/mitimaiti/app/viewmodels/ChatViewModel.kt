package com.mitimaiti.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mitimaiti.app.models.*
import com.mitimaiti.app.services.APIService
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class ChatViewModel : ViewModel() {
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()
    private val _messageText = MutableStateFlow("")
    val messageText: StateFlow<String> = _messageText.asStateFlow()
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    private val _isSending = MutableStateFlow(false)
    val isSending: StateFlow<Boolean> = _isSending.asStateFlow()
    private val _isOtherTyping = MutableStateFlow(false)
    val isOtherTyping: StateFlow<Boolean> = _isOtherTyping.asStateFlow()
    private val _match = MutableStateFlow<Match?>(null)
    val match: StateFlow<Match?> = _match.asStateFlow()
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    private val _chatUnlocked = MutableStateFlow(false)
    val chatUnlocked: StateFlow<Boolean> = _chatUnlocked.asStateFlow()

    fun updateMessageText(value: String) { _messageText.value = value }
    val isLockedForMe: Boolean get() = _match.value?.let { it.firstMsgLocked && it.firstMsgBy == "current-user-id" } ?: false
    val awaitingFirstMessage: Boolean get() = _match.value?.let { it.firstMsgBy == null } ?: true
    val showCountdown: Boolean get() = _match.value?.showCountdown ?: false
    val inputDisabled: Boolean get() = isLockedForMe
    val inputPlaceholder: String get() = when { isLockedForMe -> "Waiting for reply..."; awaitingFirstMessage -> "Send the first message!"; else -> "Type a message..." }
    val callsUnlocked: Boolean get() = _match.value?.callsUnlocked ?: false

    data class LockBanner(val title: String, val subtitle: String, val isLocked: Boolean)
    val lockBannerMessage: LockBanner? get() {
        val m = _match.value ?: return null
        return when {
            isLockedForMe -> LockBanner("Message sent!", "Waiting for ${m.otherUser.displayName} to reply before you can send another", true)
            awaitingFirstMessage -> LockBanner("New Match!", "Send the first message to start the conversation", false)
            m.showCountdown && !m.callsUnlocked -> LockBanner("Keep chatting!", "Exchange messages to unlock calls & video", false)
            else -> null
        }
    }

    fun loadMessages(match: Match) {
        _match.value = match
        viewModelScope.launch { _isLoading.value = true; APIService.fetchMessages(match.id).onSuccess { _messages.value = it.sortedBy { m -> m.createdAt }; checkAndUnlockIfReplied() }.onFailure { _error.value = "Failed to load messages" }; _isLoading.value = false }
    }

    fun sendMessage() {
        val text = _messageText.value.trim(); if (text.isEmpty() || isLockedForMe) return; val currentMatch = _match.value ?: return
        viewModelScope.launch {
            _isSending.value = true; _messageText.value = ""
            _messages.value = _messages.value + Message(matchId = currentMatch.id, senderId = "current-user-id", content = text, status = MessageStatus.SENT)
            if (currentMatch.firstMsgBy == null) { _match.value = currentMatch.copy(firstMsgBy = "current-user-id", firstMsgLocked = true, firstMsgAt = System.currentTimeMillis()) }
            APIService.sendMessage(currentMatch.id, text); _isSending.value = false; simulateReply(currentMatch.id)
        }
    }

    fun sendIcebreaker(question: String) { _messageText.value = question; sendMessage() }

    private fun receiveMessage(message: Message) {
        _messages.value = _messages.value + message
        val cm = _match.value; if (cm != null && cm.firstMsgLocked) { _match.value = cm.copy(firstMsgLocked = false); _chatUnlocked.value = true; viewModelScope.launch { delay(3000); _chatUnlocked.value = false } }
    }

    private fun checkAndUnlockIfReplied() {
        val cm = _match.value ?: return; if (cm.firstMsgLocked && cm.firstMsgBy == "current-user-id") { if (_messages.value.any { it.senderId != "current-user-id" }) { _match.value = cm.copy(firstMsgLocked = false); _chatUnlocked.value = true; viewModelScope.launch { delay(3000); _chatUnlocked.value = false } } }
    }

    private fun simulateReply(matchId: String) {
        viewModelScope.launch {
            delay(3000); _isOtherTyping.value = true; delay(2000); _isOtherTyping.value = false
            val replies = listOf("That's so sweet! Tell me more about yourself", "Haha I love that! What else are you into?", "Oh wow, we have so much in common!", "That's interesting! I'd love to hear more", "You seem really cool! What do you do for fun?")
            receiveMessage(Message(id = UUID.randomUUID().toString(), matchId = matchId, senderId = _match.value?.otherUser?.id ?: "other", content = replies.random(), status = MessageStatus.DELIVERED))
        }
    }

    fun markUnreadMessagesAsRead() { _messages.value = _messages.value.map { if (!it.isFromMe && it.status != MessageStatus.READ) it.copy(status = MessageStatus.READ) else it } }
}
