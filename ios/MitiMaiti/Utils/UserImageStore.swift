import SwiftUI
import UIKit

/// Persists the user's profile photo to disk so it's available app-wide.
@MainActor
class UserImageStore: ObservableObject {
    static let shared = UserImageStore()

    @Published var profileImage: UIImage?

    private let fileURL: URL = {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        return docs.appendingPathComponent("profile_photo.jpg")
    }()

    init() {
        loadFromDisk()
    }

    func save(_ image: UIImage) {
        profileImage = image
        if let data = image.jpegData(compressionQuality: 0.8) {
            try? data.write(to: fileURL)
        }
    }

    func clear() {
        profileImage = nil
        try? FileManager.default.removeItem(at: fileURL)
    }

    private func loadFromDisk() {
        if let data = try? Data(contentsOf: fileURL),
           let image = UIImage(data: data) {
            profileImage = image
        }
    }
}
