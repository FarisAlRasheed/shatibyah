// Dump PDFKit page.string (reading order) for a page range as JSON {"<page>": "<string>"}.
// Usage: swift tools/extract/pdfkit-strings.swift <pdf> <first> <last> <out.json>   (1-based PDF pages)
import Foundation
import PDFKit
let a = CommandLine.arguments
guard a.count >= 5, let doc = PDFDocument(url: URL(fileURLWithPath: a[1])),
      let f = Int(a[2]), let l = Int(a[3]) else { print("usage: pdfkit-strings.swift <pdf> <first> <last> <out.json>"); exit(1) }
var out: [String: String] = [:]
for n in f...min(l, doc.pageCount) { out[String(n)] = doc.page(at: n - 1)?.string ?? "" }
let data = try! JSONSerialization.data(withJSONObject: out, options: [.sortedKeys])
try! data.write(to: URL(fileURLWithPath: a[4]))
print("wrote \(out.count) pages to \(a[4])")
