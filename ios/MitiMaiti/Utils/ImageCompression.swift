import UIKit

extension UIImage {
    /// Returns JPEG data, downsizing if larger than `maxBytes`.
    /// Reduces dimensions first (max 1600px), then iteratively lowers quality
    /// until under the limit. Returns nil if encoding fails.
    func compressedForUpload(maxBytes: Int = 2 * 1024 * 1024, maxDimension: CGFloat = 1600) -> Data? {
        let scaled = self.resizedKeeping(maxDimension: maxDimension)
        var quality: CGFloat = 0.85
        var data = scaled.jpegData(compressionQuality: quality)
        while let d = data, d.count > maxBytes, quality > 0.3 {
            quality -= 0.1
            data = scaled.jpegData(compressionQuality: quality)
        }
        return data
    }

    private func resizedKeeping(maxDimension: CGFloat) -> UIImage {
        let longest = max(size.width, size.height)
        guard longest > maxDimension else { return self }
        let scale = maxDimension / longest
        let newSize = CGSize(width: size.width * scale, height: size.height * scale)
        UIGraphicsBeginImageContextWithOptions(newSize, true, 1.0)
        defer { UIGraphicsEndImageContext() }
        draw(in: CGRect(origin: .zero, size: newSize))
        return UIGraphicsGetImageFromCurrentImageContext() ?? self
    }
}
