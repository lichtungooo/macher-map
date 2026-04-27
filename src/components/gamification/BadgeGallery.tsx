import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import * as api from '../../api/client'

export function BadgeGallery({ earnedBadgeIds }: { earnedBadgeIds?: string[] }) {
  const [badges, setBadges] = useState<api.Badge[]>([])
  const [earned, setEarned] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.getAllBadges().then(setBadges).catch(() => {})
  }, [])

  useEffect(() => {
    if (earnedBadgeIds) {
      setEarned(new Set(earnedBadgeIds))
    } else {
      api.getMySkills().then(d => setEarned(new Set(d.badges.map(b => b.id)))).catch(() => {})
    }
  }, [earnedBadgeIds])

  if (!badges.length) return null

  const font = { fontFamily: 'Inter, sans-serif' }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Award size={13} style={{ color: '#D4A020' }} />
        <span style={{ ...font, fontSize: '0.64rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.4)' }}>
          Alle Badges ({earned.size}/{badges.length})
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {badges.map(badge => {
          const unlocked = earned.has(badge.id)
          return (
            <div key={badge.id} className="flex items-center gap-2 p-2 rounded-lg"
              style={{
                background: unlocked ? `${badge.color}08` : 'rgba(10,10,10,0.02)',
                border: unlocked ? `1px solid ${badge.color}25` : '1px solid rgba(10,10,10,0.04)',
                opacity: unlocked ? 1 : 0.45,
              }}>
              <span style={{ fontSize: '1.1rem', filter: unlocked ? 'none' : 'grayscale(1)' }}>{badge.icon}</span>
              <div className="min-w-0">
                <div style={{ ...font, fontSize: '0.7rem', fontWeight: 600, color: unlocked ? badge.color : 'rgba(10,10,10,0.5)' }}>
                  {badge.name}
                </div>
                <div style={{ ...font, fontSize: '0.58rem', color: 'rgba(10,10,10,0.4)', lineHeight: 1.3 }}>
                  {badge.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
