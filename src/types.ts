// Data contract from PLAN.md section 9.
export interface Section {
  id: number
  title: string
  kind: 'bab' | 'surah'
  parent: number | null
  start: number
  end: number
}

export interface Verse {
  n: number
  a: string
  b: string
}

export interface Range {
  from: number
  to: number
}

export interface Edition {
  id: string
  name: string
  source: string
  verseCount: number
  partial?: Range
  sections: Section[]
  verses: Verse[]
}

export interface AudioFile {
  id: string
  path: string
  sectionIds: number[]
  bytes: number
  sourceUrl?: string
  sourceStart?: number | null
  sourceEnd?: number | null
}

export interface VerseTiming {
  n: number
  file: string
  start: number
  end: number
  confidence: number
  checked?: boolean // the owner approved this cut by ear (tools/cut-editor.html)
}

export interface Reciter {
  id: string
  name: string
  editionId: string
  source: string
  partial?: Range
  files: AudioFile[]
  verses: VerseTiming[]
  notes?: unknown[]
}

export interface Manifest {
  editions: { id: string; name: string }[]
  reciters: { id: string; name: string; editionId: string }[]
  commentaries: { id: string; name: string; editionId: string }[]
}

/** A commentary on the poem (data/commentaries/<id>/book.json). */
export interface CommentaryBook {
  id: string
  name: string
  author: string
  source: string
  turathId: number
  editionId: string
  /** Edition sections that have a file s<id>.json, in reading order. */
  sections: number[]
}

export interface CommentaryNote {
  mark: string
  text: string
}

/** The explanation of verses `from`–`to` (the edition's numbers). */
export interface ExplanationBlock {
  intro?: false
  id: string
  from: number
  to: number
  page: number // printed page
  text: string[] // pieces, joined with a space
  breaks: number[] // a new paragraph starts before each of these pieces
  parts?: Record<string, number[]> // verse → the pieces about it
  partial?: true // second half of a verse explained in two blocks
  notes?: CommentaryNote[]
}

/** Text before verse `before`: a chapter's introduction. */
export interface IntroBlock {
  intro: true
  id: string
  title: string
  before: number
  page: number
  text: string[]
  breaks: number[]
  notes?: CommentaryNote[]
}

/** data/commentaries/<id>/s<sectionId>.json */
export interface CommentarySection {
  section: number
  blocks: (ExplanationBlock | IntroBlock)[]
}

/** A coloured piece of a verse half, as printed: red = a reader code, green = Quranic words. */
export interface ColorMark {
  h: 'a' | 'b'
  s: number // start offset in the half's text
  e: number // end offset (exclusive)
  k: 'r' | 'g'
  c?: string // red: key into EditionColors.codes
  q?: [number, number][] // green: [surah, ayah] places
  x?: string // green: a few words of the ayah
  w?: string // green: the whole Quran word or phrase when the colour splits it («ٱلۡـ / ـقِتَالُ»)
  note?: string
}

export interface ColorCode {
  kind: 'letter' | 'group' | 'word' | 'name'
  label: string
  note?: string
}

export interface EditionColors {
  edition: string
  codes: Record<string, ColorCode>
  verses: Record<string, ColorMark[]>
}

/** Where each page of the printed edition begins (data/editions/<id>/pages.json). */
export interface PrintedPage {
  page: number // number printed on the page
  pdf: number // page of the PDF
  from: number
  to: number
}

export interface EditionPages {
  edition: string
  pages: PrintedPage[]
}
