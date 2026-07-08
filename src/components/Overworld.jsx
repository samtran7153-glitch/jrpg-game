import { useState, useEffect, useRef, useCallback } from 'react'
import { Sprite } from '../Sprites'
import { CharacterCard, GoldDisplay, HeroStatsModal } from './Shared'
import { AREAS, ITEMS, xpForLevel } from '../gameState'
import { WorldMap } from './WorldMap'

// Side-scrolling exploration component
function ExplorationPanel({ area, party, onTreasureFound, onBattleStart }) {
  const [playerPos, setPlayerPos] = useState({ x: 100, y: 200 })
  const [isMoving, setIsMoving] = useState(false)
  const [facing, setFacing] = useState('right')
  const [keys, setKeys] = useState({})
  const animationRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())

  // Area-specific configurations
  const areaConfigs = {
    forest: {
      width: 1200,
      height: 400,
      playerStart: { x: 100, y: 200 },
      treasures: [
        { id: 'ancient_tree', x: 300, y: 150, width: 60, height: 80, name: 'Ancient Tree' },
        { id: 'hidden_grove', x: 800, y: 250, width: 50, height: 60, name: 'Hidden Grove' },
      ],
      battles: [
        { id: 'alpha_wolf', x: 600, y: 180, width: 40, height: 40, name: 'Alpha Wolf' },
      ],
      obstacles: [
        { x: 200, y: 100, width: 80, height: 200 }, // Tree cluster
        { x: 500, y: 250, width: 100, height: 100 }, // Rock formation
      ],
      background: 'linear-gradient(to bottom, #87CEEB 0%, #98D98E 60%, #2a4a2a 100%)'
    },
    cave: {
      width: 1200,
      height: 400,
      playerStart: { x: 100, y: 200 },
      treasures: [
        { id: 'crystal_cache', x: 400, y: 180, width: 50, height: 60, name: 'Crystal Cache' },
        { id: 'forgotten_chest', x: 900, y: 220, width: 40, height: 40, name: 'Forgotten Chest' },
      ],
      battles: [
        { id: 'cave_troll', x: 650, y: 200, width: 50, height: 50, name: 'Cave Troll' },
      ],
      obstacles: [
        { x: 300, y: 120, width: 120, height: 180 }, // Rock formation
        { x: 750, y: 280, width: 80, height: 80 }, // Stalagmites
      ],
      background: 'linear-gradient(to bottom, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
    },
    castle: {
      width: 1200,
      height: 400,
      playerStart: { x: 100, y: 200 },
      treasures: [
        { id: 'armory', x: 350, y: 160, width: 60, height: 70, name: 'Castle Armory' },
        { id: 'treasury', x: 850, y: 240, width: 50, height: 50, name: 'Royal Treasury' },
      ],
      battles: [
        { id: 'royal_guard', x: 600, y: 200, width: 45, height: 45, name: 'Royal Guard Captain' },
      ],
      obstacles: [
        { x: 250, y: 100, width: 100, height: 200 }, // Pillar
        { x: 700, y: 250, width: 150, height: 100 }, // Furniture
      ],
      background: 'linear-gradient(to bottom, #2a2a3a 0%, #3a3a4a 50%, #2a2a3a 100%)'
    },
    shadow: {
      width: 1200,
      height: 400,
      playerStart: { x: 100, y: 200 },
      treasures: [
        { id: 'void_crystal', x: 450, y: 170, width: 55, height: 65, name: 'Void Crystal' },
        { id: 'shadow_artifact', x: 820, y: 230, width: 45, height: 45, name: 'Shadow Artifact' },
      ],
      battles: [
        { id: 'shadow_beast', x: 630, y: 190, width: 48, height: 48, name: 'Shadow Beast' },
      ],
      obstacles: [
        { x: 350, y: 130, width: 90, height: 170 }, // Void mass
        { x: 780, y: 270, width: 110, height: 90 }, // Dark energy
      ],
      background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a2a 50%, #0a0a1a 100%)'
    }
  }

  const config = areaConfigs[area.id] || areaConfigs.forest

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key)) {
        e.preventDefault()
        setKeys(prev => ({ ...prev, [e.key]: true }))
      }
    }

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key)) {
        e.preventDefault()
        setKeys(prev => ({ ...prev, [e.key]: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Check collisions
  const checkCollisions = useCallback((newX, newY) => {
    // Check treasure collisions
    for (const treasure of config.treasures) {
      if (
        newX + 15 > treasure.x &&
        newX - 15 < treasure.x + treasure.width &&
        newY + 15 > treasure.y &&
        newY - 15 < treasure.y + treasure.height
      ) {
        onTreasureFound(treasure)
        return 'treasure'
      }
    }

    // Check battle collisions
    for (const battle of config.battles) {
      if (
        newX + 15 > battle.x &&
        newX - 15 < battle.x + battle.width &&
        newY + 15 > battle.y &&
        newY - 15 < battle.y + battle.height
      ) {
        onBattleStart(battle)
        return 'battle'
      }
    }

    return null
  }, [config.treasures, config.battles, onTreasureFound, onBattleStart])

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = now - lastUpdateRef.current
      
      if (deltaTime < 16) { // Cap at ~60 FPS
        animationRef.current = requestAnimationFrame(gameLoop)
        return
      }
      
      lastUpdateRef.current = now

      setPlayerPos(prevPos => {
        let newX = prevPos.x
        let newY = prevPos.y
        let moving = false
        let newFacing = facing

        const speed = 3

        if (keys['ArrowLeft'] || keys['a']) {
          newX -= speed
          moving = true
          newFacing = 'left'
        }
        if (keys['ArrowRight'] || keys['d']) {
          newX += speed
          moving = true
          newFacing = 'right'
        }
        if (keys['ArrowUp'] || keys['w']) {
          newY -= speed
          moving = true
        }
        if (keys['ArrowDown'] || keys['s']) {
          newY += speed
          moving = true
        }

        // Boundary checking
        newX = Math.max(20, Math.min(config.width - 20, newX))
        newY = Math.max(20, Math.min(config.height - 20, newY))

        // Collision detection with obstacles
        let canMove = true
        for (const obstacle of config.obstacles) {
          if (
            newX + 15 > obstacle.x &&
            newX - 15 < obstacle.x + obstacle.width &&
            newY + 15 > obstacle.y &&
            newY - 15 < obstacle.y + obstacle.height
          ) {
            canMove = false
            break
          }
        }

        if (canMove && (newX !== prevPos.x || newY !== prevPos.y)) {
          setIsMoving(moving)
          setFacing(newFacing)

          // Check collisions
          const collision = checkCollisions(newX, newY)
          if (collision) {
            return prevPos // Don't move if collision occurred
          }

          return { x: newX, y: newY }
        } else {
          setIsMoving(false)
          return prevPos
        }
      })

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [keys, facing, config, checkCollisions])

  // Camera follow player
  const cameraX = Math.max(0, Math.min(config.width - 400, playerPos.x - 200))
  const cameraY = Math.max(0, Math.min(config.height - 300, playerPos.y - 150))

  // Use the first hero in the party
  const hero = party[0]

  return (
    <div className="pixel-panel p-2 flex-1">
      <div className="text-center font-pixel text-[8px] text-retro-gold mb-2">EXPLORE</div>
      <div className="text-center font-pixel text-[5px] text-retro-dim mb-2">Use arrow keys or WASD to move</div>
      
      <div className="relative h-48 bg-retro-bg border border-retro-border rounded overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            width: `${config.width}px`,
            height: `${config.height}px`,
            background: config.background,
            transform: `translate(${-cameraX}px, ${-cameraY}px)`
          }}
        >
          {/* Render obstacles */}
          {config.obstacles.map((obstacle, index) => (
            <div
              key={`obstacle-${index}`}
              className="absolute bg-retro-dim/50 border border-retro-dim"
              style={{
                left: `${obstacle.x}px`,
                top: `${obstacle.y}px`,
                width: `${obstacle.width}px`,
                height: `${obstacle.height}px`
              }}
            />
          ))}

          {/* Render treasures */}
          {config.treasures.map((treasure) => (
            <div
              key={treasure.id}
              className="absolute flex items-center justify-center animate-pulse"
              style={{
                left: `${treasure.x}px`,
                top: `${treasure.y}px`,
                width: `${treasure.width}px`,
                height: `${treasure.height}px`
              }}
            >
              <div className="text-xl">💎</div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 font-pixel text-[3px] text-retro-gold whitespace-nowrap">
                {treasure.name}
              </div>
            </div>
          ))}

          {/* Render battles */}
          {config.battles.map((battle) => (
            <div
              key={battle.id}
              className="absolute flex items-center justify-center animate-pulse"
              style={{
                left: `${battle.x}px`,
                top: `${battle.y}px`,
                width: `${battle.width}px`,
                height: `${battle.height}px`
              }}
            >
              <div className="text-xl">⚔️</div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 font-pixel text-[3px] text-retro-accent whitespace-nowrap">
                {battle.name}
              </div>
            </div>
          ))}

          {/* Player */}
          {hero && (
            <div
              className={`absolute ${isMoving ? 'duration-100' : 'duration-200'}`}
              style={{
                left: `${playerPos.x - 15}px`,
                top: `${playerPos.y - 15}px`,
                transform: `scaleX(${facing === 'left' ? -1 : 1})`
              }}
            >
              <Sprite type={hero.sprite} size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SettingsScreen({ onReset, onBack }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex justify-center items-center flex-1">
      <div className="pixel-panel w-full max-w-sm p-5 flex flex-col items-center gap-4">
        <h2 className="font-pixel text-sm text-retro-gold tracking-wider">SETTINGS</h2>

        <div className="w-full space-y-3">
          <div className="pixel-panel p-3 w-full">
            <div className="font-pixel text-[8px] text-retro-text mb-2">Check for Updates</div>
            <div className="font-pixel text-[6px] text-retro-dim mb-3">
              Refresh the game to get the latest version.
            </div>
            <button className="pixel-btn w-full" onClick={() => window.location.reload()}>
              Refresh Game
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

export function TitleScreen({ onStart }) {
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
        <button className="pixel-btn w-48 mt-2" onClick={onStart}>
          PRESS START
        </button>
      </div>
    </div>
  )
}

export function AreaMapScreen({ state, onSelectBattle, onSelectArea, onUseItem, onShop, onWorldMap, onExplore, onTreasureFound, onBattleStart, onSettings }) {
  const area = AREAS[state.currentAreaIndex]
  if (!area) return null
  const areaComplete = state.currentBattleIndex >= area.battles.length
  const selectedPath = state.selectedPaths[state.currentAreaIndex]
  const pathBattles = selectedPath ? area.paths[selectedPath].battles : area.battles.map((_, i) => i)

  const [showItems, setShowItems] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [statsHero, setStatsHero] = useState(null)
  const [discoveryHint, setDiscoveryHint] = useState(null)

  const itemIds = Object.keys(state.inventory).filter((id) => state.inventory[id] > 0)

  // Check for nearby hidden content
  const checkForHiddenContent = (x, y) => {
    const checkNearby = (content) => {
      const distance = Math.sqrt(Math.pow(content.x - x, 2) + Math.pow(content.y - y, 2))
      return distance < 15 // Within discovery radius
    }

    // Check treasures
    for (const treasure of area.hiddenTreasures || []) {
      if (!state.discoveredTreasures[treasure.id] && checkNearby(treasure)) {
        setDiscoveryHint({ type: 'treasure', content: treasure })
        return
      }
    }

    // Check secret battles
    for (const battle of area.secretBattles || []) {
      if (!state.completedSecretBattles[battle.id] && checkNearby(battle)) {
        setDiscoveryHint({ type: 'battle', content: battle })
        return
      }
    }

    setDiscoveryHint(null)
  }

  const handleDiscovery = () => {
    if (!discoveryHint) return

    if (discoveryHint.type === 'treasure') {
      const treasure = discoveryHint.content
      setState((s) => ({
        ...s,
        gold: s.gold + (treasure.gold || 0),
        inventory: { ...s.inventory, [treasure.item]: (s.inventory[treasure.item] || 0) + 1 },
        discoveredTreasures: { ...s.discoveredTreasures, [treasure.id]: true },
        log: [...s.log, `Found ${treasure.name}! +${treasure.gold} gold, +1 ${treasure.item}`].slice(-6),
      }))
    } else if (discoveryHint.type === 'battle') {
      const battle = discoveryHint.content
      onSelectBattle(null, battle.enemies, null, null, null, battle)
    }

    setDiscoveryHint(null)
  }

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
            {area.battles.map((battle, i) => {
              const battleIndex = pathBattles[i]
              if (battleIndex === undefined) return null
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
                    {isCompleted ? '[DONE]' : isCurrent ? '[!]' : isLocked ? '[ ]' : '[!]'}
                  </span>
                  <span className="flex gap-1">
                    {showSprites
                      ? battle.enemies.map((e, ei) => (
                          <Sprite key={ei} type={e} size={16} />
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

      <div className="grid grid-cols-2 gap-1">
        <button className="pixel-btn" onClick={() => { setShowItems(!showItems); setSelectedItem(null) }}>Items</button>
        <button className="pixel-btn" onClick={onShop}>Shop</button>
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

      {/* Discovery popup */}
      {discoveryHint && (
        <div className="pixel-panel p-3 w-full space-y-2 animate-pulse">
          <div className="font-pixel text-[8px] text-retro-gold text-center">
            Something nearby!
          </div>
          <div className="font-pixel text-[6px] text-retro-dim text-center">
            {discoveryHint.content.hint}
          </div>
          <button className="pixel-btn w-full" onClick={handleDiscovery}>
            {discoveryHint.type === 'treasure' ? 'Investigate' : 'Challenge'}
          </button>
        </div>
      )}

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

  const speakerSprite = heroSpeakerMap[speaker] || enemySpeakerMap[speaker]

  return (
    <div className="pixel-panel h-36 relative overflow-hidden animate-story-stage">
      <div className="absolute inset-0 story-backdrop" />
      <div className="absolute left-0 right-0 bottom-3 h-1 bg-retro-border/70" />

      {/* Party side */}
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

      {/* Enemy side — hiding bushes before reveal, jump-out after */}
      <div className="absolute right-4 bottom-4 flex items-end gap-2">
        {!enemiesRevealed && allEnemies.length > 0 && (
          <>
            {allEnemies.map((enemy) => (
              <div key={enemy.id} className="story-bush">
                <div className="story-bush-eyes" />
              </div>
            ))}
            <div className="absolute -top-3 right-8 animate-story-rustle font-pixel text-[6px] text-retro-dim">?</div>
          </>
        )}
        {enemiesRevealed && allEnemies.map((enemy) => {
          const isDefeated = !enemy.alive || enemy.hp <= 0
          return (
            <div key={enemy.id} className={isDefeated ? '' : 'animate-story-jumpout'}>
              <div className={`story-actor ${!isDefeated && speakerSprite === enemy.sprite ? 'story-speaker' : ''}`}>
                <div className={`story-enemy ${isDefeated ? 'story-defeated' : ''}`}>
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
    const half = Math.floor(totalXp * 0.5)
    const rest = totalXp - half
    const others = party.filter((h) => h.id !== heroId)
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
      <button className="pixel-btn w-40" onClick={onRetry}>
        Return Home
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
