export function PathSelection({ area, onSelectPath, onBack }) {
  if (!area.paths) return null

  const core = area.core || []
  const coreRecruits = core
    .map((i) => area.battles[i]?.recruit)
    .filter(Boolean)

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 p-2">
      <div className="font-pixel text-sm text-retro-green">Choose Your Path</div>

      <div className="pixel-panel p-3 w-full max-w-md space-y-3">
        <div className="text-center font-pixel text-[9px] text-retro-gold">{area.name}</div>
        <div className="text-center font-pixel text-[6px] text-retro-dim">{area.description}</div>

        {/* The fork: two approaches, side by side */}
        <div className="grid grid-cols-2 gap-2 items-stretch">
          {Object.entries(area.paths).map(([pathKey, path]) => {
            const hard = pathKey === 'hard'
            return (
              <button
                key={pathKey}
                className="pixel-btn p-2 text-left flex flex-col gap-1 h-full hover:border-retro-gold"
                onClick={() => onSelectPath(pathKey)}
              >
                <div className="font-pixel text-[8px] text-retro-gold leading-tight">{path.name}</div>
                <div className={`font-pixel text-[6px] ${hard ? 'text-retro-accent' : 'text-retro-green'}`}>
                  {hard ? '⚔ Tougher foes' : '✦ Safer route'}
                </div>
                <div className="font-pixel text-[6px] text-retro-dim leading-relaxed">{path.description}</div>
                <div className="font-pixel text-[6px] text-retro-text mt-auto pt-1">
                  {path.battles.length} {path.battles.length === 1 ? 'fight' : 'fights'} →
                </div>
              </button>
            )
          })}
        </div>

        {/* The merge: both approaches converge on the shared core */}
        {core.length > 0 && (
          <>
            <div className="text-center font-pixel text-[6px] text-retro-dim tracking-widest">
              ▼ both roads converge ▼
            </div>
            <div className="pixel-panel p-2 space-y-1 border-retro-gold/60">
              <div className="font-pixel text-[7px] text-retro-gold">
                CORE · {core.length} shared {core.length === 1 ? 'fight' : 'fights'}
              </div>
              {coreRecruits.length > 0 && (
                <div className="font-pixel text-[6px] text-retro-blue">• an ally joins your party</div>
              )}
              <div className="font-pixel text-[6px] text-retro-accent">• ends with the area's guardian</div>
            </div>
          </>
        )}
      </div>

      <button className="pixel-btn w-40" onClick={onBack}>
        Back
      </button>
    </div>
  )
}
