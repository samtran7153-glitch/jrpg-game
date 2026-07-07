import { Sprite } from '../Sprites'
import { SKILLS, xpForLevel } from '../gameState'

export function Bar({ label, value, max, color }) {
  const percent = (value / max) * 100
  return (
    <div className="mb-0.5">
      <div className="flex justify-between font-pixel text-[7px] text-retro-dim">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-retro-bg border border-retro-border">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export function CharacterCard({ actor, isEnemy, isActive, isTargetable, onTarget, onStatsClick, size = 48, compact = false }) {
  const hpPercent = (actor.hp / actor.maxHp) * 100
  const hpColor = hpPercent > 50 ? 'bg-retro-green' : hpPercent > 25 ? 'bg-retro-gold' : 'bg-retro-accent'
  const mpColor = 'bg-retro-blue'

  return (
    <div
      className={`pixel-panel ${compact ? 'p-1 w-16' : 'p-1.5'} flex flex-col items-center relative transition-all duration-200 ${
        isActive ? 'ring-2 ring-retro-gold scale-105' : ''
      } ${isTargetable ? 'ring-2 ring-retro-accent cursor-pointer animate-pulse' : ''} ${
        onStatsClick && !isTargetable ? 'cursor-pointer hover:border-retro-gold' : ''
      } ${
        !actor.alive || actor.hp <= 0 ? 'animate-defeat' : ''
      }`}
      onClick={isTargetable ? () => onTarget(actor) : onStatsClick ? () => onStatsClick() : undefined}
    >
      {actor.isBoss && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 font-pixel text-[7px] text-retro-accent bg-retro-bg px-1 whitespace-nowrap">
          BOSS
        </div>
      )}
      <Sprite type={actor.sprite} size={size} defeated={actor.hp <= 0} />
      <div className="mt-1 text-center">
        <div className="font-pixel text-[7px] text-retro-text leading-tight">{actor.name}</div>
        <div className="font-pixel text-[6px] text-retro-dim">Lv.{actor.level}</div>
      </div>
      <div className="w-full mt-1">
        <Bar label="HP" value={actor.hp} max={actor.maxHp} color={hpColor} />
        {actor.maxMp > 0 && <Bar label="MP" value={actor.mp} max={actor.maxMp} color={mpColor} />}
        {actor.isPlayer && <Bar label="XP" value={actor.xp || 0} max={xpForLevel(actor.level)} color="bg-retro-purple" />}
      </div>
      {actor.defending && (
        <div className="font-pixel text-[7px] text-retro-blue mt-0.5">DEF</div>
      )}
      {actor.statusEffects && actor.statusEffects.length > 0 && (
        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
          {actor.statusEffects.map((e, i) => (
            <span key={i} className={`font-pixel text-[6px] px-1 ${
              e.type === 'poison' ? 'text-retro-green' :
              e.type === 'stun' ? 'text-retro-gold' :
              e.type === 'slow' ? 'text-retro-blue' :
              e.type === 'attack_up' ? 'text-retro-accent' :
              e.type === 'defense_up' ? 'text-retro-blue' : 'text-retro-dim'
            }`}>
              {e.type === 'poison' ? 'PSN' : e.type === 'stun' ? 'STN' : e.type === 'slow' ? 'SLW' : e.type === 'attack_up' ? 'ATK+' : e.type === 'defense_up' ? 'DEF+' : e.type}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function FloatText({ texts }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {texts.map((t) => (
        <div
          key={t.id}
          className="absolute font-pixel text-xs animate-float-up"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            color: t.color,
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function GoldDisplay({ gold }) {
  return (
    <div className="font-pixel text-[10px] text-retro-gold">
      {gold} G
    </div>
  )
}

export function HeroStatsModal({ hero, onClose }) {
  if (!hero) return null
  const hpPercent = (hero.hp / hero.maxHp) * 100
  const hpColor = hpPercent > 50 ? 'bg-retro-green' : hpPercent > 25 ? 'bg-retro-gold' : 'bg-retro-accent'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="pixel-panel p-3 w-64 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <Sprite type={hero.sprite} size={40} defeated={hero.hp <= 0} />
          <div>
            <div className="font-pixel text-[10px] text-retro-gold">{hero.name}</div>
            <div className="font-pixel text-[8px] text-retro-dim">{hero.title} · Lv.{hero.level}</div>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <Bar label="HP" value={hero.hp} max={hero.maxHp} color={hpColor} />
          <Bar label="MP" value={hero.mp} max={hero.maxMp} color="bg-retro-blue" />
          <Bar label="XP" value={hero.xp || 0} max={xpForLevel(hero.level)} color="bg-retro-purple" />
        </div>

        <div className="grid grid-cols-3 gap-1 mb-3">
          <div className="pixel-panel p-1 text-center">
            <div className="font-pixel text-[6px] text-retro-dim">ATK</div>
            <div className="font-pixel text-[10px] text-retro-accent">{hero.attack}</div>
          </div>
          <div className="pixel-panel p-1 text-center">
            <div className="font-pixel text-[6px] text-retro-dim">DEF</div>
            <div className="font-pixel text-[10px] text-retro-blue">{hero.defense}</div>
          </div>
          <div className="pixel-panel p-1 text-center">
            <div className="font-pixel text-[6px] text-retro-dim">SPD</div>
            <div className="font-pixel text-[10px] text-retro-green">{hero.speed}</div>
          </div>
        </div>

        <div className="mb-2">
          <div className="font-pixel text-[8px] text-retro-gold mb-1">SKILLS</div>
          <div className="space-y-0.5">
            {hero.skills.map((skillId) => {
              const skill = SKILLS[skillId]
              if (!skill) return null
              return (
                <div key={skillId} className="pixel-panel p-1">
                  <div className="flex justify-between items-center">
                    <span className="font-pixel text-[7px] text-retro-text">{skill.name}</span>
                    <span className="font-pixel text-[6px] text-retro-blue">{skill.mpCost} MP</span>
                  </div>
                  <div className="font-pixel text-[6px] text-retro-dim mt-0.5">{skill.description}</div>
                </div>
              )
            })}
          </div>
        </div>

        <button className="pixel-btn w-full text-[8px]" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
