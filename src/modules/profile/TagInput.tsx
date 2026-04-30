import { useState, useRef, type KeyboardEvent } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@real-life-stack/toolkit"

export interface TagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  suggestions?: string[]
  /** Wieviele Suggestions als Quick-Buttons unter dem Input zeigen */
  quickSuggestions?: number
}

/**
 * Input fuer Listen von Strings (Skills, Tags, Offers, ...).
 * - Enter oder Komma zum Hinzufuegen
 * - Backspace im leeren Input loescht letzten Tag
 * - Klick auf Suggestion fuegt sie hinzu
 */
export function TagInput({
  value,
  onChange,
  placeholder,
  suggestions = [],
  quickSuggestions = 6,
}: TagInputProps) {
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (!tag) return
    if (value.includes(tag)) {
      setDraft("")
      return
    }
    onChange([...value, tag])
    setDraft("")
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(draft)
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault()
      removeTag(value[value.length - 1])
    }
  }

  // Filter Suggestions: nur welche zeigen, die noch nicht ausgewaehlt sind
  const availableSuggestions = suggestions
    .filter((s) => !value.includes(s))
    .slice(0, quickSuggestions)

  return (
    <div className="space-y-2">
      {/* Tag-Liste + Input */}
      <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md border border-input min-h-9 focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-input">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              aria-label={`${tag} entfernen`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-32 h-6 border-none shadow-none p-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      {/* Quick-Suggestions */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableSuggestions.map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => addTag(sugg)}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-background border border-border hover:bg-muted text-xs rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-2.5 w-2.5" />
              {sugg}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
