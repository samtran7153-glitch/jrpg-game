const svgProps = (size, className) => ({
  width: size, height: size, viewBox: '0 0 16 16',
  style: { imageRendering: 'pixelated', shapeRendering: 'crispEdges' },
  className,
})

// ============ KNIGHT ============
export function KnightSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      <rect x="5" y="1" width="6" height="1" fill="#8b4513" />
      <rect x="4" y="2" width="8" height="1" fill="#8b4513" />
      <rect x="4" y="3" width="2" height="1" fill="#8b4513" />
      <rect x="10" y="3" width="2" height="1" fill="#8b4513" />
      <rect x="6" y="3" width="4" height="1" fill="#f0c090" />
      <rect x="5" y="4" width="6" height="2" fill="#f0c090" />
      <rect x="6" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="9" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="7" y="5" width="2" height="1" fill="#c08060" />
      <rect x="4" y="6" width="8" height="1" fill="#4a4a6a" />
      <rect x="4" y="7" width="8" height="3" fill="#6a6a9a" />
      <rect x="5" y="8" width="6" height="1" fill="#e94560" />
      <rect x="4" y="10" width="8" height="1" fill="#4a3a2a" />
      <rect x="5" y="11" width="2" height="3" fill="#3a3a5a" />
      <rect x="9" y="11" width="2" height="3" fill="#3a3a5a" />
      <rect x="5" y="14" width="2" height="1" fill="#2a2a3a" />
      <rect x="9" y="14" width="2" height="1" fill="#2a2a3a" />
      <rect x="12" y="5" width="1" height="6" fill="#c0c0e0" />
      <rect x="12" y="4" width="1" height="1" fill="#e0e0ff" />
      <rect x="11" y="11" width="3" height="1" fill="#8b4513" />
      <rect x="2" y="7" width="2" height="4" fill="#4ea8de" />
      <rect x="2" y="7" width="2" height="1" fill="#6bc0ff" />
      <rect x="2" y="10" width="2" height="1" fill="#3a7ab0" />
      <rect x="3" y="8" width="1" height="2" fill="#f5c518" />
    </svg>
  )
}

// ============ MAGE ============
export function MageSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      {/* Wizard hat */}
      <rect x="7" y="0" width="2" height="1" fill="#9d4edd" />
      <rect x="6" y="1" width="4" height="1" fill="#9d4edd" />
      <rect x="5" y="2" width="6" height="1" fill="#9d4edd" />
      <rect x="4" y="3" width="8" height="1" fill="#7b2cbf" />
      <rect x="7" y="0" width="1" height="1" fill="#f5c518" />
      {/* Face */}
      <rect x="5" y="4" width="6" height="2" fill="#e0b890" />
      <rect x="6" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="9" y="4" width="1" height="1" fill="#1a1a2e" />
      {/* Beard */}
      <rect x="6" y="6" width="4" height="2" fill="#d0d0d0" />
      <rect x="7" y="8" width="2" height="1" fill="#d0d0d0" />
      {/* Robe */}
      <rect x="4" y="6" width="1" height="1" fill="#7b2cbf" />
      <rect x="11" y="6" width="1" height="1" fill="#7b2cbf" />
      <rect x="3" y="7" width="10" height="5" fill="#9d4edd" />
      <rect x="4" y="8" width="8" height="1" fill="#c77dff" />
      <rect x="7" y="9" width="2" height="1" fill="#f5c518" />
      <rect x="3" y="12" width="10" height="2" fill="#5a189a" />
      {/* Staff */}
      <rect x="13" y="4" width="1" height="9" fill="#8b4513" />
      <rect x="12" y="3" width="3" height="1" fill="#4ea8de" />
      <rect x="13" y="2" width="1" height="1" fill="#4ea8de" />
      <rect x="12" y="3" width="1" height="1" fill="#6bc0ff" />
    </svg>
  )
}

// ============ ARCHER ============
export function ArcherSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      {/* Hood */}
      <rect x="5" y="1" width="6" height="1" fill="#2d6a4f" />
      <rect x="4" y="2" width="8" height="2" fill="#2d6a4f" />
      <rect x="5" y="3" width="6" height="1" fill="#f0c090" />
      {/* Face */}
      <rect x="5" y="4" width="6" height="2" fill="#f0c090" />
      <rect x="6" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="9" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="7" y="5" width="2" height="1" fill="#c08060" />
      {/* Tunic */}
      <rect x="4" y="6" width="8" height="1" fill="#40916c" />
      <rect x="4" y="7" width="8" height="3" fill="#52b788" />
      <rect x="5" y="8" width="6" height="1" fill="#74c69d" />
      {/* Belt */}
      <rect x="4" y="10" width="8" height="1" fill="#4a3a2a" />
      {/* Legs */}
      <rect x="5" y="11" width="2" height="3" fill="#2d6a4f" />
      <rect x="9" y="11" width="2" height="3" fill="#2d6a4f" />
      <rect x="5" y="14" width="2" height="1" fill="#1b4332" />
      <rect x="9" y="14" width="2" height="1" fill="#1b4332" />
      {/* Bow */}
      <rect x="1" y="5" width="1" height="6" fill="#8b4513" />
      <rect x="0" y="6" width="1" height="4" fill="#d4a373" />
      <rect x="2" y="6" width="1" height="1" fill="#d4a373" />
      <rect x="2" y="9" width="1" height="1" fill="#d4a373" />
      {/* Quiver */}
      <rect x="13" y="6" width="1" height="4" fill="#6a4a2a" />
      <rect x="13" y="5" width="1" height="1" fill="#c0c0e0" />
      <rect x="14" y="5" width="1" height="1" fill="#c0c0e0" />
    </svg>
  )
}

// ============ HEALER ============
export function HealerSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      {/* Hair */}
      <rect x="5" y="1" width="6" height="1" fill="#f5c518" />
      <rect x="4" y="2" width="8" height="2" fill="#f5c518" />
      <rect x="4" y="3" width="1" height="3" fill="#f5c518" />
      <rect x="11" y="3" width="1" height="3" fill="#f5c518" />
      {/* Face */}
      <rect x="5" y="3" width="6" height="1" fill="#f0c090" />
      <rect x="5" y="4" width="6" height="2" fill="#f0c090" />
      <rect x="6" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="9" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="7" y="5" width="2" height="1" fill="#c08060" />
      {/* White robe */}
      <rect x="4" y="6" width="8" height="1" fill="#e0e0e0" />
      <rect x="4" y="7" width="8" height="4" fill="#f0f0f0" />
      <rect x="5" y="8" width="6" height="1" fill="#ffffff" />
      {/* Red cross */}
      <rect x="7" y="7" width="2" height="1" fill="#e94560" />
      <rect x="7" y="9" width="2" height="1" fill="#e94560" />
      <rect x="7" y="7" width="2" height="3" fill="#e94560" />
      <rect x="6" y="8" width="4" height="1" fill="#e94560" />
      {/* Robe bottom */}
      <rect x="3" y="11" width="10" height="3" fill="#e0e0e0" />
      <rect x="3" y="14" width="10" height="1" fill="#c0c0c0" />
      {/* Staff with holy symbol */}
      <rect x="13" y="4" width="1" height="10" fill="#8b4513" />
      <rect x="12" y="3" width="3" height="1" fill="#f5c518" />
      <rect x="13" y="2" width="1" height="1" fill="#f5c518" />
    </svg>
  )
}

// ============ SLIME ============
export function SlimeSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      <rect x="5" y="3" width="6" height="1" fill="#4ecca3" />
      <rect x="4" y="4" width="8" height="1" fill="#4ecca3" />
      <rect x="3" y="5" width="10" height="2" fill="#52d1a3" />
      <rect x="3" y="7" width="10" height="3" fill="#4ecca3" />
      <rect x="4" y="10" width="8" height="2" fill="#3db88c" />
      <rect x="5" y="12" width="6" height="1" fill="#2a9d72" />
      {/* Highlight */}
      <rect x="4" y="5" width="2" height="1" fill="#7ee8c8" />
      {/* Eyes */}
      <rect x="5" y="6" width="2" height="1" fill="#1a1a2e" />
      <rect x="9" y="6" width="2" height="1" fill="#1a1a2e" />
      <rect x="5" y="6" width="1" height="1" fill="#ffffff" />
      <rect x="10" y="6" width="1" height="1" fill="#ffffff" />
      {/* Mouth */}
      <rect x="6" y="8" width="4" height="1" fill="#2a8d6a" />
    </svg>
  )
}

// ============ BAT ============
export function BatSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      {/* Left wing top */}
      <rect x="0" y="5" width="2" height="1" fill="#6a3a7a" />
      <rect x="1" y="6" width="2" height="1" fill="#7a4a8a" />
      <rect x="0" y="7" width="2" height="1" fill="#6a3a7a" />
      {/* Left wing membrane */}
      <rect x="2" y="5" width="2" height="1" fill="#8a5a9a" />
      <rect x="2" y="6" width="2" height="2" fill="#7a4a8a" />
      <rect x="3" y="8" width="2" height="1" fill="#6a3a7a" />
      {/* Right wing top */}
      <rect x="14" y="5" width="2" height="1" fill="#6a3a7a" />
      <rect x="13" y="6" width="2" height="1" fill="#7a4a8a" />
      <rect x="14" y="7" width="2" height="1" fill="#6a3a7a" />
      {/* Right wing membrane */}
      <rect x="12" y="5" width="2" height="1" fill="#8a5a9a" />
      <rect x="12" y="6" width="2" height="2" fill="#7a4a8a" />
      <rect x="11" y="8" width="2" height="1" fill="#6a3a7a" />
      {/* Body */}
      <rect x="5" y="4" width="6" height="1" fill="#5a2a6a" />
      <rect x="4" y="5" width="8" height="1" fill="#6a3a7a" />
      <rect x="4" y="6" width="8" height="3" fill="#7a4a8a" />
      <rect x="5" y="9" width="6" height="1" fill="#6a3a7a" />
      <rect x="6" y="10" width="4" height="1" fill="#5a2a6a" />
      {/* Ears */}
      <rect x="5" y="3" width="1" height="1" fill="#5a2a6a" />
      <rect x="10" y="3" width="1" height="1" fill="#5a2a6a" />
      {/* Eyes - glowing red */}
      <rect x="5" y="6" width="2" height="1" fill="#e94560" />
      <rect x="9" y="6" width="2" height="1" fill="#e94560" />
      <rect x="6" y="6" width="1" height="1" fill="#ff6b6b" />
      <rect x="10" y="6" width="1" height="1" fill="#ff6b6b" />
      {/* Fangs */}
      <rect x="6" y="8" width="1" height="1" fill="#ffffff" />
      <rect x="9" y="8" width="1" height="1" fill="#ffffff" />
    </svg>
  )
}

// ============ GOBLIN ============
export function GoblinSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      <rect x="3" y="1" width="1" height="2" fill="#8a8a7a" />
      <rect x="12" y="1" width="1" height="2" fill="#8a8a7a" />
      <rect x="2" y="2" width="1" height="1" fill="#8a8a7a" />
      <rect x="13" y="2" width="1" height="1" fill="#8a8a7a" />
      <rect x="4" y="2" width="8" height="1" fill="#4a7a3a" />
      <rect x="3" y="3" width="10" height="4" fill="#5a8a4a" />
      <rect x="4" y="3" width="1" height="1" fill="#3a6a2a" />
      <rect x="11" y="3" width="1" height="1" fill="#3a6a2a" />
      <rect x="5" y="4" width="2" height="1" fill="#1a1a1a" />
      <rect x="9" y="4" width="2" height="1" fill="#1a1a1a" />
      <rect x="5" y="4" width="1" height="1" fill="#e94560" />
      <rect x="10" y="4" width="1" height="1" fill="#e94560" />
      <rect x="5" y="6" width="6" height="1" fill="#3a5a2a" />
      <rect x="6" y="6" width="1" height="1" fill="#e0e0d0" />
      <rect x="9" y="6" width="1" height="1" fill="#e0e0d0" />
      <rect x="4" y="7" width="8" height="1" fill="#3a6a2a" />
      <rect x="4" y="8" width="8" height="3" fill="#4a7a3a" />
      <rect x="5" y="9" width="6" height="1" fill="#5a8a4a" />
      <rect x="2" y="8" width="2" height="2" fill="#5a8a4a" />
      <rect x="12" y="8" width="2" height="2" fill="#5a8a4a" />
      <rect x="2" y="10" width="2" height="1" fill="#d0d0c0" />
      <rect x="12" y="10" width="2" height="1" fill="#d0d0c0" />
      <rect x="5" y="11" width="6" height="1" fill="#6a4a2a" />
      <rect x="5" y="12" width="2" height="2" fill="#4a7a3a" />
      <rect x="9" y="12" width="2" height="2" fill="#4a7a3a" />
      <rect x="4" y="14" width="3" height="1" fill="#3a5a2a" />
      <rect x="9" y="14" width="3" height="1" fill="#3a5a2a" />
    </svg>
  )
}

// ============ SKELETON ============
export function SkeletonSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      {/* Skull */}
      <rect x="5" y="1" width="6" height="1" fill="#e0e0d0" />
      <rect x="4" y="2" width="8" height="4" fill="#e0e0d0" />
      <rect x="5" y="2" width="1" height="1" fill="#c0c0b0" />
      <rect x="10" y="2" width="1" height="1" fill="#c0c0b0" />
      {/* Eye sockets */}
      <rect x="5" y="3" width="2" height="2" fill="#1a1a2e" />
      <rect x="9" y="3" width="2" height="2" fill="#1a1a2e" />
      <rect x="5" y="3" width="1" height="1" fill="#e94560" />
      <rect x="10" y="3" width="1" height="1" fill="#e94560" />
      {/* Teeth */}
      <rect x="5" y="5" width="1" height="1" fill="#1a1a2e" />
      <rect x="7" y="5" width="1" height="1" fill="#1a1a2e" />
      <rect x="9" y="5" width="1" height="1" fill="#1a1a2e" />
      <rect x="11" y="5" width="1" height="1" fill="#1a1a2e" />
      {/* Spine/ribcage */}
      <rect x="7" y="6" width="2" height="1" fill="#c0c0b0" />
      <rect x="5" y="7" width="6" height="1" fill="#e0e0d0" />
      <rect x="5" y="8" width="1" height="1" fill="#e0e0d0" />
      <rect x="10" y="8" width="1" height="1" fill="#e0e0d0" />
      <rect x="6" y="8" width="1" height="1" fill="#c0c0b0" />
      <rect x="9" y="8" width="1" height="1" fill="#c0c0b0" />
      <rect x="7" y="8" width="2" height="1" fill="#c0c0b0" />
      <rect x="5" y="9" width="6" height="1" fill="#e0e0d0" />
      <rect x="7" y="10" width="2" height="1" fill="#c0c0b0" />
      {/* Arms - bone */}
      <rect x="2" y="7" width="2" height="3" fill="#e0e0d0" />
      <rect x="12" y="7" width="2" height="3" fill="#e0e0d0" />
      <rect x="2" y="10" width="2" height="1" fill="#c0c0b0" />
      <rect x="12" y="10" width="2" height="1" fill="#c0c0b0" />
      {/* Legs */}
      <rect x="5" y="11" width="2" height="3" fill="#e0e0d0" />
      <rect x="9" y="11" width="2" height="3" fill="#e0e0d0" />
      <rect x="5" y="14" width="2" height="1" fill="#c0c0b0" />
      <rect x="9" y="14" width="2" height="1" fill="#c0c0b0" />
    </svg>
  )
}

// ============ DARK KNIGHT ============
export function DarkKnightSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      {/* Dark helmet */}
      <rect x="5" y="1" width="6" height="1" fill="#2a2a3a" />
      <rect x="4" y="2" width="8" height="3" fill="#3a3a4a" />
      <rect x="5" y="2" width="1" height="1" fill="#1a1a2e" />
      <rect x="10" y="2" width="1" height="1" fill="#1a1a2e" />
      {/* Visor slit - glowing red */}
      <rect x="5" y="3" width="2" height="1" fill="#e94560" />
      <rect x="9" y="3" width="2" height="1" fill="#e94560" />
      {/* Dark armor */}
      <rect x="3" y="5" width="10" height="1" fill="#2a2a3a" />
      <rect x="3" y="6" width="10" height="4" fill="#3a3a4a" />
      <rect x="4" y="7" width="8" height="1" fill="#4a4a5a" />
      <rect x="7" y="6" width="2" height="3" fill="#e94560" />
      {/* Belt */}
      <rect x="3" y="10" width="10" height="1" fill="#1a1a2e" />
      {/* Legs */}
      <rect x="4" y="11" width="3" height="3" fill="#2a2a3a" />
      <rect x="9" y="11" width="3" height="3" fill="#2a2a3a" />
      <rect x="4" y="14" width="3" height="1" fill="#1a1a2e" />
      <rect x="9" y="14" width="3" height="1" fill="#1a1a2e" />
      {/* Dark sword */}
      <rect x="13" y="4" width="1" height="8" fill="#6a6a8a" />
      <rect x="13" y="3" width="1" height="1" fill="#e94560" />
      <rect x="12" y="12" width="3" height="1" fill="#1a1a2e" />
      {/* Shoulder spikes */}
      <rect x="2" y="5" width="1" height="1" fill="#5a5a6a" />
      <rect x="13" y="5" width="1" height="1" fill="#5a5a6a" />
    </svg>
  )
}

// ============ GOBLIN KING ============
export function GoblinKingSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      {/* Crown */}
      <rect x="4" y="0" width="1" height="2" fill="#f5c518" />
      <rect x="7" y="0" width="2" height="2" fill="#f5c518" />
      <rect x="11" y="0" width="1" height="2" fill="#f5c518" />
      <rect x="4" y="1" width="8" height="1" fill="#f5c518" />
      <rect x="7" y="1" width="1" height="1" fill="#e94560" />
      {/* Horns */}
      <rect x="2" y="2" width="1" height="2" fill="#8a8a7a" />
      <rect x="13" y="2" width="1" height="2" fill="#8a8a7a" />
      {/* Head - bigger, darker green */}
      <rect x="3" y="2" width="10" height="1" fill="#3a6a2a" />
      <rect x="3" y="3" width="10" height="4" fill="#4a7a3a" />
      <rect x="4" y="3" width="1" height="1" fill="#2a5a1a" />
      <rect x="11" y="3" width="1" height="1" fill="#2a5a1a" />
      {/* Eyes - glowing red */}
      <rect x="5" y="4" width="2" height="1" fill="#1a1a1a" />
      <rect x="9" y="4" width="2" height="1" fill="#1a1a1a" />
      <rect x="5" y="4" width="1" height="1" fill="#e94560" />
      <rect x="10" y="4" width="1" height="1" fill="#e94560" />
      {/* Mouth with fangs */}
      <rect x="4" y="6" width="8" height="1" fill="#2a5a1a" />
      <rect x="5" y="6" width="1" height="1" fill="#e0e0d0" />
      <rect x="10" y="6" width="1" height="1" fill="#e0e0d0" />
      {/* Body - armored */}
      <rect x="3" y="7" width="10" height="1" fill="#2a4a1a" />
      <rect x="3" y="8" width="10" height="4" fill="#3a5a2a" />
      <rect x="4" y="9" width="8" height="1" fill="#4a7a3a" />
      <rect x="7" y="8" width="2" height="3" fill="#f5c518" />
      {/* Arms */}
      <rect x="1" y="8" width="2" height="3" fill="#4a7a3a" />
      <rect x="13" y="8" width="2" height="3" fill="#4a7a3a" />
      <rect x="1" y="11" width="2" height="1" fill="#d0d0c0" />
      <rect x="13" y="11" width="2" height="1" fill="#d0d0c0" />
      {/* Legs */}
      <rect x="4" y="12" width="3" height="2" fill="#3a5a2a" />
      <rect x="9" y="12" width="3" height="2" fill="#3a5a2a" />
      <rect x="3" y="14" width="4" height="1" fill="#2a4a1a" />
      <rect x="9" y="14" width="4" height="1" fill="#2a4a1a" />
    </svg>
  )
}

// ============ DRAGON ============
export function DragonSprite({ size = 64, defeated = false }) {
  const c = defeated ? 'opacity-20 grayscale' : ''
  return (
    <svg {...svgProps(size, c)}>
      {/* Horns */}
      <rect x="2" y="0" width="1" height="2" fill="#8a4a2a" />
      <rect x="13" y="0" width="1" height="2" fill="#8a4a2a" />
      <rect x="1" y="1" width="1" height="1" fill="#8a4a2a" />
      <rect x="14" y="1" width="1" height="1" fill="#8a4a2a" />
      {/* Head */}
      <rect x="3" y="1" width="10" height="1" fill="#c0392b" />
      <rect x="2" y="2" width="12" height="4" fill="#e74c3c" />
      <rect x="3" y="2" width="1" height="1" fill="#a93226" />
      <rect x="12" y="2" width="1" height="1" fill="#a93226" />
      {/* Eyes - fiery */}
      <rect x="4" y="3" width="2" height="1" fill="#f5c518" />
      <rect x="10" y="3" width="2" height="1" fill="#f5c518" />
      <rect x="4" y="3" width="1" height="1" fill="#e94560" />
      <rect x="11" y="3" width="1" height="1" fill="#e94560" />
      {/* Nostrils */}
      <rect x="6" y="5" width="1" height="1" fill="#1a1a2e" />
      <rect x="9" y="5" width="1" height="1" fill="#1a1a2e" />
      {/* Snout */}
      <rect x="5" y="5" width="6" height="1" fill="#c0392b" />
      {/* Neck/body */}
      <rect x="3" y="6" width="10" height="1" fill="#c0392b" />
      <rect x="2" y="7" width="12" height="4" fill="#e74c3c" />
      <rect x="3" y="8" width="10" height="1" fill="#ff6b5c" />
      {/* Belly scales */}
      <rect x="5" y="8" width="6" height="2" fill="#f5c518" />
      <rect x="6" y="9" width="4" height="1" fill="#f0a020" />
      {/* Wings */}
      <rect x="0" y="6" width="2" height="1" fill="#a93226" />
      <rect x="0" y="7" width="1" height="3" fill="#a93226" />
      <rect x="14" y="6" width="2" height="1" fill="#a93226" />
      <rect x="15" y="7" width="1" height="3" fill="#a93226" />
      {/* Legs */}
      <rect x="3" y="11" width="3" height="3" fill="#c0392b" />
      <rect x="10" y="11" width="3" height="3" fill="#c0392b" />
      {/* Claws */}
      <rect x="2" y="14" width="2" height="1" fill="#1a1a2e" />
      <rect x="4" y="14" width="2" height="1" fill="#1a1a2e" />
      <rect x="10" y="14" width="2" height="1" fill="#1a1a2e" />
      <rect x="12" y="14" width="2" height="1" fill="#1a1a2e" />
      {/* Tail */}
      <rect x="7" y="11" width="2" height="2" fill="#c0392b" />
      <rect x="7" y="13" width="2" height="1" fill="#a93226" />
    </svg>
  )
}

// ============ DEATH ============
export function DeathSprite({ size = 64 }) {
  return (
    <svg {...svgProps(size, '')}>
      <rect x="4" y="10" width="8" height="4" fill="#5a5a6a" />
      <rect x="4" y="10" width="8" height="1" fill="#7a7a8a" />
      <rect x="5" y="3" width="6" height="1" fill="#5a5a6a" />
      <rect x="4" y="4" width="8" height="6" fill="#6a6a7a" />
      <rect x="5" y="4" width="6" height="1" fill="#7a7a8a" />
      <rect x="7" y="5" width="2" height="1" fill="#3a3a4a" />
      <rect x="7" y="5" width="2" height="4" fill="#3a3a4a" />
      <rect x="6" y="6" width="4" height="1" fill="#3a3a4a" />
      <rect x="2" y="14" width="12" height="1" fill="#3a3a2a" />
      <rect x="3" y="15" width="10" height="1" fill="#2a2a1a" />
      <rect x="3" y="13" width="1" height="1" fill="#4a6a2a" />
      <rect x="12" y="13" width="1" height="1" fill="#4a6a2a" />
    </svg>
  )
}

// ============ AREA SPRITES ============
function CaveSprite({ size }) {
  const c = colors(size)
  return (
    <svg {...svgProps(size, c)}>
      {/* Cave entrance */}
      <rect x="2" y="8" width="12" height="6" fill="#2c3e50" />
      <rect x="3" y="9" width="10" height="4" fill="#34495e" />
      <rect x="4" y="10" width="8" height="2" fill="#1a252f" />
      {/* Rocky top */}
      <rect x="1" y="6" width="14" height="2" fill="#7f8c8d" />
      <rect x="0" y="5" width="16" height="1" fill="#95a5a6" />
      <rect x="2" y="4" width="12" height="1" fill="#95a5a6" />
    </svg>
  )
}

function ShadowSprite({ size }) {
  const c = colors(size)
  return (
    <svg {...svgProps(size, c)}>
      {/* Swirling shadow */}
      <rect x="3" y="2" width="10" height="12" fill="#2c3e50" opacity="0.8" />
      <rect x="4" y="3" width="8" height="10" fill="#34495e" opacity="0.6" />
      <rect x="5" y="4" width="6" height="8" fill="#1a252f" opacity="0.7" />
      {/* Shadow wisps */}
      <rect x="2" y="3" width="2" height="8" fill="#2c3e50" opacity="0.4" />
      <rect x="12" y="4" width="2" height="6" fill="#2c3e50" opacity="0.4" />
      <rect x="6" y="1" width="4" height="2" fill="#2c3e50" opacity="0.3" />
    </svg>
  )
}

function ForestSprite({ size }) {
  const c = colors(size)
  return (
    <svg {...svgProps(size, c)}>
      {/* Tree trunks */}
      <rect x="3" y="8" width="2" height="6" fill="#8b4513" />
      <rect x="11" y="7" width="2" height="7" fill="#8b4513" />
      <rect x="7" y="9" width="2" height="5" fill="#8b4513" />
      {/* Tree tops */}
      <rect x="1" y="4" width="6" height="4" fill="#228b22" />
      <rect x="9" y="3" width="6" height="4" fill="#228b22" />
      <rect x="5" y="6" width="6" height="3" fill="#32cd32" />
      {/* Leaves */}
      <rect x="2" y="5" width="4" height="1" fill="#90ee90" />
      <rect x="10" y="4" width="4" height="1" fill="#90ee90" />
    </svg>
  )
}

function CastleSprite({ size }) {
  const c = colors(size)
  return (
    <svg {...svgProps(size, c)}>
      {/* Castle base */}
      <rect x="2" y="10" width="12" height="4" fill="#708090" />
      {/* Towers */}
      <rect x="1" y="6" width="3" height="6" fill="#708090" />
      <rect x="12" y="5" width="3" height="7" fill="#708090" />
      <rect x="6" y="7" width="4" height="5" fill="#708090" />
      {/* Tower tops */}
      <rect x="0" y="5" width="5" height="1" fill="#2f4f4f" />
      <rect x="11" y="4" width="5" height="1" fill="#2f4f4f" />
      <rect x="5" y="6" width="6" height="1" fill="#2f4f4f" />
      {/* Gate */}
      <rect x="6" y="12" width="4" height="2" fill="#1a1a1a" />
    </svg>
  )
}

// ============ SPRITE LOOKUP ============
const SPRITE_MAP = {
  knight: KnightSprite,
  mage: MageSprite,
  archer: ArcherSprite,
  healer: HealerSprite,
  slime: SlimeSprite,
  bat: BatSprite,
  goblin: GoblinSprite,
  skeleton: SkeletonSprite,
  darkKnight: DarkKnightSprite,
  goblinKing: GoblinKingSprite,
  dragon: DragonSprite,
  // Area sprites
  cave: CaveSprite,
  shadow: ShadowSprite,
  forest: ForestSprite,
  castle: CastleSprite,
}

export function Sprite({ type, size = 64, defeated = false }) {
  const Component = SPRITE_MAP[type]
  if (!Component) return null
  if (defeated) return <DeathSprite size={size} />
  return <Component size={size} defeated={defeated} />
}
