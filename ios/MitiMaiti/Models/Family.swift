import Foundation

struct FamilyPermissions: Codable, Hashable {
    var canViewProfile: Bool
    var canViewPhotos: Bool
    var canViewBasics: Bool
    var canViewSindhi: Bool
    var canViewMatches: Bool
    var canSuggest: Bool
    var canViewCulturalScore: Bool
    var canViewKundli: Bool

    static let allEnabled = FamilyPermissions(
        canViewProfile: true, canViewPhotos: true, canViewBasics: true,
        canViewSindhi: true, canViewMatches: true, canSuggest: true,
        canViewCulturalScore: true, canViewKundli: true
    )

    static let allDisabled = FamilyPermissions(
        canViewProfile: false, canViewPhotos: false, canViewBasics: false,
        canViewSindhi: false, canViewMatches: false, canSuggest: false,
        canViewCulturalScore: false, canViewKundli: false
    )

    var enabledCount: Int {
        [canViewProfile, canViewPhotos, canViewBasics, canViewSindhi,
         canViewMatches, canSuggest, canViewCulturalScore, canViewKundli]
            .filter { $0 }.count
    }

    /// Maps each permission key path to its (icon, title, description).
    static let permissionDescriptions: [(keyPath: WritableKeyPath<FamilyPermissions, Bool>, icon: String, title: String, description: String)] = [
        (\.canViewProfile, "eye", "View Profile", "Can see your full profile details"),
        (\.canViewPhotos, "camera", "View Photos", "Can browse your uploaded photos"),
        (\.canViewBasics, "briefcase", "View Basics", "Can see education, occupation & lifestyle"),
        (\.canViewSindhi, "moon.stars", "Sindhi Identity", "Can view your Sindhi heritage details"),
        (\.canViewMatches, "heart", "View Matches", "Can see your current matches"),
        (\.canSuggest, "message", "Suggest Profiles", "Can recommend profiles for you"),
        (\.canViewCulturalScore, "star", "Cultural Score", "Can view your cultural compatibility score"),
        (\.canViewKundli, "chart.bar", "Kundli Score", "Can view your kundli compatibility score"),
    ]
}

struct FamilyMember: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let phone: String
    var relationship: String
    var status: FamilyMemberStatus
    var permissions: FamilyPermissions
    let joinedAt: Date

    init(
        id: String = UUID().uuidString,
        name: String,
        phone: String,
        relationship: String,
        status: FamilyMemberStatus = .active,
        permissions: FamilyPermissions = .allEnabled,
        joinedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.phone = phone
        self.relationship = relationship
        self.status = status
        self.permissions = permissions
        self.joinedAt = joinedAt
    }
}

struct FamilyInvite: Codable, Hashable {
    let code: String
    let deepLink: String
    let expiresAt: Date
    let currentMembers: Int
    let maxMembers: Int

    init(
        code: String = "MM-\(String(Int.random(in: 100000...999999)))",
        deepLink: String = "",
        expiresAt: Date = Calendar.current.date(byAdding: .hour, value: 48, to: Date())!,
        currentMembers: Int = 1,
        maxMembers: Int = 3
    ) {
        self.code = code
        self.deepLink = "mitimaiti://family/join?code=\(code)"
        self.expiresAt = expiresAt
        self.currentMembers = currentMembers
        self.maxMembers = maxMembers
    }
}

struct FamilySuggestion: Identifiable, Codable, Hashable {
    let id: String
    let suggestedBy: FamilyMember
    let suggestedUser: User
    let note: String?
    let suggestedAt: Date

    init(
        id: String = UUID().uuidString,
        suggestedBy: FamilyMember,
        suggestedUser: User,
        note: String? = nil,
        suggestedAt: Date = Date()
    ) {
        self.id = id
        self.suggestedBy = suggestedBy
        self.suggestedUser = suggestedUser
        self.note = note
        self.suggestedAt = suggestedAt
    }
}
