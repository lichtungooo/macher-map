import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import * as api from '../../api/client'

const SKILL_ICONS: Record<string, string> = {
  holz: '🪵', metall: '⚙️', elektro: '⚡', digital: '💻', textil: '🧵', bau: '🔨',
}

function xpForNextLevel(level: number) {
  return (level + 1) * (level + 1) * 50
}

export function SkillTree({ userId }: { userId?: string }) {
  const [data, setData] = useState<{ skills: api.UserSkill[]; badges: api.Badge[]; total_xp: number; level: number } | null>(null)

  useEffect(() => {
    const load = userId ? api.getUserSkills(userId) : api.getMySkills()
    load.then(setData).catch(() => {})
  }, [userId])

  if (!data) return null

  const font = { fontFamily: 'Inter, sans-serif' }

  return (
    <div className="space-y-3">
      {/* Gesamt-Level */}
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8751A, #D4A020)', color: '#fff' }}>
          <span style={{ ...font, fontSize: '1.2rem', fontWeight: 700 }}>{data.level}</span>
        </div>
        <div className="flex-1">
          <div style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: '#1A1A1A' }}>Macher Level {data.level}</div>
          <div style={{ ...font, fontSize: '0.64rem', color: 'rgba(10,10,10,0.5)' }}>{data.total_xp} XP gesamt</div>
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(10,10,10,0.06)' }}>
            <div className="h-full rounded-full" style={{
              background: 'linear-gradient(90deg, #E8751A, #D4A020)',
              width: `${Math.min(100, (data.total_xp / xpForNextLevel(data.level)) * 100)}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Skill-Kategorien */}
      <div className="grid grid-cols-2 gap-2">
        {data.skills.map(skill => {
          const nextXp = xpForNextLevel(skill.level)
          const progress = Math.min(100, (skill.xp / nextXp) * 100)
          return (
            <div key={skill.category_id} className="p-2.5 rounded-xl" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span style={{ fontSize: '1.1rem' }}>{SKILL_ICONS[skill.category_id] || '🔧'}</span>
                <div>
                  <div style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: skill.color }}>{skill.category_name}</div>
                  <div style={{ ...font, fontSize: '0.58rem', color: 'rgba(10,10,10,0.45)' }}>Lvl {skill.level} · {skill.xp} XP</div>
                </div>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(10,10,10,0.06)' }}>
                <div className="h-full rounded-full" style={{
                  background: skill.color,
                  width: `${progress}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Badges */}
      {data.badges.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} style={{ color: '#D4A020' }} />
            <span style={{ ...font, fontSize: '0.64rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.4)' }}>
              Badges ({data.badges.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.badges.map(badge => (
              <div key={badge.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" title={badge.description}
                style={{ background: `${badge.color}12`, border: `1px solid ${badge.color}30` }}>
                <span style={{ fontSize: '0.85rem' }}>{badge.icon}</span>
                <span style={{ ...font, fontSize: '0.68rem', fontWeight: 500, color: badge.color }}>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
