// Explanation groups of a commentary (EXPLANATION-PLAN A). A group is one block, or blocks that share
// a verse: the book explains a few verses in two halves (229, 244, 405, 498), and those read as one.
import { loadCommentary, loadCommentarySection, sectionOf } from './data'
import type { CommentaryBook, CommentarySection, Edition, ExplanationBlock, IntroBlock } from './types'

export interface ExplainGroup {
  from: number
  to: number
  section: number // the file it is in
  blocks: ExplanationBlock[]
  /** A chapter's introduction, shown before the group's first verse. */
  intros: IntroBlock[]
}

const groupCache = new WeakMap<CommentarySection, ExplainGroup[]>()

export function groupsOf(file: CommentarySection): ExplainGroup[] {
  const hit = groupCache.get(file)
  if (hit) return hit
  const groups: ExplainGroup[] = []
  for (const b of file.blocks) {
    if (b.intro) continue
    const last = groups[groups.length - 1]
    if (last && b.from <= last.to) {
      last.blocks.push(b)
      last.to = Math.max(last.to, b.to)
    } else groups.push({ from: b.from, to: b.to, section: file.section, blocks: [b], intros: [] })
  }
  for (const b of file.blocks) {
    if (!b.intro) continue
    groups.find((g) => g.from <= b.before && b.before <= g.to)?.intros.push(b)
  }
  groupCache.set(file, groups)
  return groups
}

export interface Located {
  book: CommentaryBook
  group: ExplainGroup | null // null: the book has nothing on this verse
  /** Where the neighbouring groups start (they may be in another section file); null at either end. */
  prev: () => Promise<number | null>
  next: () => Promise<number | null>
}

/** The group that explains verse n in book `bookId`. */
export async function locate(bookId: string, edition: Edition, n: number): Promise<Located> {
  const book = await loadCommentary(bookId)
  const sectionId = sectionOf(edition, n)?.id
  const at = sectionId == null ? -1 : book.sections.indexOf(sectionId)
  const groups = at < 0 ? [] : groupsOf(await loadCommentarySection(bookId, sectionId!))
  const i = groups.findIndex((g) => g.from <= n && n <= g.to)
  const group = i < 0 ? null : groups[i]

  // Steps across section files: the last group of the file before, or the first of the file after.
  const across = async (d: 1 | -1) => {
    for (let k = at + d; k >= 0 && k < book.sections.length; k += d) {
      const gs = groupsOf(await loadCommentarySection(bookId, book.sections[k]))
      if (gs.length) return (d > 0 ? gs[0] : gs[gs.length - 1]).from
    }
    return null
  }
  return {
    book,
    group,
    prev: async () => (i > 0 ? groups[i - 1].from : at < 0 ? null : across(-1)),
    next: async () => (i >= 0 && i < groups.length - 1 ? groups[i + 1].from : at < 0 ? null : across(1)),
  }
}

/** A block's text as paragraphs of pieces: a new paragraph before each index in `breaks`. */
export function paragraphs(text: string[], breaks: number[]): number[][] {
  const starts = new Set(breaks)
  const out: number[][] = []
  text.forEach((_, i) => {
    if (i === 0 || starts.has(i)) out.push([])
    out[out.length - 1].push(i)
  })
  return out
}
