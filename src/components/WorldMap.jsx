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

  // Simple linear progression: each area unlocks the next
  const connections = AREAS.map((_, i) => i + 1).filter(i => i < AREAS.length)

  return (
    <div className="pixel-panel p-3 w-full space-y-2">
      <div className="text-center font-pixel text-[8px] text-retro-gold">WORLD MAP</div>
      <div className="space-y-1">
        {AREAS.map((area, index) => {
          const status = getAreaStatus(index)
          const isLocked = status === 'locked'
          const isCurrent = status === 'current'
          const isCompleted = status === 'completed'
          const hasNext = connections.includes(index)
          const isLast = index === AREAS.length - 1

          return (
            <div key={index} className="relative">
              {/* Connection line to next area */}
              {hasNext && (
                <div className={`absolute left-6 top-8 w-0.5 h-4 ${isCompleted ? 'bg-retro-dim' : 'bg-retro-border'}`} />
              )}

              <button
                className={`w-full flex items-center gap-2 p-1.5 pixel-panel text-left transition-all ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-retro-bg'
                } ${isCurrent ? 'ring-1 ring-retro-gold' : ''}`}
                disabled={isLocked}
                onClick={() => handleAreaClick(index)}
                title={area.name}
              >
                <div className="relative flex-shrink-0">
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
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[7px] text-retro-text truncate">
                    {area.name}
                  </div>
                  <div className="font-pixel text-[5px] text-retro-dim">
                    {isCompleted ? 'Completed' : isCurrent ? 'Current' : isLocked ? 'Locked' : ''}
                  </div>
                </div>
                {isCurrent && (
                  <span className="font-pixel text-[6px] text-retro-gold animate-pulse">
                    HERE
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </div>
      <button className="pixel-btn w-full" onClick={onBack}>
        Back
      </button>
    </div>
  )
}
