// The Android adaptive icon's foreground: the gold word alone on a transparent square. Android masks
// the icon to a circle or squircle, so the word stays inside the middle 66% (the safe zone).
// Usage: swift tools/android/icon.swift <Amiri Bold font file> <out.png> <size in px>
import AppKit
import CoreText

let args = CommandLine.arguments
let fontURL = URL(fileURLWithPath: args[1]), out = args[2], size = Int(args[3])!
guard let descs = CTFontManagerCreateFontDescriptorsFromURL(fontURL as CFURL) as? [CTFontDescriptor], let d = descs.first else {
  print("font load failed"); exit(1)
}
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0, space: cs,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
func c(_ h: UInt32) -> CGColor { CGColor(colorSpace: cs, components: [CGFloat((h >> 16) & 255) / 255, CGFloat((h >> 8) & 255) / 255, CGFloat(h & 255) / 255, 1])! }
let S = CGFloat(size)
let word = "الشاطبية"
func line(_ pt: CGFloat) -> CTLine {
  let f = CTFontCreateWithFontDescriptor(d, pt, nil)
  return CTLineCreateWithAttributedString(NSAttributedString(string: word, attributes: [.font: f]))
}
var l = line(300)
var b = CTLineGetBoundsWithOptions(l, .useGlyphPathBounds)
l = line(300 * (S * 0.54) / b.width)
b = CTLineGetBoundsWithOptions(l, .useGlyphPathBounds)
let ox = (S - b.width) / 2 - b.minX, oy = (S - b.height) / 2 - b.minY
ctx.setTextDrawingMode(.clip)
ctx.textPosition = CGPoint(x: ox, y: oy)
CTLineDraw(l, ctx)
let gold = CGGradient(colorsSpace: cs, colors: [c(0xf3dda0), c(0xd4af62), c(0xa47c38)] as CFArray, locations: [0, 0.5, 1])!
ctx.drawLinearGradient(gold, start: CGPoint(x: ox + b.minX, y: oy + b.maxY), end: CGPoint(x: ox + b.minX + b.width * 0.8, y: oy + b.minY), options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
let rep = NSBitmapImageRep(cgImage: ctx.makeImage()!)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
