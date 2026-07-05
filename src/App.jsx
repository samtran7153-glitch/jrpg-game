import { useState, useCallback, useEffect } from 'react'
import { createInitialState, PHASES, SKILLS, ITEMS, calculateDamage } from './gameState'
import { HeroSprite, GoblinSprite, DeathSprite } from './Sprites'

export default function App() {
  const [state, setState] = useState(createInitialState)
  const [anim, setAnim] = useState({ type: null, target: null })

  const addLog = (prev, msg) => [...prev, msg].slice(-6)

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  const startBattle = () => {
    setState((s) => ({ ...s, phase: PHASES.PLAYER_MENU, log: ['Battle Start!'] }))
  }

  const playerAttack = useCallback(async () => {
    setState((s) => ({ ...s, busy: true }))
    setAnim({ type: 'hero-attack', target: 'enemy' })
    await sleep(400)

    setState((s) => {
      const dmg = calculateDamage(s.hero, s.enemy, s.hero.attack)
      const newEnemyHp = Math.max(0, s.enemy.hp - dmg)
      const log = addLog(s.log, `${s.hero.name} attacks! ${dmg} damage!`)
      const enemy = { ...s.enemy, hp: newEnemyHp }
      const phase = newEnemyHp <= 0 ? PHASES.VICTORY : PHASES.ENEMY_TURN
      return { ...s, enemy, log, phase, busy: false }
    })
    setAnim(null)
  }, [])

  const playerDefend = useCallback(async () => {
    setState((s) => {
      const hero = { ...s.hero, defending: true }
      const log = addLog(s.log, `${s.hero.name} raises their shield!`)
      return { ...s, hero, log, phase: PHASES.ENEMY_TURN }
    })
  }, [])

  const playerSkill = useCallback(async (skillId) => {
    const skill = SKILLS[skillId]
    setState((s) => {
      if (s.hero.mp < skill.mpCost) return s
      return { ...s, busy: true }
    })

    setAnim({ type: 'hero-skill', target: 'enemy' })
    await sleep(500)

    setState((s) => {
      if (s.hero.mp < skill.mpCost) return s

      const hero = { ...s.hero, mp: s.hero.mp - skill.mpCost }
      let enemy = { ...s.enemy }
      let log = [...s.log]

      if (skill.type === 'support') {
        const healAmt = skill.heal
        hero.hp = Math.min(hero.maxHp, hero.hp + healAmt)
        log = addLog(log, `${s.hero.name} casts ${skill.name}! +${healAmt} HP!`)
      } else {
        const dmg = calculateDamage(hero, s.enemy, skill.damage)
        enemy.hp = Math.max(0, enemy.hp - dmg)
        log = addLog(log, `${s.hero.name} casts ${skill.name}! ${dmg} damage!`)
      }

      const phase = enemy.hp <= 0 ? PHASES.VICTORY : PHASES.ENEMY_TURN
      return { ...s, hero, enemy, log, phase, busy: false }
    })
    setAnim(null)
  }, [])

  const playerItem = useCallback(async (itemId) => {
    const item = ITEMS[itemId]
    setState((s) => {
      if (!s.hero.items[itemId] || s.hero.items[itemId] <= 0) return s
      return { ...s, busy: true }
    })

    await sleep(300)

    setState((s) => {
      if (!s.hero.items[itemId] || s.hero.items[itemId] <= 0) return s
      const items = { ...s.hero.items, [itemId]: s.hero.items[itemId] - 1 }
      const hero = { ...s.hero, items }
      let log = [...s.log]

      if (item.heal) {
        hero.hp = Math.min(hero.maxHp, s.hero.hp + item.heal)
        log = addLog(log, `${s.hero.name} uses ${item.name}! +${item.heal} HP!`)
      }
      if (item.mpRestore) {
        hero.mp = Math.min(hero.maxMp, s.hero.mp + item.mpRestore)
        log = addLog(log, `${s.hero.name} uses ${item.name}! +${item.mpRestore} MP!`)
      }

      return { ...s, hero, log, phase: PHASES.ENEMY_TURN, busy: false }
    })
  }, [])

  const enemyTurn = useCallback(async () => {
    await sleep(800)

    setState((s) => {
      if (s.phase !== PHASES.ENEMY_TURN) return s
      const enemy = { ...s.enemy }
      const hero = { ...s.hero, defending: false }
      let log = [...s.log]

      // Enemy AI: 70% attack, 30% skill if enough MP
      const useSkill = enemy.mp >= 8 && Math.random() < 0.3
      let dmg

      if (useSkill) {
        const skill = SKILLS.fireball
        enemy.mp -= skill.mpCost
        dmg = calculateDamage(enemy, hero, skill.damage)
        log = addLog(log, `${enemy.name} casts ${skill.name}! ${dmg} damage!`)
      } else {
        dmg = calculateDamage(enemy, hero, enemy.attack)
        log = addLog(log, `${enemy.name} attacks! ${dmg} damage!`)
      }

      hero.hp = Math.max(0, hero.hp - dmg)
      const phase = hero.hp <= 0 ? PHASES.DEFEAT : PHASES.PLAYER_MENU

      return { ...s, enemy, hero, log, phase }
    })
  }, [])

  useEffect(() => {
    if (state.phase === PHASES.ENEMY_TURN && !state.busy) {
      enemyTurn()
    }
  }, [state.phase, state.busy, enemyTurn])

  const restart = () => {
    setState(createInitialState())
  }

  const goToSkills = () => {
    setState((s) => ({ ...s, phase: PHASES.PLAYER_SKILLS }))
  }

  const goToItems = () => {
    setState((s) => ({ ...s, phase: PHASES.PLAYER_ITEMS }))
  }

  const backToMenu = () => {
    setState((s) => ({ ...s, phase: PHASES.PLAYER_MENU }))
  }

  return (
    <div className="min-h-screen bg-retro-bg flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md mx-auto flex flex-col gap-3" style={{ minHeight: '100dvh' }}>
        <Header />
        <BattleField state={state} anim={anim} />
        <StatusBar hero={state.hero} enemy={state.enemy} />
        <BattleLog log={state.log} />
        <ActionMenu
          state={state}
          hero={state.hero}
          onAttack={playerAttack}
          onDefend={playerDefend}
          onSkill={playerSkill}
          onItem={playerItem}
          onSkills={goToSkills}
          onItems={goToItems}
          onBack={backToMenu}
          onStart={startBattle}
          onRestart={restart}
        />
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="text-center pt-2">
      <h1 className="font-pixel text-sm sm:text-base text-retro-gold tracking-wider">
        PIXEL QUEST
      </h1>
      <p className="font-pixel text-[8px] text-retro-dim mt-1">— A JRPG Adventure —</p>
    </div>
  )
}

function BattleField({ state, anim }) {
  const { hero, enemy, phase } = state

  return (
    <div className="pixel-panel p-4 flex-1 flex flex-col justify-between min-h-[200px] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }} />
      </div>

      {/* Enemy area */}
      <div className="flex justify-center items-start relative z-10">
        <CharacterSprite
          name={enemy.name}
          title={enemy.title}
          sprite={<GoblinSprite size={64} defeated={enemy.hp <= 0} />}
          hp={enemy.hp}
          maxHp={enemy.maxHp}
          isEnemy
          anim={anim?.target === 'enemy' ? anim.type : null}
          defeated={enemy.hp <= 0}
        />
      </div>

      {/* VS divider */}
      <div className="flex items-center justify-center my-1 relative z-10">
        <div className="h-px flex-1 bg-retro-border" />
        <span className="font-pixel text-[8px] text-retro-accent px-2">VS</span>
        <div className="h-px flex-1 bg-retro-border" />
      </div>

      {/* Hero area */}
      <div className="flex justify-center items-end relative z-10">
        <CharacterSprite
          name={hero.name}
          title={hero.title}
          sprite={<HeroSprite size={64} defeated={hero.hp <= 0} />}
          hp={hero.hp}
          maxHp={hero.maxHp}
          mp={hero.mp}
          maxMp={hero.maxMp}
          anim={anim?.target === 'enemy' && anim.type === 'hero-attack' ? 'enemy-hit' : null}
          defeated={hero.hp <= 0}
        />
      </div>

      {phase === PHASES.VICTORY && (
        <Overlay title="VICTORY!" color="text-retro-green" subtitle="The Goblin King is defeated!" />
      )}
      {phase === PHASES.DEFEAT && (
        <Overlay title="DEFEAT..." color="text-retro-accent" subtitle="You have fallen in battle." />
      )}
      {phase === PHASES.INTRO && (
        <Overlay title="READY?" color="text-retro-gold" subtitle="Press START to begin!" />
      )}
    </div>
  )
}

function CharacterSprite({ name, title, sprite, hp, maxHp, mp, maxMp, isEnemy, anim, defeated }) {
  const hpPercent = (hp / maxHp) * 100
  const hpColor = hpPercent > 50 ? 'bg-retro-green' : hpPercent > 25 ? 'bg-retro-gold' : 'bg-retro-accent'

  let animClass = ''
  if (anim === 'hero-attack') animClass = 'animate-bounce'
  if (anim === 'hero-skill') animClass = 'animate-pulse'
  if (anim === 'enemy-hit') animClass = 'animate-pulse'
  if (defeated) animClass = 'opacity-20 grayscale'

  return (
    <div className={`flex flex-col items-center ${isEnemy ? '' : 'flex-col-reverse'}`}>
      <div className={`${animClass} transition-all duration-300`}>
        {defeated ? <DeathSprite size={64} /> : sprite}
      </div>
      <div className="mt-1 text-center">
        <div className="font-pixel text-[8px] text-retro-text">{name}</div>
        <div className="font-pixel text-[6px] text-retro-dim mt-0.5">{title}</div>
      </div>
      <div className="w-32 mt-1">
        <Bar label="HP" value={hp} max={maxHp} color={hpColor} />
        {mp !== undefined && <Bar label="MP" value={mp} max={maxMp} color="bg-retro-blue" />}
      </div>
    </div>
  )
}

function Bar({ label, value, max, color }) {
  const percent = (value / max) * 100
  return (
    <div className="mb-1">
      <div className="flex justify-between font-pixel text-[6px] text-retro-dim mb-0.5">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-2 bg-retro-bg border border-retro-border">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function StatusBar({ hero, enemy }) {
  return (
    <div className="pixel-panel p-2 grid grid-cols-2 gap-2 text-center">
      <div>
        <div className="font-pixel text-[7px] text-retro-green">{hero.name}</div>
        <div className="font-pixel text-[6px] text-retro-dim">Lv.{hero.level} · ATK {hero.attack} · DEF {hero.defense}</div>
      </div>
      <div>
        <div className="font-pixel text-[7px] text-retro-accent">{enemy.name}</div>
        <div className="font-pixel text-[6px] text-retro-dim">Lv.{enemy.level} · ATK {enemy.attack} · DEF {enemy.defense}</div>
      </div>
    </div>
  )
}

function BattleLog({ log }) {
  return (
    <div className="pixel-panel p-2 h-20 overflow-hidden">
      <div className="font-pixel text-[6px] text-retro-dim mb-1">BATTLE LOG</div>
      <div className="space-y-0.5">
        {log.slice(-3).map((entry, i) => (
          <div key={i} className="font-pixel text-[7px] text-retro-text leading-relaxed">
            {entry}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionMenu({ state, hero, onAttack, onDefend, onSkill, onItem, onSkills, onItems, onBack, onStart, onRestart }) {
  const { phase, busy } = state

  if (phase === PHASES.INTRO) {
    return (
      <div className="pixel-panel p-3">
        <button className="pixel-btn w-full" onClick={onStart}>
          START BATTLE
        </button>
      </div>
    )
  }

  if (phase === PHASES.VICTORY || phase === PHASES.DEFEAT) {
    return (
      <div className="pixel-panel p-3">
        <button className="pixel-btn w-full" onClick={onRestart}>
          FIGHT AGAIN
        </button>
      </div>
    )
  }

  if (phase === PHASES.ENEMY_TURN || busy) {
    return (
      <div className="pixel-panel p-3 text-center">
        <div className="font-pixel text-[8px] text-retro-dim animate-pulse">
          Enemy is thinking...
        </div>
      </div>
    )
  }

  if (phase === PHASES.PLAYER_SKILLS) {
    return (
      <div className="pixel-panel p-2 space-y-1">
        <div className="font-pixel text-[7px] text-retro-gold px-1 pb-1">SKILLS</div>
        {hero.skills.map((skillId) => {
          const skill = SKILLS[skillId]
          const canUse = hero.mp >= skill.mpCost
          return (
            <button
              key={skillId}
              className="pixel-btn w-full text-left flex justify-between items-center"
              disabled={!canUse}
              onClick={() => onSkill(skillId)}
            >
              <span>{skill.name}</span>
              <span className="text-retro-blue text-[6px]">{skill.mpCost} MP</span>
            </button>
          )
        })}
        <button className="pixel-btn w-full text-retro-dim mt-1" onClick={onBack}>
          ← Back
        </button>
      </div>
    )
  }

  if (phase === PHASES.PLAYER_ITEMS) {
    const itemIds = Object.keys(hero.items).filter((id) => hero.items[id] > 0)
    return (
      <div className="pixel-panel p-2 space-y-1">
        <div className="font-pixel text-[7px] text-retro-gold px-1 pb-1">ITEMS</div>
        {itemIds.length === 0 && (
          <div className="font-pixel text-[7px] text-retro-dim px-1 py-2">No items left!</div>
        )}
        {itemIds.map((itemId) => {
          const item = ITEMS[itemId]
          return (
            <button
              key={itemId}
              className="pixel-btn w-full text-left flex justify-between items-center"
              onClick={() => onItem(itemId)}
            >
              <span>{item.name}</span>
              <span className="text-retro-dim text-[6px]">x{hero.items[itemId]}</span>
            </button>
          )
        })}
        <button className="pixel-btn w-full text-retro-dim mt-1" onClick={onBack}>
          ← Back
        </button>
      </div>
    )
  }

  // Main menu
  return (
    <div className="pixel-panel p-2 grid grid-cols-2 gap-1">
      <button className="pixel-btn" onClick={onAttack} disabled={busy}>
        Attack
      </button>
      <button className="pixel-btn" onClick={onSkills} disabled={busy}>
        Skills
      </button>
      <button className="pixel-btn" onClick={onItems} disabled={busy}>
        Items
      </button>
      <button className="pixel-btn" onClick={onDefend} disabled={busy}>
        Defend
      </button>
    </div>
  )
}

function Overlay({ title, color, subtitle }) {
  return (
    <div className="absolute inset-0 bg-retro-bg/80 flex flex-col items-center justify-center z-20">
      <div className={`font-pixel text-lg ${color} mb-2`}>{title}</div>
      <div className="font-pixel text-[8px] text-retro-text text-center px-4">{subtitle}</div>
    </div>
  )
}
