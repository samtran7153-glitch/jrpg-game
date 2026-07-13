import { AREAS } from '../gameState'
import { Sprite } from '../Sprites'

export function WorldMap({ state, onSelectArea, onBack }) {
  const { currentAreaIndex } = state

  const getAreaStatus = (index) => {
    if (index < currentAreaIndex) return 'completed'
    if (index === currentAreaIndex) return 'current'
    if (index === currentAreaIndex + 1) return 'next' // Next unlockable area
    return 'locked'
  }

  const handleAreaClick = (index) => {
    const status = getAreaStatus(index)
    if (status !== 'locked') {
      onSelectArea(index)
    }
  }

  // Flexible 2D plane coordinates - easy to extend for new areas
  const positions = [
    { x: 50, y: 80 },   // forest (starting area)
    { x: 25, y: 55 },   // cave (northwest of forest)
    { x: 75, y: 55 },   // castle (northeast of forest)
    { x: 50, y: 30 },   // shadow realm (north of forest/castle)
  ]

  // Define connections between areas (can create branching paths)
  const connections = [
    { from: 0, to: 1 }, // forest -> cave
    { from: 0, to: 2 }, // forest -> castle
    { from: 2, to: 3 }, // castle -> shadow
    { from: 1, to: 3 }, // cave -> shadow (alternative path)
  ]

  // Decorative landmarks positioned around the map
  const landmarks = [
    { type: 'mountain', x: 15, y: 25, name: 'Dragon Peaks' },
    { type: 'lake', x: 85, y: 25, name: 'Mirror Lake' },
    { type: 'mountain', x: 10, y: 70, name: 'Stone Ridge' },
    { type: 'ruins', x: 90, y: 75, name: 'Forgotten Ruins' },
    { type: 'village', x: 50, y: 15, name: 'Outpost' },
  ]

  const isPathUnlocked = (from, to) => {
    const fromStatus = getAreaStatus(from)
    const toStatus = getAreaStatus(to)
    return fromStatus !== 'locked' && toStatus !== 'locked'
  }

  const renderLandmark = (landmark, index) => {
    const baseClass = "absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    
    switch(landmark.type) {
      case 'mountain':
        return (
          <div key={index} className={baseClass} style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}>
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-retro-dim/60" />
            <div className="font-pixel text-[5px] text-retro-dim opacity-80 text-center mt-0.5">{landmark.name}</div>
          </div>
        )
      case 'lake':
        return (
          <div key={index} className={baseClass} style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}>
            <div className="w-8 h-8 bg-retro-blue/40 rounded-full border border-retro-blue/50" />
            <div className="font-pixel text-[5px] text-retro-dim opacity-80 text-center mt-0.5">{landmark.name}</div>
          </div>
        )
      case 'forest':
        return (
          <div key={index} className={baseClass} style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}>
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[14px] border-b-retro-green/60" />
            <div className="font-pixel text-[5px] text-retro-dim opacity-80 text-center mt-0.5">{landmark.name}</div>
          </div>
        )
      case 'ruins':
        return (
          <div key={index} className={baseClass} style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}>
            <div className="flex gap-0.5 items-end opacity-60">
              <div className="w-1.5 h-4 bg-retro-dim/60 rounded-t-sm" />
              <div className="w-2 h-5 bg-retro-dim/60 rounded-t-sm" />
              <div className="w-1.5 h-4 bg-retro-dim/60 rounded-t-sm" />
            </div>
            <div className="font-pixel text-[5px] text-retro-dim opacity-80 text-center mt-0.5">{landmark.name}</div>
          </div>
        )
      case 'village':
        return (
          <div key={index} className={baseClass} style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}>
            <div className="relative opacity-60">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-retro-accent/60" />
              <div className="w-4 h-3 bg-retro-accent/60 -mt-0.5" />
            </div>
            <div className="font-pixel text-[5px] text-retro-dim opacity-80 text-center mt-0.5">{landmark.name}</div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="pixel-panel p-3 w-full space-y-2">
      <div className="text-center font-pixel text-[8px] text-retro-gold">WORLD MAP</div>
      <div className="relative h-64 bg-retro-bg border border-retro-border rounded overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-retro-green/5 via-retro-bg to-retro-purple/5" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #6a6a8a 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }} />
        </div>

        {/* Terrain biomes */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-retro-green/10 rounded-bl-full" />
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-retro-blue/10 rounded-br-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-retro-purple/10 rounded-tl-full" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-retro-accent/10 rounded-tr-full" />

        {/* Landmarks */}
        {landmarks.map(renderLandmark)}

        {/* Compass rose */}
        <div className="absolute top-2 right-2 w-10 h-10 pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 border border-retro-dim/30 rounded-full" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-0.5 text-retro-dim/40 text-[8px]">N</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-0.5 text-retro-dim/20 text-[6px]">S</div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-0.5 text-retro-dim/20 text-[6px]">W</div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-0.5 text-retro-dim/20 text-[6px]">E</div>
            <div className="absolute inset-2 border border-retro-dim/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-retro-accent/30" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 bg-retro-accent/30" />
          </div>
        </div>

        {/* Map legend */}
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <div className="pixel-panel p-1 bg-retro-bg/90 border border-retro-dim/30">
            <div className="font-pixel text-[4px] text-retro-dim mb-0.5">LEGEND</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-retro-green rounded-full" />
                <span className="font-pixel text-[3px] text-retro-dim">Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-retro-gold rounded-full animate-pulse" />
                <span className="font-pixel text-[3px] text-retro-dim">Current</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-retro-gold rounded-full opacity-50" />
                <span className="font-pixel text-[3px] text-retro-dim">Next</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-retro-accent rounded-full" />
                <span className="font-pixel text-[3px] text-retro-dim">Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map(({ from, to }, i) => {
            const fromPos = positions[from]
            const toPos = positions[to]
            const isActive = isPathUnlocked(from, to)

            // Create curved path
            const midX = (fromPos.x + toPos.x) / 2
            const midY = (fromPos.y + toPos.y) / 2 - 10 // Curve upward

            const pathData = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`

            return (
              <g key={i}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isActive ? '#6a6a8a' : '#2a2a3a'}
                  strokeWidth="2"
                  strokeDasharray={isActive ? '0' : '4,2'}
                  opacity={isActive ? 0.8 : 0.4}
                />
                {/* Arrow indicator */}
                {isActive && (
                  <polygon
                    points={`${toPos.x} ${toPos.y} ${toPos.x - 2} ${toPos.y - 3} ${toPos.x + 2} ${toPos.y - 3}`}
                    fill="#6a6a8a"
                    opacity="0.6"
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* Area nodes */}
        {AREAS.map((area, index) => {
          const status = getAreaStatus(index)
          const pos = positions[index]
          const isLocked = status === 'locked'
          const isCurrent = status === 'current'
          const isCompleted = status === 'completed'
          const isNext = status === 'next'
          const isUnknown = isLocked && index > currentAreaIndex + 1

          return (
            <button
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 pixel-panel p-1.5 flex flex-col items-center justify-center transition-all ${
                isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110 hover:z-10'
              } ${isCurrent ? 'ring-2 ring-retro-gold animate-pulse z-20' : ''} ${
                isCompleted ? 'ring-1 ring-retro-dim' : ''
              } ${isNext ? 'ring-2 ring-retro-gold ring-opacity-50 z-10' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              disabled={isLocked}
              onClick={() => handleAreaClick(index)}
              title={isUnknown ? '???' : area.name}
            >
              {isUnknown ? (
                <>
                  <div className="text-retro-dim opacity-40" style={{ fontSize: '20px' }}>?</div>
                  <span className="font-pixel text-[5px] text-retro-dim opacity-30 leading-none mt-0.5">
                    ???
                  </span>
                </>
              ) : (
                <>
                  <Sprite type={area.sprite} size={24} />
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-retro-green rounded-full flex items-center justify-center border border-retro-bg">
                      <span className="font-pixel text-[6px] text-white">D</span>
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-retro-accent rounded-full flex items-center justify-center border border-retro-bg">
                      <span className="font-pixel text-[6px] text-white">L</span>
                    </div>
                  )}
                  <span className="font-pixel text-[5px] text-retro-text leading-none mt-0.5 text-center">
                    {area.name.split(' ')[0]}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
      <div className="text-center font-pixel text-[6px] text-retro-dim">
        Click any unlocked area to travel
      </div>

      <button className="pixel-btn w-full" onClick={onBack}>
        Back
      </button>
    </div>
  )
}
