package com.mitimaiti.app.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.ByteArrayOutputStream
import kotlin.math.max

object ImageCompression {
    private const val MAX_DIMENSION = 1600
    private const val MAX_BYTES = 2 * 1024 * 1024

    /** Read image at [uri], downsize, and JPEG-compress to under MAX_BYTES. */
    fun compressForUpload(context: Context, uri: Uri): ByteArray? {
        val bitmap = decodeSampled(context, uri) ?: return null
        val scaled = downscale(bitmap, MAX_DIMENSION)
        var quality = 85
        var bytes = encode(scaled, quality)
        while (bytes.size > MAX_BYTES && quality > 30) {
            quality -= 10
            bytes = encode(scaled, quality)
        }
        return bytes
    }

    private fun decodeSampled(context: Context, uri: Uri): Bitmap? {
        // First pass: read bounds only
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
        val longest = max(bounds.outWidth, bounds.outHeight)
        var sample = 1
        while (longest / sample > MAX_DIMENSION * 2) sample *= 2

        val opts = BitmapFactory.Options().apply { inSampleSize = sample }
        return context.contentResolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, opts)
        }
    }

    private fun downscale(bitmap: Bitmap, maxDim: Int): Bitmap {
        val longest = max(bitmap.width, bitmap.height)
        if (longest <= maxDim) return bitmap
        val scale = maxDim.toFloat() / longest
        val w = (bitmap.width * scale).toInt()
        val h = (bitmap.height * scale).toInt()
        return Bitmap.createScaledBitmap(bitmap, w, h, true)
    }

    private fun encode(bitmap: Bitmap, quality: Int): ByteArray {
        val out = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, quality, out)
        return out.toByteArray()
    }
}
