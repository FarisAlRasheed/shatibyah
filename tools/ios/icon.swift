// Renders one 1024×1024 app icon from the calligraphy in calligraphy.png.
// The pale paper is dropped, the ink becomes a mask, and the colours are painted through it.
//
//   swift icon.swift <calligraphy.png> <out.png> <bgTop> <bgBottom> <ink1> <ink2> <ink3> [thicken=1]
//
// Colours are hex without '#'. The background runs top to bottom; the ink colour runs
// diagonally (three stops, so gold reads as metal; pass one colour three times for a flat ink).
// Run tools/ios/icons.sh rather than this file directly: it makes every icon the app uses.
import AppKit

let a = CommandLine.arguments
guard a.count >= 8 else { print("usage: icon.swift src out bgTop bgBottom ink1 ink2 ink3 [thicken]"); exit(1) }
func hex(_ s: String) -> UInt32 { UInt32(s, radix: 16)! }
let thicken = a.count > 8 ? Int(a[8])! : 1

// 1. Read the calligraphy.
let src = NSImage(contentsOfFile: a[1])!.cgImage(forProposedRect: nil, context: nil, hints: nil)!
let w = src.width, h = src.height
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
var px = [UInt8](repeating: 0, count: w * h * 4)
CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: cs,
          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  .draw(src, in: CGRect(x: 0, y: 0, width: w, height: h))

// 2. Ink = how much darker a pixel is than the paper. Most of the image is paper, so the
//    75th-percentile brightness is the paper and the darkest 3% is solid ink.
var lum = [Double](repeating: 0, count: w * h)
for i in 0..<(w * h) { lum[i] = 0.3 * Double(px[i * 4]) + 0.59 * Double(px[i * 4 + 1]) + 0.11 * Double(px[i * 4 + 2]) }
let sorted = lum.sorted()
let paper = sorted[sorted.count * 3 / 4], ink = sorted[sorted.count * 3 / 100]
var m = [UInt8](repeating: 0, count: w * h)
for i in 0..<(w * h) {
  let t = ((paper - lum[i]) / (paper - ink) - 0.15) / 0.7 // tightened so the paper texture drops out
  m[i] = UInt8(max(0, min(1, t)) * 255)
}

// 3. Thicken the strokes (a round max filter) so the word holds up at home-screen size.
if thicken > 0 {
  var o = m
  for y in 0..<h { for x in 0..<w {
    var v: UInt8 = 0
    for dy in -thicken...thicken { for dx in -thicken...thicken where dx * dx + dy * dy <= thicken * thicken + thicken {
      let xx = x + dx, yy = y + dy
      if xx >= 0, yy >= 0, xx < w, yy < h { v = max(v, m[yy * w + xx]) }
    } }
    o[y * w + x] = v
  } }
  m = o
}

// 4. Crop the mask to the ink.
var x0 = w, y0 = h, x1 = 0, y1 = 0
for y in 0..<h { for x in 0..<w where m[y * w + x] > 60 { x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y) } }
let mask = CGContext(data: &m, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w,
                     space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.none.rawValue)!
  .makeImage()!.cropping(to: CGRect(x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1))!

// 5. Paint the icon: background, then the ink colour through the mask, 84% of the width.
let S: CGFloat = 1024
func color(_ v: UInt32) -> CGColor {
  CGColor(colorSpace: cs, components: [CGFloat((v >> 16) & 255) / 255, CGFloat((v >> 8) & 255) / 255, CGFloat(v & 255) / 255, 1])!
}
func gradient(_ c: [String]) -> CGGradient {
  CGGradient(colorsSpace: cs, colors: c.map { color(hex($0)) } as CFArray, locations: c.count == 2 ? [0, 1] : [0, 0.5, 1])!
}
let ctx = CGContext(data: nil, width: Int(S), height: Int(S), bitsPerComponent: 8, bytesPerRow: 0, space: cs,
                    bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
ctx.interpolationQuality = .high
ctx.drawLinearGradient(gradient([a[3], a[4]]), start: CGPoint(x: 0, y: S), end: .zero, options: [])
let mw = CGFloat(mask.width), mh = CGFloat(mask.height)
let k = min(S * 0.84 / mw, S * 0.72 / mh)
let r = CGRect(x: (S - mw * k) / 2, y: (S - mh * k) / 2, width: mw * k, height: mh * k)
ctx.clip(to: r, mask: mask)
ctx.drawLinearGradient(gradient([a[5], a[6], a[7]]), start: CGPoint(x: r.minX, y: r.maxY),
                       end: CGPoint(x: r.minX + r.width * 0.8, y: r.minY), options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
try! NSBitmapImageRep(cgImage: ctx.makeImage()!).representation(using: .png, properties: [:])!
  .write(to: URL(fileURLWithPath: a[2]))
