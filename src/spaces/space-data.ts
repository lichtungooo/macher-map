import type { Group } from "@real-life-stack/data-interface"

/**
 * Spaces-Hierarchie + Hashtags — Helper-Module.
 *
 * Datenmodell auf group.data:
 *   parentSpaceId?: string   — ID des Parent-Space (oder leer = Root)
 *   slug?: string            — URL-Slug (lesbarer Name, eindeutig pro Verbund)
 *   hashtags?: string[]      — Kategorien fuer Discovery
 *   description?: string     — Freitext (war schon da)
 */

export interface SpaceMeta {
  parentSpaceId?: string
  slug?: string
  hashtags?: string[]
  description?: string
}

export function getSpaceMeta(group: Group): SpaceMeta {
  const data = group.data ?? {}
  return {
    parentSpaceId:
      typeof data.parentSpaceId === "string" ? data.parentSpaceId : undefined,
    slug: typeof data.slug === "string" ? data.slug : undefined,
    hashtags: Array.isArray(data.hashtags)
      ? (data.hashtags as unknown[]).filter((h): h is string => typeof h === "string")
      : undefined,
    description:
      typeof data.description === "string" ? data.description : undefined,
  }
}

// ============================================================
// Slug
// ============================================================

/**
 * Erzeugt einen URL-sicheren Slug aus einem Namen.
 *   "Macher Kassel" → "macher-kassel"
 *   "Lichtung Bremen Süd" → "lichtung-bremen-sued"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/

export function isValidSlug(slug: string): boolean {
  if (!slug) return false
  if (slug.length > 64) return false
  return SLUG_RE.test(slug)
}

/** Findet einen Space anhand seines Slugs. */
export function findGroupBySlug(groups: Group[], slug: string): Group | undefined {
  return groups.find((g) => g.data?.slug === slug)
}

/** Prueft ob ein Slug im Verbund noch frei ist (eigenen Space ausnehmen). */
export function isSlugFree(
  groups: Group[],
  slug: string,
  exceptGroupId?: string
): boolean {
  return !groups.some(
    (g) => g.data?.slug === slug && g.id !== exceptGroupId
  )
}

// ============================================================
// Hierarchie
// ============================================================

/** Findet direkte Sub-Spaces eines Parents. */
export function findChildSpaces(groups: Group[], parentId: string): Group[] {
  return groups.filter((g) => getSpaceMeta(g).parentSpaceId === parentId)
}

/** Liefert alle Root-Spaces (kein Parent gesetzt). */
export function findRootSpaces(groups: Group[]): Group[] {
  return groups.filter((g) => !getSpaceMeta(g).parentSpaceId)
}

/** Liefert die ID-Kette vom Space hinauf zur Wurzel (inkl. self). */
export function getAncestorChain(groups: Group[], spaceId: string): string[] {
  const chain: string[] = []
  let cursor: string | undefined = spaceId
  const seen = new Set<string>()
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor)
    chain.push(cursor)
    const node = groups.find((g) => g.id === cursor)
    cursor = node ? getSpaceMeta(node).parentSpaceId : undefined
  }
  return chain
}

/** Liefert alle Nachfahren eines Space (rekursiv, ohne self). */
export function getDescendantIds(groups: Group[], spaceId: string): string[] {
  const result: string[] = []
  const queue = [spaceId]
  while (queue.length > 0) {
    const cur = queue.shift() as string
    const children = findChildSpaces(groups, cur)
    for (const c of children) {
      result.push(c.id)
      queue.push(c.id)
    }
  }
  return result
}

/** Pruefung: darf candidate Parent von child werden? Vermeidet Zyklen. */
export function canBeParent(
  groups: Group[],
  childId: string,
  candidateParentId: string
): boolean {
  if (candidateParentId === childId) return false
  // Kein Vorfahre des childs darf gleichzeitig sein Sub-Space sein.
  const descendants = getDescendantIds(groups, childId)
  return !descendants.includes(candidateParentId)
}

// ============================================================
// Hashtags
// ============================================================

/** Saubert ein Hashtag — kein "#", lowercase, Trim, max 32 Zeichen. */
export function normalizeHashtag(tag: string): string {
  return tag
    .replace(/^#/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 32)
}

/** Sammelt alle Hashtags aus allen Spaces (uniq, sortiert). */
export function collectAllHashtags(groups: Group[]): string[] {
  const all = new Set<string>()
  for (const g of groups) {
    const tags = getSpaceMeta(g).hashtags ?? []
    for (const t of tags) all.add(t)
  }
  return Array.from(all).sort()
}
