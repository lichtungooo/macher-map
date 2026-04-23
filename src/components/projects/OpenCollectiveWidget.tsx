import { useState, useEffect } from 'react'
import { ExternalLink, Heart, Users } from 'lucide-react'

interface AccountStats {
  name: string
  stats: {
    balance: { valueInCents: number; currency: string } | null
    totalAmountReceived: { valueInCents: number; currency: string }
    contributionsCount: number
    contributorsCount: number
  }
}

interface GraphQLResponse<T> {
  data?: { account: T }
  errors?: { message: string }[]
}

const QUERY = `
  query GetAccountStats($slug: String!) {
    account(slug: $slug) {
      name
      stats {
        balance { valueInCents currency }
        totalAmountReceived(net: true) { valueInCents currency }
        contributionsCount
        contributorsCount
      }
    }
  }
`

// URL oder Slug → sauberer Slug
export function extractSlug(urlOrSlug: string): string | null {
  if (!urlOrSlug) return null
  const trimmed = urlOrSlug.trim()
  // https://opencollective.com/foo/projects/bar → 'bar'
  // https://opencollective.com/foo → 'foo'
  // opencollective.com/foo → 'foo'
  // foo → 'foo'
  const match = trimmed.match(/opencollective\.com\/([^/?#]+)(?:\/projects\/([^/?#]+))?/i)
  if (match) return match[2] || match[1]
  // Nur Slug ohne Host
  const clean = trimmed.replace(/^\/+|\/+$/g, '')
  if (/^[a-z0-9-]+$/i.test(clean)) return clean
  return null
}

function formatCurrency(valueInCents: number, currency: string) {
  const value = valueInCents / 100
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency || 'EUR',
    ...(Math.abs(value) >= 1000 ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : { maximumFractionDigits: 0 }),
  }
  return new Intl.NumberFormat('de-DE', opts).format(value)
}

interface Props {
  urlOrSlug: string
  goalAmount?: number
  accent?: string
}

export function OpenCollectiveWidget({ urlOrSlug, goalAmount, accent = '#C07090' }: Props) {
  const slug = extractSlug(urlOrSlug)
  const [data, setData] = useState<AccountStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const serif = { fontFamily: "'Space Grotesk', sans-serif" }

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('https://api.opencollective.com/graphql/v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: QUERY, variables: { slug } }),
        })
        const json: GraphQLResponse<AccountStats> = await res.json()
        if (cancelled) return
        if (json.errors?.length) setError(json.errors[0].message)
        else if (json.data?.account) setData(json.data.account)
        else setError('Keine Daten')
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Fehler')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [slug])

  if (!slug) return null

  const donateUrl = `https://opencollective.com/${slug}/donate`
  const profileUrl = `https://opencollective.com/${slug}`

  // Ladezustand — weiches Skeleton
  if (loading) {
    return (
      <div className="rounded-2xl p-5 mb-4" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div style={{ width: 6, height: 6, borderRadius: 99, background: accent, opacity: 0.4 }} />
          <span style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color: 'rgba(10,10,10,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Open Collective
          </span>
        </div>
        <div className="flex gap-3 mb-3">
          <div className="flex-1 h-10 rounded-lg" style={{ background: 'rgba(10,10,10,0.04)' }} />
          <div className="flex-1 h-10 rounded-lg" style={{ background: 'rgba(10,10,10,0.04)' }} />
        </div>
        <div className="h-10 rounded-xl" style={{ background: 'rgba(10,10,10,0.04)' }} />
      </div>
    )
  }

  // Fehler oder keine Daten → Fallback: nur Link-Button
  if (error || !data) {
    return (
      <a href={profileUrl} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-4"
        style={{ ...font, fontSize: '0.85rem', fontWeight: 500, color: '#fff', background: `linear-gradient(90deg, ${accent}, #E0A0B5)`, border: 'none', textDecoration: 'none' }}>
        Unterstuetzen via Open Collective
        <ExternalLink size={13} />
      </a>
    )
  }

  const stats = data.stats
  const balance = stats.balance?.valueInCents ?? 0
  const received = stats.totalAmountReceived.valueInCents
  const currency = stats.balance?.currency || stats.totalAmountReceived.currency || 'EUR'

  // Progress zum goal — in gleicher Waehrung
  const goalCents = goalAmount ? goalAmount * 100 : 0
  const progress = goalCents > 0 ? Math.min(1, received / goalCents) : 0

  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div style={{ width: 6, height: 6, borderRadius: 99, background: accent }} />
          <span style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Open Collective
          </span>
        </div>
        <a href={profileUrl} target="_blank" rel="noopener noreferrer"
          style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)', textDecoration: 'none' }}>
          {data.name}
          <ExternalLink size={9} style={{ display: 'inline', marginLeft: 3, marginTop: -2 }} />
        </a>
      </div>

      {/* Zahlen */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.03)' }}>
          <p style={{ ...font, fontSize: '0.6rem', fontWeight: 500, color: 'rgba(10,10,10,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            Eingenommen
          </p>
          <p style={{ ...serif, fontSize: '1.35rem', fontWeight: 500, color: '#1A1A1A', lineHeight: 1.1 }}>
            {formatCurrency(received, currency)}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.03)' }}>
          <p style={{ ...font, fontSize: '0.6rem', fontWeight: 500, color: 'rgba(10,10,10,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            Im Topf
          </p>
          <p style={{ ...serif, fontSize: '1.35rem', fontWeight: 500, color: accent, lineHeight: 1.1 }}>
            {formatCurrency(balance, currency)}
          </p>
        </div>
      </div>

      {/* Ziel-Balken, wenn goal gesetzt */}
      {goalCents > 0 && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.45)' }}>
              {Math.round(progress * 100)}% vom Ziel
            </span>
            <span style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.45)' }}>
              {formatCurrency(goalCents, currency)}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(10,10,10,0.05)' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${accent}, #E0A0B5)` }} />
          </div>
        </div>
      )}

      {/* Kontributoren-Zeile */}
      {stats.contributorsCount > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <Users size={11} style={{ color: 'rgba(10,10,10,0.3)' }} />
          <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)' }}>
            {stats.contributorsCount} {stats.contributorsCount === 1 ? 'Mensch unterstuetzt' : 'Menschen unterstuetzen'}
          </span>
        </div>
      )}

      {/* Spenden-Button */}
      <a href={donateUrl} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
        style={{ ...font, fontSize: '0.85rem', fontWeight: 500, color: '#fff', background: `linear-gradient(90deg, ${accent}, #E0A0B5)`, border: 'none', textDecoration: 'none' }}>
        <Heart size={13} fill="#fff" />
        Jetzt spenden
      </a>
    </div>
  )
}
