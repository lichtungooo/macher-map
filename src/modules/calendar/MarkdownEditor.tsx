import { useState, useMemo } from "react"
import { Eye, Edit, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon } from "lucide-react"
import { Button, Textarea } from "@real-life-stack/toolkit"

/**
 * MarkdownEditor — kompakter Editor mit Toolbar + Edit/Preview-Toggle.
 *
 * Eigener Mini-Markdown-Renderer (kein lib-Dependency) fuer Basics:
 *   # H1, ## H2, ### H3
 *   **bold**, *italic*, `code`
 *   [text](url), Auto-Links
 *   - Liste / 1. Nummerierte Liste
 *   > Blockquote
 *   --- Trennlinie
 *   Leerzeile = Absatz
 *
 * Reicht fuer Event-Beschreibungen. Bei Bedarf spaeter durch `marked` ersetzen.
 */

export interface MarkdownEditorProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  rows?: number
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 8 }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview" | "split">("edit")

  const insert = (before: string, after = "") => {
    onChange(value + before + after)
  }

  const insertHeading = (level: 1 | 2) => {
    const prefix = level === 1 ? "# " : "## "
    onChange(value + (value.endsWith("\n") || value === "" ? "" : "\n") + prefix)
  }

  const html = useMemo(() => renderMarkdown(value), [value])

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap border-b pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => insertHeading(1)}
          title="Ueberschrift 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => insertHeading(2)}
          title="Ueberschrift 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => insert("**", "**")}
          title="Fett"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => insert("*", "*")}
          title="Kursiv"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(value + (value.endsWith("\n") || value === "" ? "" : "\n") + "- ")}
          title="Liste"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => insert("[Text](", ")")}
          title="Link"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </Button>

        <div className="flex-1" />

        {/* Mode-Switcher */}
        <div className="inline-flex rounded-md border bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-2 h-7 inline-flex items-center gap-1 text-xs rounded ${
              mode === "edit" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"
            }`}
          >
            <Edit className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`px-2 h-7 inline-flex items-center text-xs rounded ${
              mode === "split" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"
            }`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-2 h-7 inline-flex items-center gap-1 text-xs rounded ${
              mode === "preview" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"
            }`}
          >
            <Eye className="h-3 w-3" />
            Vorschau
          </button>
        </div>
      </div>

      {/* Body */}
      {mode === "edit" && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm"
        />
      )}
      {mode === "preview" && (
        <div
          className="prose prose-sm max-w-none p-3 border rounded-md bg-muted/20 min-h-[180px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      {mode === "split" && (
        <div className="grid grid-cols-2 gap-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="font-mono text-sm"
          />
          <div
            className="prose prose-sm max-w-none p-3 border rounded-md bg-muted/20 overflow-y-auto"
            style={{ minHeight: `${rows * 1.5}em` }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * MarkdownView — read-only Renderer fuer gespeicherte Markdown-Inhalte.
 * Nutzt denselben Mini-Renderer wie der Editor.
 */
export function MarkdownView({ markdown, className }: { markdown: string; className?: string }) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown])
  return (
    <div
      className={`prose prose-sm max-w-none ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ============================================================
// Mini-Markdown-Renderer (ohne externe lib)
// ============================================================

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderInline(s: string): string {
  let out = escapeHtml(s)
  // Bold: **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  // Italic: *text* (nicht innerhalb von bold matched, weil bold zuerst)
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>")
  // Code inline: `code`
  out = out.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-[0.85em]">$1</code>')
  // Links: [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>'
  )
  // Auto-Links (http/https)
  out = out.replace(
    /(^|[\s])(https?:\/\/[^\s<]+)/g,
    '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$2</a>'
  )
  return out
}

function renderMarkdown(md: string): string {
  if (!md) return ""
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let inList: "ul" | "ol" | null = null

  const closeList = () => {
    if (inList) {
      out.push(`</${inList}>`)
      inList = null
    }
  }

  for (const line of lines) {
    // Trennlinie
    if (/^---+$/.test(line.trim())) {
      closeList()
      out.push('<hr class="my-3 border-border" />')
      continue
    }
    // Headings
    if (/^### /.test(line)) {
      closeList()
      out.push(`<h3 class="text-base font-semibold mt-3 mb-1">${renderInline(line.slice(4))}</h3>`)
      continue
    }
    if (/^## /.test(line)) {
      closeList()
      out.push(`<h2 class="text-lg font-semibold mt-4 mb-2">${renderInline(line.slice(3))}</h2>`)
      continue
    }
    if (/^# /.test(line)) {
      closeList()
      out.push(`<h1 class="text-xl font-bold mt-4 mb-2">${renderInline(line.slice(2))}</h1>`)
      continue
    }
    // Blockquote
    if (/^> /.test(line)) {
      closeList()
      out.push(`<blockquote class="border-l-4 border-muted pl-3 italic text-muted-foreground my-2">${renderInline(line.slice(2))}</blockquote>`)
      continue
    }
    // Unordered list
    if (/^[-*] /.test(line)) {
      if (inList !== "ul") {
        closeList()
        inList = "ul"
        out.push('<ul class="list-disc list-inside space-y-1 my-2">')
      }
      out.push(`<li>${renderInline(line.slice(2))}</li>`)
      continue
    }
    // Ordered list
    if (/^\d+\. /.test(line)) {
      if (inList !== "ol") {
        closeList()
        inList = "ol"
        out.push('<ol class="list-decimal list-inside space-y-1 my-2">')
      }
      out.push(`<li>${renderInline(line.replace(/^\d+\. /, ""))}</li>`)
      continue
    }
    // Empty line → close list, paragraph break
    if (line.trim() === "") {
      closeList()
      continue
    }
    // Default: paragraph
    closeList()
    out.push(`<p class="my-1">${renderInline(line)}</p>`)
  }

  closeList()
  return out.join("\n")
}
