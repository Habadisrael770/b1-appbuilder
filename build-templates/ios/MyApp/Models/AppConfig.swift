import UIKit

/**
 AppConfig - Singleton for app configuration
 
 Manages all app-wide configuration including:
 - Website URL
 - App name and branding
 - Colors and theming
 - API endpoints
 */
class AppConfig {
    static let shared = AppConfig()
    
    // MARK: - Properties
    var appName: String = "B1 App"
    var websiteUrl: String = "https://example.com"
    var appId: String = "com.b1appbuilder"
    var appVersion: String = "1.0.0"
    
    // Colors
    var primaryColor: UIColor = UIColor(red: 0, green: 122/255, blue: 1, alpha: 1) // #007AFF
    var primaryDarkColor: UIColor = UIColor(red: 0, green: 81/255, blue: 186/255, alpha: 1) // #0051BA
    var accentColor: UIColor = UIColor(red: 0, green: 122/255, blue: 1, alpha: 1) // #007AFF
    
    // MARK: - Initialization
    private init() {
        loadConfiguration()
    }
    
    // MARK: - Configuration Loading
    private func loadConfiguration() {
        // Load from config.json if available
        if let configPath = Bundle.main.path(forResource: "config", ofType: "json"),
           let data = try? Data(contentsOf: URL(fileURLWithPath: configPath)),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            
            if let appName = json["appName"] as? String {
                self.appName = appName
            }
            
            if let websiteUrl = json["websiteUrl"] as? String {
                self.websiteUrl = websiteUrl
            }
            
            if let appId = json["appId"] as? String {
                self.appId = appId
            }
            
            if let appVersion = json["appVersion"] as? String {
                self.appVersion = appVersion
            }
            
            if let colorHex = json["primaryColor"] as? String {
                self.primaryColor = UIColor(hex: colorHex) ?? self.primaryColor
            }
        }
    }
    
    // MARK: - Utility Methods
    func getAppInfo() -> [String: Any] {
        return [
            "appName": appName,
            "appId": appId,
            "appVersion": appVersion,
            "platform": "iOS",
            "osVersion": UIDevice.current.systemVersion,
            "deviceModel": UIDevice.current.model
        ]
    }
}

// MARK: - UIColor Extension for Hex Colors
extension UIColor {
    convenience init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespaces)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
        
        var rgb: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&rgb)
        
        let red = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
        let green = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
        let blue = CGFloat(rgb & 0x0000FF) / 255.0
        
        self.init(red: red, green: green, blue: blue, alpha: 1.0)
    }
}
