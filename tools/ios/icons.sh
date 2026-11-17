#!/bin/zsh
# Makes every app icon from tools/ios/calligraphy.png:
#   - the default iOS icon: green on cream (light mode), gold on green (dark mode), and the tinted version
#   - the alternate iOS icons the user can pick in الإعدادات (names must match APP_ICONS in src/appIcon.ts)
#   - small previews of those for the settings screen (src/assets/app-icons)
#   - the web icons (gold on green)
# Run from anywhere: tools/ios/icons.sh
set -e
setopt null_glob
cd "${0:A:h}/../.."
SRC=tools/ios/calligraphy.png
XC=ios/App/App/Assets.xcassets
PREV=src/assets/app-icons
TMP=$(mktemp -d)
swiftc -O tools/ios/icon.swift -o $TMP/icon

render() { $TMP/icon $SRC "$@" }

# Colour pairs: background top, background bottom, ink ×3.
GOLD_GREEN=(21443a 132a22 f6e2aa e0bd6e c09650)
WHITE_GREEN=(1f5a45 143d2f ffffff ffffff f1ece0)
GREEN_CREAM=(faf5e8 efe6d0 1f5a45 1a4a39 123628)
GOLD_BLACK=(1c1c1e 0b0b0c f6e2aa e0bd6e c09650)
WHITE_NAVY=(1d3557 0f1f36 ffffff ffffff eef2f8)
GREEN_WHITE=(ffffff f2f2f2 1f5a45 1a4a39 123628)
TINTED=(000000 000000 ffffff ffffff ffffff)

# Default icon with its light, dark and tinted appearances.
D=$XC/AppIcon.appiconset
rm -f $D/*.png
render $D/light.png $GREEN_CREAM
render $D/dark.png $GOLD_GREEN
render $D/tinted.png $TINTED
cat > $D/Contents.json <<'EOF'
{
  "images" : [
    { "filename" : "light.png", "idiom" : "universal", "platform" : "ios", "size" : "1024x1024" },
    { "appearances" : [ { "appearance" : "luminosity", "value" : "dark" } ], "filename" : "dark.png", "idiom" : "universal", "platform" : "ios", "size" : "1024x1024" },
    { "appearances" : [ { "appearance" : "luminosity", "value" : "tinted" } ], "filename" : "tinted.png", "idiom" : "universal", "platform" : "ios", "size" : "1024x1024" }
  ],
  "info" : { "author" : "xcode", "version" : 1 }
}
EOF

# Alternate icons (one fixed look each) and their settings previews.
mkdir -p $PREV
alt() { # name preview-id colours...
  local name=$1 id=$2; shift 2
  local dir=$XC/AppIcon-$name.appiconset
  mkdir -p $dir; rm -f $dir/*.png
  render $dir/icon.png "$@"
  cat > $dir/Contents.json <<'EOF'
{
  "images" : [ { "filename" : "icon.png", "idiom" : "universal", "platform" : "ios", "size" : "1024x1024" } ],
  "info" : { "author" : "xcode", "version" : 1 }
}
EOF
  sips -s format png -z 120 120 $dir/icon.png --out $PREV/$id.png >/dev/null
}
alt GoldGreen gold-green $GOLD_GREEN
alt WhiteGreen white-green $WHITE_GREEN
alt GreenCream green-cream $GREEN_CREAM
alt GoldBlack gold-black $GOLD_BLACK
alt WhiteNavy white-navy $WHITE_NAVY
alt GreenWhite green-white $GREEN_WHITE

# Web icons: gold on green.
render $TMP/web.png $GOLD_GREEN
sips -z 512 512 $TMP/web.png --out public/icon-512.png >/dev/null
sips -z 192 192 $TMP/web.png --out public/icon-192.png >/dev/null
sips -z 180 180 $TMP/web.png --out public/apple-touch-icon.png >/dev/null

rm -rf $TMP
echo "icons done"
