import { Sprite } from '../Sprites'

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

export function CharacterCard({ actor, isEnemy, isActive, isTargetable, onTarget, size = 48, compact = false }) {
  const hpPercent = (actor.hp / actor.maxHp) * 100
  const hpColor = hpPercent > 50 ? 'bg-retro-green' : hpPercent > 25 ? 'bg-retro-gold' : 'bg-retro-accent'
  const mpColor = 'bg-retro-blue'

  return (
    <div
      className={`pixel-panel ${compact ? 'p-1 w-16' : 'p-1.5'} flex flex-col items-center relative transition-all duration-200 ${
        isActive ? 'ring-2 ring-retro-gold scale-105' : ''
      } ${isTargetable ? 'ring-2 ring-retro-accent cursor-pointer animate-pulse' : ''} ${
        !actor.alive || actor.hp <= 0 ? 'animate-defeat' : ''
      }`}
      onClick={isTargetable ? () => onTarget(actor) : undefined}
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
      </div>
      {actor.defending && (
        <div className="font-pixel text-[7px] text-retro-blue mt-0.5">DEF</div>
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
