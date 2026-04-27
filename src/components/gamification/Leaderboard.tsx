import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import * as api from '../../api/client'

const MEDAL = ['🥇', '🥈', '🥉']

export function Leaderboard() {
  const [entries, setEntries] = useState<api.LeaderboardEntry[]>([])

  useEffect(() => {
    api.getLeaderboard().then(setEntries).catch(() => {})
  }, [])

  if (!entries.length) return null

  const font = { fontFamily: 'Inter, sans-serif' }
  const maxXp = entries[0]?.total_xp || 1

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Trophy size={13} style={{ color: '#D4A020' }} />
        <span style={{ ...font, fontSize: '0.64rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.4)' }}>
          Top Macher
        </span>
      </div>
      <div className="space-y-1">
        {entries.slice(0, 10).map((entry, i) => (
          <div key={entry.user_id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
            style={{ background: i < 3 ? 'rgba(212,160,32,0.04)' : '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
            <span style={{ ...font, fontSize: '0.9rem', width: 22, textAlign: 'center' }}>
              {MEDAL[i] || <span style={{ fontSize: '0.7rem', color: 'rgba(10,10,10,0.35)', fontWeight: 600 }}>{i + 1}</span>}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span style={{ ...font, fontSize: '0.76rem', fontWeight: 600, color: '#1A1A1A' }}>{entry.name || 'Macher'}</span>
                <span style={{ ...font, fontSize: '0.64rem', fontWeight: 500, color: '#E8751A' }}>Lvl {entry.level}</span>
              </div>
              <div className="mt-0.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(10,10,10,0.06)' }}>
                <div className="h-full rounded-full" style={{
                  background: 'linear-gradient(90deg, #E8751A, #D4A020)',
                  width: `${(entry.total_xp / maxXp) * 100}%`,
                }} />
              </div>
              <div style={{ ...font, fontSize: '0.58rem', color: 'rgba(10,10,10,0.4)', marginTop: 1 }}>{entry.total_xp} XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
