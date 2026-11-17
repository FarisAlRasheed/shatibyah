import UIKit
import Capacitor

/// The app's own bridge view controller (SceneDelegate and Main.storyboard use it), so local plugins can be registered.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppIconPlugin())
    }
}

/// Lets الإعدادات switch the home-screen icon to one of the alternate icons in Assets.xcassets
/// (<name>.appiconset, e.g. AppIcon-GoldGreen, made by tools/ios/icons.sh). An empty name means the default icon,
/// which follows light and dark mode. JavaScript side: src/appIcon.ts.
@objc(AppIconPlugin)
public class AppIconPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppIconPlugin"
    public let jsName = "AppIcon"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
    ]

    @objc func get(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            call.resolve([
                "name": UIApplication.shared.alternateIconName ?? "",
                "supported": UIApplication.shared.supportsAlternateIcons,
            ])
        }
    }

    @objc func set(_ call: CAPPluginCall) {
        let name = call.getString("name") ?? ""
        DispatchQueue.main.async {
            guard UIApplication.shared.supportsAlternateIcons else { return call.reject("Alternate icons are not supported") }
            UIApplication.shared.setAlternateIconName(name.isEmpty ? nil : name) { error in
                if let error { call.reject(error.localizedDescription) } else { call.resolve() }
            }
        }
    }
}
