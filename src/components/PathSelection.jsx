import { useState } from 'react'
import { TutorialBanner, TUTORIAL_HIGHLIGHT_CLASS } from './Shared'

const PATH_TIPS = [
  { text: 'A fork in the road! Pick an approach — Safer or Tougher — then both roads rejoin for the core fights.', highlight: 'fork' },
  { text: 'Your choice sticks for this visit, but nothing is missed: recruits and the AREA BOSS are beyond the fork either way.', highlight: 'core' },
  { text: 'After beating the boss, revisit this area to try the other approach (finished ones show a ✓).', highlight: 'fork' },
]

export function PathSelection({ area, onSelectPath, onBack, completedPaths = {}, seenTutorials = {}, onTutorialSeen }) {
  const [tutHighlight, setTutHighlight] = useState(null)
  if (!area.paths) return null
  const tutActive = !seenTutorials.path_selection && onTutorialSeen
  const hl = (key) => (tutActive && tutHighlight === key ? ` ${TUTORIAL_HIGHLIGHT_CLASS}` : '')

  // The last core entry is the area boss — shown as its own challenge, not a core fight.
  const core = area.core || []
  const coreFights = core.slice(0, -1)
  const coreRecruits = coreFights
    .map((i) => area.battles[i]?.recruit)
    .filter(Boolean)

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 p-2">
      <div className="font-pixel text-sm text-retro-green">Choose Your Path</div>

      <div className="pixel-panel p-3 w-full max-w-md space-y-3">
        <div className="text-center font-pixel text-[9px] text-retro-gold">{area.name}</div>
        <div className="text-center font-pixel text-[6px] text-retro-dim">{area.description}</div>

        {/* The fork: two approaches, side by side */}
        <div className={`grid grid-cols-2 gap-2 items-stretch${hl('fork')}`}>
          {Object.entries(area.paths).map(([pathKey, path]) => {
            const hard = pathKey === 'hard'
            return (
              <button
                key={pathKey}
                className="pixel-btn p-2 text-left flex flex-col gap-1 h-full hover:border-retro-gold"
                onClick={() => onSelectPath(pathKey)}
              >
                <div className="font-pixel text-[8px] text-retro-gold leading-tight flex items-center justify-between gap-1">
                  <span>{path.name}</span>
                  {completedPaths[pathKey] && <span className="text-retro-green text-[7px]">✓ done</span>}
                </div>
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
            <div className={`pixel-panel p-2 space-y-1 border-retro-gold/60${hl('core')}`}>
              {coreFights.length > 0 && (
                <div className="font-pixel text-[7px] text-retro-gold">
                  CORE · {coreFights.length} shared {coreFights.length === 1 ? 'fight' : 'fights'}
                </div>
              )}
              {coreRecruits.length > 0 && (
                <div className="font-pixel text-[6px] text-retro-blue">• an ally joins your party</div>
              )}
              <div className="font-pixel text-[6px] text-retro-accent">
                ⚔ AREA BOSS · awaits beyond, on the area map
              </div>
            </div>
          </>
        )}
      </div>

      {tutActive && (
        <div className="w-full max-w-md">
          <TutorialBanner tips={PATH_TIPS} onDone={() => onTutorialSeen('path_selection')} onStepChange={setTutHighlight} />
        </div>
      )}

      <button className="pixel-btn w-40" onClick={onBack}>
        Back
      </button>
    </div>
  )
}
