package com.mitimaiti.app.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.models.CulturalBadge
import com.mitimaiti.app.models.LikedYouCard
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors
import com.mitimaiti.app.viewmodels.InboxViewModel

@Composable
fun LikedYouScreen(viewModel: InboxViewModel) {
    val colors = LocalAdaptiveColors.current
    val likes by viewModel.likes.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize().background(colors.backgroundGradient).statusBarsPadding()
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Liked You", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                if (likes.isNotEmpty()) {
                    Text("${likes.size} people", fontSize = 14.sp, color = colors.textSecondary)
                }
            }
        }

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AppColors.Rose)
            }
        } else if (likes.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                    Icon(Icons.Default.FavoriteBorder, "No likes", tint = colors.textMuted, modifier = Modifier.size(64.dp))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("No likes yet", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("When someone likes your profile, they'll appear here", fontSize = 15.sp, color = colors.textSecondary, textAlign = TextAlign.Center)
                }
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                items(likes, key = { it.id }) { like ->
                    LikeCard(
                        like = like,
                        onLikeBack = { viewModel.likeBack(like.id) },
                        onPass = { viewModel.passLike(like.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun LikeCard(like: LikedYouCard, onLikeBack: () -> Unit, onPass: () -> Unit) {
    val colors = LocalAdaptiveColors.current
    val user = like.user

    Card(
        shape = RoundedCornerShape(AppTheme.radiusLg),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface)
    ) {
        Box(modifier = Modifier.fillMaxWidth().aspectRatio(0.75f)) {
            // Photo
            AsyncImage(
                model = user.primaryPhoto?.url ?: "",
                contentDescription = user.displayName,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )

            // Bottom gradient
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.55f)
                    .align(Alignment.BottomCenter)
                    .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.8f))))
            )

            // Cultural badge
            val badgeColor = when (like.culturalBadge) {
                CulturalBadge.GOLD -> AppColors.BadgeGold
                CulturalBadge.GREEN -> AppColors.BadgeGreen
                CulturalBadge.ORANGE -> AppColors.BadgeOrange
                CulturalBadge.NONE -> colors.textMuted
            }
            Surface(
                shape = RoundedCornerShape(AppTheme.radiusFull),
                color = badgeColor.copy(alpha = 0.2f),
                modifier = Modifier.align(Alignment.TopEnd).padding(8.dp)
            ) {
                Text(
                    "${like.culturalScore}%",
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = badgeColor
                )
            }

            // Info at bottom
            Column(
                modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(10.dp)
            ) {
                Text(
                    "${user.displayName}, ${user.age ?: ""}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (user.city.isNotEmpty()) {
                    Text(user.city, fontSize = 12.sp, color = Color.White.copy(alpha = 0.7f))
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    // Pass button
                    IconButton(
                        onClick = onPass,
                        modifier = Modifier.size(40.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.2f))
                    ) {
                        Icon(Icons.Default.Close, "Pass", tint = Color.White, modifier = Modifier.size(20.dp))
                    }
                    // Like back button
                    IconButton(
                        onClick = onLikeBack,
                        modifier = Modifier.size(40.dp).clip(CircleShape).background(AppColors.Rose.copy(alpha = 0.8f))
                    ) {
                        Icon(Icons.Default.Favorite, "Like Back", tint = Color.White, modifier = Modifier.size(20.dp))
                    }
                }
            }
        }
    }
}
