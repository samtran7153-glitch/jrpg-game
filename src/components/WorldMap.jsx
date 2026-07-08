import { AREAS } from '../gameState'
import { Sprite } from '../Sprites'

export function WorldMap({ state, onSelectArea }) {
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

  // Simple 2x2 grid layout
  const positions = [
    { x: 25, y: 20 }, // forest
    { x: 75, y: 20 }, // cave
    { x: 25, y: 70 }, // castle
    { x: 75, y: 70 }, // shadow
  ]

  // Connections: forest->cave, forest->castle, cave->shadow, castle->shadow
  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 3]
  ]

  return (
    <div className="pixel-panel p-3 w-full space-y-2">
      <div className="text-center font-pixel text-[8px] text-retro-gold">WORLD MAP</div>
      <div className="relative h-32 bg-retro-bg border border-retro-border rounded">
        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(([from, to], i) => {
            const fromPos = positions[from]
            const toPos = positions[to]
            const fromStatus = getAreaStatus(from)
            const toStatus = getAreaStatus(to)
            const isActive = fromStatus !== 'locked' && toStatus !== 'locked'
            return (
              <line
                key={i}
                x1={`${fromPos.x}%`}
                y1={`${fromPos.y}%`}
                x2={`${toPos.x}%`}
                y2={`${toPos.y}%`}
                stroke={isActive ? '#6a6a8a' : '#2a2a3a'}
                strokeWidth="2"
                strokeDasharray={isActive ? '0' : '4,2'}
              />
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
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 pixel-panel p-1 flex flex-col items-center justify-center transition-all ${
                isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
              } ${isCurrent ? 'ring-2 ring-retro-gold animate-pulse' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              disabled={isLocked}
              onClick={() => handleAreaClick(index)}
              title={area.name}
            >
              <Sprite type={area.sprite} size={20} />
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-retro-green rounded-full flex items-center justify-center">
                  <span className="font-pixel text-[5px] text-white">✓</span>
                </div>
              )}
              {isLocked && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-retro-accent rounded-full flex items-center justify-center">
                  <span className="font-pixel text-[5px] text-white">🔒</span>
                </div>
              )}
              <span className="font-pixel text-[5px] text-retro-text leading-none mt-0.5">
                {area.name.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>
      <div className="text-center font-pixel text-[6px] text-retro-dim">
        Click any unlocked area to travel
      </div>
    </div>
  )
}
