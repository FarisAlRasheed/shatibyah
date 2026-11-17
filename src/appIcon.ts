import goldGreen from './assets/app-icons/gold-green.png'
import whiteGreen from './assets/app-icons/white-green.png'
import greenCream from './assets/app-icons/green-cream.png'
import goldBlack from './assets/app-icons/gold-black.png'
import whiteNavy from './assets/app-icons/white-navy.png'
import greenWhite from './assets/app-icons/green-white.png'
import { NATIVE } from './native'

/**
 * The home-screen icons the user can pick in الإعدادات (iOS app only).
 * `name` is the alternate icon set in Xcode (<name>.appiconset, made by tools/ios/icons.sh);
 * '' is the default icon, which is green on cream in light mode and gold on green in dark mode.
 */
export const APP_ICONS: { name: string; label: string; preview: string }[] = [
  { name: 'AppIcon-GoldGreen', label: 'ذهبي على أخضر', preview: goldGreen },
  { name: 'AppIcon-WhiteGreen', label: 'أبيض على أخضر', preview: whiteGreen },
  { name: 'AppIcon-GreenCream', label: 'أخضر على عاجي', preview: greenCream },
  { name: 'AppIcon-GoldBlack', label: 'ذهبي على أسود', preview: goldBlack },
  { name: 'AppIcon-WhiteNavy', label: 'أبيض على كحلي', preview: whiteNavy },
  { name: 'AppIcon-GreenWhite', label: 'أخضر على أبيض', preview: greenWhite },
]
export const AUTO_ICON = { light: greenCream, dark: goldGreen }

type AppIconPlugin = {
  get(): Promise<{ name: string; supported: boolean }>
  set(o: { name: string }): Promise<void>
}

let plugin: Promise<AppIconPlugin | null> | null = null
/** The native AppIcon plugin (ios/App/App/AppIconPlugin.swift), or null outside the iOS app. */
export function appIconPlugin(): Promise<AppIconPlugin | null> {
  if (!NATIVE) return Promise.resolve(null)
  plugin ??= import('@capacitor/core').then(({ Capacitor, registerPlugin }) => {
    if (Capacitor.getPlatform() !== 'ios') return null
    // Wrapped in a plain object: Capacitor's plugin proxy answers every property, including `then`,
    // so resolving a promise with it directly would never settle.
    const native = registerPlugin<AppIconPlugin>('AppIcon')
    return { get: () => native.get(), set: (o: { name: string }) => native.set(o) }
  })
  return plugin
}
