package com.mitimaiti.app.ui.pages

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TermsScreen(onBack: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Terms of Service", fontWeight = FontWeight.Bold, color = colors.textPrimary) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = colors.textPrimary) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colors.surface)
            )
        },
        containerColor = colors.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Text("Last Updated: March 15, 2026", fontSize = 13.sp, color = colors.textMuted)

            LegalSection("1. Acceptance of Terms",
                "By accessing or using MitiMaiti, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.")
            LegalSection("2. Eligibility",
                "You must be at least 18 years old to use MitiMaiti. By creating an account, you represent and warrant that you meet this age requirement and have the legal capacity to enter into this agreement.")
            LegalSection("3. The MitiMaiti Service",
                "3.1 Respect-First Messaging\nOur messaging system is designed for meaningful conversations. When you match with someone, one person sends the first message. The other has 24 hours to reply before the match expires. This encourages genuine engagement.\n\n3.2 Family Mode\nYou may invite up to 3 family members to your circle. Family members can view permitted profile sections and suggest matches based on your permission settings. Messages are never visible to family members.")
            LegalSection("4. User Conduct",
                "You agree to:\n• Provide accurate information\n• Use the service for its intended purpose\n• Respect other users' boundaries\n• Not engage in harassment, spam, or fraudulent activity\n• Not use automated tools or bots\n• Not share explicit or inappropriate content")
            LegalSection("5. Content Moderation",
                "We employ a 3-layer moderation system:\n• Automated content scanning for explicit material\n• AI-assisted review of reported content\n• Human review for escalated cases\n\nViolations follow our strike system: Warning → 7-day suspension → Permanent ban.")
            LegalSection("6. Daily Limits",
                "Free accounts are subject to daily limits:\n• 50 likes per day\n• 10 rewinds per day\n• Up to 3 family members\nThese limits reset at midnight in your local timezone.")
            LegalSection("7. Account Termination",
                "You may delete your account at any time through Settings. Your account will be deactivated immediately and permanently deleted after 30 days. You can reactivate by logging in within the 30-day window.\n\nWe reserve the right to suspend or terminate accounts that violate these terms.")
            LegalSection("8. Disclaimer",
                "MitiMaiti is provided \"as is\" without warranties of any kind. We do not guarantee matches, compatibility, or outcomes. Cultural and kundli scores are based on self-reported data and are for reference only.")
            LegalSection("9. Contact",
                "For questions about these Terms, contact us at legal@mitimaiti.com or through the in-app support feature.")

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
