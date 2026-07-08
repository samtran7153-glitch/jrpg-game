import { useState, useEffect, useRef, useCallback } from 'react'
import { Sprite } from '../Sprites'

export function ExplorationMap({ area, onTreasureFound, onBattleStart, onExit, party }) {
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
              <div className="text-2xl">💎</div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 font-pixel text-[4px] text-retro-gold whitespace-nowrap">
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
              <div className="text-2xl">⚔️</div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 font-pixel text-[4px] text-retro-accent whitespace-nowrap">
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
              <Sprite type={hero.sprite} size={30} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
