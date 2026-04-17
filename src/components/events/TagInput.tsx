import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import * as api from '../../api/client'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const font = { fontFamily: 'Inter, sans-serif' as const }

  useEffect(() => {
    if (input.length === 0) {
      api.searchTags('').then((tags: any[]) => setSuggestions(tags.map((t: any) => t.name).filter((n: string) => !value.includes(n)))).catch(() => {})
      return
    }
    const timer = setTimeout(() => {
      api.searchTags(input).then((tags: any[]) => setSuggestions(tags.map((t: any) => t.name).filter((n: string) => !value.includes(n)))).catch(() => {})
    }, 150)
    return () => clearTimeout(timer)
  }, [input, value])

  const addTag = (tag: string) => {
    const clean = tag.toLowerCase().replace(/[^a-zäöüß0-9]/g, '')
    if (!clean || value.includes(clean)) return
    onChange([...value, clean])
    setInput('')
    inputRef.current?.focus()
  }

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag))
  }

  return (
    <div>
      {/* Ausgewaehlte Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {value.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', ...font, fontSize: '0.7rem', color: '#D4A843' }}>
              #{tag}
              <button type="button" onClick={() => removeTag(tag)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4A843', padding: 0, lineHeight: 1 }}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input mit Autocomplete */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) { e.preventDefault(); addTag(input) }
          }}
          placeholder="Hashtag eingeben..."
          className="w-full px-3 py-2 rounded-lg outline-none"
          style={{ border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.82rem', color: '#0A0A0A', background: '#fff' }}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 rounded-lg shadow-lg p-1 z-10 max-h-36 overflow-y-auto"
            style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.08)' }}>
            {suggestions.map(tag => (
              <button key={tag} type="button"
                onMouseDown={e => { e.preventDefault(); addTag(tag) }}
                className="w-full px-3 py-1.5 rounded text-left"
                style={{ ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.6)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,67,0.06)'; e.currentTarget.style.color = '#D4A843' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(10,10,10,0.6)' }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
