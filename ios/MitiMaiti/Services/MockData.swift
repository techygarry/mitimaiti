import Foundation

struct MockData {
    // MARK: - Photo URLs (SF Symbols as placeholders - replace with real URLs)
    static let photoURLs = [
        "photo_1", "photo_2", "photo_3", "photo_4", "photo_5",
        "photo_6", "photo_7", "photo_8", "photo_9", "photo_10"
    ]

    // MARK: - Interests
    static let allInterests = [
        "Travel", "Cooking", "Cricket", "Music", "Fitness", "Reading",
        "Photography", "Dancing", "Art", "Movies", "Yoga", "Hiking",
        "Coffee", "Food", "Gaming", "Bollywood", "Meditation",
        "Volunteering", "Fashion", "Tech", "Writing", "Tennis",
        "Swimming", "Cycling", "Theatre"
    ]

    // MARK: - Prompt Questions
    static let promptQuestions = [
        "A typical Sunday for me looks like...",
        "The way to my heart is...",
        "My favorite Sindhi tradition is...",
        "I get along best with people who...",
        "One thing I'd love to try is...",
        "My most controversial opinion is...",
        "I'm known among my friends for...",
        "The key to my heart is..."
    ]

    // MARK: - Icebreakers
    static let icebreakers: [Icebreaker] = [
        Icebreaker(category: "sindhi", question: "What's your favorite Sindhi dish?"),
        Icebreaker(category: "sindhi", question: "Do you celebrate Cheti Chand?"),
        Icebreaker(category: "fun", question: "Tea or coffee for a first date?"),
        Icebreaker(category: "fun", question: "What's the last show you binged?"),
        Icebreaker(category: "general", question: "What's your idea of a perfect weekend?"),
        Icebreaker(category: "deep", question: "What's the most important value in a relationship?"),
        Icebreaker(category: "sindhi", question: "Sai bhaani! What does community mean to you?"),
        Icebreaker(category: "fun", question: "Mountains or beaches?")
    ]

    // MARK: - Cities
    static let cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Ahmedabad",
        "Chennai", "Kolkata", "Jaipur", "Lucknow", "Dubai", "Abu Dhabi",
        "London", "New York", "Toronto", "Singapore", "Hong Kong",
        "Sydney", "Melbourne", "San Francisco", "Los Angeles"
    ]

    // MARK: - Mock Users
    static func makeUser(
        name: String, age: Int, city: String, gender: Gender,
        bio: String, occupation: String, company: String,
        education: String, interests: [String], intent: Intent = .marriage,
        isVerified: Bool = true, completeness: Int = 85,
        fluency: SindhiFluency = .fluent, religion: String = "Hindu",
        photoIndex: Int = 0
    ) -> User {
        User(
            id: UUID().uuidString,
            displayName: name,
            dateOfBirth: Date.fromAge(age),
            gender: gender,
            bio: bio,
            heightCm: Int.random(in: 155...190),
            city: city,
            country: "India",
            intent: intent,
            isVerified: isVerified,
            profileCompleteness: completeness,
            photos: (0..<Int.random(in: 3...6)).map { i in
                UserPhoto(
                    url: photoURLs[(photoIndex + i) % photoURLs.count],
                    isPrimary: i == 0,
                    sortOrder: i
                )
            },
            prompts: [
                UserPrompt(question: promptQuestions.randomElement()!,
                          answer: ["I love long walks and good conversations",
                                   "Exploring new cuisines and cultures together",
                                   "Someone who values family as much as I do",
                                   "Chai pe charcha with my close ones"].randomElement()!),
                UserPrompt(question: promptQuestions.randomElement()!,
                          answer: ["Dal pakwan and a good Sindhi gathering",
                                   "Making my mom's secret recipe",
                                   "Celebrating Diwali with the whole family",
                                   "Being someone others can rely on"].randomElement()!)
            ],
            education: education,
            occupation: occupation,
            company: company,
            religion: religion,
            sindhiFluency: fluency,
            communitySubGroup: ["Bhaibund", "Amil", "Lohana", "Hyderabadi"].randomElement()!,
            gotra: ["Somani", "Vaswani", "Lalwani", "Advani"].randomElement()!,
            familyValues: [.traditional, .moderate, .liberal].randomElement()!,
            foodPreference: [.vegetarian, .nonVegetarian, .eggetarian].randomElement()!,
            interests: interests,
            isOnline: Bool.random(),
            lastActive: Date().addingTimeInterval(-Double.random(in: 0...7200))
        )
    }

    static let mockUsers: [User] = [
        makeUser(name: "Priya", age: 26, city: "Mumbai", gender: .woman,
                bio: "Architect by day, dancer by night. Love exploring hidden food joints and creating art.",
                occupation: "Architect", company: "Foster + Partners", education: "B.Arch, IIT Bombay",
                interests: ["Dancing", "Art", "Food", "Travel", "Photography"], photoIndex: 0),

        makeUser(name: "Arjun", age: 28, city: "Dubai", gender: .man,
                bio: "Tech entrepreneur building the future. Chai lover, cricket fanatic, and proud Sindhi.",
                occupation: "Founder & CEO", company: "TechVentures", education: "MBA, ISB",
                interests: ["Tech", "Cricket", "Coffee", "Travel", "Fitness"], photoIndex: 1),

        makeUser(name: "Kavya", age: 24, city: "Bangalore", gender: .woman,
                bio: "Yoga instructor who believes in mindful living. Fluent in 4 languages including Sindhi!",
                occupation: "Yoga Instructor", company: "Soul Space Studio", education: "MA Psychology",
                interests: ["Yoga", "Meditation", "Cooking", "Reading", "Music"], intent: .open, photoIndex: 2),

        makeUser(name: "Rohan", age: 30, city: "London", gender: .man,
                bio: "Investment banker with a love for Bollywood and biryani. Family is everything to me.",
                occupation: "VP, Investment Banking", company: "Goldman Sachs", education: "MSc Finance, LSE",
                interests: ["Bollywood", "Food", "Cricket", "Travel", "Fitness"], photoIndex: 3),

        makeUser(name: "Anaya", age: 25, city: "Delhi", gender: .woman,
                bio: "Doctor saving lives and cooking dal pakwan on weekends. Looking for my forever person.",
                occupation: "Resident Doctor", company: "AIIMS Delhi", education: "MBBS, AIIMS",
                interests: ["Cooking", "Reading", "Music", "Volunteering", "Travel"], photoIndex: 4),

        makeUser(name: "Vikram", age: 27, city: "Pune", gender: .man,
                bio: "Software engineer at heart, musician by soul. Can play 3 instruments and code in 5 languages.",
                occupation: "Senior Engineer", company: "Google", education: "B.Tech, NIT",
                interests: ["Music", "Tech", "Gaming", "Coffee", "Photography"], intent: .open, photoIndex: 5),

        makeUser(name: "Meera", age: 29, city: "Singapore", gender: .woman,
                bio: "Consultant helping businesses grow. Weekend hiker and amateur chef. Sindhi and proud!",
                occupation: "Strategy Consultant", company: "McKinsey", education: "MBA, INSEAD",
                interests: ["Hiking", "Cooking", "Travel", "Reading", "Fashion"], photoIndex: 6),

        makeUser(name: "Sahil", age: 26, city: "Toronto", gender: .man,
                bio: "Data scientist who speaks in probabilities. Love dogs, sunset drives, and my mom's cooking.",
                occupation: "Data Scientist", company: "Shopify", education: "MS CS, UofT",
                interests: ["Tech", "Photography", "Cycling", "Movies", "Food"], photoIndex: 7),

        makeUser(name: "Isha", age: 27, city: "Mumbai", gender: .woman,
                bio: "Fashion designer creating fusion Indo-western pieces. Believe in tradition with a modern twist.",
                occupation: "Fashion Designer", company: "Studio Isha", education: "BDes, NIFT",
                interests: ["Fashion", "Art", "Dancing", "Travel", "Photography"], photoIndex: 8),

        makeUser(name: "Dev", age: 31, city: "Hyderabad", gender: .man,
                bio: "Cardiologist who runs marathons. My idea of romance: cooking together and watching sunsets.",
                occupation: "Cardiologist", company: "Apollo Hospitals", education: "MD, Cardiology",
                interests: ["Fitness", "Cooking", "Travel", "Cricket", "Reading"], photoIndex: 9),

        makeUser(name: "Nisha", age: 23, city: "Ahmedabad", gender: .woman,
                bio: "Law student fighting for justice. Garba champion and chai addict. Looking for my equal.",
                occupation: "Law Student", company: "NLU Ahmedabad", education: "BA LLB",
                interests: ["Dancing", "Reading", "Volunteering", "Theatre", "Coffee"], intent: .casual, photoIndex: 0),

        makeUser(name: "Karan", age: 29, city: "San Francisco", gender: .man,
                bio: "Product manager at a unicorn startup. Miss home food but mastered mom's dal recipe!",
                occupation: "Product Manager", company: "Stripe", education: "BS CS, Stanford",
                interests: ["Tech", "Cooking", "Hiking", "Photography", "Coffee"], photoIndex: 1)
    ]

    // MARK: - Feed Cards
    static func makeFeedCard(from user: User, culturalPct: Int? = nil) -> FeedCard {
        let score = culturalPct ?? Int.random(in: 55...98)
        let badge: CulturalBadge = score >= 90 ? .gold : score >= 75 ? .green : score >= 60 ? .orange : .none

        return FeedCard(
            user: user,
            culturalScore: CulturalScore(
                overallScore: score,
                badge: badge,
                dimensions: [
                    CulturalDimension(name: "Language", description: "Sindhi fluency match", score: Int.random(in: 12...20), maxScore: 20),
                    CulturalDimension(name: "Religion", description: "Religious compatibility", score: Int.random(in: 10...20), maxScore: 20),
                    CulturalDimension(name: "Dietary", description: "Food preference match", score: Int.random(in: 8...15), maxScore: 15),
                    CulturalDimension(name: "Festivals", description: "Festival celebration overlap", score: Int.random(in: 8...15), maxScore: 15),
                    CulturalDimension(name: "Family Values", description: "Family orientation match", score: Int.random(in: 10...15), maxScore: 15),
                    CulturalDimension(name: "Generation", description: "Generational proximity", score: Int.random(in: 8...15), maxScore: 15)
                ]
            ),
            kundliScore: KundliScore(
                totalScore: Int.random(in: 18...32),
                tier: [.excellent, .good, .challenging].randomElement()!,
                gunas: [
                    KundliGuna(name: "Varna", description: "Spiritual development", score: Int.random(in: 0...1), maxScore: 1),
                    KundliGuna(name: "Vashya", description: "Mutual attraction", score: Int.random(in: 0...2), maxScore: 2),
                    KundliGuna(name: "Tara", description: "Star compatibility", score: Int.random(in: 0...3), maxScore: 3),
                    KundliGuna(name: "Yoni", description: "Physical compatibility", score: Int.random(in: 0...4), maxScore: 4),
                    KundliGuna(name: "Graha Maitri", description: "Mental compatibility", score: Int.random(in: 0...5), maxScore: 5),
                    KundliGuna(name: "Gana", description: "Temperament", score: Int.random(in: 0...6), maxScore: 6),
                    KundliGuna(name: "Bhakut", description: "Health & wellbeing", score: Int.random(in: 0...7), maxScore: 7),
                    KundliGuna(name: "Nadi", description: "Genetic compatibility", score: Int.random(in: 0...8), maxScore: 8)
                ]
            ),
            commonInterests: Int.random(in: 1...5),
            distanceKm: Double.random(in: 2...150)
        )
    }

    static let feedCards: [FeedCard] = mockUsers.map { makeFeedCard(from: $0) }

    // MARK: - Matches
    // Each match demonstrates a different state of the Respect-First chat system:
    static let mockMatches: [Match] = [
        // State: UNLOCKED — Both users have exchanged messages. Timer gone.
        // Priya sent first, current user replied → chat is fully open
        Match(
            otherUser: mockUsers[0],
            status: .active,
            matchedAt: Date().addingTimeInterval(-3600 * 5),
            expiresAt: nil, // Timer gone after both messaged
            lastMessage: Message(matchId: "m1", senderId: mockUsers[0].id, content: "Hey! Love your profile pic!", createdAt: Date().addingTimeInterval(-1800)),
            unreadCount: 2,
            firstMsgBy: mockUsers[0].id,
            firstMsgLocked: false, // Unlocked: both have messaged
            firstMsgAt: Date().addingTimeInterval(-3600 * 4)
        ),

        // State: AWAITING FIRST MESSAGE — No one has sent anything yet. 24h timer ticking.
        Match(
            otherUser: mockUsers[2],
            status: .pendingFirstMessage,
            matchedAt: Date().addingTimeInterval(-3600 * 2),
            expiresAt: Date().addingTimeInterval(3600 * 22), // 22h remaining
            unreadCount: 0,
            firstMsgBy: nil, // No one has messaged yet
            firstMsgLocked: false // Not locked (no first message)
        ),

        // State: LOCKED — Current user sent first, waiting for Anaya to reply.
        // Input is DISABLED for current user until Anaya responds.
        Match(
            otherUser: mockUsers[4],
            status: .pendingFirstMessage,
            matchedAt: Date().addingTimeInterval(-3600 * 8),
            expiresAt: Date().addingTimeInterval(3600 * 16), // 16h remaining to reply
            lastMessage: Message(matchId: "m3", senderId: "current-user-id", content: "Would love to try your dal pakwan recipe!", createdAt: Date().addingTimeInterval(-7200)),
            unreadCount: 0,
            firstMsgBy: "current-user-id", // I sent first
            firstMsgLocked: true, // LOCKED: waiting for Anaya's reply
            firstMsgAt: Date().addingTimeInterval(-7200) // Sent 2h ago
        ),

        // State: UNLOCKED — Both exchanged. Active conversation.
        Match(
            otherUser: mockUsers[6],
            status: .active,
            matchedAt: Date().addingTimeInterval(-86400),
            expiresAt: nil, // Timer gone
            lastMessage: Message(matchId: "m4", senderId: mockUsers[6].id, content: "Singapore is lovely this time of year!", createdAt: Date().addingTimeInterval(-3600)),
            unreadCount: 1,
            firstMsgBy: "current-user-id",
            firstMsgLocked: false, // Unlocked
            firstMsgAt: Date().addingTimeInterval(-86400 + 3600)
        ),

        // State: THEY SENT FIRST — Isha sent first message, current user needs to reply.
        // Input is ENABLED for current user (they're the receiver).
        Match(
            otherUser: mockUsers[8],
            status: .pendingFirstMessage,
            matchedAt: Date().addingTimeInterval(-3600 * 3),
            expiresAt: Date().addingTimeInterval(3600 * 21), // 21h remaining
            lastMessage: Message(matchId: "m5", senderId: mockUsers[8].id, content: "Hey! Your music taste is amazing!", createdAt: Date().addingTimeInterval(-3600)),
            unreadCount: 1,
            firstMsgBy: mockUsers[8].id, // Isha sent first
            firstMsgLocked: true, // Locked for Isha (she can't send again), but current user CAN reply
            firstMsgAt: Date().addingTimeInterval(-3600)
        )
    ]

    // MARK: - Likes
    static let mockLikes: [LikedYouCard] = [
        LikedYouCard(user: mockUsers[1], likedAt: Date().addingTimeInterval(-3600), likeLabel: "Liked your profile", culturalScore: 88, culturalBadge: .gold),
        LikedYouCard(user: mockUsers[3], likedAt: Date().addingTimeInterval(-7200), likeLabel: "Liked your photo", culturalScore: 76, culturalBadge: .green),
        LikedYouCard(user: mockUsers[5], likedAt: Date().addingTimeInterval(-14400), likeLabel: "Liked your answer", culturalScore: 82, culturalBadge: .green),
        LikedYouCard(user: mockUsers[7], likedAt: Date().addingTimeInterval(-28800), likeLabel: "Liked your profile", culturalScore: 91, culturalBadge: .gold),
        LikedYouCard(user: mockUsers[9], likedAt: Date().addingTimeInterval(-43200), likeLabel: "Liked your photo", culturalScore: 65, culturalBadge: .orange)
    ]

    // MARK: - Messages
    static func mockMessages(matchId: String, otherUserId: String) -> [Message] {
        [
            Message(matchId: matchId, senderId: otherUserId, content: "Hey there! I noticed we both love Sindhi food!", msgType: .text, status: .read, createdAt: Date().addingTimeInterval(-7200)),
            Message(matchId: matchId, senderId: "current-user-id", content: "Sai bhaani! Yes, nothing beats homemade dal pakwan!", msgType: .text, status: .read, createdAt: Date().addingTimeInterval(-6900)),
            Message(matchId: matchId, senderId: otherUserId, content: "So true! My mom makes the best one. What's your specialty?", msgType: .text, status: .read, createdAt: Date().addingTimeInterval(-6600)),
            Message(matchId: matchId, senderId: "current-user-id", content: "I make a killer sai bhaji! Also trying to perfect koki", msgType: .text, status: .delivered, createdAt: Date().addingTimeInterval(-5400)),
            Message(matchId: matchId, senderId: otherUserId, content: "A person after my own heart! We should cook together sometime", msgType: .text, status: .sent, createdAt: Date().addingTimeInterval(-3600)),
            Message(matchId: matchId, senderId: "current-user-id", content: "That sounds like an amazing first date idea!", msgType: .text, status: .sent, createdAt: Date().addingTimeInterval(-1800))
        ]
    }

    // MARK: - Family
    static let mockFamilyMembers: [FamilyMember] = [
        FamilyMember(name: "Maa", phone: "+919876543210", relationship: "Mother", status: .active,
                    permissions: FamilyPermissions(canViewProfile: true, canViewPhotos: true, canViewBasics: true, canViewSindhi: true, canViewMatches: false, canSuggest: true, canViewCulturalScore: true, canViewKundli: true),
                    joinedAt: Date().addingTimeInterval(-86400 * 14)),
        FamilyMember(name: "Papa", phone: "+919876543211", relationship: "Father", status: .active,
                    permissions: .allEnabled,
                    joinedAt: Date().addingTimeInterval(-86400 * 12))
    ]

    static let mockFamilySuggestions: [FamilySuggestion] = [
        FamilySuggestion(
            suggestedBy: mockFamilyMembers[0],
            suggestedUser: mockUsers[3],
            note: "Lalwani family ka beta hai, bahut accha ladka hai. London mein settled hai.",
            suggestedAt: Date().addingTimeInterval(-3600 * 6)
        )
    ]

    // MARK: - Current User
    static let currentUser = User(
        id: "current-user-id",
        phone: "+919876543200",
        displayName: "You",
        dateOfBirth: Date.fromAge(26),
        gender: .man,
        bio: "Building cool things and exploring the world. Proud Sindhi, love music and good food.",
        heightCm: 178,
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        intent: .marriage,
        showMe: .women,
        isVerified: true,
        profileCompleteness: 72,
        photos: [
            UserPhoto(url: "photo_1", isPrimary: true, sortOrder: 0),
            UserPhoto(url: "photo_2", sortOrder: 1),
            UserPhoto(url: "photo_3", sortOrder: 2)
        ],
        prompts: [
            UserPrompt(question: "A typical Sunday for me looks like...", answer: "Late morning chai, jam session, then cooking with family"),
            UserPrompt(question: "My favorite Sindhi tradition is...", answer: "Cheti Chand celebrations with the whole community")
        ],
        education: "B.Tech, IIT Bombay",
        occupation: "Software Engineer",
        company: "Apple",
        religion: "Hindu",
        sindhiFluency: .fluent,
        communitySubGroup: "Bhaibund",
        gotra: "Advani",
        familyValues: .moderate,
        foodPreference: .vegetarian,
        interests: ["Music", "Tech", "Cooking", "Travel", "Cricket", "Photography"],
        isOnline: true
    )
}
