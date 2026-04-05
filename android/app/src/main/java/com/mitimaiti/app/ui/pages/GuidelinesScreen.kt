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
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuidelinesScreen(onBack: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Community Guidelines", fontWeight = FontWeight.Bold, color = colors.textPrimary) },
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

            LegalSection("1. Be Authentic",
                "Use your real name and recent photos. Represent yourself honestly — your age, occupation, and intentions. Fake profiles undermine trust in our community.")
            LegalSection("2. Be Respectful",
                "Treat every member with dignity. No harassment, hate speech, or discrimination based on gender, religion, caste, or background. Respect boundaries — if someone isn't interested, move on gracefully.")
            LegalSection("3. Keep It Safe",
                "Never share personal financial information. Don't ask for money or make financial requests. Report suspicious behavior immediately. Meet in public places for first dates.")
            LegalSection("4. Zero Tolerance",
                "The following result in permanent removal:\n• Sexual harassment or unsolicited explicit content\n• Threats of violence or intimidation\n• Impersonation or catfishing\n• Scams or financial exploitation\n• Sharing others' private information\n• Underage users")
            LegalSection("5. Photo Guidelines",
                "All photos must be of you. No group photos as your primary photo. No explicit or suggestive content. No photos of minors. Selfie verification may be required.")
            LegalSection("6. Family Mode Etiquette",
                "Family members must respect the user's privacy. Messages are never visible to family. Suggestions should be made respectfully. The primary user has full control over permissions.")
            LegalSection("7. Strike System",
                "• First violation: Warning\n• Second violation: 7-day suspension\n• Third violation: Permanent ban\n\nSevere violations may result in immediate permanent removal.")
            LegalSection("8. Report a Concern",
                "Use the in-app report feature on any profile or message. Reports are reviewed within 24 hours. Your identity is kept confidential. False reports may result in action against your account.")

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
internal fun LegalSection(title: String, body: String) {
    val colors = LocalAdaptiveColors.current
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(title, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
        Text(body, fontSize = 15.sp, color = colors.textSecondary, lineHeight = 22.sp)
    }
}
