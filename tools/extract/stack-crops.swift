// Stack crops from page PNGs into one image, with a label column on the left.
// Usage: swift tools/extract/stack-crops.swift <spec.json>
// spec.json: [{"out": "x.png", "items": [{"img": "p017.png", "x": 0, "y": 0, "w": 1100, "h": 116, "label": "1a"}, ...]}, ...]
// x/y/w/h in pixels of the source image (origin top-left). One output image per entry.
import AppKit
let spec = try! JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))) as! [[String: Any]]
var cache: [String: CGImage] = [:]
func load(_ p: String) -> CGImage {
  if let c = cache[p] { return c }
  let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: p) as CFURL, nil)!
  let img = CGImageSourceCreateImageAtIndex(src, 0, nil)!
  cache[p] = img; return img
}
let labelW = 90
for e in spec {
  let items = e["items"] as! [[String: Any]]
  let W = labelW + (items.map { $0["w"] as! Int }.max() ?? 0)
  let H = items.map { ($0["h"] as! Int) + 4 }.reduce(0, +)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: W, pixelsHigh: H, bitsPerSample: 8, samplesPerPixel: 4,
                             hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  let ctx = NSGraphicsContext(bitmapImageRep: rep)!
  NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = ctx
  let cg = ctx.cgContext
  cg.setFillColor(NSColor.white.cgColor); cg.fill(CGRect(x: 0, y: 0, width: W, height: H))
  var top = 0
  for it in items {
    let x = it["x"] as! Int, y = it["y"] as! Int, w = it["w"] as! Int, h = it["h"] as! Int
    let img = load(it["img"] as! String)
    if let crop = img.cropping(to: CGRect(x: x, y: y, width: w, height: h)) {
      cg.draw(crop, in: CGRect(x: labelW, y: H - top - h, width: crop.width, height: crop.height))
    }
    cg.setFillColor(NSColor(white: 0.6, alpha: 1).cgColor)
    cg.fill(CGRect(x: 0, y: H - top - h - 4, width: W, height: 2))
    let s = NSAttributedString(string: it["label"] as! String, attributes: [.font: NSFont.boldSystemFont(ofSize: 26), .foregroundColor: NSColor.red])
    s.draw(at: NSPoint(x: 4, y: H - top - h / 2 - 14))
    top += h + 4
  }
  NSGraphicsContext.restoreGraphicsState()
  try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: e["out"] as! String))
}
print("wrote \(spec.count) images")
