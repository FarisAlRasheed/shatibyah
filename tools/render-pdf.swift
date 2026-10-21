// Render PDF pages to PNG with macOS PDFKit (no installs needed).
// Usage: swift tools/render-pdf.swift <pdf> <outDir> <firstPage> <lastPage> [dpi=300]
// Page numbers are 1-based PDF page indexes (not the printed page numbers).
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count >= 5, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])),
      let first = Int(args[3]), let last = Int(args[4]) else {
  print("usage: render-pdf.swift <pdf> <outDir> <firstPage> <lastPage> [dpi]"); exit(1)
}
let dpi = args.count > 5 ? Double(args[5])! : 300
let outDir = URL(fileURLWithPath: args[2])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
for n in first...min(last, doc.pageCount) {
  guard let page = doc.page(at: n - 1) else { continue }
  let box = page.bounds(for: .mediaBox)
  let scale = dpi / 72
  let w = Int(box.width * scale), h = Int(box.height * scale)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
                             samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                             colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  let ctx = NSGraphicsContext(bitmapImageRep: rep)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = ctx
  ctx.cgContext.setFillColor(NSColor.white.cgColor)
  ctx.cgContext.fill(CGRect(x: 0, y: 0, width: w, height: h))
  ctx.cgContext.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: ctx.cgContext)
  NSGraphicsContext.restoreGraphicsState()
  let file = outDir.appendingPathComponent(String(format: "p%03d.png", n))
  try rep.representation(using: .png, properties: [:])!.write(to: file)
  print(file.path)
}
