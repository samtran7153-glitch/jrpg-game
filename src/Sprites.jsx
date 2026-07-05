export function HeroSprite({ size = 64, defeated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      className={defeated ? 'opacity-20 grayscale' : ''}
    >
      {/* Hair */}
      <rect x="5" y="1" width="6" height="1" fill="#8b4513" />
      <rect x="4" y="2" width="8" height="1" fill="#8b4513" />
      <rect x="4" y="3" width="2" height="1" fill="#8b4513" />
      <rect x="10" y="3" width="2" height="1" fill="#8b4513" />
      {/* Face */}
      <rect x="6" y="3" width="4" height="1" fill="#f0c090" />
      <rect x="5" y="4" width="6" height="2" fill="#f0c090" />
      {/* Eyes */}
      <rect x="6" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="9" y="4" width="1" height="1" fill="#1a1a2e" />
      {/* Mouth */}
      <rect x="7" y="5" width="2" height="1" fill="#c08060" />
      {/* Armor - chest plate */}
      <rect x="4" y="6" width="8" height="1" fill="#4a4a6a" />
      <rect x="4" y="7" width="8" height="3" fill="#6a6a9a" />
      <rect x="5" y="8" width="6" height="1" fill="#e94560" />
      {/* Belt */}
      <rect x="4" y="10" width="8" height="1" fill="#4a3a2a" />
      {/* Legs */}
      <rect x="5" y="11" width="2" height="3" fill="#3a3a5a" />
      <rect x="9" y="11" width="2" height="3" fill="#3a3a5a" />
      {/* Boots */}
      <rect x="5" y="14" width="2" height="1" fill="#2a2a3a" />
      <rect x="9" y="14" width="2" height="1" fill="#2a2a3a" />
      {/* Sword (right side) */}
      <rect x="12" y="5" width="1" height="6" fill="#c0c0e0" />
      <rect x="12" y="4" width="1" height="1" fill="#e0e0ff" />
      <rect x="11" y="11" width="3" height="1" fill="#8b4513" />
      {/* Shield (left side) */}
      <rect x="2" y="7" width="2" height="4" fill="#4ea8de" />
      <rect x="2" y="7" width="2" height="1" fill="#6bc0ff" />
      <rect x="2" y="10" width="2" height="1" fill="#3a7ab0" />
      <rect x="3" y="8" width="1" height="2" fill="#f5c518" />
    </svg>
  )
}

export function GoblinSprite({ size = 64, defeated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      className={defeated ? 'opacity-20 grayscale' : ''}
    >
      {/* Horns */}
      <rect x="3" y="1" width="1" height="2" fill="#8a8a7a" />
      <rect x="12" y="1" width="1" height="2" fill="#8a8a7a" />
      <rect x="2" y="2" width="1" height="1" fill="#8a8a7a" />
      <rect x="13" y="2" width="1" height="1" fill="#8a8a7a" />
      {/* Head */}
      <rect x="4" y="2" width="8" height="1" fill="#4a7a3a" />
      <rect x="3" y="3" width="10" height="4" fill="#5a8a4a" />
      <rect x="4" y="3" width="1" height="1" fill="#3a6a2a" />
      <rect x="11" y="3" width="1" height="1" fill="#3a6a2a" />
      {/* Eyes - glowing red */}
      <rect x="5" y="4" width="2" height="1" fill="#1a1a1a" />
      <rect x="9" y="4" width="2" height="1" fill="#1a1a1a" />
      <rect x="5" y="4" width="1" height="1" fill="#e94560" />
      <rect x="10" y="4" width="1" height="1" fill="#e94560" />
      {/* Mouth with fangs */}
      <rect x="5" y="6" width="6" height="1" fill="#3a5a2a" />
      <rect x="6" y="6" width="1" height="1" fill="#e0e0d0" />
      <rect x="9" y="6" width="1" height="1" fill="#e0e0d0" />
      {/* Body */}
      <rect x="4" y="7" width="8" height="1" fill="#3a6a2a" />
      <rect x="4" y="8" width="8" height="3" fill="#4a7a3a" />
      <rect x="5" y="9" width="6" height="1" fill="#5a8a4a" />
      {/* Arms */}
      <rect x="2" y="8" width="2" height="2" fill="#5a8a4a" />
      <rect x="12" y="8" width="2" height="2" fill="#5a8a4a" />
      {/* Claws */}
      <rect x="2" y="10" width="2" height="1" fill="#d0d0c0" />
      <rect x="12" y="10" width="2" height="1" fill="#d0d0c0" />
      {/* Loincloth */}
      <rect x="5" y="11" width="6" height="1" fill="#6a4a2a" />
      {/* Legs */}
      <rect x="5" y="12" width="2" height="2" fill="#4a7a3a" />
      <rect x="9" y="12" width="2" height="2" fill="#4a7a3a" />
      {/* Feet */}
      <rect x="4" y="14" width="3" height="1" fill="#3a5a2a" />
      <rect x="9" y="14" width="3" height="1" fill="#3a5a2a" />
    </svg>
  )
}

export function DeathSprite({ size = 64 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {/* Tombstone base */}
      <rect x="4" y="10" width="8" height="4" fill="#5a5a6a" />
      <rect x="4" y="10" width="8" height="1" fill="#7a7a8a" />
      {/* Tombstone top - rounded */}
      <rect x="5" y="3" width="6" height="1" fill="#5a5a6a" />
      <rect x="4" y="4" width="8" height="6" fill="#6a6a7a" />
      <rect x="5" y="4" width="6" height="1" fill="#7a7a8a" />
      {/* Cross / RIP text area */}
      <rect x="7" y="5" width="2" height="1" fill="#3a3a4a" />
      <rect x="7" y="5" width="2" height="4" fill="#3a3a4a" />
      <rect x="6" y="6" width="4" height="1" fill="#3a3a4a" />
      {/* Ground */}
      <rect x="2" y="14" width="12" height="1" fill="#3a3a2a" />
      <rect x="3" y="15" width="10" height="1" fill="#2a2a1a" />
      {/* Grass tufts */}
      <rect x="3" y="13" width="1" height="1" fill="#4a6a2a" />
      <rect x="12" y="13" width="1" height="1" fill="#4a6a2a" />
    </svg>
  )
}
