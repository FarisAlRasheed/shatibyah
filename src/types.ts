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
}
