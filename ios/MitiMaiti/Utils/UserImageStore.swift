import SwiftUI
import UIKit

/// Persists the user's profile photos to disk so they are available app-wide.
/// Index 0 is always the primary/avatar photo.
@MainActor
class UserImageStore: ObservableObject {
    static let shared = UserImageStore()

    // MARK: - Published

    /// All photos in order. Index 0 is the primary avatar.
    @Published var photos: [UIImage] = []

    /// Convenience accessor for the primary (first) photo.
    var profileImage: UIImage? { photos.first }

    // MARK: - Private

    private let storageDir: URL = {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let dir = docs.appendingPathComponent("profile_photos", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()

    /// Legacy single-photo path — kept so existing installs migrate their data.
    private let legacyFileURL: URL = {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        return docs.appendingPathComponent("profile_photo.jpg")
    }()

    // MARK: - Init

    init() {
        loadFromDisk()
    }

    // MARK: - Public API

    /// Save (or replace) the photo at a given index.
    /// Passing an index equal to `photos.count` appends a new photo.
    func save(_ image: UIImage, at index: Int = 0) {
        if index < photos.count {
            photos[index] = image
        } else {
            photos.append(image)
        }
        persistToDisk()
    }

    /// Append multiple photos at once (e.g. after onboarding).
    func setAll(_ images: [UIImage]) {
        photos = images
        persistToDisk()
    }

    /// Remove the photo at a given index and re-persist.
    func remove(at index: Int) {
        guard index < photos.count else { return }
        photos.remove(at: index)
        persistToDisk()
    }

    /// Move the photo at `index` to position 0, making it the primary/avatar photo.
    /// All other photos shift right by one to fill the gap. No-op if index is 0 or out of range.
    func setPrimary(at index: Int) {
        guard index > 0, index < photos.count else { return }
        let promoted = photos.remove(at: index)
        photos.insert(promoted, at: 0)
        persistToDisk()
    }

    /// Clear all stored photos.
    func clear() {
        photos = []
        // Remove every numbered file from the storage directory
        let existing = (try? FileManager.default.contentsOfDirectory(
            at: storageDir,
            includingPropertiesForKeys: nil
        )) ?? []
        for url in existing {
            try? FileManager.default.removeItem(at: url)
        }
        // Also remove legacy single-photo file
        try? FileManager.default.removeItem(at: legacyFileURL)
    }

    // MARK: - Disk I/O

    private func fileURL(for index: Int) -> URL {
        storageDir.appendingPathComponent("photo_\(index).jpg")
    }

    private func persistToDisk() {
        // Remove files beyond the current count so stale images don't linger
        for index in photos.count..<(photos.count + 20) {
            let url = fileURL(for: index)
            guard FileManager.default.fileExists(atPath: url.path) else { break }
            try? FileManager.default.removeItem(at: url)
        }
        for (index, image) in photos.enumerated() {
            if let data = image.jpegData(compressionQuality: 0.8) {
                try? data.write(to: fileURL(for: index))
            }
        }
    }

    private func loadFromDisk() {
        var loaded: [UIImage] = []
        var index = 0
        while true {
            let url = fileURL(for: index)
            guard let data = try? Data(contentsOf: url),
                  let image = UIImage(data: data) else { break }
            loaded.append(image)
            index += 1
        }

        if loaded.isEmpty {
            // Migrate legacy single-photo file if it exists
            if let data = try? Data(contentsOf: legacyFileURL),
               let image = UIImage(data: data) {
                loaded.append(image)
                // Persist in new format and clean up legacy file
                photos = loaded
                persistToDisk()
                try? FileManager.default.removeItem(at: legacyFileURL)
                return
            }
        }

        photos = loaded
    }
}
