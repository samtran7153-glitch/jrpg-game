import { useState, useEffect, useRef, useCallback } from 'react'
import { Sprite } from '../Sprites'
import { ENEMY_TYPES, HERO_CLASSES } from '../gameData'

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
      { x: 200, y: 100, width: 80, height: 200, type: 'tree' }, // Tree cluster
      { x: 500, y: 250, width: 100, height: 100, type: 'rock' }, // Rock formation
      // Trees the player must weave between to reach the Alpha Wolf's lair
      { x: 560, y: 150, width: 30, height: 30, type: 'tree' },
      { x: 656, y: 146, width: 30, height: 30, type: 'tree' },
      { x: 702, y: 198, width: 30, height: 30, type: 'tree' },
      { x: 640, y: 246, width: 30, height: 30, type: 'tree' },
      { x: 556, y: 234, width: 30, height: 30, type: 'tree' },
    ],
    ground: 'linear-gradient(to bottom, #4a7a3a 0%, #3a5a2a 60%, #24331a 100%)',
    decor: [
      { type: 'tree', x: 150, y: 320 }, { type: 'tree', x: 430, y: 90 },
      { type: 'tree', x: 950, y: 110 }, { type: 'tree', x: 1080, y: 330 },
      { type: 'bush', x: 380, y: 340 }, { type: 'bush', x: 720, y: 130 },
      { type: 'bush', x: 1000, y: 300 }, { type: 'flower', x: 250, y: 300 },
      { type: 'flower', x: 560, y: 120 }, { type: 'flower', x: 880, y: 340 },
      { type: 'flower', x: 680, y: 320 },
      // Dense, dark grove ringing the Alpha Wolf's lair (battle marker ~620,200)
      { type: 'darkTree', x: 520, y: 195 }, { type: 'darkTree', x: 546, y: 158 },
      { type: 'darkTree', x: 578, y: 138 }, { type: 'darkTree', x: 615, y: 130 },
      { type: 'darkTree', x: 655, y: 138 }, { type: 'darkTree', x: 692, y: 160 },
      { type: 'darkTree', x: 710, y: 205 }, { type: 'darkTree', x: 690, y: 244 },
      { type: 'darkTree', x: 600, y: 262 }, { type: 'darkTree', x: 552, y: 242 },
      { type: 'darkTree', x: 505, y: 232 }, { type: 'darkTree', x: 728, y: 172 },
      { type: 'darkTree', x: 640, y: 116 }, { type: 'darkTree', x: 578, y: 252 },
      { type: 'bush', x: 588, y: 224 }, { type: 'bush', x: 664, y: 224 },
      { type: 'bush', x: 620, y: 242 },
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
      { x: 300, y: 120, width: 120, height: 180, type: 'rock' }, // Rock formation
      { x: 750, y: 280, width: 80, height: 80, type: 'rock' }, // Stalagmites
    ],
    ground: 'linear-gradient(to bottom, #3a3a3a 0%, #2a2a2a 70%, #1c1c1c 100%)',
    decor: [
      { type: 'stalagmite', x: 180, y: 330 }, { type: 'stalagmite', x: 520, y: 110 },
      { type: 'stalagmite', x: 1050, y: 320 }, { type: 'crystal', x: 250, y: 300 },
      { type: 'crystal', x: 620, y: 130 }, { type: 'crystal', x: 980, y: 300 },
      { type: 'crystal', x: 830, y: 340 }, { type: 'rock', x: 480, y: 340 },
      { type: 'rock', x: 700, y: 120 }, { type: 'rock', x: 1120, y: 200 },
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
      { x: 250, y: 100, width: 100, height: 200, type: 'rock' }, // Pillar
      { x: 700, y: 250, width: 150, height: 100, type: 'rock' }, // Furniture
    ],
    ground: 'linear-gradient(to bottom, #4a4a58 0%, #3a3a46 70%, #2a2a34 100%)',
    decor: [
      { type: 'pillar', x: 160, y: 300 }, { type: 'pillar', x: 480, y: 300 },
      { type: 'pillar', x: 1050, y: 300 }, { type: 'torch', x: 400, y: 130 },
      { type: 'torch', x: 620, y: 130 }, { type: 'torch', x: 940, y: 130 },
      { type: 'banner', x: 300, y: 90 }, { type: 'banner', x: 900, y: 90 },
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
      { x: 350, y: 130, width: 90, height: 170, type: 'rock' }, // Void mass
      { x: 780, y: 270, width: 110, height: 90, type: 'rock' }, // Dark energy
    ],
    ground: 'linear-gradient(to bottom, #1e1e2e 0%, #141420 70%, #0c0c16 100%)',
    decor: [
      { type: 'wisp', x: 200, y: 300 }, { type: 'wisp', x: 560, y: 120 },
      { type: 'wisp', x: 700, y: 320 }, { type: 'wisp', x: 1050, y: 200 },
      { type: 'crystal', x: 280, y: 330 }, { type: 'crystal', x: 640, y: 310 },
      { type: 'crystal', x: 960, y: 130 }, { type: 'stalagmite', x: 500, y: 340 },
      { type: 'stalagmite', x: 1100, y: 320 },
    ],
    background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a2a 50%, #0a0a1a 100%)'
  }
}

// Purely decorative, non-colliding scenery drawn from CSS shapes (no emoji).
function DecorItem({ type }) {
  switch (type) {
    case 'tree':
      return (
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[22px] border-b-green-700/80 -mb-1" />
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-green-800/80 -mb-1" />
          <div className="w-2 h-3 bg-yellow-900/80 rounded-sm" />
        </div>
      )
    case 'darkTree':
      return (
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[24px] border-b-green-900/90 -mb-1" />
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[27px] border-b-green-950/90 -mb-1" />
          <div className="w-2 h-4 bg-yellow-950/90 rounded-sm" />
        </div>
      )
    case 'bush':
      return <div className="w-7 h-5 bg-green-800/70 rounded-full border border-green-900/50" />
    case 'flower':
      return (
        <div className="flex flex-col items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-400/80" />
          <div className="w-px h-2 bg-green-700/70" />
        </div>
      )
    case 'stalagmite':
      return <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[24px] border-b-stone-600/80" />
    case 'crystal':
      return <div className="w-3 h-5 bg-cyan-400/60 rotate-45 rounded-sm shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
    case 'rock':
      return <div className="w-6 h-4 bg-stone-500/70 rounded-t-full border border-stone-700/50" />
    case 'pillar':
      return (
        <div className="flex flex-col items-center">
          <div className="w-8 h-2 bg-slate-400/70 rounded-sm" />
          <div className="w-6 h-24 bg-slate-500/60" />
          <div className="w-8 h-2 bg-slate-400/70 rounded-sm" />
        </div>
      )
    case 'torch':
      return (
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-orange-400/90 shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse" />
          <div className="w-1 h-5 bg-yellow-900/80" />
        </div>
      )
    case 'banner':
      return (
        <div className="flex flex-col items-center">
          <div className="w-6 h-px bg-slate-400/60" />
          <div className="w-5 h-10 bg-purple-800/70 [clip-path:polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)]" />
        </div>
      )
    case 'wisp':
      return <div className="w-2.5 h-2.5 rounded-full bg-purple-400/60 shadow-[0_0_10px_rgba(192,132,252,0.7)] animate-pulse" />
    default:
      return null
  }
}

const TREASURE_REVEAL_START = 160
const TREASURE_REVEAL_END = 80
const BATTLE_REVEAL_START = 200
const BATTLE_REVEAL_END = 120
// Half-size of a treasure's visible marker; collection requires touching this,
// not merely entering the treasure's (much larger) bounding box.
const MARKER_HALF = 10
// Secret battles are locked until the party includes this hero class (Kira).
// A secret battle may override it with its own `requires` classKey.
const SECRET_BATTLE_REQUIRES = 'archer'

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
  // A secret battle the player has walked into and must choose to fight or leave.
  const [encounter, setEncounter] = useState(null)
  const encounterRef = useRef(false)   // pauses movement while the choice is open
  const declinedRef = useRef(new Set()) // battles left alone; re-arm once we walk away
  // Measure the actual map viewport so the camera math matches it (avoids empty
  // background bands sliding in/out at the edges, which look like the map resizing).
  const viewportRef = useRef(null)
  const [viewport, setViewport] = useState({ w: 400, h: 300 })

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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

    // Release every held key if the window loses focus or is hidden. Without
    // this, a keyup that fires off-window never arrives and the hero keeps
    // walking on its own (looks "stuck" against a wall).
    const releaseAllKeys = () => {
      keysRef.current = {}
      isMovingRef.current = false
      setIsMoving(false)
    }
    const handleVisibility = () => { if (document.hidden) releaseAllKeys() }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', releaseAllKeys)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', releaseAllKeys)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const setKey = (key, pressed) => {
    keysRef.current[key] = pressed
  }

  // Check collisions (with trigger guards to prevent firing every frame)
  const checkCollisions = useCallback((x, y) => {
    for (const treasure of config.treasures) {
      if (triggeredRef.current.has(treasure.id)) continue
      // Require the player to actually touch the visible marker (a small diamond
      // centered in the treasure's bounding box), not just enter the large box.
      const cx = treasure.x + treasure.width / 2
      const cy = treasure.y + treasure.height / 2
      if (
        x + 15 > cx - MARKER_HALF &&
        x - 15 < cx + MARKER_HALF &&
        y + 15 > cy - MARKER_HALF &&
        y - 15 < cy + MARKER_HALF
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
        // Present the story + fight/leave choice instead of fighting immediately.
        const data = (area.secretBattles || []).find((b) => b.id === battle.id)
        setEncounter(data || { id: battle.id, name: battle.name, enemies: [], story: [] })
        encounterRef.current = true
        keysRef.current = {}
        isMovingRef.current = false
        setIsMoving(false)
      }
    }
  }, [config.treasures, config.battles, area, onTreasureFound])

  // Game loop
  useEffect(() => {
    let lastTime = performance.now()
    let animationId

    const gameLoop = (time) => {
      const delta = Math.min((time - lastTime) / 16.67, 2)
      lastTime = time

      // Freeze the world while the fight/leave choice is open.
      if (encounterRef.current) {
        animationId = requestAnimationFrame(gameLoop)
        return
      }

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

      // Opposite keys (e.g. Left+Right) cancel out to a zero vector. Without this
      // guard, normalizing it divides by zero -> NaN position -> hero frozen
      // permanently anywhere on the map.
      const len = Math.sqrt(dx * dx + dy * dy)
      if (moving && len > 0) {
        const speed = 5 * delta
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

          // Re-arm any battle the player left alone once they've stepped away,
          // so they can return and reconsider it later.
          if (declinedRef.current.size) {
            for (const b of config.battles) {
              if (!declinedRef.current.has(b.id)) continue
              const bx = b.x + b.width / 2
              const by = b.y + b.height / 2
              if (Math.hypot(newX - bx, newY - by) > 70) {
                declinedRef.current.delete(b.id)
                triggeredRef.current.delete(b.id)
              }
            }
          }

          checkCollisions(newX, newY)
          return { x: newX, y: newY }
        })
      }

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [config, checkCollisions])

  // World renders at its natural size (no stretching). The fixed-size frame is
  // always smaller than the world, so it stays fully covered as the player moves.
  const worldW = config.width
  const worldH = config.height

  // Camera follows the player, clamped to the world using the real frame size.
  const cameraX = Math.max(0, Math.min(worldW - viewport.w, playerPos.x - viewport.w / 2))
  const cameraY = Math.max(0, Math.min(worldH - viewport.h, playerPos.y - viewport.h / 2))

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

  const reqClass = encounter?.requires || SECRET_BATTLE_REQUIRES
  const canFight = !encounter || party.some((h) => h.classKey === reqClass)
  const reqName = HERO_CLASSES[reqClass]?.name || 'a stronger ally'

  const acceptEncounter = () => {
    const e = encounter
    if (!e || !party.some((h) => h.classKey === (e.requires || SECRET_BATTLE_REQUIRES))) return
    encounterRef.current = false
    setEncounter(null)
    onBattleStart({ id: e.id })
  }

  const declineEncounter = () => {
    if (encounter) declinedRef.current.add(encounter.id)
    encounterRef.current = false
    setEncounter(null)
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="pixel-panel p-2">
        <div className="flex justify-between items-center">
          <div className="font-pixel text-[10px] text-retro-gold">{area.name}</div>
          <button className="pixel-btn text-[6px] px-2 py-1" onClick={onExit}>
            Exit
          </button>
        </div>
        <div className="font-pixel text-[6px] text-retro-dim">Use arrow keys or WASD to move</div>
      </div>

      <div ref={viewportRef} className="relative overflow-hidden bg-retro-bg shrink-0" style={{ height: 300 }}>
        <div
          className="absolute inset-0"
          style={{
            width: `${worldW}px`,
            height: `${worldH}px`,
            background: config.background,
            transform: `translate(${-cameraX}px, ${-cameraY}px)`
          }}
        >
          {/* Ground plane: a textured surface below the horizon so objects
              stand on real ground instead of a bare gradient. */}
          {config.ground && (
            <>
              <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ top: '26%', background: config.ground }} />
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  top: '26%',
                  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.10) 1px, transparent 1px)',
                  backgroundSize: '9px 9px',
                }}
              />
              <div className="absolute inset-x-0 pointer-events-none" style={{ top: '26%', height: 2, background: 'rgba(255,255,255,0.08)' }} />
            </>
          )}

          {/* Render decorative scenery (non-colliding) */}
          {(config.decor || []).map((item, index) => (
            <div
              key={`decor-${index}`}
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
              style={{ left: `${item.x}px`, top: `${item.y}px` }}
            >
              <DecorItem type={item.type} />
            </div>
          ))}

          {/* Render obstacles (trees show foliage; everything else is solid) */}
          {config.obstacles.map((obstacle, index) => (
            <div
              key={`obstacle-${index}`}
              className={`absolute ${
                obstacle.type === 'tree'
                  ? 'bg-green-900/85 border border-green-950/60 rounded-[45%] shadow-[inset_0_-4px_6px_rgba(0,0,0,0.35)]'
                  : 'bg-retro-dim/50 border border-retro-dim'
              }`}
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

      </div>

      {/* Mobile D-pad — placed below the map so it never covers the play area */}
      <div className="mt-2 grid grid-cols-3 gap-1 w-max mx-auto select-none opacity-80" style={{ touchAction: 'none' }}>
        <div />
        <button
          className="pixel-btn w-11 h-11 flex items-center justify-center active:scale-95"
          onPointerDown={(e) => { e.preventDefault(); setKey('ArrowUp', true) }}
          onPointerUp={(e) => { e.preventDefault(); setKey('ArrowUp', false) }}
          onPointerLeave={(e) => { e.preventDefault(); setKey('ArrowUp', false) }}
          onPointerCancel={(e) => { e.preventDefault(); setKey('ArrowUp', false) }}
        >
          <span className="font-pixel text-[10px]">U</span>
        </button>
        <div />
        <button
          className="pixel-btn w-11 h-11 flex items-center justify-center active:scale-95"
          onPointerDown={(e) => { e.preventDefault(); setKey('ArrowLeft', true) }}
          onPointerUp={(e) => { e.preventDefault(); setKey('ArrowLeft', false) }}
          onPointerLeave={(e) => { e.preventDefault(); setKey('ArrowLeft', false) }}
          onPointerCancel={(e) => { e.preventDefault(); setKey('ArrowLeft', false) }}
        >
          <span className="font-pixel text-[10px]">L</span>
        </button>
        <button
          className="pixel-btn w-11 h-11 flex items-center justify-center active:scale-95"
          onPointerDown={(e) => { e.preventDefault(); setKey('ArrowDown', true) }}
          onPointerUp={(e) => { e.preventDefault(); setKey('ArrowDown', false) }}
          onPointerLeave={(e) => { e.preventDefault(); setKey('ArrowDown', false) }}
          onPointerCancel={(e) => { e.preventDefault(); setKey('ArrowDown', false) }}
        >
          <span className="font-pixel text-[10px]">D</span>
        </button>
        <button
          className="pixel-btn w-11 h-11 flex items-center justify-center active:scale-95"
          onPointerDown={(e) => { e.preventDefault(); setKey('ArrowRight', true) }}
          onPointerUp={(e) => { e.preventDefault(); setKey('ArrowRight', false) }}
          onPointerLeave={(e) => { e.preventDefault(); setKey('ArrowRight', false) }}
          onPointerCancel={(e) => { e.preventDefault(); setKey('ArrowRight', false) }}
        >
          <span className="font-pixel text-[10px]">R</span>
        </button>
      </div>

      {/* Secret battle encounter: story + choose to fight or leave */}
      {encounter && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-4">
          <div className="pixel-panel p-4 w-full max-w-xs space-y-3 bg-retro-bg">
            <div className="font-pixel text-[10px] text-retro-accent text-center">{encounter.name}</div>
            {encounter.enemies?.length > 0 && (
              <div className="flex justify-center gap-2">
                {encounter.enemies.map((e, i) => (
                  <Sprite key={i} type={ENEMY_TYPES[e]?.sprite || e} size={28} />
                ))}
              </div>
            )}
            <div className="space-y-1">
              {(encounter.story || [encounter.hint]).filter(Boolean).map((line, i) => (
                <div key={i} className="font-pixel text-[7px] text-retro-text leading-relaxed">{line}</div>
              ))}
            </div>
            {canFight ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button className="pixel-btn text-retro-accent" onClick={acceptEncounter}>Fight</button>
                <button className="pixel-btn text-retro-dim" onClick={declineEncounter}>Leave</button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="font-pixel text-[7px] text-retro-gold text-center leading-relaxed">
                  You're not ready for this. Return once {reqName} has joined you.
                </div>
                <button className="pixel-btn w-full text-retro-dim" onClick={declineEncounter}>Back</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
