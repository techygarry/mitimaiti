import Foundation

enum AppConfig {
    static let baseURL: String = env("API_BASE_URL") ?? defaultBaseURL
    static let socketURL: String = env("WS_URL") ?? defaultSocketURL
    static var useMockData: Bool = (env("USE_MOCK_DATA") ?? defaultUseMockData) == "true"

    private static var defaultUseMockData: String {
        #if DEBUG
        return "true"
        #else
        return "false"
        #endif
    }

    private static var defaultBaseURL: String {
        #if DEBUG
        return "http://localhost:4000/v1"
        #else
        return "https://api.mitimaiti.com/v1"
        #endif
    }

    private static var defaultSocketURL: String {
        #if DEBUG
        return "http://localhost:4001"
        #else
        return "https://ws.mitimaiti.com"
        #endif
    }

    private static func env(_ key: String) -> String? {
        guard let value = ProcessInfo.processInfo.environment[key], !value.isEmpty else { return nil }
        return value
    }
}
