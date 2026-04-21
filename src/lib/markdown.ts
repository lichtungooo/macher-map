import { marked } from 'marked'

// Konfiguration fuer schoenes, herzliches Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
})

/**
 * Rendert Markdown zu HTML.
 * Nutzt marked fuer Ueberschriften, Listen, Zitate, Trennlinien, bold, italic etc.
 */
export function renderMarkdown(text: string | null | undefined): string {
  if (!text) return ''
  try {
    return marked.parse(text) as string
  } catch {
    return text
  }
}
