package com.mitimaiti.app.ui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mitimaiti.app.ui.theme.AppColors
import com.mitimaiti.app.ui.theme.AppTheme
import com.mitimaiti.app.ui.theme.LocalAdaptiveColors

/**
 * A ModalBottomSheet that lets the user pick a new primary profile photo.
 *
 * Options:
 *  1. Choose from Gallery — launches the system PickVisualMedia picker and adds the new URI
 *     to PhotoRepository before setting it as primary.
 *  2. Choose from uploaded photos — shows a grid of photos already in PhotoRepository;
 *     tapping one calls [onSetPrimary] with its index so the caller can move it to index 0.
 *
 * @param existingPhotos  Current list of URIs from PhotoRepository.
 * @param onDismiss       Called when the sheet should be hidden.
 * @param onNewPhotoFromGallery Called with the new URI chosen from the gallery; the caller is
 *                        responsible for adding it to PhotoRepository and promoting it to primary.
 * @param onSetPrimary    Called with the index of an existing photo that should become primary.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PrimaryPhotoPickerSheet(
    existingPhotos: List<Uri>,
    onDismiss: () -> Unit,
    onNewPhotoFromGallery: (Uri) -> Unit,
    onSetPrimary: (index: Int) -> Unit
) {
    val colors = LocalAdaptiveColors.current

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri != null) {
            onNewPhotoFromGallery(uri)
            onDismiss()
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = colors.surface,
        dragHandle = { BottomSheetDefaults.DragHandle() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp)
                .padding(bottom = 24.dp)
        ) {
            Text(
                "Change Profile Photo",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            // Choose from Gallery button
            Button(
                onClick = {
                    galleryLauncher.launch(
                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(AppTheme.radiusMd),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Rose)
            ) {
                Icon(
                    Icons.Default.PhotoLibrary,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = Color.White
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Choose from Gallery",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }

            // Uploaded photos grid — only shown when there are photos beyond the primary
            if (existingPhotos.size > 1) {
                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    "Choose from uploaded photos",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.textSecondary,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                // Height must be bounded so the sheet doesn't grow unbounded
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 360.dp)
                ) {
                    itemsIndexed(existingPhotos) { index, uri ->
                        val isPrimary = index == 0
                        Box(
                            modifier = Modifier
                                .aspectRatio(0.75f)
                                .clip(RoundedCornerShape(AppTheme.radiusMd))
                                .then(
                                    if (isPrimary)
                                        Modifier.border(
                                            2.dp,
                                            AppColors.Gold,
                                            RoundedCornerShape(AppTheme.radiusMd)
                                        )
                                    else
                                        Modifier.border(
                                            1.dp,
                                            colors.border,
                                            RoundedCornerShape(AppTheme.radiusMd)
                                        )
                                )
                                .clickable(enabled = !isPrimary) {
                                    onSetPrimary(index)
                                    onDismiss()
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            AsyncImage(
                                model = uri,
                                contentDescription = "Photo ${index + 1}",
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(RoundedCornerShape(AppTheme.radiusMd)),
                                contentScale = ContentScale.Crop
                            )
                            // Primary indicator overlay
                            if (isPrimary) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .background(
                                            AppColors.Gold.copy(alpha = 0.25f),
                                            RoundedCornerShape(AppTheme.radiusMd)
                                        )
                                )
                                Surface(
                                    shape = RoundedCornerShape(
                                        topStart = AppTheme.radiusMd,
                                        topEnd = 0.dp,
                                        bottomStart = 0.dp,
                                        bottomEnd = 0.dp
                                    ),
                                    color = AppColors.Gold,
                                    modifier = Modifier.align(Alignment.TopStart)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Check,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(10.dp)
                                        )
                                        Spacer(modifier = Modifier.width(2.dp))
                                        Text(
                                            "MAIN",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
