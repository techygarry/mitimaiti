package com.mitimaiti.app.models

import java.util.UUID

data class FamilyPermissions(
    val canViewProfile: Boolean = true,
    val canViewPhotos: Boolean = true,
    val canViewBasics: Boolean = true,
    val canViewSindhi: Boolean = true,
    val canViewMatches: Boolean = false,
    val canSuggest: Boolean = true,
    val canViewCulturalScore: Boolean = true,
    val canViewKundli: Boolean = false
)

data class FamilyMember(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val phone: String = "",
    val relationship: String = "",
    val status: FamilyMemberStatus = FamilyMemberStatus.ACTIVE,
    val permissions: FamilyPermissions = FamilyPermissions(),
    val joinedAt: Long = System.currentTimeMillis()
)

data class FamilyInvite(
    val code: String = "",
    val deepLink: String = "",
    val expiresAt: Long = System.currentTimeMillis() + 48 * 60 * 60 * 1000,
    val currentMembers: Int = 0,
    val maxMembers: Int = 3
)

data class FamilySuggestion(
    val id: String = UUID.randomUUID().toString(),
    val suggestedBy: FamilyMember,
    val suggestedUser: User,
    val note: String? = null,
    val suggestedAt: Long = System.currentTimeMillis()
)
