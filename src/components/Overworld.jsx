import { useState, useEffect } from 'react'
import { Sprite } from '../Sprites'
import { CharacterCard, GoldDisplay, HeroStatsModal } from './Shared'
import { AREAS, ITEMS, xpForLevel } from '../gameState'
import { ENEMY_TYPES } from '../gameData'

function formatSavedAt(ts) {
  if (!ts) return 'Never'
  const date = new Date(ts)
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function SettingsScreen({ onReset, onBack, onSave, onLoad, onExport, onImport, saveStatus, lastSavedAt }) {
  const [confirming, setConfirming] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(null)
  const [checking, setChecking] = useState(false)
  const [transferCode, setTransferCode] = useState('')
  const [exportStatus, setExportStatus] = useState(null)
  const [importStatus, setImportStatus] = useState(null)

  const checkForUpdates = async () => {
    setChecking(true)
    setUpdateStatus(null)
    try {
      const response = await fetch(`/index.html?_=${Date.now()}`, { cache: 'no-store' })
      const html = await response.text()
      const match = html.match(/index-[A-Za-z0-9]+\.js/)
      const remoteBundle = match ? match[0] : null

      const currentScript = document.querySelector('script[type="module"]')
      const currentSrc = currentScript ? currentScript.src : ''
      const currentBundle = currentSrc.split('/').pop()

      if (remoteBundle && currentBundle && remoteBundle !== currentBundle) {
        setUpdateStatus('new')
      } else {
        setUpdateStatus('latest')
      }
    } catch (e) {
      setUpdateStatus('error')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex justify-center items-center flex-1">
      <div className="pixel-panel w-full max-w-sm p-5 flex flex-col items-center gap-4">
        <h2 className="font-pixel text-sm text-retro-gold tracking-wider">SETTINGS</h2>

        <div className="w-full space-y-3">
          <div className="pixel-panel p-3 w-full">
            <div className="font-pixel text-[8px] text-retro-text mb-2">Check for Updates</div>
            <div className="font-pixel text-[6px] text-retro-dim mb-3">
              Compares the running version with the deployed version.
            </div>

            {updateStatus === 'latest' && (
              <div className="font-pixel text-[7px] text-retro-green text-center mb-2">
                You have the latest version.
              </div>
            )}
            {updateStatus === 'new' && (
              <div className="font-pixel text-[7px] text-retro-gold text-center mb-2">
                A new version is available! Refresh to update.
              </div>
            )}
            {updateStatus === 'error' && (
              <div className="font-pixel text-[7px] text-retro-accent text-center mb-2">
                Could not check for updates.
              </div>
            )}

            <button className="pixel-btn w-full" onClick={checkForUpdates} disabled={checking}>
              {checking ? 'Checking...' : 'Check for Updates'}
            </button>

            <button
              className="pixel-btn w-full mt-2"
              onClick={async () => {
                await onSave()
                window.location.reload()
              }}
            >
              Refresh Game
            </button>
          </div>

          <div className="pixel-panel p-3 w-full">
            <div className="font-pixel text-[8px] text-retro-text mb-2">Cloud Save</div>
            <div className="font-pixel text-[6px] text-retro-dim mb-3">
              Progress is automatically saved while you play. You can also save or load manually.
            </div>

            <div className="font-pixel text-[7px] text-retro-dim text-center mb-2">
              Last saved: {formatSavedAt(lastSavedAt)}
            </div>

            {saveStatus === 'saving' && (
              <div className="font-pixel text-[7px] text-retro-gold text-center mb-2">Saving...</div>
            )}
            {saveStatus === 'saved' && (
              <div className="font-pixel text-[7px] text-retro-green text-center mb-2">Saved!</div>
            )}
            {saveStatus === 'loading' && (
              <div className="font-pixel text-[7px] text-retro-gold text-center mb-2">Loading...</div>
            )}
            {saveStatus === 'loaded' && (
              <div className="font-pixel text-[7px] text-retro-green text-center mb-2">Loaded!</div>
            )}
            {saveStatus === 'none' && (
              <div className="font-pixel text-[7px] text-retro-accent text-center mb-2">No cloud save found.</div>
            )}
            {saveStatus === 'error' && (
              <div className="font-pixel text-[7px] text-retro-accent text-center mb-2">Cloud save failed.</div>
            )}

            <div className="flex gap-2">
              <button className="pixel-btn flex-1" onClick={onSave} disabled={saveStatus === 'saving' || saveStatus === 'loading'}>
                Save Now
              </button>
              <button className="pixel-btn flex-1" onClick={onLoad} disabled={saveStatus === 'saving' || saveStatus === 'loading'}>
                Load Save
              </button>
            </div>
          </div>

          <div className="pixel-panel p-3 w-full">
            <div className="font-pixel text-[8px] text-retro-text mb-2">Transfer Code</div>
            <div className="font-pixel text-[6px] text-retro-dim mb-3">
              Copy your save code to move progress to another device or browser.
            </div>

            {exportStatus && (
              <div className="font-pixel text-[7px] text-retro-green text-center mb-2">{exportStatus}</div>
            )}
            <button
              className="pixel-btn w-full"
              onClick={() => {
                const code = onExport()
                if (!code) return
                navigator.clipboard.writeText(code).then(() => {
                  setExportStatus('Copied to clipboard!')
                }).catch(() => {
                  setExportStatus('Could not copy; code printed to console')
                  console.log('Transfer code:', code)
                })
              }}
            >
              Export Save Code
            </button>

            <textarea
              className="w-full mt-2 bg-retro-panel border border-retro-border text-retro-text font-pixel text-[7px] p-2 rounded"
              rows={3}
              placeholder="Paste save code here..."
              value={transferCode}
              onChange={(e) => setTransferCode(e.target.value)}
            />

            {importStatus && (
              <div className={`font-pixel text-[7px] text-center mb-2 ${importStatus === 'Save loaded!' ? 'text-retro-green' : 'text-retro-accent'}`}>
                {importStatus}
              </div>
            )}
            <button
              className="pixel-btn w-full mt-2"
              disabled={!transferCode.trim()}
              onClick={async () => {
                const result = await onImport(transferCode)
                setImportStatus(result.success ? 'Save loaded!' : result.error)
              }}
            >
              Import Save Code
            </button>
          </div>

          <div className="pixel-panel p-3 w-full">
            <div className="font-pixel text-[8px] text-retro-text mb-2">Reset Progress</div>
            <div className="font-pixel text-[6px] text-retro-dim mb-3">
              This will erase all progress and start a new game.
            </div>
            {!confirming ? (
              <button className="pixel-btn w-full text-retro-accent" onClick={() => setConfirming(true)}>
                Reset
              </button>
            ) : (
              <div className="space-y-2">
                <div className="font-pixel text-[7px] text-retro-accent text-center">
                  Are you sure?
                </div>
                <div className="flex gap-2">
                  <button className="pixel-btn flex-1 text-retro-accent" onClick={onReset}>
                    Yes, Reset
                  </button>
                  <button className="pixel-btn flex-1" onClick={() => setConfirming(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="pixel-btn w-48" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}

export function TitleScreen({ onStart, onContinue, hasCloudSave }) {
  return (
    <div className="flex justify-center items-center flex-1">
      <div className="pixel-panel w-full max-w-sm p-5 flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-3">
            <Sprite type="knight" size={40} />
            <Sprite type="mage" size={40} />
            <Sprite type="archer" size={40} />
            <Sprite type="healer" size={40} />
          </div>
          <h1 className="font-pixel text-base text-retro-gold tracking-wider">PIXEL QUEST</h1>
          <p className="font-pixel text-[9px] text-retro-dim mt-2">A JRPG Adventure</p>
        </div>
        <div className="flex justify-center gap-3 mt-1">
          <Sprite type="goblinKing" size={36} />
          <Sprite type="dragon" size={48} />
          <Sprite type="darkKnight" size={36} />
        </div>
        <div className="flex flex-col gap-2 w-48 mt-2">
          {hasCloudSave ? (
            <button className="pixel-btn w-full text-retro-green" onClick={onContinue}>
              Continue
            </button>
          ) : (
            <button className="pixel-btn w-full" onClick={onStart}>
              PRESS START
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function AreaMapScreen({ state, onSelectBattle, onUseItem, onShop, onWorldMap, onExplore, onSettings }) {
  const area = AREAS[state.currentAreaIndex]
  if (!area) return null
  const selectedPath = state.selectedPaths[state.currentAreaIndex]
  const pathBattles = selectedPath ? area.paths[selectedPath].battles : area.battles.map((_, i) => i)

  const [showItems, setShowItems] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [statsHero, setStatsHero] = useState(null)

  const itemIds = Object.keys(state.inventory).filter((id) => state.inventory[id] > 0)

  const handleUseItem = (heroId) => {
    if (selectedItem) {
      onUseItem(selectedItem, heroId)
      setSelectedItem(null)
    }
  }

  const isValidTarget = (hero) => {
    if (!selectedItem) return false
    const item = ITEMS[selectedItem]
    if (!item) return false
    if (item.revive) return !hero.alive || hero.hp <= 0
    if (!hero.alive || hero.hp <= 0) return false
    if (item.heal) return hero.hp < hero.maxHp
    if (item.mpRestore) return hero.mp < hero.maxMp
    if (item.cure) return (hero.statusEffects || []).some((e) => e.type === item.cure)
    return false
  }

  return (
    <div className="flex flex-col h-full gap-2 relative">
      <div className="pixel-panel p-2">
        <div className="flex justify-between items-center">
          <div className="font-pixel text-[10px] text-retro-gold">{area.name}</div>
          <div className="font-pixel text-[7px] text-retro-dim">
            {selectedPath ? `Path: ${area.paths[selectedPath].name}` : 'No path selected'}
          </div>
        </div>
        <div className="font-pixel text-[6px] text-retro-dim mt-1">{area.description}</div>
      </div>

      <div className="flex gap-2">
        {/* Side panels */}
        <div className="pixel-panel p-2 flex-1 h-44">
          {/* Party Display */}
          <div className="font-pixel text-[8px] text-retro-gold mb-2">PARTY</div>
          <div className="flex gap-1 flex-wrap justify-center">
            {state.party.map((hero) => (
              <CharacterCard
                key={hero.id}
                actor={hero}
                size={32}
                isTargetable={isValidTarget(hero)}
                onTarget={() => handleUseItem(hero.id)}
                onStatsClick={selectedItem ? undefined : () => setStatsHero(hero)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Items Panel - Replaces side panels when open */}
      {showItems ? (
        <div className="pixel-panel p-2 flex-1">
          <div className="font-pixel text-[8px] text-retro-gold mb-2">ITEMS</div>
          <div className="space-y-1">
            {itemIds.length === 0 && (
              <div className="font-pixel text-[8px] text-retro-dim">No items left! Visit the shop.</div>
            )}
            {itemIds.map((itemId) => {
              const item = ITEMS[itemId]
              const hasValidTarget = state.party.some((h) => {
                if (item.revive) return !h.alive || h.hp <= 0
                if (!h.alive || h.hp <= 0) return false
                if (item.heal) return h.hp < h.maxHp
                if (item.mpRestore) return h.mp < h.maxMp
                if (item.cure) return (h.statusEffects || []).some((e) => e.type === item.cure)
                return false
              })
              return (
                <button
                  key={itemId}
                  className={`pixel-btn w-full text-left flex justify-between items-center ${
                    selectedItem === itemId ? 'ring-2 ring-retro-gold' : ''
                  } ${!hasValidTarget ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={!hasValidTarget}
                  onClick={() => setSelectedItem(selectedItem === itemId ? null : itemId)}
                >
                  <div>
                    <div className="font-pixel text-[8px]">{item.name}</div>
                    <div className="font-pixel text-[6px] text-retro-dim">{item.description}</div>
                  </div>
                  <div className="font-pixel text-[8px] text-retro-dim">x{state.inventory[itemId]}</div>
                </button>
              )
            })}
            {selectedItem && (
              <div className="font-pixel text-[7px] text-retro-gold text-center mt-2">
                Click a glowing hero card to use it.
              </div>
            )}
          </div>
          <button className="pixel-btn w-full text-retro-dim mt-2" onClick={() => { setShowItems(false); setSelectedItem(null) }}>
            Close
          </button>
        </div>
      ) : (
        <div className="pixel-panel p-2 flex-1">
          {/* Battles */}
          <div className="font-pixel text-[8px] text-retro-gold mb-2">BATTLES</div>
          <div className="space-y-2">
            {pathBattles.map((battleIndex) => {
              const battle = area.battles[battleIndex]
              if (!battle) return null
              const isCompleted = battleIndex < state.currentBattleIndex
              const isCurrent = battleIndex === state.currentBattleIndex
              const isLocked = battleIndex > state.currentBattleIndex
              const showSprites = isCompleted && !isCurrent

              return (
                <button
                  key={battleIndex}
                  className={`pixel-btn w-full text-left flex items-center gap-2 ${
                    isLocked ? 'opacity-40' : ''
                  } ${isCurrent ? 'ring-2 ring-retro-gold animate-pulse' : ''}`}
                  disabled={isLocked}
                  onClick={() => onSelectBattle(battleIndex)}
                >
                  <span className="text-[7px]">
                    {isCompleted ? '[DONE]' : isCurrent ? '[!]' : '[ ]'}
                  </span>
                  <span className="flex gap-1">
                    {showSprites
                      ? battle.enemies.map((e, ei) => (
                          <Sprite key={ei} type={ENEMY_TYPES[e]?.sprite || e} size={16} />
                        ))
                      : <span className="font-pixel text-[7px] text-retro-dim">???</span>
                    }
                  </span>
                  <span className="text-[7px] ml-auto">
                    Battle {battleIndex + 1}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1">
        <button className="pixel-btn" onClick={() => { setShowItems(!showItems); setSelectedItem(null) }}>Items</button>
        <button className="pixel-btn" onClick={onShop}>Shop</button>
        <button className="pixel-btn" onClick={onExplore}>Explore</button>
      </div>

      <div className="flex gap-1 items-stretch">
        <button className="pixel-btn flex-1" onClick={onWorldMap}>
          World Map
        </button>
        <button className="pixel-btn w-12 flex items-center justify-center !py-3 !px-0" onClick={onSettings} title="Settings">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M19.4 12.9c0-.3.1-.6.1-.9s0-.6-.1-.9l2-1.6c.2-.2.3-.5.2-.7l-1.9-3.3c-.1-.2-.4-.3-.7-.2l-2.4.9c-.5-.4-1-.7-1.6-1l-.4-2.6c0-.3-.3-.5-.6-.5h-3.8c-.3 0-.6.2-.6.5l-.4 2.6c-.6.3-1.1.6-1.6 1l-2.4-.9c-.3-.1-.6 0-.7.2L2.2 8.8c-.1.2 0 .5.2.7l2 1.6c0 .3-.1.6-.1.9s0 .6.1.9l-2 1.6c-.2.2-.3.5-.2.7l1.9 3.3c.1.2.4.3.7.2l2.4-.9c.5.4 1 .7 1.6 1l.4 2.6c0 .3.3.5.6.5h3.8c.3 0 .6-.2.6-.5l.4-2.6c.6-.3 1.1-.6 1.6-1l2.4.9c.3.1.6 0 .7-.2l1.9-3.3c.1-.2 0-.5-.2-.7l-2-1.6zM12 15.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" />
          </svg>
        </button>
      </div>

      {statsHero && <HeroStatsModal hero={statsHero} onClose={() => setStatsHero(null)} />}
    </div>
  )
}

export function ShopScreen({ state, onBuy, onBack }) {
  const itemIds = Object.keys(ITEMS)
  const [selectedItem, setSelectedItem] = useState(null)
  const selected = selectedItem ? ITEMS[selectedItem] : null
  const ownedCount = selectedItem ? (state.inventory[selectedItem] || 0) : 0
  const canAfford = selected && state.gold >= selected.price

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="pixel-panel p-2 text-center">
        <div className="font-pixel text-[10px] text-retro-gold">ITEM SHOP</div>
        <div className="flex justify-center mt-1">
          <GoldDisplay gold={state.gold} />
        </div>
      </div>

      <div className="flex gap-2 flex-1 min-h-0">
        <div className="pixel-panel p-2 flex-1 space-y-1 overflow-y-auto">
          {itemIds.map((itemId) => {
            const item = ITEMS[itemId]
            const canAffordItem = state.gold >= item.price
            return (
              <button
                key={itemId}
                className={`pixel-btn w-full text-left flex justify-between items-center ${
                  selectedItem === itemId ? 'ring-2 ring-retro-gold' : ''
                }`}
                disabled={!canAffordItem}
                onClick={() => setSelectedItem(itemId)}
              >
                <div>
                  <div className="font-pixel text-[8px]">{item.name}</div>
                  <div className="font-pixel text-[7px] text-retro-dim">{item.description}</div>
                  <div className="font-pixel text-[7px] text-retro-blue">Owned: {state.inventory[itemId] || 0}</div>
                </div>
                <div className="font-pixel text-[8px] text-retro-gold">{item.price} G</div>
              </button>
            )
          })}
        </div>

        {selected && (
          <div className="pixel-panel p-2 w-32 flex flex-col gap-1.5">
            <div className="font-pixel text-[9px] text-retro-gold text-center border-b border-retro-border pb-1">
              {selected.name}
            </div>
            <div className="font-pixel text-[7px] text-retro-text leading-relaxed">
              {selected.description}
            </div>
            {selected.heal && (
              <div className="font-pixel text-[7px] text-retro-green">HP +{selected.heal}</div>
            )}
            {selected.mpRestore && (
              <div className="font-pixel text-[7px] text-retro-blue">MP +{selected.mpRestore}</div>
            )}
            {selected.revive && (
              <div className="font-pixel text-[7px] text-retro-gold">Revives ally</div>
            )}
            {selected.cure && (
              <div className="font-pixel text-[7px] text-retro-green">Cures {selected.cure}</div>
            )}
            <div className="font-pixel text-[7px] text-retro-dim mt-1">Owned: {ownedCount}</div>
            <div className="font-pixel text-[8px] text-retro-gold">Price: {selected.price} G</div>
            <button
              className={`pixel-btn w-full mt-auto ${!canAfford ? 'opacity-40' : ''}`}
              disabled={!canAfford}
              onClick={() => onBuy(selectedItem)}
            >
              Buy
            </button>
          </div>
        )}
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
      <StoryStage state={state} speaker={speaker} dialogueIndex={state.dialogueIndex} dialogueLines={state.dialogueLines} />
      <div key={state.dialogueIndex} className="pixel-panel p-3 min-h-[220px] relative overflow-y-auto animate-dialogue-box">
        <div className="absolute inset-0 opacity-10 pointer-events-none dialogue-scanlines" />
        <div className="relative z-10 flex gap-3 items-start">
          <div className="w-14 h-14 pixel-panel flex items-center justify-center shrink-0 animate-dialogue-portrait">
            <span className="font-pixel text-lg text-retro-gold">{speakerInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-block font-pixel text-[9px] text-retro-gold mb-2 px-2 py-1 border border-retro-border bg-retro-bg animate-speaker-badge">
              {speaker || 'Narrator'}
            </div>
            <div className="font-pixel text-[9px] text-retro-text leading-loose animate-dialogue-text break-words">
              {text}
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-3 flex justify-end items-center gap-2">
          <span className="font-pixel text-[8px] text-retro-dim animate-next-prompt">▼</span>
          <button className="pixel-btn text-[8px]" onClick={onAdvance}>
            {state.dialogueIndex < state.dialogueLines.length - 1 ? 'Next' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StoryStage({ state, speaker, dialogueIndex, dialogueLines }) {
  const [surprised, setSurprised] = useState(false)

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
    Shadow: 'skeleton',
    'Shadow Lord': 'darkKnight',
  }
  const enemyNames = Object.keys(enemySpeakerMap)

  const visibleParty = state.party.slice(0, 4)
  const allEnemies = state.enemies.length > 0 ? state.enemies.slice(0, 3) : []
  const enemiesDefeated = allEnemies.length > 0 && allEnemies.every((e) => !e.alive || e.hp <= 0)

  const isLastLine = dialogueIndex >= dialogueLines.length - 1
  const hasEnemySpeaker = dialogueLines.slice(0, dialogueIndex + 1).some((line) => {
    const lineSpeaker = line.split(':')[0] || ''
    return enemyNames.includes(lineSpeaker)
  })
  const enemiesRevealed = enemiesDefeated || hasEnemySpeaker || (isLastLine && allEnemies.length > 0)
  const hasHiddenEnemies = allEnemies.some((e) => !e.isBoss)

  useEffect(() => {
    if (enemiesRevealed && hasHiddenEnemies) {
      setSurprised(true)
      const t = setTimeout(() => setSurprised(false), 800)
      return () => clearTimeout(t)
    }
  }, [enemiesRevealed, hasHiddenEnemies])

  const speakerSprite = heroSpeakerMap[speaker] || enemySpeakerMap[speaker]

  return (
    <div className="pixel-panel h-36 relative overflow-hidden animate-story-stage">
      <div className="absolute inset-0 story-backdrop" />
      <div className="absolute left-0 right-0 bottom-3 h-1 bg-retro-border/70" />

      {/* Party side */}
      <div className={`absolute left-4 bottom-4 flex items-end gap-2 animate-story-party-enter ${surprised ? 'animate-story-surprise' : ''}`}>
        {visibleParty.map((hero) => (
          <div
            key={hero.id}
            className={`story-actor ${speakerSprite === hero.sprite ? 'story-speaker' : ''}`}
          >
            <Sprite type={hero.sprite} size={speakerSprite === hero.sprite ? 46 : 34} />
          </div>
        ))}
      </div>

      {/* Enemy side — hiding bushes before reveal, jump-out after */}
      <div className="absolute right-4 bottom-4 flex items-end gap-2">
        {allEnemies.map((enemy) => {
          const isDefeated = !enemy.alive || enemy.hp <= 0
          const isHidden = !enemiesRevealed && !enemy.isBoss
          if (isHidden) {
            return (
              <div key={enemy.id} className="story-bush">
                <div className="story-bush-eyes" />
              </div>
            )
          }
          return (
            <div key={enemy.id} className={isDefeated ? '' : enemy.isBoss ? 'animate-story-boss-enter' : 'animate-story-jumpout'}>
              <div className={`story-actor ${speakerSprite === enemy.sprite && !isDefeated ? 'story-speaker' : ''}`}>
                <div className={`story-enemy ${isDefeated ? 'story-defeated' : ''}`}>
                  {enemy.isBoss && <div className="absolute -top-2 left-1/2 -translate-x-1/2 font-pixel text-[7px] text-retro-accent bg-retro-bg px-1 whitespace-nowrap scale-x-[-1]">BOSS</div>}
                  <Sprite type={enemy.sprite} size={speakerSprite === enemy.sprite ? 48 : 36} defeated={isDefeated} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allEnemies.length === 0 && (
        <div className="absolute right-6 bottom-5 animate-story-sparkle font-pixel text-retro-gold text-xs">✦</div>
      )}
    </div>
  )
}

export function VictoryScreen({ state, onConfirm }) {
  const { battleResult, party } = state
  const [xpAlloc, setXpAlloc] = useState(() => {
    if (!battleResult) return {}
    const total = battleResult.xp
    const perHero = Math.floor(total / party.length)
    const remainder = total - perHero * party.length
    const alloc = {}
    party.forEach((h, i) => {
      alloc[h.id] = perHero + (i < remainder ? 1 : 0)
    })
    return alloc
  })

  if (!battleResult) return null

  const totalXp = battleResult.xp
  const allocated = Object.values(xpAlloc).reduce((a, b) => a + b, 0)
  const remaining = totalXp - allocated

  const adjust = (heroId, delta) => {
    setXpAlloc((prev) => {
      const current = prev[heroId] || 0
      const newVal = Math.max(0, current + delta)
      const newAllocated = allocated - current + newVal
      if (newAllocated > totalXp) return prev
      return { ...prev, [heroId]: newVal }
    })
  }

  const splitEvenly = () => {
    const perHero = Math.floor(totalXp / party.length)
    const remainder = totalXp - perHero * party.length
    const alloc = {}
    party.forEach((h, i) => {
      alloc[h.id] = perHero + (i < remainder ? 1 : 0)
    })
    setXpAlloc(alloc)
  }

  const focusHero = (heroId) => {
    const others = party.filter((h) => h.id !== heroId)
    if (others.length === 0) {
      setXpAlloc({ [heroId]: totalXp })
      return
    }
    const half = Math.floor(totalXp * 0.5)
    const rest = totalXp - half
    const perOther = Math.floor(rest / others.length)
    const remainder = rest - perOther * others.length
    const alloc = {}
    alloc[heroId] = half
    others.forEach((h, i) => {
      alloc[h.id] = perOther + (i < remainder ? 1 : 0)
    })
    setXpAlloc(alloc)
  }

  const emptyXp = () => {
    const alloc = {}
    party.forEach((h) => {
      alloc[h.id] = 0
    })
    setXpAlloc(alloc)
  }

  const canConfirm = remaining === 0

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 overflow-y-auto">
      <div className="font-pixel text-lg text-retro-green">VICTORY!</div>
      <div className="pixel-panel p-3 w-full space-y-2">
        <div className="text-center font-pixel text-[9px] text-retro-text">Battle Rewards</div>
        {battleResult.isReplay && (
          <div className="text-center font-pixel text-[7px] text-retro-dim animate-pulse">
            Replay: 50% rewards
          </div>
        )}
        <div className="flex justify-between font-pixel text-[9px]">
          <span className="text-retro-dim">Total XP:</span>
          <span className={battleResult.isReplay ? 'text-retro-dim' : 'text-retro-green'}>{totalXp}</span>
        </div>
        <div className="flex justify-between font-pixel text-[9px]">
          <span className="text-retro-dim">Gold Gained:</span>
          <span className={battleResult.isReplay ? 'text-retro-dim' : 'text-retro-gold'}>{battleResult.gold}</span>
        </div>
        {battleResult.recruited && (
          <div className="text-center font-pixel text-[8px] text-retro-green animate-pulse pt-1">
            {battleResult.recruited.name} joined the party!
          </div>
        )}
      </div>

      <div className="pixel-panel p-2 w-full space-y-1">
        <div className="text-center font-pixel text-[8px] text-retro-gold mb-1">Allocate XP</div>
        <div className="text-center font-pixel text-[6px] text-retro-dim mb-1 leading-relaxed">
          Use -5/+5 to adjust. FOC gives 50% to one hero. Split resets to even.
        </div>
        <div className="text-center font-pixel text-[7px] text-retro-dim mb-1">
          Remaining: {remaining} XP
        </div>
        {party.map((hero) => {
          const currentXp = hero.xp || 0
          const addedXp = xpAlloc[hero.id] || 0
          const neededXp = xpForLevel(hero.level)
          const previewXp = currentXp + addedXp
          const currentPercent = Math.min(100, (currentXp / neededXp) * 100)
          const previewPercent = Math.min(100, (previewXp / neededXp) * 100)
          const willLevel = previewXp >= neededXp

          return (
            <div key={hero.id} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sprite type={hero.sprite} size={20} />
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[7px] text-retro-text truncate">{hero.name}</div>
                  <div className="font-pixel text-[6px] text-retro-dim">Lv.{hero.level}</div>
                </div>
                <button
                  className="pixel-btn text-[8px] px-1.5 py-0.5"
                  onClick={() => adjust(hero.id, -5)}
                  disabled={xpAlloc[hero.id] <= 0}
                >
                  -5
                </button>
                <span className="font-pixel text-[8px] text-retro-green w-10 text-center">
                  {addedXp}
                </span>
                <button
                  className="pixel-btn text-[8px] px-1.5 py-0.5"
                  onClick={() => adjust(hero.id, Math.min(5, remaining))}
                  disabled={remaining <= 0}
                >
                  +{Math.min(5, remaining)}
                </button>
                <button
                  className="pixel-btn text-[7px] px-1 py-0.5 text-retro-gold"
                  onClick={() => focusHero(hero.id)}
                  title="Focus 50% XP on this hero"
                >
                  FOC
                </button>
              </div>
              <div className="ml-7">
                <div className="flex justify-between font-pixel text-[6px] text-retro-dim mb-0.5">
                  <span>XP</span>
                  <span className={willLevel ? 'text-retro-gold' : ''}>
                    {currentXp}+{addedXp}/{neededXp}{willLevel ? ' LEVEL!' : ''}
                  </span>
                </div>
                <div className="h-1.5 bg-retro-bg border border-retro-border relative overflow-hidden">
                  <div className="h-full bg-retro-purple" style={{ width: `${currentPercent}%` }} />
                  <div className="absolute inset-y-0 bg-retro-gold opacity-80" style={{ left: `${currentPercent}%`, width: `${Math.max(0, previewPercent - currentPercent)}%` }} />
                </div>
              </div>
            </div>
          )
        })}
        <div className="flex gap-1 pt-1">
          <button className="pixel-btn flex-1 text-[7px]" onClick={splitEvenly}>
            Split Evenly
          </button>
          <button className="pixel-btn flex-1 text-[7px] text-retro-dim" onClick={emptyXp}>
            Empty XP
          </button>
        </div>
      </div>

      <button
        className="pixel-btn w-40"
        onClick={() => canConfirm && onConfirm(xpAlloc)}
        disabled={!canConfirm}
      >
        {canConfirm ? 'Confirm' : `${remaining} XP left to distribute`}
      </button>
    </div>
  )
}

export function DefeatScreen({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <div className="font-pixel text-lg text-retro-accent">DEFEAT...</div>
      <div className="font-pixel text-[9px] text-retro-dim text-center px-4">
        Your party has fallen. The darkness spreads...
      </div>
      <div className="font-pixel text-[7px] text-retro-gold text-center px-4">
        Your save is preserved. Use Continue on the title screen to reload.
      </div>
      <button className="pixel-btn w-40" onClick={onRetry}>
        Return to Title
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
        The Shadow Lord is vanquished.<br />Peace returns to the land.<br />Thank you for playing!
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

export function TravelScreen({ state, onComplete }) {
  const travel = state.travel
  const party = state.party.slice(0, 4)
  const [showEncounter, setShowEncounter] = useState(false)

  useEffect(() => {
    if (!travel) return
    let cancelled = false
    const encounterTimer = setTimeout(() => {
      if (travel.hasEncounter && !cancelled) setShowEncounter(true)
    }, 1200)
    const finishTimer = setTimeout(() => {
      if (!cancelled) onComplete()
    }, 2600)
    return () => {
      cancelled = true
      clearTimeout(encounterTimer)
      clearTimeout(finishTimer)
    }
  }, [travel, onComplete])

  const enemyType = travel?.randomEnemies?.[0]
  const enemySprite = enemyType ? (ENEMY_TYPES[enemyType]?.sprite || enemyType) : null

  return (
    <div className="flex justify-center items-center flex-1">
      <div className="pixel-panel w-full max-w-sm p-4 flex flex-col items-center">
        <div className="font-pixel text-sm text-retro-gold mb-4">TRAVELING</div>
        <div className="relative w-full h-32 bg-retro-bg border border-retro-border overflow-hidden rounded">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #6a6a8a 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          />
          <div
            className="absolute bottom-5 flex gap-1"
            style={{
              animation: 'travel-walk 2.4s linear forwards, travel-bob 0.35s ease-in-out infinite',
            }}
          >
            {party.map((hero) => (
              <Sprite key={hero.id} type={hero.sprite} size={24} />
            ))}
          </div>
          {showEncounter && enemySprite && (
            <div
              className="absolute bottom-5 right-4"
              style={{ animation: 'travel-enemy-pop 0.4s ease-out forwards' }}
            >
              <Sprite type={enemySprite} size={32} />
            </div>
          )}
        </div>
        <div className="font-pixel text-[8px] text-retro-dim mt-4">
          {travel?.hasEncounter ? 'Wild enemies ahead!' : 'On the road...'}
        </div>
      </div>
    </div>
  )
}
