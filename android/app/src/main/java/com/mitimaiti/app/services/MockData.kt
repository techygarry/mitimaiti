package com.mitimaiti.app.services

import com.mitimaiti.app.models.*
import java.time.LocalDate

object MockData {

    val interests = listOf(
        "Travel", "Cooking", "Cricket", "Music", "Dancing", "Photography",
        "Reading", "Yoga", "Hiking", "Movies", "Art", "Tech", "Gaming",
        "Fitness", "Meditation", "Singing", "Writing", "Fashion", "Food",
        "Bollywood", "Tennis", "Swimming", "Cycling", "Gardening", "Volunteering"
    )

    val icebreakers = listOf(
        Icebreaker(question = "What Sindhi dish reminds you of home?", category = "sindhi"),
        Icebreaker(question = "Cheti Chand or Diwali - which celebration hits different?", category = "sindhi"),
        Icebreaker(question = "What's a tradition from your family you want to keep alive?", category = "sindhi"),
        Icebreaker(question = "If you could teleport anywhere right now, where?", category = "fun"),
        Icebreaker(question = "What's the most adventurous thing on your bucket list?", category = "fun"),
        Icebreaker(question = "What's one thing people always get wrong about you?", category = "general"),
        Icebreaker(question = "What does your ideal Sunday look like?", category = "general"),
        Icebreaker(question = "What's something you believe that most people don't?", category = "deep")
    )

    val cities = listOf(
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Ahmedabad",
        "Chennai", "Kolkata", "Jaipur", "Udaipur", "New York", "London",
        "Dubai", "Singapore", "Toronto", "Sydney", "San Francisco",
        "Los Angeles", "Hong Kong", "Karachi"
    )

    fun makeUser(
        id: String, name: String, age: Int, city: String, bio: String, intent: Intent,
        gender: Gender = Gender.WOMAN, photoIndices: List<Int> = listOf(1, 2, 3),
        occupation: String? = null, education: String? = null,
        fluency: SindhiFluency = SindhiFluency.FLUENT, familyValues: FamilyValues = FamilyValues.MODERATE,
        foodPreference: FoodPreference = FoodPreference.VEGETARIAN,
        isVerified: Boolean = false, isOnline: Boolean = false,
        interests: List<String> = emptyList(), completeness: Int = 85
    ): User {
        return User(
            id = id, displayName = name,
            dateOfBirth = LocalDate.now().minusYears(age.toLong()),
            gender = gender, bio = bio, city = city, country = "India",
            intent = intent, showMe = ShowMe.EVERYONE, isVerified = isVerified,
            photos = photoIndices.mapIndexed { index, imgIdx ->
                UserPhoto(
                    url = "https://i.pravatar.cc/400?img=$imgIdx",
                    urlThumb = "https://i.pravatar.cc/150?img=$imgIdx",
                    isPrimary = index == 0, sortOrder = index, isVerified = isVerified
                )
            },
            prompts = listOf(
                UserPrompt(question = "A perfect day for me is...", answer = "Starting with chai, ending with good conversation"),
                UserPrompt(question = "I'm looking for someone who...", answer = "Values family but also has their own ambitions")
            ),
            occupation = occupation, education = education, sindhiFluency = fluency,
            familyValues = familyValues, foodPreference = foodPreference,
            isOnline = isOnline, interests = interests, profileCompleteness = completeness,
            heightCm = (155..185).random(), religion = "Hindu", motherTongue = "Sindhi",
            generation = listOf("1st Gen", "2nd Gen", "3rd Gen").random()
        )
    }

    val mockUsers: List<User> by lazy {
        listOf(
            makeUser("u1", "Priya Makhija", 26, "Mumbai", "Product designer who loves chai and conversations", Intent.MARRIAGE, photoIndices = listOf(5, 6, 7), occupation = "Product Designer", education = "NID Ahmedabad", isVerified = true, isOnline = true, interests = listOf("Art", "Travel", "Yoga", "Photography"), fluency = SindhiFluency.NATIVE, familyValues = FamilyValues.TRADITIONAL, completeness = 95),
            makeUser("u2", "Ananya Lulla", 24, "Delhi", "Coffee addict & bookworm. Let's talk about the last book that changed you", Intent.OPEN, photoIndices = listOf(9, 10, 11), occupation = "Marketing Manager", education = "LSR Delhi", interests = listOf("Reading", "Movies", "Cooking", "Travel"), fluency = SindhiFluency.CONVERSATIONAL),
            makeUser("u3", "Kavya Gidwani", 28, "Bangalore", "Software engineer by day, classical dancer by evening", Intent.MARRIAGE, photoIndices = listOf(12, 13, 14), occupation = "Software Engineer", education = "IIT Bombay", isVerified = true, interests = listOf("Dancing", "Tech", "Fitness", "Music"), fluency = SindhiFluency.FLUENT, familyValues = FamilyValues.TRADITIONAL, completeness = 92),
            makeUser("u4", "Simran Wadhwa", 25, "Pune", "Yoga instructor finding balance in chaos", Intent.OPEN, photoIndices = listOf(15, 16, 17), occupation = "Yoga Instructor", interests = listOf("Yoga", "Meditation", "Cooking", "Hiking"), foodPreference = FoodPreference.VEGAN),
            makeUser("u5", "Nisha Keswani", 27, "Hyderabad", "Doctor by profession, foodie by passion", Intent.MARRIAGE, photoIndices = listOf(18, 19, 20), occupation = "Doctor", education = "AIIMS", isVerified = true, isOnline = true, interests = listOf("Food", "Travel", "Reading", "Volunteering"), completeness = 90),
            makeUser("u6", "Meera Chandiramani", 23, "Ahmedabad", "Fresh out of college, big dreams", Intent.CASUAL, photoIndices = listOf(21, 22, 23), education = "Gujarat University", interests = listOf("Music", "Fashion", "Dancing", "Movies"), fluency = SindhiFluency.BASIC),
            makeUser("u7", "Rhea Tolani", 29, "New York", "Lawyer who can argue and cook equally well", Intent.MARRIAGE, photoIndices = listOf(24, 25, 26), occupation = "Lawyer", education = "Columbia Law", interests = listOf("Cooking", "Reading", "Fitness", "Travel"), fluency = SindhiFluency.CONVERSATIONAL, familyValues = FamilyValues.LIBERAL, completeness = 88),
            makeUser("u8", "Diya Motwani", 26, "London", "Finance girlie who loves weekend getaways", Intent.OPEN, photoIndices = listOf(27, 28, 29), occupation = "Investment Analyst", education = "LSE", interests = listOf("Travel", "Fitness", "Photography", "Fashion")),
            makeUser("u9", "Tara Lalwani", 24, "Dubai", "Interior designer creating beautiful spaces", Intent.MARRIAGE, photoIndices = listOf(30, 31, 32), occupation = "Interior Designer", isOnline = true, interests = listOf("Art", "Photography", "Travel", "Gardening"), fluency = SindhiFluency.NATIVE, familyValues = FamilyValues.TRADITIONAL),
            makeUser("u10", "Aisha Chhabria", 27, "Singapore", "Data scientist decoding patterns in everything", Intent.OPEN, photoIndices = listOf(33, 34, 35), occupation = "Data Scientist", education = "NUS", interests = listOf("Tech", "Reading", "Gaming", "Hiking")),
            makeUser("u11", "Pooja Vaswani", 25, "Toronto", "Grad student & part-time chai philosopher", Intent.CASUAL, photoIndices = listOf(36, 37, 38), education = "UofT", interests = listOf("Reading", "Music", "Cooking", "Volunteering"), fluency = SindhiFluency.LEARNING),
            makeUser("u12", "Sakshi Mirpuri", 28, "Mumbai", "Architect building dreams, literally", Intent.MARRIAGE, photoIndices = listOf(39, 40, 41), occupation = "Architect", education = "JJ School of Art", isVerified = true, interests = listOf("Art", "Travel", "Hiking", "Photography"), completeness = 93),
            makeUser("u13", "Jaya Bijlani", 26, "Chennai", "Content creator & storyteller", Intent.OPEN, photoIndices = listOf(42, 43, 44), occupation = "Content Creator", interests = listOf("Writing", "Photography", "Movies", "Travel")),
            makeUser("u14", "Roshni Daswani", 30, "Jaipur", "Psychologist helping others find clarity", Intent.MARRIAGE, photoIndices = listOf(45, 46, 47), occupation = "Psychologist", education = "Tata Institute", interests = listOf("Reading", "Meditation", "Volunteering", "Music"), familyValues = FamilyValues.TRADITIONAL, completeness = 91),
            makeUser("u15", "Kiara Samtani", 23, "Kolkata", "Musician who speaks through melodies", Intent.CASUAL, photoIndices = listOf(48, 49, 50), occupation = "Musician", interests = listOf("Music", "Singing", "Dancing", "Travel"), fluency = SindhiFluency.BASIC),
            makeUser("u16", "Aditi Mirchandani", 27, "San Francisco", "Startup founder disrupting things", Intent.OPEN, photoIndices = listOf(51, 52, 53), occupation = "Founder & CEO", education = "Stanford", interests = listOf("Tech", "Fitness", "Travel", "Reading"), fluency = SindhiFluency.CONVERSATIONAL, familyValues = FamilyValues.LIBERAL),
            makeUser("u17", "Zara Mansukhani", 25, "Udaipur", "Heritage conservationist & history nerd", Intent.MARRIAGE, photoIndices = listOf(54, 55, 56), occupation = "Conservationist", interests = listOf("Art", "Reading", "Volunteering", "Photography"), fluency = SindhiFluency.NATIVE, familyValues = FamilyValues.TRADITIONAL),
            makeUser("u18", "Isha Kripalani", 28, "Los Angeles", "Filmmaker chasing stories across borders", Intent.OPEN, photoIndices = listOf(57, 58, 59), occupation = "Filmmaker", education = "UCLA Film", interests = listOf("Movies", "Travel", "Photography", "Writing")),
            makeUser("u19", "Neha Hotchandani", 26, "Sydney", "Marine biologist saving the oceans", Intent.MARRIAGE, photoIndices = listOf(1, 3, 5), occupation = "Marine Biologist", education = "UNSW", isOnline = true, interests = listOf("Swimming", "Travel", "Photography", "Volunteering"), completeness = 87),
            makeUser("u20", "Sana Thadani", 24, "Hong Kong", "Fashion buyer with an eye for detail", Intent.CASUAL, photoIndices = listOf(7, 9, 11), occupation = "Fashion Buyer", interests = listOf("Fashion", "Travel", "Art", "Food")),
            makeUser("u21", "Divya Gehani", 29, "Mumbai", "CA who can make taxes fun (almost)", Intent.MARRIAGE, photoIndices = listOf(13, 15, 17), occupation = "Chartered Accountant", education = "ICAI", isVerified = true, interests = listOf("Reading", "Cooking", "Travel", "Fitness"), familyValues = FamilyValues.TRADITIONAL, completeness = 94),
            makeUser("u22", "Riya Purswani", 25, "Delhi", "Journalist uncovering stories that matter", Intent.OPEN, photoIndices = listOf(19, 21, 23), occupation = "Journalist", education = "IIMC", interests = listOf("Writing", "Travel", "Movies", "Reading")),
            makeUser("u23", "Megha Malkani", 27, "Bangalore", "UX researcher obsessed with human behavior", Intent.MARRIAGE, photoIndices = listOf(25, 27, 29), occupation = "UX Researcher", education = "IIT Delhi", interests = listOf("Tech", "Art", "Reading", "Yoga"), completeness = 89),
            makeUser("u24", "Ankita Sundrani", 26, "Pune", "Veterinarian & animal lover", Intent.OPEN, photoIndices = listOf(31, 33, 35), occupation = "Veterinarian", interests = listOf("Volunteering", "Hiking", "Photography", "Cooking")),
            makeUser("u25", "Tanvi Bajaj", 24, "Ahmedabad", "Dance teacher spreading joy through movement", Intent.CASUAL, photoIndices = listOf(37, 39, 41), occupation = "Dance Teacher", interests = listOf("Dancing", "Music", "Fitness", "Bollywood"), fluency = SindhiFluency.NATIVE)
        )
    }

    val currentUser: User by lazy {
        User(
            id = "current-user-id", phone = "+919876543210", displayName = "Rahul Advani",
            dateOfBirth = LocalDate.of(1997, 3, 15), gender = Gender.MAN,
            bio = "Tech entrepreneur who loves Sindhi food and long conversations. Building something meaningful, one line of code at a time.",
            heightCm = 178, city = "Mumbai", state = "Maharashtra", country = "India",
            intent = Intent.MARRIAGE, showMe = ShowMe.WOMEN, isVerified = true,
            photos = listOf(
                UserPhoto(url = "https://i.pravatar.cc/400?img=3", urlThumb = "https://i.pravatar.cc/150?img=3", isPrimary = true, sortOrder = 0, isVerified = true),
                UserPhoto(url = "https://i.pravatar.cc/400?img=4", urlThumb = "https://i.pravatar.cc/150?img=4", sortOrder = 1),
                UserPhoto(url = "https://i.pravatar.cc/400?img=8", urlThumb = "https://i.pravatar.cc/150?img=8", sortOrder = 2)
            ),
            prompts = listOf(
                UserPrompt(question = "A perfect day for me is...", answer = "Starting with Sindhi breakfast, working on my startup, evening cricket with friends, and ending with family dinner"),
                UserPrompt(question = "I'm looking for someone who...", answer = "Has ambition but also knows how to slow down and enjoy dal pakwan on a Sunday morning")
            ),
            education = "IIT Bombay", occupation = "Founder & CTO", company = "TechStartup",
            religion = "Hindu", smoking = "Never", drinking = "Socially", exercise = "Often", wantKids = "Someday",
            motherTongue = "Sindhi", sindhiDialect = "Hyderabadi", sindhiFluency = SindhiFluency.NATIVE,
            communitySubGroup = "Hyderabadi Sindhi", gotra = "Advani",
            familyOriginCity = "Hyderabad", familyOriginCountry = "India", generation = "3rd Gen",
            familyValues = FamilyValues.MODERATE, foodPreference = FoodPreference.VEGETARIAN,
            festivalsCelebrated = listOf("Cheti Chand", "Diwali", "Holi", "Thanksgiving Sindhi"),
            interests = listOf("Tech", "Cricket", "Cooking", "Travel", "Reading", "Music"),
            languages = listOf("Sindhi", "Hindi", "English", "Marathi"),
            isOnline = true, profileCompleteness = 92
        )
    }

    fun makeFeedCards(): List<FeedCard> {
        return mockUsers.mapIndexed { index, user ->
            val score = (55..98).random()
            FeedCard(
                user = user,
                culturalScore = CulturalScore(
                    overallScore = score,
                    badge = when { score >= 85 -> CulturalBadge.GOLD; score >= 70 -> CulturalBadge.GREEN; score >= 50 -> CulturalBadge.ORANGE; else -> CulturalBadge.NONE },
                    dimensions = listOf(
                        CulturalDimension("Language", (40..100).random()), CulturalDimension("Religion", (50..100).random()),
                        CulturalDimension("Dietary", (30..100).random()), CulturalDimension("Festivals", (40..100).random()),
                        CulturalDimension("Family Values", (50..100).random()), CulturalDimension("Generation", (30..100).random())
                    )
                ),
                kundliScore = if (index % 3 == 0) KundliScore(
                    totalScore = (18..32).random().toDouble(),
                    tier = listOf(KundliTier.EXCELLENT, KundliTier.GOOD, KundliTier.CHALLENGING).random(),
                    gunas = listOf(
                        KundliGuna("Varna", (0..1).random().toDouble(), 1.0), KundliGuna("Vashya", (0..2).random().toDouble(), 2.0),
                        KundliGuna("Tara", (0..3).random().toDouble(), 3.0), KundliGuna("Yoni", (0..4).random().toDouble(), 4.0),
                        KundliGuna("Graha Maitri", (0..5).random().toDouble(), 5.0), KundliGuna("Gana", (0..6).random().toDouble(), 6.0),
                        KundliGuna("Bhakoot", (0..7).random().toDouble(), 7.0), KundliGuna("Nadi", (0..8).random().toDouble(), 8.0)
                    )
                ) else null,
                commonInterests = (1..6).random(),
                distanceKm = if (user.city == "Mumbai") (1..25).random().toDouble() else (50..500).random().toDouble(),
                isExplore = index > 15
            )
        }
    }

    fun makeLikes(): List<LikedYouCard> = mockUsers.take(10).map { user ->
        val score = (60..95).random()
        LikedYouCard(user = user, culturalScore = score, culturalBadge = when { score >= 85 -> CulturalBadge.GOLD; score >= 70 -> CulturalBadge.GREEN; else -> CulturalBadge.ORANGE }, likedAt = System.currentTimeMillis() - (0..72).random() * 60 * 60 * 1000L)
    }

    fun makeMatches(): List<Match> {
        val now = System.currentTimeMillis(); val hour = 60 * 60 * 1000L
        return listOf(
            Match(id = "m1", otherUser = mockUsers[0], status = MatchStatus.ACTIVE, matchedAt = now - 20 * hour, expiresAt = null, lastMessage = "Would love to! Which restaurant?", unreadCount = 2, firstMsgBy = "current-user-id", firstMsgLocked = false, firstMsgAt = now - 18 * hour),
            Match(id = "m2", otherUser = mockUsers[2], status = MatchStatus.PENDING_FIRST_MESSAGE, matchedAt = now - 6 * hour, expiresAt = now + 18 * hour, lastMessage = "Hey! Love your profile", unreadCount = 0, firstMsgBy = "current-user-id", firstMsgLocked = true, firstMsgAt = now - 5 * hour),
            Match(id = "m3", otherUser = mockUsers[4], status = MatchStatus.PENDING_FIRST_MESSAGE, matchedAt = now - 2 * hour, expiresAt = now + 22 * hour, lastMessage = null, unreadCount = 0, firstMsgBy = null, firstMsgLocked = false, firstMsgAt = null),
            Match(id = "m4", otherUser = mockUsers[6], status = MatchStatus.ACTIVE, matchedAt = now - 48 * hour, expiresAt = null, lastMessage = "Haha that's so true!", unreadCount = 1, firstMsgBy = mockUsers[6].id, firstMsgLocked = false, firstMsgAt = now - 46 * hour),
            Match(id = "m5", otherUser = mockUsers[8], status = MatchStatus.PENDING_FIRST_MESSAGE, matchedAt = now - 21 * hour, expiresAt = now + 3 * hour, lastMessage = null, unreadCount = 0, firstMsgBy = null, firstMsgLocked = false, firstMsgAt = null)
        )
    }

    fun makeMessages(matchId: String): List<Message> {
        val now = System.currentTimeMillis(); val min = 60 * 1000L
        return when (matchId) {
            "m1" -> listOf(
                Message(matchId = "m1", senderId = "current-user-id", content = "Hey Priya! Your design portfolio is amazing", createdAt = now - 18 * 60 * min),
                Message(matchId = "m1", senderId = "u1", content = "Thank you! I saw you're into tech too. What are you building?", createdAt = now - 17 * 60 * min),
                Message(matchId = "m1", senderId = "current-user-id", content = "A community platform for Sindhis actually! Inspired by wanting to stay connected to our roots", createdAt = now - 16 * 60 * min),
                Message(matchId = "m1", senderId = "u1", content = "No way! That's such a cool idea. I've been wanting to do more cultural design work", createdAt = now - 15 * 60 * min),
                Message(matchId = "m1", senderId = "current-user-id", content = "We should chat more about this over coffee maybe?", createdAt = now - 14 * 60 * min),
                Message(matchId = "m1", senderId = "u1", content = "Would love to! Which restaurant?", createdAt = now - 12 * 60 * min),
                Message(matchId = "m1", senderId = "u1", content = "Have you tried the new Sindhi place in Bandra?", createdAt = now - 10 * 60 * min)
            )
            "m2" -> listOf(Message(matchId = "m2", senderId = "current-user-id", content = "Hey! Love your profile", createdAt = now - 5 * 60 * min))
            "m4" -> listOf(
                Message(matchId = "m4", senderId = "u7", content = "Hey Rahul! Another Sindhi in tech, love to see it!", createdAt = now - 46 * 60 * min),
                Message(matchId = "m4", senderId = "current-user-id", content = "Rhea! Always great to meet fellow Sindhis abroad. How's NYC treating you?", createdAt = now - 44 * 60 * min),
                Message(matchId = "m4", senderId = "u7", content = "It's amazing but I miss Mumbai street food so much", createdAt = now - 42 * 60 * min),
                Message(matchId = "m4", senderId = "current-user-id", content = "Nothing beats pani puri from Chowpatty!", createdAt = now - 40 * 60 * min),
                Message(matchId = "m4", senderId = "u7", content = "Haha that's so true!", createdAt = now - 38 * 60 * min)
            )
            else -> emptyList()
        }
    }

    fun makeFamilyMembers(): List<FamilyMember> = listOf(
        FamilyMember(id = "fm1", name = "Sunita Advani", phone = "+919876543211", relationship = "Mother", status = FamilyMemberStatus.ACTIVE, permissions = FamilyPermissions(canViewProfile = true, canViewPhotos = true, canViewBasics = true, canViewSindhi = true, canViewMatches = true, canSuggest = true, canViewCulturalScore = true, canViewKundli = true)),
        FamilyMember(id = "fm2", name = "Vikram Advani", phone = "+919876543212", relationship = "Father", status = FamilyMemberStatus.ACTIVE, permissions = FamilyPermissions(canViewProfile = true, canViewPhotos = true, canViewBasics = true, canViewSindhi = true, canViewMatches = false, canSuggest = true, canViewCulturalScore = true, canViewKundli = true)),
        FamilyMember(id = "fm3", name = "Neha Advani", phone = "+919876543213", relationship = "Sister", status = FamilyMemberStatus.ACTIVE, permissions = FamilyPermissions(canViewProfile = true, canViewPhotos = true, canViewBasics = true, canViewSindhi = true, canViewMatches = true, canSuggest = true, canViewCulturalScore = true, canViewKundli = false))
    )

    fun makeFamilySuggestions(): List<FamilySuggestion> {
        val members = makeFamilyMembers()
        return listOf(
            FamilySuggestion(suggestedBy = members[0], suggestedUser = mockUsers[11], note = "Beta, she's from a lovely Sindhi family in Mumbai!"),
            FamilySuggestion(suggestedBy = members[2], suggestedUser = mockUsers[15], note = "Bhai check her out - she's also in tech!"),
            FamilySuggestion(suggestedBy = members[0], suggestedUser = mockUsers[16], note = "Her family knows our family friends in Udaipur")
        )
    }
}
