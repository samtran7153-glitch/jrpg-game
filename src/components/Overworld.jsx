import { Sprite } from '../Sprites'
import { CharacterCard, GoldDisplay } from './Shared'
import { AREAS, ITEMS } from '../gameState'

export function TitleScreen({ onStart }) {
  return (
    <div className="flex justify-center pt-12 sm:pt-16">
      <div className="pixel-panel w-full max-w-sm p-5 flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-3">
            <Sprite type="knight" size={40} />
            <Sprite type="mage" size={40} />
            <Sprite type="archer" size={40} />
            <Sprite type="healer" size={40} />
          </div>
          <h1 className="font-pixel text-base text-retro-gold tracking-wider">PIXEL QUEST</h1>
          <p className="font-pixel text-[7px] text-retro-dim mt-2">A JRPG Adventure</p>
        </div>
        <div className="flex justify-center gap-3 mt-1">
          <Sprite type="goblinKing" size={36} />
          <Sprite type="dragon" size={48} />
          <Sprite type="darkKnight" size={36} />
        </div>
        <button className="pixel-btn w-48 mt-2" onClick={onStart}>
          PRESS START
        </button>
      </div>
    </div>
  )
}

export function AreaMapScreen({ state, onSelectBattle, onShop, onContinue }) {
  const area = AREAS[state.currentAreaIndex]
  if (!area) return null
  const areaComplete = state.currentBattleIndex >= area.battles.length

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="pixel-panel p-2 text-center">
        <div className="font-pixel text-[8px] text-retro-gold">{area.name}</div>
        <div className="font-pixel text-[5px] text-retro-dim mt-1">{area.description}</div>
      </div>

      <div className="flex justify-between items-center pixel-panel p-2">
        <div className="font-pixel text-[6px] text-retro-text">Party Status</div>
        <GoldDisplay gold={state.gold} />
      </div>

      <div className="pixel-panel p-2 flex gap-1 flex-wrap justify-center">
        {state.party.map((hero) => (
          <CharacterCard key={hero.id} actor={hero} size={32} />
        ))}
      </div>

      <div className="pixel-panel p-2 flex-1">
        <div className="font-pixel text-[6px] text-retro-gold mb-2">BATTLES</div>
        <div className="space-y-2">
          {area.battles.map((battle, i) => {
            const isCompleted = i < state.currentBattleIndex
            const isCurrent = i === state.currentBattleIndex
            const isLocked = i > state.currentBattleIndex
            return (
              <button
                key={i}
                className={`pixel-btn w-full text-left flex items-center gap-2 ${
                  isLocked ? 'opacity-40' : ''
                }`}
                disabled={isLocked}
                onClick={() => onSelectBattle(i)}
              >
                <span className="text-[5px]">
                  {isCompleted ? '[DONE]' : isCurrent ? '[!]' : '[ ]'}
                </span>
                <span className="flex gap-1">
                  {battle.enemies.map((e, ei) => (
                    <Sprite key={ei} type={e} size={16} />
                  ))}
                </span>
                <span className="text-[5px] ml-auto">
                  Battle {i + 1}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <button className="pixel-btn" onClick={onShop}>Shop</button>
        <button className="pixel-btn" onClick={onContinue} disabled={!areaComplete}>
          Next Area
        </button>
      </div>
    </div>
  )
}

export function ShopScreen({ state, onBuy, onBack }) {
  const itemIds = Object.keys(ITEMS)
  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="pixel-panel p-2 text-center">
        <div className="font-pixel text-[8px] text-retro-gold">ITEM SHOP</div>
        <div className="flex justify-center mt-1">
          <GoldDisplay gold={state.gold} />
        </div>
      </div>

      <div className="pixel-panel p-2 flex-1 space-y-1">
        {itemIds.map((itemId) => {
          const item = ITEMS[itemId]
          const canAfford = state.gold >= item.price
          return (
            <button
              key={itemId}
              className="pixel-btn w-full text-left flex justify-between items-center"
              disabled={!canAfford}
              onClick={() => onBuy(itemId)}
            >
              <div>
                <div>{item.name}</div>
                <div className="text-[5px] text-retro-dim">{item.description}</div>
              </div>
              <div className="text-retro-gold text-[6px]">{item.price} G</div>
            </button>
          )
        })}
      </div>

      <button className="pixel-btn w-full" onClick={onBack}>
        Leave Shop
      </button>
    </div>
  )
}

export function DialogueScreen({ state, onAdvance }) {
  const line = state.dialogueLines[state.dialogueIndex] || ''
  const speaker = line.split(':')[0] || ''
  const text = line.includes(':') ? line.split(':').slice(1).join(':').trim() : line
  const speakerInitial = speaker ? speaker[0] : '?'

  return (
    <div className="flex flex-col gap-2 flex-1 justify-end pb-4">
      <StoryStage key={`stage-${state.dialogueIndex}`} state={state} speaker={speaker} />
      <div key={state.dialogueIndex} className="pixel-panel p-3 min-h-[180px] relative overflow-hidden animate-dialogue-box">
        <div className="absolute inset-0 opacity-10 pointer-events-none dialogue-scanlines" />
        <div className="relative z-10 flex gap-3 items-start">
          <div className="w-14 h-14 pixel-panel flex items-center justify-center shrink-0 animate-dialogue-portrait">
            <span className="font-pixel text-lg text-retro-gold">{speakerInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-block font-pixel text-[7px] text-retro-gold mb-3 px-2 py-1 border border-retro-border bg-retro-bg animate-speaker-badge">
              {speaker || 'Narrator'}
            </div>
            <div className="font-pixel text-[8px] text-retro-text leading-relaxed animate-dialogue-text">
              {text}
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-4 flex justify-end items-center gap-2">
          <span className="font-pixel text-[6px] text-retro-dim animate-next-prompt">▼</span>
          <button className="pixel-btn text-[6px]" onClick={onAdvance}>
            {state.dialogueIndex < state.dialogueLines.length - 1 ? 'Next' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StoryStage({ state, speaker }) {
  const heroSpeakerMap = {
    Aria: 'knight',
    Elwyn: 'mage',
    Kira: 'archer',
    Sera: 'healer',
  }
  const enemySpeakerMap = {
    'Goblin King': 'goblinKing',
    'Dark Knight': 'darkKnight',
    Dragon: 'dragon',
  }
  const visibleParty = state.party.slice(0, 4)
  const visibleEnemies = state.enemies.length > 0
    ? state.enemies.slice(0, 3)
    : []
  const speakerSprite = heroSpeakerMap[speaker] || enemySpeakerMap[speaker]

  return (
    <div className="pixel-panel h-36 relative overflow-hidden animate-story-stage">
      <div className="absolute inset-0 story-backdrop" />
      <div className="absolute left-0 right-0 bottom-3 h-1 bg-retro-border/70" />
      <div className="absolute left-4 bottom-4 flex items-end gap-2 animate-story-party-enter">
        {visibleParty.map((hero) => (
          <div
            key={hero.id}
            className={`story-actor ${speakerSprite === hero.sprite ? 'story-speaker' : ''}`}
          >
            <Sprite type={hero.sprite} size={speakerSprite === hero.sprite ? 46 : 34} />
          </div>
        ))}
      </div>
      <div className="absolute right-4 bottom-4 flex items-end gap-2 animate-story-enemy-enter">
        {visibleEnemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`story-actor ${speakerSprite === enemy.sprite ? 'story-speaker' : ''}`}
          >
            <div className="story-enemy">
              <Sprite type={enemy.sprite} size={speakerSprite === enemy.sprite ? 48 : 36} />
            </div>
          </div>
        ))}
      </div>
      {visibleEnemies.length === 0 && (
        <div className="absolute right-6 bottom-5 animate-story-sparkle font-pixel text-retro-gold text-xs">✦</div>
      )}
    </div>
  )
}

export function VictoryScreen({ state, onContinue }) {
  const { battleResult } = state
  if (!battleResult) return null

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3">
      <div className="font-pixel text-lg text-retro-green">VICTORY!</div>
      <div className="pixel-panel p-3 w-full space-y-2">
        <div className="text-center font-pixel text-[7px] text-retro-text">Battle Rewards</div>
        <div className="flex justify-between font-pixel text-[7px]">
          <span className="text-retro-dim">XP Gained:</span>
          <span className="text-retro-green">{battleResult.xpPerHero || battleResult.xp}</span>
        </div>
        <div className="flex justify-between font-pixel text-[7px]">
          <span className="text-retro-dim">Gold Gained:</span>
          <span className="text-retro-gold">{battleResult.gold}</span>
        </div>
        {battleResult.leveledUp && battleResult.leveledUp.length > 0 && (
          <div className="text-center font-pixel text-[6px] text-retro-gold animate-pulse pt-1">
            LEVEL UP! {battleResult.leveledUp.join(', ')}
          </div>
        )}
        {battleResult.recruited && (
          <div className="text-center font-pixel text-[6px] text-retro-green animate-pulse pt-1">
            {battleResult.recruited.name} joined the party!
          </div>
        )}
      </div>
      <button className="pixel-btn w-40" onClick={onContinue}>
        Continue
      </button>
    </div>
  )
}

export function DefeatScreen({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <div className="font-pixel text-lg text-retro-accent">DEFEAT...</div>
      <div className="font-pixel text-[7px] text-retro-dim text-center px-4">
        Your party has fallen. The darkness spreads...
      </div>
      <button className="pixel-btn w-40" onClick={onRetry}>
        Try Again
      </button>
    </div>
  )
}

export function GameCompleteScreen({ onRestart }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <div className="font-pixel text-base text-retro-gold text-center">
        THE END
      </div>
      <div className="font-pixel text-[7px] text-retro-text text-center px-4 leading-relaxed">
        The Ancient Dragon is vanquished.<br />Peace returns to the land.<br />Thank you for playing!
      </div>
      <div className="flex justify-center gap-2 mt-2">
        <Sprite type="knight" size={32} />
        <Sprite type="mage" size={32} />
        <Sprite type="archer" size={32} />
        <Sprite type="healer" size={32} />
      </div>
      <button className="pixel-btn w-40 mt-2" onClick={onRestart}>
        New Game
      </button>
    </div>
  )
}
