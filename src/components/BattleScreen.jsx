import { useState } from 'react'
import { Sprite } from '../Sprites'
import { CharacterCard, FloatText } from './Shared'
import { SKILLS, ITEMS, AREAS } from '../gameState'

const TUTORIAL_TIPS = [
  { text: 'Welcome to battle! The bar above shows turn order. Your hero acts first.', highlight: 'turn_order' },
  { text: 'Choose ATTACK to hit an enemy. Pick a target by tapping them.', highlight: 'attack' },
  { text: 'SKILLS use MP for powerful effects. Try Power Slash!', highlight: 'skills' },
  { text: 'ITEMS heal HP or MP. Use them wisely — they are limited.', highlight: 'items' },
  { text: 'DEFEND halves damage next turn. Use it when low on HP!', highlight: 'defend' },
  { text: 'Watch the turn order bar to plan ahead. Defeat all enemies to win!', highlight: 'turn_order' },
]

const AREA_THEMES = {
  forest: { ground: '#2d5a1e', groundAccent: '#3d7a2a', sky: 'linear-gradient(180deg, #1a3a2a 0%, #0f2a1a 60%, #1a1a2e 100%)', accent: '#4ecca3' },
  cave: { ground: '#3a2a1a', groundAccent: '#4a3a2a', sky: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1b 60%, #1a1a2e 100%)', accent: '#6a6a8a' },
  castle: { ground: '#2a2a3a', groundAccent: '#3a3a4a', sky: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1b 50%, #1a1a2e 100%)', accent: '#9d4edd' },
  shadow: { ground: '#1a1a2e', groundAccent: '#2a2a3e', sky: 'linear-gradient(180deg, #0a0a14 0%, #0f0f1b 50%, #1a1a2e 100%)', accent: '#9d4edd' },
}

const AREA_DECORATIONS = {
  forest: [
    { type: 'tree', x: 12, y: 20, size: 18 },
    { type: 'tree', x: 82, y: 25, size: 16 },
    { type: 'tree', x: 70, y: 70, size: 20 },
    { type: 'bush', x: 28, y: 75, size: 12 },
    { type: 'bush', x: 88, y: 55, size: 10 },
    { type: 'rock', x: 45, y: 15, size: 10 },
  ],
  cave: [
    { type: 'rock', x: 10, y: 22, size: 18 },
    { type: 'rock', x: 85, y: 18, size: 22 },
    { type: 'rock', x: 75, y: 75, size: 16 },
    { type: 'crystal', x: 25, y: 70, size: 14 },
    { type: 'crystal', x: 60, y: 25, size: 12 },
    { type: 'stalagmite', x: 40, y: 80, size: 16 },
  ],
  castle: [
    { type: 'pillar', x: 18, y: 20, size: 16 },
    { type: 'pillar', x: 80, y: 20, size: 16 },
    { type: 'torch', x: 12, y: 45, size: 12 },
    { type: 'torch', x: 86, y: 45, size: 12 },
    { type: 'shield', x: 30, y: 78, size: 14 },
    { type: 'shield', x: 68, y: 76, size: 14 },
  ],
  shadow: [
    { type: 'void', x: 20, y: 20, size: 22 },
    { type: 'void', x: 70, y: 25, size: 18 },
    { type: 'void', x: 45, y: 75, size: 24 },
    { type: 'crack', x: 15, y: 60, size: 18 },
    { type: 'crack', x: 80, y: 70, size: 16 },
  ],
}

function DecorIcon({ type, size }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' }
  switch (type) {
    case 'tree':
      return (
        <svg {...common} className="text-retro-green">
          <path d="M12 2L6 10h4l-3 5h4l-3 5h6l-3-5h4l-3-5h4L12 2z" />
        </svg>
      )
    case 'bush':
      return (
        <svg {...common} className="text-retro-green">
          <circle cx="8" cy="16" r="5" />
          <circle cx="14" cy="14" r="6" />
          <circle cx="18" cy="17" r="4" />
        </svg>
      )
    case 'rock':
      return (
        <svg {...common} className="text-retro-dim">
          <path d="M4 18l3-9 6-2 5 3 2 8H4z" />
        </svg>
      )
    case 'crystal':
      return (
        <svg {...common} className="text-retro-blue">
          <path d="M12 2l8 10-8 10-8-10L12 2z" opacity="0.85" />
        </svg>
      )
    case 'stalagmite':
      return (
        <svg {...common} className="text-retro-dim">
          <path d="M12 22L7 8l5-6 5 6-5 14z" />
        </svg>
      )
    case 'pillar':
      return (
        <svg {...common} className="text-retro-dim">
          <rect x="7" y="2" width="10" height="20" rx="1" />
          <rect x="5" y="2" width="14" height="3" />
          <rect x="5" y="19" width="14" height="3" />
        </svg>
      )
    case 'torch':
      return (
        <svg {...common} className="text-retro-gold">
          <path d="M10 22h4v-8h-4v8z" />
          <path d="M12 2c-2 3-4 6-3 9 0 0 1-2 3-2s3 2 3 2c1-3-1-6-3-9z" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common} className="text-retro-accent">
          <path d="M12 2C8 2 4 4 4 4v7c0 6 8 11 8 11s8-5 8-11V4s-4-2-8-2z" />
        </svg>
      )
    case 'void':
      return (
        <svg {...common} className="text-retro-purple">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="5" fill="#0f0f1b" />
        </svg>
      )
    case 'crack':
      return (
        <svg {...common} className="text-retro-accent">
          <path d="M12 2l-2 6 4 3-3 5 5 4-4 2" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    default:
      return null
  }
}

export function BattleScreen({ state, anim, onAction }) {
  const { party, enemies, turnOrder, currentTurnIndex, phase, log, floatTexts, screenShake } = state
  const area = AREAS[state.currentAreaIndex]
  const theme = AREA_THEMES[area?.id] || AREA_THEMES.forest
  const queuedActor = turnOrder[currentTurnIndex % turnOrder.length]
  const activeActor = queuedActor?.isPlayer
    ? party.find((hero) => hero.id === queuedActor.id)
    : enemies.find((enemy) => enemy.id === queuedActor?.id)
  const isPlayerTurn = activeActor && activeActor.isPlayer && activeActor.alive && activeActor.hp > 0
  const needsTarget = phase === 'player_target'
  const needsMultiTarget = phase === 'player_multi_target'
  const needsAllyTarget = phase === 'player_ally_target'
  const selectedTargetIds = state.pendingAction?.selectedTargets?.map((t) => t.id) || []

  const isFirstBattle = state.currentAreaIndex === 0 && state.currentBattleIndex === 0
  const [tutorialStep, setTutorialStep] = useState(0)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const showTutorial = isFirstBattle && !tutorialDismissed && phase === 'player_menu'

  return (
    <div className={`flex flex-col gap-2 flex-1 ${screenShake > 0 ? 'animate-shake' : ''}`}>
      {/* Turn order bar */}
      <TurnOrderBar turnOrder={turnOrder} currentTurnIndex={currentTurnIndex} party={party} enemies={enemies} highlighted={showTutorial && TUTORIAL_TIPS[tutorialStep]?.highlight === 'turn_order'} />

      {/* Battle field */}
      <div className="pixel-panel p-2 relative flex-1 overflow-hidden flex flex-col justify-center battlefield-plane" style={{ background: theme.sky }}>
        {/* Flat ground plane */}
        <div className="battlefield-ground" style={{ background: theme.ground }} />

        {/* Top-down area decorations */}
        {(AREA_DECORATIONS[area?.id] || []).map((decor, i) => (
          <div
            key={i}
            className="absolute pointer-events-none z-0 opacity-70"
            style={{ left: `${decor.x}%`, top: `${decor.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <DecorIcon type={decor.type} size={decor.size} />
          </div>
        ))}

        <FloatText texts={floatTexts} />

        {/* Enemies front row (top) */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap relative z-10 battle-enemies-row">
          {enemies.map((enemy) => (
            <CharacterCard
              key={enemy.id}
              actor={enemy}
              isEnemy
              isActive={activeActor?.id === enemy.id}
              isTargetable={(needsTarget || needsMultiTarget) && enemy.alive && enemy.hp > 0}
              isSelected={needsMultiTarget && selectedTargetIds.includes(enemy.id)}
              onTarget={(e) => onAction(needsMultiTarget ? 'select_multi_target' : 'target_enemy', e)}
              size={36}
              compact
            />
          ))}
        </div>

        {/* Party front row (bottom) */}
        <div className="flex justify-center gap-3 flex-wrap relative z-10 battle-party-row">
          {party.map((hero) => (
            <CharacterCard
              key={hero.id}
              actor={hero}
              isActive={activeActor?.id === hero.id}
              isTargetable={needsAllyTarget && hero.alive && hero.hp > 0}
              onTarget={(h) => onAction('target_ally', h)}
              size={34}
              compact
            />
          ))}
        </div>
      </div>

      {/* Battle log */}
      <div className="pixel-panel p-1.5 h-14 overflow-hidden">
        <div className="space-y-0.5">
          {log.slice(-3).map((entry, i) => (
            <div key={i} className="font-pixel text-[8px] text-retro-text leading-relaxed">
              {entry}
            </div>
          ))}
        </div>
      </div>

      {/* Action menu */}
      <BattleMenu state={state} activeActor={activeActor} isPlayerTurn={isPlayerTurn} onAction={onAction} tutorialHighlight={showTutorial ? TUTORIAL_TIPS[tutorialStep]?.highlight : null} />

      {/* Tutorial banner */}
      {showTutorial && (
        <div className="pixel-panel p-2 z-40 border-2 border-retro-gold">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <div className="font-pixel text-[8px] text-retro-gold mb-0.5">TUTORIAL {tutorialStep + 1}/{TUTORIAL_TIPS.length}</div>
              <div className="font-pixel text-[8px] text-retro-text leading-relaxed">
                {TUTORIAL_TIPS[tutorialStep].text}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              {tutorialStep > 0 && (
                <button className="pixel-btn text-[7px] px-1 py-0.5" onClick={() => setTutorialStep(tutorialStep - 1)}>
                  Back
                </button>
              )}
              {tutorialStep < TUTORIAL_TIPS.length - 1 ? (
                <button className="pixel-btn text-[7px] px-1 py-0.5" onClick={() => setTutorialStep(tutorialStep + 1)}>
                  Next
                </button>
              ) : (
                <button className="pixel-btn text-[7px] px-1 py-0.5" onClick={() => setTutorialDismissed(true)}>
                  Got it!
                </button>
              )}
              <button className="pixel-btn text-[7px] px-1 py-0.5 text-retro-dim" onClick={() => setTutorialDismissed(true)}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TurnOrderBar({ turnOrder, currentTurnIndex, party, enemies, highlighted }) {
  const resolveActor = (queuedActor) => {
    if (!queuedActor) return null
    const actors = queuedActor.isPlayer ? party : enemies
    return actors.find((actor) => actor.id === queuedActor.id) || null
  }

  const upcoming = []
  for (let i = 0; i < turnOrder.length && upcoming.length < 8; i++) {
    const idx = (currentTurnIndex + i) % turnOrder.length
    const actor = resolveActor(turnOrder[idx])
    if (actor && actor.alive && actor.hp > 0) upcoming.push({ actor, idx })
  }

  return (
    <div className={`pixel-panel px-1.5 py-1 flex items-center gap-1 overflow-x-auto min-h-8 ${highlighted ? 'ring-2 ring-retro-gold animate-pulse' : ''}`}>
      <span className="font-pixel text-[6px] text-retro-dim shrink-0">TURN</span>
      {upcoming.map(({ actor, idx }, i) => {
        const isActive = i === 0
        return (
          <div
            key={`${actor.id}-${idx}`}
            className={`shrink-0 ${isActive ? 'ring-1 ring-retro-gold' : 'opacity-60'}`}
          >
            <Sprite type={actor.sprite} size={16} defeated={false} />
          </div>
        )
      })}
    </div>
  )
}

function BattleMenu({ state, activeActor, isPlayerTurn, onAction, tutorialHighlight }) {
  const { phase, busy } = state

  if (!isPlayerTurn || busy) {
    return (
      <div className="pixel-panel p-2 text-center">
        <div className="font-pixel text-[8px] text-retro-dim animate-pulse">
          {activeActor?.name || 'Enemy'} is acting...
        </div>
      </div>
    )
  }

  if (phase === 'player_skills') {
    return (
      <div className="pixel-panel p-1.5 space-y-1">
        <div className="font-pixel text-[8px] text-retro-gold px-1 pb-0.5">SKILLS</div>
        {activeActor.skills.map((skillId) => {
          const skill = SKILLS[skillId]
          const canUse = activeActor.mp >= skill.mpCost
          return (
            <button
              key={skillId}
              className="pixel-btn w-full text-left flex flex-col gap-0.5"
              disabled={!canUse}
              onClick={() => onAction('select_skill', skillId)}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-pixel text-[8px]">{skill.name}</span>
                <span className="font-pixel text-[8px] text-retro-blue">{skill.mpCost} MP</span>
              </div>
              <span className="font-pixel text-[6px] text-retro-dim leading-tight">{skill.description}</span>
            </button>
          )
        })}
        <button className="pixel-btn w-full text-retro-dim mt-0.5" onClick={() => onAction('back_to_menu')}>
          Back
        </button>
      </div>
    )
  }

  if (phase === 'player_items') {
    const itemIds = Object.keys(state.inventory).filter((id) => state.inventory[id] > 0)
    const isItemUsable = (item) => {
      if (item.revive) return state.party.some((h) => !h.alive || h.hp <= 0)
      if (item.heal) return state.party.some((h) => h.alive && h.hp > 0 && h.hp < h.maxHp)
      if (item.mpRestore) return state.party.some((h) => h.alive && h.hp > 0 && h.mp < h.maxMp)
      if (item.cure) return state.party.some((h) => h.alive && h.hp > 0 && (h.statusEffects || []).some((e) => e.type === item.cure))
      return true
    }
    return (
      <div className="pixel-panel p-1.5 space-y-1">
        <div className="font-pixel text-[8px] text-retro-gold px-1 pb-0.5">ITEMS</div>
        {itemIds.length === 0 && (
          <div className="font-pixel text-[8px] text-retro-dim px-1 py-1">No items left!</div>
        )}
        {itemIds.map((itemId) => {
          const item = ITEMS[itemId]
          const usable = isItemUsable(item)
          return (
            <button
              key={itemId}
              className="pixel-btn w-full text-left flex flex-col gap-0.5"
              disabled={!usable}
              onClick={() => onAction('use_item', itemId)}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`font-pixel text-[8px] ${usable ? '' : 'text-retro-dim'}`}>{item.name}</span>
                <span className="font-pixel text-[8px] text-retro-dim">x{state.inventory[itemId]}</span>
              </div>
              <span className={`font-pixel text-[6px] leading-tight ${usable ? 'text-retro-dim' : 'text-retro-dim/50'}`}>{item.description}</span>
            </button>
          )
        })}
        <button className="pixel-btn w-full text-retro-dim mt-0.5" onClick={() => onAction('back_to_menu')}>
          Back
        </button>
      </div>
    )
  }

  if (phase === 'player_target') {
    return (
      <div className="pixel-panel p-2 text-center">
        <div className="font-pixel text-[8px] text-retro-accent animate-pulse">
          Select target...
        </div>
        <button className="pixel-btn w-full text-retro-dim mt-1" onClick={() => onAction('back_to_menu')}>
          Cancel
        </button>
      </div>
    )
  }

  if (phase === 'player_multi_target') {
    const selected = state.pendingAction?.selectedTargets || []
    const skill = SKILLS[state.pendingAction?.skillId]
    const hits = skill?.hits || 1
    return (
      <div className="pixel-panel p-2 text-center">
        <div className="font-pixel text-[8px] text-retro-accent animate-pulse">
          Select target {Math.min(selected.length + 1, hits)}/{hits}...
        </div>
        <button className="pixel-btn w-full text-retro-dim mt-1" onClick={() => onAction('back_to_menu')}>
          Cancel
        </button>
      </div>
    )
  }

  if (phase === 'player_ally_target') {
    return (
      <div className="pixel-panel p-2 text-center">
        <div className="font-pixel text-[8px] text-retro-green animate-pulse">
          Select ally...
        </div>
        <button className="pixel-btn w-full text-retro-dim mt-1" onClick={() => onAction('back_to_menu')}>
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="pixel-panel p-1.5 grid grid-cols-2 gap-1">
      <button className={`pixel-btn ${tutorialHighlight === 'attack' ? 'ring-2 ring-retro-gold animate-pulse' : ''}`} onClick={() => onAction('attack')}>Attack</button>
      <button className={`pixel-btn ${tutorialHighlight === 'skills' ? 'ring-2 ring-retro-gold animate-pulse' : ''}`} onClick={() => onAction('open_skills')}>Skills</button>
      <button className={`pixel-btn ${tutorialHighlight === 'items' ? 'ring-2 ring-retro-gold animate-pulse' : ''}`} onClick={() => onAction('open_items')}>Items</button>
      <button className={`pixel-btn ${tutorialHighlight === 'defend' ? 'ring-2 ring-retro-gold animate-pulse' : ''}`} onClick={() => onAction('defend')}>Defend</button>
    </div>
  )
}
