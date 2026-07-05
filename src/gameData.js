export const SKILLS = {
  fireball: {
    name: 'Fireball',
    mpCost: 8,
    damage: 28,
    type: 'magic',
    description: 'A blazing sphere of fire',
  },
  heal: {
    name: 'Heal',
    mpCost: 6,
    heal: 35,
    type: 'support',
    description: 'Restore HP with holy light',
  },
  powerSlash: {
    name: 'Power Slash',
    mpCost: 4,
    damage: 20,
    type: 'physical',
    description: 'A mighty sword strike',
  },
}

export const ITEMS = {
  potion: {
    name: 'Potion',
    heal: 30,
    description: 'Restores 30 HP',
  },
  ether: {
    name: 'Ether',
    mpRestore: 15,
    description: 'Restores 15 MP',
  },
}

export function createHero() {
  return {
    id: 'hero',
    name: 'Aria',
    title: 'Swordswoman',
    level: 5,
    hp: 80,
    maxHp: 80,
    mp: 30,
    maxMp: 30,
    attack: 22,
    defense: 10,
    speed: 15,
    skills: ['fireball', 'heal', 'powerSlash'],
    items: { potion: 3, ether: 1 },
    defending: false,
  }
}

export function createEnemy() {
  return {
    id: 'enemy',
    name: 'Goblin King',
    title: 'Forest Tyrant',
    level: 6,
    hp: 100,
    maxHp: 100,
    mp: 20,
    maxMp: 20,
    attack: 18,
    defense: 8,
    speed: 12,
    skills: ['fireball'],
    defending: false,
  }
}

export function calculateDamage(attacker, defender, baseDamage) {
  const variance = 0.85 + Math.random() * 0.3
  const def = defender.defending ? defender.defense * 2 : defender.defense
  const dmg = Math.max(1, Math.floor((baseDamage - def * 0.5) * variance))
  return dmg
}
