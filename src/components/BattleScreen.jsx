import { useState } from 'react'
import { Sprite } from '../Sprites'
import { CharacterCard, FloatText } from './Shared'
import { SKILLS, ITEMS } from '../gameState'

const TUTORIAL_TIPS = [
  'Welcome to battle! The bar above shows turn order. Your hero acts first.',
  'Choose ATTACK to hit an enemy. Pick a target by tapping them.',
  'SKILLS use MP for powerful effects. Try Power Slash!',
  'ITEMS heal HP or MP. Use them wisely — they are limited.',
  'DEFEND halves damage next turn. Use it when low on HP!',
  'Watch the turn order bar to plan ahead. Defeat all enemies to win!',
]

export function BattleScreen({ state, anim, onAction }) {
  const { party, enemies, turnOrder, currentTurnIndex, phase, log, floatTexts, screenShake } = state
  const queuedActor = turnOrder[currentTurnIndex % turnOrder.length]
  const activeActor = queuedActor?.isPlayer
    ? party.find((hero) => hero.id === queuedActor.id)
    : enemies.find((enemy) => enemy.id === queuedActor?.id)
  const isPlayerTurn = activeActor && activeActor.isPlayer && activeActor.alive && activeActor.hp > 0
  const needsTarget = phase === 'player_target'
  const needsAllyTarget = phase === 'player_ally_target'

  const isFirstBattle = state.currentAreaIndex === 0 && state.currentBattleIndex === 0
  const [tutorialStep, setTutorialStep] = useState(0)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const showTutorial = isFirstBattle && !tutorialDismissed && phase === 'player_menu'

  return (
    <div className={`flex flex-col gap-2 flex-1 ${screenShake > 0 ? 'animate-shake' : ''}`}>
      {/* Turn order bar */}
      <TurnOrderBar turnOrder={turnOrder} currentTurnIndex={currentTurnIndex} party={party} enemies={enemies} />

      {/* Battle field */}
      <div className="pixel-panel p-2 relative flex-1 overflow-hidden flex flex-col justify-center">
        <FloatText texts={floatTexts} />
        {/* Enemies row */}
        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          {enemies.map((enemy) => (
            <CharacterCard
              key={enemy.id}
              actor={enemy}
              isEnemy
              isActive={activeActor?.id === enemy.id}
              isTargetable={needsTarget && enemy.alive && enemy.hp > 0}
              onTarget={(e) => onAction('target_enemy', e)}
              size={36}
              compact
            />
          ))}
        </div>
        {/* VS divider */}
        <div className="flex items-center justify-center my-1">
          <div className="h-px flex-1 bg-retro-border" />
          <span className="font-pixel text-[8px] text-retro-accent px-2">VS</span>
          <div className="h-px flex-1 bg-retro-border" />
        </div>
        {/* Party row */}
        <div className="flex justify-center gap-1.5 flex-wrap">
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
      <BattleMenu state={state} activeActor={activeActor} isPlayerTurn={isPlayerTurn} onAction={onAction} />

      {/* Tutorial overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={() => setTutorialDismissed(true)}>
          <div className="pixel-panel p-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="font-pixel text-[10px] text-retro-gold mb-2 text-center">TUTORIAL {tutorialStep + 1}/{TUTORIAL_TIPS.length}</div>
            <div className="font-pixel text-[9px] text-retro-text leading-relaxed text-center mb-3">
              {TUTORIAL_TIPS[tutorialStep]}
            </div>
            <div className="flex gap-2 justify-center">
              {tutorialStep < TUTORIAL_TIPS.length - 1 ? (
                <button className="pixel-btn" onClick={() => setTutorialStep(tutorialStep + 1)}>
                  Next
                </button>
              ) : (
                <button className="pixel-btn" onClick={() => setTutorialDismissed(true)}>
                  Got it!
                </button>
              )}
              {tutorialStep > 0 && (
                <button className="pixel-btn text-retro-dim" onClick={() => setTutorialStep(tutorialStep - 1)}>
                  Back
                </button>
              )}
              <button className="pixel-btn text-retro-dim" onClick={() => setTutorialDismissed(true)}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TurnOrderBar({ turnOrder, currentTurnIndex, party, enemies }) {
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
    <div className="pixel-panel px-1.5 py-1 flex items-center gap-1 overflow-x-auto min-h-8">
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

function BattleMenu({ state, activeActor, isPlayerTurn, onAction }) {
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
                <span>{skill.name}</span>
                <span className="text-retro-blue text-[7px]">{skill.mpCost} MP</span>
              </div>
              <span className="text-retro-dim text-[6px] leading-tight">{skill.description}</span>
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
    return (
      <div className="pixel-panel p-1.5 space-y-1">
        <div className="font-pixel text-[8px] text-retro-gold px-1 pb-0.5">ITEMS</div>
        {itemIds.length === 0 && (
          <div className="font-pixel text-[8px] text-retro-dim px-1 py-1">No items left!</div>
        )}
        {itemIds.map((itemId) => {
          const item = ITEMS[itemId]
          return (
            <button
              key={itemId}
              className="pixel-btn w-full text-left flex flex-col gap-0.5"
              onClick={() => onAction('use_item', itemId)}
            >
              <div className="flex justify-between items-center w-full">
                <span>{item.name}</span>
                <span className="text-retro-dim text-[7px]">x{state.inventory[itemId]}</span>
              </div>
              <span className="text-retro-dim text-[6px] leading-tight">{item.description}</span>
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
      <button className="pixel-btn" onClick={() => onAction('attack')}>Attack</button>
      <button className="pixel-btn" onClick={() => onAction('open_skills')}>Skills</button>
      <button className="pixel-btn" onClick={() => onAction('open_items')}>Items</button>
      <button className="pixel-btn" onClick={() => onAction('defend')}>Defend</button>
    </div>
  )
}
