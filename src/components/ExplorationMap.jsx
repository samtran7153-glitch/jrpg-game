import { useState, useEffect, useRef, useCallback } from 'react'
import { Sprite } from '../Sprites'

// Area-specific configurations (module-level to avoid re-creation on every render)
const areaConfigs = {
  forest: {
    width: 1200,
    height: 400,
    bgColor: '#2a4a2a',
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
    bgColor: '#2d2d2d',
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
    bgColor: '#3a3a4a',
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
    bgColor: '#1a1a2a',
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

const TREASURE_REVEAL_START = 160
const TREASURE_REVEAL_END = 80
const BATTLE_REVEAL_START = 200
const BATTLE_REVEAL_END = 120

export function ExplorationMap({ area, onTreasureFound, onBattleStart, onExit, party, discoveredTreasures = {}, completedSecretBattles = {} }) {
  const config = areaConfigs[area.id] || areaConfigs.forest
  const [playerPos, setPlayerPos] = useState(config.playerStart)
  const [isMoving, setIsMoving] = useState(false)
  const [facing, setFacing] = useState('right')
  const keysRef = useRef({})
  const isMovingRef = useRef(false)
  const facingRef = useRef('right')
  const animationRef = useRef(null)
  const triggeredRef = useRef(new Set())

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key)) {
        e.preventDefault()
        keysRef.current[e.key] = true
      }
    }

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key)) {
        e.preventDefault()
        keysRef.current[e.key] = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const setKey = (key, pressed) => {
    keysRef.current[key] = pressed
  }

  // Check collisions (with trigger guards to prevent firing every frame)
  const checkCollisions = useCallback((x, y) => {
    for (const treasure of config.treasures) {
      if (triggeredRef.current.has(treasure.id)) continue
      if (
        x + 15 > treasure.x &&
        x - 15 < treasure.x + treasure.width &&
        y + 15 > treasure.y &&
        y - 15 < treasure.y + treasure.height
      ) {
        triggeredRef.current.add(treasure.id)
        onTreasureFound(treasure)
      }
    }

    for (const battle of config.battles) {
      if (triggeredRef.current.has(battle.id)) continue
      if (
        x + 15 > battle.x &&
        x - 15 < battle.x + battle.width &&
        y + 15 > battle.y &&
        y - 15 < battle.y + battle.height
      ) {
        triggeredRef.current.add(battle.id)
        onBattleStart(battle)
      }
    }
  }, [config.treasures, config.battles, onTreasureFound, onBattleStart])

  // Game loop
  useEffect(() => {
    let lastTime = performance.now()
    let animationId

    const gameLoop = (time) => {
      const delta = Math.min((time - lastTime) / 16.67, 2)
      lastTime = time

      const keys = keysRef.current
      let dx = 0
      let dy = 0
      let moving = false

      if (keys['ArrowLeft'] || keys['a']) { dx -= 1; moving = true }
      if (keys['ArrowRight'] || keys['d']) { dx += 1; moving = true }
      if (keys['ArrowUp'] || keys['w']) { dy -= 1; moving = true }
      if (keys['ArrowDown'] || keys['s']) { dy += 1; moving = true }

      if (dx !== 0) {
        const nextFacing = dx > 0 ? 'right' : 'left'
        if (facingRef.current !== nextFacing) {
          facingRef.current = nextFacing
          setFacing(nextFacing)
        }
      }

      if (moving !== isMovingRef.current) {
        isMovingRef.current = moving
        setIsMoving(moving)
      }

      if (moving) {
        const speed = 6 * delta
        const len = Math.sqrt(dx * dx + dy * dy)
        dx = (dx / len) * speed
        dy = (dy / len) * speed

        const hitsObstacle = (x, y) => {
          for (const obstacle of config.obstacles) {
            if (
              x + 15 > obstacle.x &&
              x - 15 < obstacle.x + obstacle.width &&
              y + 15 > obstacle.y &&
              y - 15 < obstacle.y + obstacle.height
            ) {
              return true
            }
          }
          return false
        }

        setPlayerPos((prev) => {
          let newX = prev.x + dx
          let newY = prev.y + dy

          // If diagonal move hits an obstacle, try sliding along the clear axis
          if (hitsObstacle(newX, newY)) {
            const horizontalClear = !hitsObstacle(newX, prev.y)
            const verticalClear = !hitsObstacle(prev.x, newY)
            if (horizontalClear && verticalClear) {
              // Both axes clear independently; keep the larger movement component
              if (Math.abs(dx) >= Math.abs(dy)) {
                newY = prev.y
              } else {
                newX = prev.x
              }
            } else if (horizontalClear) {
              newY = prev.y
            } else if (verticalClear) {
              newX = prev.x
            } else {
              newX = prev.x
              newY = prev.y
            }
          }

          newX = Math.max(20, Math.min(config.width - 20, newX))
          newY = Math.max(20, Math.min(config.height - 20, newY))

          checkCollisions(newX, newY)
          return { x: newX, y: newY }
        })
      }

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [config, checkCollisions])

  // Camera follow player
  const cameraX = Math.max(0, Math.min(config.width - 400, playerPos.x - 200))
  const cameraY = Math.max(0, Math.min(config.height - 300, playerPos.y - 150))

  // Proximity reveal: objects fade in as the player approaches
  const getVisibility = (obj, end, start) => {
    const cx = obj.x + obj.width / 2
    const cy = obj.y + obj.height / 2
    const dist = Math.sqrt((cx - playerPos.x) ** 2 + (cy - playerPos.y) ** 2)
    if (dist > start) return 0
    if (dist < end) return 1
    return 1 - (dist - end) / (start - end)
  }

  // Use the first hero in the party
  const hero = party[0]

  return (
    <div className="flex flex-col h-full">
      <div className="pixel-panel p-2">
        <div className="flex justify-between items-center">
          <div className="font-pixel text-[10px] text-retro-gold">{area.name}</div>
          <button className="pixel-btn text-[6px] px-2 py-1" onClick={onExit}>
            Exit
          </button>
        </div>
        <div className="font-pixel text-[6px] text-retro-dim">Use arrow keys or WASD to move</div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-retro-bg">
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
          {config.treasures.map((treasure) => {
            const collected = discoveredTreasures[treasure.id]
            const visibility = getVisibility(treasure, TREASURE_REVEAL_END, TREASURE_REVEAL_START)
            if (visibility <= 0) return null
            return (
              <div
                key={treasure.id}
                className="absolute flex flex-col items-center justify-center transition-opacity duration-300"
                style={{
                  left: `${treasure.x}px`,
                  top: `${treasure.y}px`,
                  width: `${treasure.width}px`,
                  height: `${treasure.height}px`,
                  opacity: visibility
                }}
              >
                <div className={`w-4 h-4 rounded-sm transform rotate-45 transition-colors ${collected ? 'bg-retro-dim/50' : 'bg-retro-gold shadow-[0_0_8px_rgba(245,197,24,0.6)]'}`} />
                <div className={`font-pixel text-[4px] mt-3 whitespace-nowrap ${collected ? 'text-retro-dim' : 'text-retro-gold'}`}>
                  {collected ? 'DONE' : treasure.name}
                </div>
              </div>
            )
          })}

          {/* Render battles */}
          {config.battles.map((battle) => {
            const completed = completedSecretBattles[battle.id]
            const visibility = getVisibility(battle, BATTLE_REVEAL_END, BATTLE_REVEAL_START)
            if (visibility <= 0) return null
            return (
              <div
                key={battle.id}
                className="absolute flex flex-col items-center justify-center transition-opacity duration-300"
                style={{
                  left: `${battle.x}px`,
                  top: `${battle.y}px`,
                  width: `${battle.width}px`,
                  height: `${battle.height}px`,
                  opacity: visibility
                }}
              >
                <div className={`w-4 h-4 rounded-full transition-colors ${completed ? 'bg-retro-dim/50' : 'bg-retro-accent shadow-[0_0_8px_rgba(233,69,96,0.6)]'}`} />
                <div className={`font-pixel text-[4px] mt-3 whitespace-nowrap ${completed ? 'text-retro-dim' : 'text-retro-accent'}`}>
                  {completed ? 'DONE' : battle.name}
                </div>
              </div>
            )
          })}

          {/* Player */}
          {hero && (
            <div
              className="absolute"
              style={{
                left: `${playerPos.x - 15}px`,
                top: `${playerPos.y - 15}px`,
                transform: `scaleX(${facing === 'left' ? -1 : 1})`
              }}
            >
              <Sprite type={hero.sprite} size={30} />
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="absolute bottom-4 right-4 grid grid-cols-3 gap-1 select-none" style={{ touchAction: 'none' }}>
          <div />
          <button
            className="pixel-btn w-12 h-12 flex items-center justify-center active:scale-95"
            onPointerDown={(e) => { e.preventDefault(); setKey('ArrowUp', true) }}
            onPointerUp={(e) => { e.preventDefault(); setKey('ArrowUp', false) }}
            onPointerLeave={(e) => { e.preventDefault(); setKey('ArrowUp', false) }}
          >
            <span className="font-pixel text-[10px]">U</span>
          </button>
          <div />
          <button
            className="pixel-btn w-12 h-12 flex items-center justify-center active:scale-95"
            onPointerDown={(e) => { e.preventDefault(); setKey('ArrowLeft', true) }}
            onPointerUp={(e) => { e.preventDefault(); setKey('ArrowLeft', false) }}
            onPointerLeave={(e) => { e.preventDefault(); setKey('ArrowLeft', false) }}
          >
            <span className="font-pixel text-[10px]">L</span>
          </button>
          <button
            className="pixel-btn w-12 h-12 flex items-center justify-center active:scale-95"
            onPointerDown={(e) => { e.preventDefault(); setKey('ArrowDown', true) }}
            onPointerUp={(e) => { e.preventDefault(); setKey('ArrowDown', false) }}
            onPointerLeave={(e) => { e.preventDefault(); setKey('ArrowDown', false) }}
          >
            <span className="font-pixel text-[10px]">D</span>
          </button>
          <button
            className="pixel-btn w-12 h-12 flex items-center justify-center active:scale-95"
            onPointerDown={(e) => { e.preventDefault(); setKey('ArrowRight', true) }}
            onPointerUp={(e) => { e.preventDefault(); setKey('ArrowRight', false) }}
            onPointerLeave={(e) => { e.preventDefault(); setKey('ArrowRight', false) }}
          >
            <span className="font-pixel text-[10px]">R</span>
          </button>
        </div>
      </div>
    </div>
  )
}
