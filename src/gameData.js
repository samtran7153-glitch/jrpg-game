// ============ SKILLS ============
export const SKILLS = {
  // Knight skills
  powerSlash: { name: 'Power Slash', mpCost: 4, damage: 22, type: 'physical', target: 'enemy', description: 'A mighty sword strike' },
  shieldBash: { name: 'Shield Bash', mpCost: 6, damage: 15, type: 'physical', target: 'enemy', effect: 'stun', description: 'Damage + chance to stun' },
  taunt: { name: 'Taunt', mpCost: 3, type: 'buff', target: 'self', effect: 'defense_up', description: 'Raise defense' },
  // Mage skills
  fireball: { name: 'Fireball', mpCost: 8, damage: 30, type: 'magic', target: 'enemy', description: 'A blazing sphere of fire' },
  iceLance: { name: 'Ice Lance', mpCost: 7, damage: 25, type: 'magic', target: 'enemy', effect: 'slow', description: 'Ice spike + slow' },
  lightning: { name: 'Lightning', mpCost: 12, damage: 40, type: 'magic', target: 'enemy', description: 'Bolt from the heavens' },
  // Archer skills
  preciseShot: { name: 'Precise Shot', mpCost: 3, damage: 18, type: 'physical', target: 'enemy', critBonus: 0.3, description: 'High crit chance arrow' },
  poisonArrow: { name: 'Poison Arrow', mpCost: 5, damage: 12, type: 'physical', target: 'enemy', effect: 'poison', description: 'Damage + poison' },
  rapidFire: { name: 'Rapid Fire', mpCost: 8, damage: 10, type: 'physical', target: 'enemy', hits: 3, description: 'Fire 3 arrows' },
  // Healer skills
  heal: { name: 'Heal', mpCost: 6, heal: 35, type: 'support', target: 'ally', description: 'Restore HP' },
  greaterHeal: { name: 'Greater Heal', mpCost: 12, heal: 70, type: 'support', target: 'ally', description: 'Restore a lot of HP' },
  bless: { name: 'Bless', mpCost: 8, type: 'buff', target: 'ally', effect: 'attack_up', description: 'Boost ally attack' },
  // Enemy skills
  boneToss: { name: 'Bone Toss', mpCost: 5, damage: 18, type: 'physical', target: 'enemy', description: 'Hurls a sharpened bone' },
  darkSlash: { name: 'Dark Slash', mpCost: 8, damage: 28, type: 'physical', target: 'enemy', description: 'A shadow-infused strike' },
  dragonBreath: { name: 'Dragon Breath', mpCost: 15, damage: 45, type: 'magic', target: 'enemy_all', description: 'Scorching breath hits all' },
  venomSpit: { name: 'Venom Spit', mpCost: 4, damage: 8, type: 'physical', target: 'enemy', effect: 'poison', description: 'Poisonous spit' },
}

// ============ ITEMS ============
export const ITEMS = {
  potion: { name: 'Potion', heal: 30, description: 'Restores 30 HP', price: 30 },
  hiPotion: { name: 'Hi-Potion', heal: 70, description: 'Restores 70 HP', price: 80 },
  ether: { name: 'Ether', mpRestore: 15, description: 'Restores 15 MP', price: 50 },
  hiEther: { name: 'Hi-Ether', mpRestore: 35, description: 'Restores 35 MP', price: 120 },
  phoenixDown: { name: 'Phoenix Down', revive: true, heal: 30, description: 'Revive a fallen ally', price: 150 },
  antidote: { name: 'Antidote', cure: 'poison', description: 'Cures poison', price: 25 },
}

// ============ HERO CLASSES ============
export const HERO_CLASSES = {
  knight: { name: 'Aria', title: 'Knight', sprite: 'knight', level: 5, maxHp: 90, maxMp: 25, attack: 24, defense: 14, speed: 12, skills: ['powerSlash', 'shieldBash', 'taunt'] },
  mage: { name: 'Elwyn', title: 'Mage', sprite: 'mage', level: 5, maxHp: 55, maxMp: 45, attack: 12, defense: 6, speed: 14, skills: ['fireball', 'iceLance', 'lightning'] },
  archer: { name: 'Kira', title: 'Archer', sprite: 'archer', level: 5, maxHp: 65, maxMp: 30, attack: 20, defense: 8, speed: 20, skills: ['preciseShot', 'poisonArrow', 'rapidFire'] },
  healer: { name: 'Sera', title: 'Cleric', sprite: 'healer', level: 5, maxHp: 60, maxMp: 40, attack: 10, defense: 8, speed: 13, skills: ['heal', 'greaterHeal', 'bless'] },
}

// ============ ENEMY TYPES ============
export const ENEMY_TYPES = {
  slime: { name: 'Slime', sprite: 'slime', maxHp: 35, maxMp: 10, attack: 12, defense: 4, speed: 8, xp: 15, gold: 10, skills: ['venomSpit'], ai: { skillChance: 0.2 } },
  goblin: { name: 'Goblin', sprite: 'goblin', maxHp: 55, maxMp: 15, attack: 16, defense: 7, speed: 12, xp: 25, gold: 18, skills: ['fireball'], ai: { skillChance: 0.25 } },
  skeleton: { name: 'Skeleton', sprite: 'skeleton', maxHp: 50, maxMp: 20, attack: 20, defense: 5, speed: 11, xp: 30, gold: 22, skills: ['boneToss'], ai: { skillChance: 0.3 } },
  darkKnight: { name: 'Dark Knight', sprite: 'darkKnight', maxHp: 120, maxMp: 30, attack: 26, defense: 15, speed: 14, xp: 60, gold: 50, skills: ['darkSlash', 'shieldBash'], ai: { skillChance: 0.35 } },
  goblinKing: { name: 'Goblin King', sprite: 'goblinKing', maxHp: 160, maxMp: 40, attack: 22, defense: 12, speed: 13, xp: 100, gold: 80, skills: ['fireball', 'darkSlash'], ai: { skillChance: 0.4 }, isBoss: true },
  dragon: { name: 'Ancient Dragon', sprite: 'dragon', maxHp: 280, maxMp: 60, attack: 30, defense: 18, speed: 16, xp: 250, gold: 200, skills: ['dragonBreath', 'fireball', 'darkSlash'], ai: { skillChance: 0.45 }, isBoss: true },
}

// ============ AREAS ============
export const AREAS = [
  {
    id: 'forest', name: 'Whispering Forest', sprite: 'forest',
    description: 'A dense forest teeming with wild creatures.',
    battles: [
      { enemies: ['slime', 'slime'], dialogue: { before: ['Aria: This forest seems peaceful...', "Kira: Don't let your guard down. I sense something ahead."], after: ['Elwyn: That was close!'] } },
      { enemies: ['slime', 'goblin'], dialogue: { before: ["Kira: Goblins! They've been raiding the nearby villages."], after: ['Sera: We should keep moving.'] } },
      { enemies: ['goblinKing'], dialogue: { before: ['Aria: The Goblin King! So you\'re the one terrorizing these woods.', 'Goblin King: You dare challenge me?! I\'ll crush you all!'], after: ['Aria: The forest is safe now.', 'Elwyn: But I sense a darker presence coming from the caves...'] } },
    ],
  },
  {
    id: 'cave', name: 'Shadow Caverns', sprite: 'cave',
    description: 'Dark caves where the undead roam freely.',
    battles: [
      { enemies: ['skeleton', 'skeleton'], dialogue: { before: ["Sera: These bones... they're moving!", 'Elwyn: Necromancy. Someone is raising the dead.'], after: ['Kira: Deeper we go.'] } },
      { enemies: ['skeleton', 'goblin'], dialogue: { before: ['Aria: Goblins and skeletons working together?', 'Kira: Something is commanding them.'], after: ['Sera: I feel a powerful dark aura ahead.'] } },
      { enemies: ['darkKnight'], dialogue: { before: ["Dark Knight: You shall pass no further. My master's plans will not be interrupted.", 'Aria: Who is your master?', 'Dark Knight: You will learn soon enough... in death.'], after: ['Elwyn: The Dark Knight mentioned a master...', 'Aria: Then we press on to the castle.'] } },
    ],
  },
  {
    id: 'castle', name: 'Obsidian Castle', sprite: 'castle',
    description: 'A foreboding castle where the final threat awaits.',
    battles: [
      { enemies: ['skeleton', 'darkKnight'], dialogue: { before: ['Aria: This is it. The Obsidian Castle.', 'Kira: The source of the darkness.'], after: ["Sera: We're ready for whatever lies ahead."] } },
      { enemies: ['darkKnight', 'goblin'], dialogue: { before: ['Elwyn: The dark energy is overwhelming here.', 'Aria: Stay strong, everyone!'], after: ['Kira: One more fight. I can feel it.'] } },
      { enemies: ['dragon'], dialogue: { before: ['Dragon: Fools. You have come to your doom.', "Aria: You're the one behind everything!", 'Dragon: I am eternal. I am power. You are nothing but insects.', 'Sera: Together, we can do this!'], after: ["Aria: It's over. The dragon is defeated.", 'Elwyn: The land can finally heal.', 'Kira: We did it, team!', 'Sera: And our adventure is just beginning...'] } },
    ],
  },
]

// ============ HELPER FUNCTIONS ============
export function createHero(classKey) {
  const cls = HERO_CLASSES[classKey]
  return {
    id: `hero_${classKey}`, classKey, name: cls.name, title: cls.title, sprite: cls.sprite,
    level: cls.level, hp: cls.maxHp, maxHp: cls.maxHp, mp: cls.maxMp, maxMp: cls.maxMp,
    attack: cls.attack, defense: cls.defense, speed: cls.speed,
    skills: [...cls.skills], items: {}, defending: false, statusEffects: [], isPlayer: true, alive: true,
  }
}

export function createEnemy(typeKey, index = 0) {
  const tpl = ENEMY_TYPES[typeKey]
  return {
    id: `enemy_${typeKey}_${index}`, typeKey, name: tpl.name, sprite: tpl.sprite,
    level: Math.ceil(tpl.maxHp / 20), hp: tpl.maxHp, maxHp: tpl.maxHp, mp: tpl.maxMp, maxMp: tpl.maxMp,
    attack: tpl.attack, defense: tpl.defense, speed: tpl.speed, xp: tpl.xp, gold: tpl.gold,
    skills: [...tpl.skills], ai: tpl.ai, isBoss: tpl.isBoss || false,
    defending: false, statusEffects: [], isPlayer: false, alive: true,
  }
}

export function createParty() {
  return [createHero('knight'), createHero('mage'), createHero('archer'), createHero('healer')]
}

export function calculateDamage(attacker, defender, baseDamage, isCrit = false) {
  const variance = 0.85 + Math.random() * 0.3
  const critMult = isCrit ? 1.75 : 1
  const def = defender.defending ? defender.defense * 2 : defender.defense
  return Math.max(1, Math.floor((baseDamage - def * 0.5) * variance * critMult))
}

export function rollCrit(critBonus = 0) {
  return Math.random() < 0.1 + critBonus
}

export function xpForLevel(level) {
  return level * 100
}

export function levelUp(hero) {
  const newLevel = hero.level + 1
  const hpGain = Math.floor(hero.maxHp * 0.12) + 5
  const mpGain = Math.floor(hero.maxMp * 0.1) + 2
  const atkGain = Math.max(2, Math.floor(hero.attack * 0.1))
  const defGain = Math.max(1, Math.floor(hero.defense * 0.1))
  return {
    ...hero, level: newLevel,
    maxHp: hero.maxHp + hpGain, maxMp: hero.maxMp + mpGain,
    hp: hero.maxHp + hpGain, mp: hero.maxMp + mpGain,
    attack: hero.attack + atkGain, defense: hero.defense + defGain,
  }
}
