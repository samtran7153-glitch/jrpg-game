import { AREAS } from '../gameState'
import { Sprite } from '../Sprites'

export function WorldMap({ state, onSelectArea, onBack }) {
  const { currentAreaIndex } = state

  const getAreaStatus = (index) => {
    if (index < currentAreaIndex) return 'completed'
    if (index === currentAreaIndex) return 'current'
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

  const isPathUnlocked = (from, to) => {
    const fromStatus = getAreaStatus(from)
    const toStatus = getAreaStatus(to)
    return fromStatus !== 'locked' && toStatus !== 'locked'
  }

  return (
    <div className="pixel-panel p-3 w-full space-y-2">
      <div className="text-center font-pixel text-[8px] text-retro-gold">WORLD MAP</div>
      <div className="relative h-64 bg-retro-bg border border-retro-border rounded overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-retro-purple/10 to-retro-blue/10" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #6a6a8a 1px, transparent 1px)',
            backgroundSize: '8px 8px'
          }} />
        </div>

        {/* Connection paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(({ from, to }, i) => {
            const fromPos = positions[from]
            const toPos = positions[to]
            const isActive = isPathUnlocked(from, to)
            
            // Create curved path
            const midX = (fromPos.x + toPos.x) / 2
            const midY = (fromPos.y + toPos.y) / 2 - 10 // Curve upward
            
            const pathData = `M ${fromPos.x}% ${fromPos.y}% Q ${midX}% ${midY}% ${toPos.x}% ${toPos.y}%`
            
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
                    points={`${toPos.x}% ${toPos.y}% ${toPos.x - 2}% ${toPos.y - 3}% ${toPos.x + 2}% ${toPos.y - 3}%`}
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

          return (
            <button
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 pixel-panel p-1.5 flex flex-col items-center justify-center transition-all ${
                isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110 hover:z-10'
              } ${isCurrent ? 'ring-2 ring-retro-gold animate-pulse z-20' : ''} ${
                isCompleted ? 'ring-1 ring-retro-dim' : ''
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              disabled={isLocked}
              onClick={() => handleAreaClick(index)}
              title={area.name}
            >
              <Sprite type={area.sprite} size={24} />
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-retro-green rounded-full flex items-center justify-center border border-retro-bg">
                  <span className="font-pixel text-[6px] text-white">✓</span>
                </div>
              )}
              {isLocked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-retro-accent rounded-full flex items-center justify-center border border-retro-bg">
                  <span className="font-pixel text-[6px] text-white">🔒</span>
                </div>
              )}
              <span className="font-pixel text-[5px] text-retro-text leading-none mt-0.5 text-center">
                {area.name.split(' ')[0]}
              </span>
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
