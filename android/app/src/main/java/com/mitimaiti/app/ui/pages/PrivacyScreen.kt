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
fun PrivacyScreen(onBack: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Privacy Policy", fontWeight = FontWeight.Bold, color = colors.textPrimary) },
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

            LegalSection("1. Introduction",
                "MitiMaiti (\"we\", \"our\", \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our mobile application and services.")
            LegalSection("2. Information We Collect",
                "2.1 Information You Provide:\n• Phone number for authentication\n• Profile information (name, age, gender, photos, bio)\n• Cultural data (Sindhi fluency, dialect, community, gotra)\n• Kundli details (if provided)\n• Messages and chat content\n• Reports and feedback\n\n2.2 Information Collected Automatically:\n• Device information (model, OS version)\n• Usage data (features used, time spent)\n• IP address and approximate location\n• Notification interaction data")
            LegalSection("3. How We Use Your Information",
                "• To create and maintain your account\n• To match you with compatible users based on cultural and personal preferences\n• To facilitate messaging and connections\n• To verify your identity and ensure safety\n• To improve our services and algorithms\n• To send notifications about matches, messages, and app updates")
            LegalSection("4. Data Sharing",
                "We share data only with essential service providers:\n• Supabase (database and authentication)\n• AWS Rekognition (photo verification)\n• Firebase (push notifications)\n• Twilio (SMS verification)\n\nWe never sell your personal data to third parties.")
            LegalSection("5. Data Retention",
                "We retain your data while your account is active. Upon account deletion, your data is permanently removed within 30 days. Anonymized usage data may be retained for analytics.")
            LegalSection("6. Your Rights (GDPR / DPDP)",
                "You have the right to:\n• Access your personal data\n• Correct inaccurate data\n• Request deletion of your data\n• Export your data in a portable format\n• Withdraw consent for data processing\n• Object to automated decision-making")
            LegalSection("7. Security",
                "We implement industry-standard security measures including encryption in transit (TLS) and at rest, secure authentication tokens, and regular security audits.")
            LegalSection("8. Children's Privacy",
                "MitiMaiti is not intended for users under 18. We do not knowingly collect information from minors. If we discover an underage user, we will immediately delete their account.")
            LegalSection("9. Contact Us",
                "For privacy-related inquiries, contact us at privacy@mitimaiti.com or through the in-app support feature.")

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
