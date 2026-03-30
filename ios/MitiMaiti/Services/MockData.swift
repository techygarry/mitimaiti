import Foundation

struct MockData {
    // MARK: - Photo URLs (picsum.photos for real placeholder images)
    static let photoURLs = [
        "https://i.pravatar.cc/600?img=1",
        "https://i.pravatar.cc/600?img=5",
        "https://i.pravatar.cc/600?img=9",
        "https://i.pravatar.cc/600?img=12",
        "https://i.pravatar.cc/600?img=16",
        "https://i.pravatar.cc/600?img=20",
        "https://i.pravatar.cc/600?img=25",
        "https://i.pravatar.cc/600?img=32",
        "https://i.pravatar.cc/600?img=36",
        "https://i.pravatar.cc/600?img=41",
        "https://i.pravatar.cc/600?img=45",
        "https://i.pravatar.cc/600?img=48",
        "https://i.pravatar.cc/600?img=49",
        "https://i.pravatar.cc/600?img=56",
        "https://i.pravatar.cc/600?img=57"
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
        makeUser(name: "Aanya", age: 25, city: "Mumbai", gender: .woman,
                bio: "Interior designer who turns spaces into stories. Weekend potter, full-time dreamer. My happy place? A chai stall at sunset.",
                occupation: "Interior Designer", company: "Studio Naya", education: "BDes, Rachana Sansad",
                interests: ["Art", "Travel", "Coffee", "Photography", "Cooking"], photoIndex: 0),

        makeUser(name: "Reyansh", age: 28, city: "Dubai", gender: .man,
                bio: "Building fintech for South Asia. When I'm not coding, you'll find me on a cricket pitch or planning my next trek.",
                occupation: "Co-Founder", company: "PaySindh", education: "MBA, SP Jain",
                interests: ["Tech", "Cricket", "Hiking", "Travel", "Fitness"], photoIndex: 1),

        makeUser(name: "Tara", age: 26, city: "Bangalore", gender: .woman,
                bio: "Neuroscience researcher by day, stand-up comedy open mic-er by night. I speak fluent sarcasm and decent Sindhi.",
                occupation: "Research Scientist", company: "IISc Bangalore", education: "PhD Neuroscience",
                interests: ["Music", "Reading", "Coffee", "Movies", "Yoga"], intent: .open, photoIndex: 2),

        makeUser(name: "Advait", age: 30, city: "London", gender: .man,
                bio: "Architect designing homes people actually love. Vinyl collector, amateur pasta maker, and hopeless romantic.",
                occupation: "Senior Architect", company: "Zaha Hadid Architects", education: "MArch, AA London",
                interests: ["Art", "Cooking", "Music", "Travel", "Photography"], photoIndex: 3),

        makeUser(name: "Siya", age: 24, city: "Delhi", gender: .woman,
                bio: "Documentary filmmaker telling untold stories. Currently working on a film about Sindhi diaspora. Chai > Coffee, always.",
                occupation: "Filmmaker", company: "Independent", education: "Mass Comm, Jamia",
                interests: ["Movies", "Travel", "Writing", "Volunteering", "Photography"], photoIndex: 4),

        makeUser(name: "Kabir", age: 27, city: "Pune", gender: .man,
                bio: "ML engineer teaching machines to think. Weekend DJ and terrible dancer. Will cook biryani for you on the third date.",
                occupation: "ML Engineer", company: "Microsoft", education: "M.Tech, IIT Pune",
                interests: ["Tech", "Music", "Gaming", "Food", "Dancing"], intent: .open, photoIndex: 5),

        makeUser(name: "Zara", age: 28, city: "Singapore", gender: .woman,
                bio: "Private equity analyst with a travel obsession. 30 countries and counting. Looking for a co-pilot for the next adventure.",
                occupation: "VP, Private Equity", company: "Temasek", education: "BCom, SRCC + CFA",
                interests: ["Travel", "Fitness", "Reading", "Fashion", "Hiking"], photoIndex: 6),

        makeUser(name: "Vivaan", age: 26, city: "Toronto", gender: .man,
                bio: "Emergency room physician in training. Stress relief = guitar + my golden retriever named Naan. Yes, like the bread.",
                occupation: "Medical Resident", company: "Mount Sinai Hospital", education: "MD, UofT",
                interests: ["Music", "Fitness", "Cooking", "Photography", "Movies"], photoIndex: 7),

        makeUser(name: "Myra", age: 27, city: "Mumbai", gender: .woman,
                bio: "Brand strategist for luxury labels. I believe in slow mornings, deep conversations, and spontaneous road trips.",
                occupation: "Brand Strategist", company: "Estee Lauder", education: "MBA, IIM Ahmedabad",
                interests: ["Fashion", "Art", "Travel", "Coffee", "Yoga"], photoIndex: 8),

        makeUser(name: "Arnav", age: 31, city: "Hyderabad", gender: .man,
                bio: "Restaurateur who opened a modern Sindhi fusion kitchen. If food is the way to your heart, I have a reservation for two.",
                occupation: "Chef & Owner", company: "Swaad Sindhi Kitchen", education: "Le Cordon Bleu, Paris",
                interests: ["Cooking", "Food", "Travel", "Cricket", "Bollywood"], photoIndex: 9),

        makeUser(name: "Kiara", age: 23, city: "Ahmedabad", gender: .woman,
                bio: "Final year law student and moot court champion. Part-time garba instructor. Full-time believer in finding your person.",
                occupation: "Law Student", company: "NLU Ahmedabad", education: "BA LLB (Hons)",
                interests: ["Dancing", "Reading", "Volunteering", "Theatre", "Coffee"], intent: .casual, photoIndex: 10),

        makeUser(name: "Dhruv", age: 29, city: "San Francisco", gender: .man,
                bio: "Staff engineer at a Big Tech company. Weekend trail runner and home barista. Mastered mom's koki recipe — taste test available.",
                occupation: "Staff Engineer", company: "Meta", education: "MS CS, CMU",
                interests: ["Tech", "Cooking", "Hiking", "Photography", "Coffee"], photoIndex: 11),

        makeUser(name: "Anvi", age: 26, city: "Jaipur", gender: .woman,
                bio: "Textile designer preserving Sindhi craft traditions in modern fashion. My ajrak collection has its own room.",
                occupation: "Textile Designer", company: "Anvi Weaves", education: "NID Ahmedabad",
                interests: ["Fashion", "Art", "Travel", "Photography", "Music"], photoIndex: 12),

        makeUser(name: "Yash", age: 32, city: "Melbourne", gender: .man,
                bio: "Dentist who makes people smile — literally. Weekend surfer and terrible pun maker. Looking for someone who laughs at bad jokes.",
                occupation: "Dentist", company: "SmileCraft Dental", education: "BDS, Manipal + MDS Melbourne",
                interests: ["Fitness", "Travel", "Cooking", "Swimming", "Movies"], photoIndex: 13),

        makeUser(name: "Riya", age: 25, city: "Kolkata", gender: .woman,
                bio: "Classical Kathak dancer turned contemporary choreographer. I express through movement what words can't say.",
                occupation: "Choreographer", company: "Nritya Academy", education: "MA Performing Arts",
                interests: ["Dancing", "Music", "Yoga", "Art", "Meditation"], intent: .open, photoIndex: 14)
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
