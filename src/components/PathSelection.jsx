import { AREAS } from '../gameState'

export function PathSelection({ area, onSelectPath, onBack }) {
  if (!area.paths) return null

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <div className="font-pixel text-lg text-retro-green">Choose Your Path</div>
      <div className="pixel-panel p-4 w-full max-w-md space-y-3">
        <div className="text-center font-pixel text-[9px] text-retro-text">
          {area.name}
        </div>
        <div className="text-center font-pixel text-[7px] text-retro-dim">
          A fork in the road lies ahead. Choose which way your party will go.
        </div>
        <div className="text-center font-pixel text-[7px] text-retro-dim">
          {area.description}
        </div>
        
        <div className="space-y-3">
          {Object.entries(area.paths).map(([pathKey, path]) => (
            <button
              key={pathKey}
              className="pixel-btn w-full p-3 text-left"
              onClick={() => onSelectPath(pathKey)}
            >
              <div className="font-pixel text-[8px] text-retro-gold mb-1">
                {path.name}
              </div>
              <div className="font-pixel text-[6px] text-retro-dim mb-2">
                {path.description}
              </div>
              <div className="flex justify-between font-pixel text-[6px]">
                <span className="text-retro-text">
                  Approach: {path.battles.length} {path.battles.length === 1 ? 'battle' : 'battles'}
                </span>
                <span className={pathKey === 'hard' ? 'text-retro-accent' : 'text-retro-green'}>
                  {pathKey === 'hard' ? 'Tougher foes' : 'Safer route'}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center font-pixel text-[6px] text-retro-dim pt-1">
          Both roads rejoin for the heart of {area.name}{area.core?.length ? ' — and its boss' : ''}.
        </div>
      </div>
      
      <button className="pixel-btn w-40" onClick={onBack}>
        Back
      </button>
    </div>
  )
}
