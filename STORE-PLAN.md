# Store publishing plan (2026-11-17)

How to get «الشاطبية» onto the App Store and Google Play. Nothing here is built yet; the open decisions in the last section come first. The rules of `UX-PLAN.md` still apply.

## Where the app stands

| Area | State |
|---|---|
| Web app | Live on Vercel, installable offline PWA |
| iOS shell | Capacitor 8 project in `ios/`, bundle ID `com.farisalrasheed.shatibyah`, version 1.0 (1), iPhone + iPad, iOS 15+, background audio enabled, 1024 px icon |
| iOS signing | A team ID is set in the Xcode project; whether it is the paid programme is not confirmed |
| Android | Capacitor project in `android/` (2026-11-17), same app ID, adaptive icon; a debug APK builds. Not run on a device yet; background audio, back button and release signing still to do (phase 3) |
| App size | 73 MB, of which 72 MB is the bundled audio and data |
| User data | Kept in the web view's local storage only; no account, no server, no analytics |
| Network use | None, except the WhatsApp contact link |
| Git | The iOS work and the last features are not committed |

## Phase 0: decisions and paperwork (before any code)

1. Settle the open decisions below.
2. Content permissions (see decision 1). This is the one thing that can get the app rejected or removed, so it starts first and runs in parallel with everything else.
3. Developer accounts:
   - Apple Developer Program: 99 USD per year. Enrolment usually takes one to two days.
   - Google Play Console: 25 USD once, plus identity verification. A new personal account must run a closed test with at least 12 testers for 14 days before it may publish to production. Plan about three weeks for this.
4. Commit the current work so the release starts from a clean tree.

## Phase 1: make the iOS app release-ready

1. Real-device checks still open: lock-screen playback, repeat with pauses, pinch zoom, sepia theme, wird strip with a real plan, backup share sheet, listener mode. Fix what fails.
2. Protect user data: keep a second copy of the store in native storage (the earlier "phase 2"). iOS may clear a web view's local storage; a memorization plan and notes must not vanish after an update.
3. Lock-screen and Control Centre: title, باب name, play, pause, next and previous verse.
4. Audio interruptions: phone call, alarm, headphones unplugged, another app playing.
5. Store compliance files: privacy manifest, the "no non-exempt encryption" key in `Info.plist`.
6. iPad pass: all four orientations, split view, the Mac side panel layout on wide screens.
7. Launch screen and dark-mode launch colour.
8. In-app «عن التطبيق»: version, sources and credits (edition, reciter, commentary), contact, privacy policy link.

## Phase 2: App Store submission

1. Privacy policy page and support page on the Vercel site (both URLs are required).
2. App Store Connect record: name, subtitle, description and keywords in Arabic (English optional), category, age rating, privacy answers ("data not collected").
3. Screenshots: iPhone 6.9 inch and iPad 13 inch sets, taken from the simulator.
4. Archive and upload from Xcode, then TestFlight on the owner's iPhone and iPad, optionally a few outside testers.
5. Submit for review. First reviews usually take one to three days; a rejection round adds a few more.
6. Release, then check the store listing on a real device.

## Phase 3: Android app

1. Done 2026-11-17: `@capacitor/android` added, one shared build (`npm run build:app` → `dist-app`) for both platforms, Android icon and launch screen. Java 21 and the Android SDK live in `~/Library/Android`.
2. Background playback. This is the largest Android task: a web view's audio is stopped in the background unless the app runs a media foreground service with a notification. It needs a plugin or a small piece of native code, then testing with the repeat engine and its pauses.
3. Android behaviours: system back button and gesture, edge-to-edge insets, status bar colours, backup export and import through the system file picker.
4. Rendering check in Android's web view: kashida and equal half-lines, the four fonts, pinch zoom, Arabic digits. It is a different engine from iOS, so the verse layout needs its own look.
5. Test on a real Android phone (an emulator does not prove background audio).
6. Adaptive icon, splash screen, release signing key with Play App Signing, app bundle build.

## Phase 4: Google Play submission

1. Store listing: Arabic texts, phone screenshots, 512 px icon, 1024 x 500 feature graphic.
2. Forms: data safety (nothing collected), content rating, target audience, ads declaration (none).
3. Internal test, then the closed test (12 testers, 14 days, for a new personal account), then apply for production access.
4. Production release.

## Phase 5: after launch

1. One release routine for all three targets (web, iOS, Android) with a shared version number.
2. Updates carry the features left out of 1.0 (decision 2).
3. Keep both store accounts in good standing: yearly Apple fee, yearly target-API update on Play.

## Rough timeline

| Track | Time |
|---|---|
| Permissions | Unknown; depends on the rights holders |
| iOS, phases 1 and 2 | About one to two weeks of work, plus review |
| Android, phases 3 and 4 | About one to two weeks of work, plus roughly three weeks of Play testing rules |

## Open decisions for the owner

1. **Content permissions.** The poem is public domain, but three things in the app belong to others: the recitation of د. محمود بن حليم (from a-alqasim.com), the Qasim edition's text work, and «الوافي» (the author died in 1982, so it is still under copyright in most countries). Stores ask the developer to confirm they hold the rights, and a complaint removes the app.
2. **What goes in version 1.0.** Not built yet: second commentary «سراج القارئ», explanation mode with inline cards, search in explanations, full ayah for green words, the small extras.
3. **Order of the stores.** iOS first and Android after, or both at the same launch.
4. **Accounts.** Is the Apple programme already paid? Publish under the owner's personal name or an organisation? (An organisation needs a D-U-N-S number, but on Play it skips the 12-tester rule.)
5. **Price.** Free with no ads and no purchases, or something else.
6. **Audio.** Keep it inside the app (73 MB download, works offline at once) or download it on first launch (small app, needs hosting and a download screen).
7. **Name and ID.** App Store names must be unique, and «الشاطبية» alone is probably taken. The bundle ID `com.farisalrasheed.shatibyah` can never change after the first upload.
8. **Contact.** The app links to the owner's WhatsApp number; in a public app every user sees it.
