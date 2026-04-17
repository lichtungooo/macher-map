import { Bold, Italic, Quote, Heading2, List, Link, Minus, Heart } from 'lucide-react'

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  prefix: string,
  suffix: string = '',
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = value.slice(start, end)
  const replacement = `${prefix}${selected || 'Text'}${suffix}`
  const newValue = value.slice(0, start) + replacement + value.slice(end)
  onChange(newValue)

  setTimeout(() => {
    textarea.focus()
    const cursorPos = start + prefix.length
    const cursorEnd = cursorPos + (selected || 'Text').length
    textarea.setSelectionRange(cursorPos, cursorEnd)
  }, 0)
}

const TOOLS = [
  { icon: Bold, label: 'Fett', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Kursiv', prefix: '*', suffix: '*' },
  { icon: Heading2, label: 'Ueberschrift', prefix: '## ', suffix: '' },
  { icon: Quote, label: 'Zitat', prefix: '> ', suffix: '' },
  { icon: List, label: 'Liste', prefix: '- ', suffix: '' },
  { icon: Link, label: 'Link', prefix: '[', suffix: '](url)' },
  { icon: Minus, label: 'Trennlinie', prefix: '\n---\n', suffix: '' },
  { icon: Heart, label: 'Herz', prefix: '\u2764 ', suffix: '' },
]

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 mb-1.5 flex-wrap">
      {TOOLS.map((tool, i) => (
        <button
          key={i}
          type="button"
          title={tool.label}
          onClick={() => {
            if (textareaRef.current) {
              insertMarkdown(textareaRef.current, value, onChange, tool.prefix, tool.suffix)
            }
          }}
          className="rounded flex items-center justify-center transition-colors"
          style={{
            width: 28, height: 28,
            background: 'transparent',
            border: '1px solid rgba(10,10,10,0.06)',
            cursor: 'pointer',
            color: 'rgba(10,10,10,0.35)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(212,168,67,0.08)'
            e.currentTarget.style.color = '#D4A843'
            e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(10,10,10,0.35)'
            e.currentTarget.style.borderColor = 'rgba(10,10,10,0.06)'
          }}
        >
          <tool.icon size={12} />
        </button>
      ))}
    </div>
  )
}
