// ============ SKILLS ============
export const SKILLS = {
  // Knight skills
  powerSlash: { name: 'Power Slash', mpCost: 4, damage: 22, type: 'physical', element: 'physical', target: 'enemy', description: 'A mighty sword strike' },
  shieldBash: { name: 'Shield Bash', mpCost: 6, damage: 15, type: 'physical', element: 'physical', target: 'enemy', effect: 'stun', effectChance: 0.4, duration: 1, description: 'Damage + chance to stun' },
  taunt: { name: 'Taunt', mpCost: 3, type: 'buff', target: 'self', effect: 'defense_up', duration: 3, description: 'Raise defense for 3 turns' },
  // Mage skills
  fireball: { name: 'Fireball', mpCost: 8, damage: 30, type: 'magic', element: 'fire', target: 'enemy', description: 'A blazing sphere of fire' },
  iceLance: { name: 'Ice Lance', mpCost: 7, damage: 25, type: 'magic', element: 'ice', target: 'enemy', effect: 'slow', effectChance: 0.6, duration: 2, description: 'Ice spike + slow' },
  lightning: { name: 'Lightning', mpCost: 12, damage: 40, type: 'magic', element: 'lightning', target: 'enemy', description: 'Bolt from the heavens' },
  // Archer skills
  preciseShot: { name: 'Precise Shot', mpCost: 3, damage: 18, type: 'physical', element: 'physical', target: 'enemy', critBonus: 0.3, description: 'High crit chance arrow' },
  poisonArrow: { name: 'Poison Arrow', mpCost: 5, damage: 12, type: 'physical', element: 'physical', target: 'enemy', effect: 'poison', effectChance: 0.7, duration: 3, description: 'Damage + poison for 3 turns' },
  rapidFire: { name: 'Rapid Fire', mpCost: 8, damage: 10, type: 'physical', element: 'physical', target: 'enemy', hits: 3, description: 'Fire 3 arrows' },
  // Healer skills
  heal: { name: 'Heal', mpCost: 6, heal: 35, type: 'support', target: 'ally', description: 'Restore HP' },
  greaterHeal: { name: 'Greater Heal', mpCost: 12, heal: 70, type: 'support', target: 'ally', description: 'Restore a lot of HP' },
  bless: { name: 'Bless', mpCost: 8, type: 'buff', target: 'ally', effect: 'attack_up', duration: 3, description: 'Boost ally attack for 3 turns' },
  // Enemy skills
  boneToss: { name: 'Bone Toss', mpCost: 5, damage: 18, type: 'physical', element: 'physical', target: 'enemy', description: 'Hurls a sharpened bone' },
  darkSlash: { name: 'Dark Slash', mpCost: 8, damage: 28, type: 'magic', element: 'dark', target: 'enemy', description: 'A shadow-infused strike' },
  dragonBreath: { name: 'Dragon Breath', mpCost: 15, damage: 45, type: 'magic', element: 'fire', target: 'enemy_all', description: 'Scorching breath hits all' },
  venomSpit: { name: 'Venom Spit', mpCost: 4, damage: 8, type: 'physical', element: 'physical', target: 'enemy', effect: 'poison', effectChance: 0.5, duration: 3, description: 'Poisonous spit' },
}

// ============ ITEMS ============
export const ITEMS = {
  potion: { name: 'Potion', heal: 30, description: 'Restores 30 HP', price: 30 },
  hiPotion: { name: 'Hi-Potion', heal: 70, description: 'Restores 70 HP', price: 60 },
  ether: { name: 'Ether', mpRestore: 15, description: 'Restores 15 MP', price: 50 },
  hiEther: { name: 'Hi-Ether', mpRestore: 35, description: 'Restores 35 MP', price: 90 },
  phoenixDown: { name: 'Phoenix Down', revive: true, heal: 30, description: 'Revive a fallen ally', price: 150 },
  antidote: { name: 'Antidote', cure: 'poison', description: 'Cures poison', price: 25 },
}

// ============ HERO CLASSES ============
export const HERO_CLASSES = {
  knight: { name: 'Aria', title: 'Knight', sprite: 'knight', level: 1, maxHp: 50, maxMp: 15, attack: 14, defense: 8, speed: 10, skills: ['powerSlash', 'shieldBash', 'taunt'] },
  mage: { name: 'Elwyn', title: 'Mage', sprite: 'mage', level: 1, maxHp: 30, maxMp: 30, attack: 8, defense: 4, speed: 12, skills: ['fireball', 'iceLance', 'lightning'] },
  archer: { name: 'Kira', title: 'Archer', sprite: 'archer', level: 1, maxHp: 38, maxMp: 18, attack: 12, defense: 5, speed: 16, skills: ['preciseShot', 'poisonArrow', 'rapidFire'] },
  healer: { name: 'Sera', title: 'Cleric', sprite: 'healer', level: 1, maxHp: 35, maxMp: 25, attack: 6, defense: 5, speed: 11, skills: ['heal', 'greaterHeal', 'bless'] },
}

// ============ ENEMY TYPES ============
export const ENEMY_TYPES = {
  slime: { name: 'Slime', sprite: 'slime', maxHp: 35, maxMp: 10, attack: 12, defense: 4, speed: 8, xp: 15, gold: 15, skills: ['venomSpit'], weaknesses: { fire: 1.5, ice: 0.5 }, ai: { skillChance: 0.2 } },
  bat: { name: 'Cave Bat', sprite: 'slime', maxHp: 28, maxMp: 8, attack: 14, defense: 3, speed: 18, xp: 18, gold: 18, skills: ['venomSpit'], weaknesses: { lightning: 1.5, ice: 0.5 }, ai: { skillChance: 0.25 } },
  goblin: { name: 'Goblin', sprite: 'goblin', maxHp: 55, maxMp: 15, attack: 16, defense: 7, speed: 12, xp: 25, gold: 27, skills: ['fireball'], weaknesses: { fire: 0.5, lightning: 1.5 }, ai: { skillChance: 0.25 } },
  wolf: { name: 'Dire Wolf', sprite: 'goblin', maxHp: 65, maxMp: 10, attack: 20, defense: 6, speed: 15, xp: 30, gold: 30, skills: ['darkSlash'], weaknesses: { ice: 1.5, fire: 1.25 }, ai: { skillChance: 0.3 } },
  skeleton: { name: 'Skeleton', sprite: 'skeleton', maxHp: 50, maxMp: 20, attack: 20, defense: 5, speed: 11, xp: 30, gold: 33, skills: ['boneToss'], weaknesses: { fire: 1.5, lightning: 1.25, dark: 0.25 }, ai: { skillChance: 0.3 } },
  shadow: { name: 'Shadow', sprite: 'skeleton', maxHp: 70, maxMp: 25, attack: 24, defense: 8, speed: 17, xp: 40, gold: 45, skills: ['darkSlash', 'iceLance'], weaknesses: { dark: 0.25, fire: 1.5, lightning: 1.25 }, ai: { skillChance: 0.35 } },
  darkKnight: { name: 'Dark Knight', sprite: 'darkKnight', maxHp: 120, maxMp: 30, attack: 26, defense: 15, speed: 14, xp: 60, gold: 75, skills: ['darkSlash', 'shieldBash'], weaknesses: { dark: 0.5, fire: 1.25, lightning: 1.25 }, ai: { skillChance: 0.35 } },
  goblinKing: { name: 'Goblin King', sprite: 'goblinKing', maxHp: 160, maxMp: 40, attack: 22, defense: 12, speed: 13, xp: 100, gold: 120, skills: ['fireball', 'darkSlash'], weaknesses: { fire: 0.5, lightning: 1.5 }, ai: { skillChance: 0.4, tauntChance: 0.35, taunts: ['You cannot defeat me!', 'I will crush your bones!', 'Is that all you\'ve got?', 'Pathetic humans!', 'Feel my wrath!'] }, isBoss: true },
  dragon: { name: 'Ancient Dragon', sprite: 'dragon', maxHp: 280, maxMp: 60, attack: 30, defense: 18, speed: 16, xp: 250, gold: 300, skills: ['dragonBreath', 'fireball', 'darkSlash'], weaknesses: { fire: 0.25, ice: 2.0, lightning: 1.25 }, ai: { skillChance: 0.45, tauntChance: 0.4, taunts: ['You are nothing but insects!', 'Burn in my flames!', 'I am eternal!', 'Your resistance is futile!', 'Tremble before me!'] }, isBoss: true },
  shadowLord: { name: 'Shadow Lord', sprite: 'darkKnight', maxHp: 220, maxMp: 50, attack: 28, defense: 16, speed: 15, xp: 180, gold: 225, skills: ['darkSlash', 'lightning', 'dragonBreath'], weaknesses: { dark: 0.25, fire: 1.5, lightning: 0.5, ice: 1.25 }, ai: { skillChance: 0.5, tauntChance: 0.45, taunts: ['Darkness consumes all!', 'You fight in vain!', 'I am the void!', 'Your light fades!', 'Bow before the Shadow Lord!'] }, isBoss: true },
}

// ============ AREAS ============
export const AREAS = [
  {
    id: 'forest', name: 'Whispering Forest', sprite: 'forest',
    description: 'A dense forest teeming with wild creatures.',
    battles: [
      { enemies: ['slime'], recruit: 'mage', dialogue: { before: ['Aria: This forest seems peaceful...', "Aria: Still, I shouldn't let my guard down."], after: ['Elwyn: That was close! Let me join you before worse things appear.'] } },
      { enemies: ['slime', 'slime'], dialogue: { before: ['Elwyn: More slimes? They must be nesting nearby.'], after: ['Aria: Let\'s keep moving deeper.'] } },
      { enemies: ['slime', 'goblin'], recruit: 'archer', dialogue: { before: ["Aria: Goblins! They've been raiding the nearby villages."], after: ["Kira: Nice shot, right? You'll need an archer from here on."] } },
      { enemies: ['goblin', 'goblin'], dialogue: { before: ['Kira: A whole goblin patrol!', 'Aria: Stay sharp, everyone.'], after: ['Elwyn: They were well-organized. Someone is leading them.'] } },
      { enemies: ['wolf'], dialogue: { before: ['Aria: A dire wolf! Watch out for its speed!'], after: ['Kira: That thing was fast. Good thing I\'m faster.'] } },
      { enemies: ['goblinKing'], dialogue: { before: ['Aria: The Goblin King! So you\'re the one terrorizing these woods.', 'Goblin King: You dare challenge me?! I\'ll crush you all!'], after: ['Aria: The forest is safe now.', 'Elwyn: But I sense a darker presence coming from the caves...'] } },
    ],
  },
  {
    id: 'cave', name: 'Shadow Caverns', sprite: 'cave',
    description: 'Dark caves where the undead roam freely.',
    battles: [
      { enemies: ['bat', 'bat'], dialogue: { before: ['Kira: Bats! They\'re fast but fragile.'], after: ['Aria: The cave entrance is clear.'] } },
      { enemies: ['skeleton', 'skeleton'], recruit: 'healer', dialogue: { before: ["Aria: These bones... they're moving!", 'Elwyn: Necromancy. Someone is raising the dead.'], after: ["Sera: You're wounded. Let me travel with you and keep everyone standing."] } },
      { enemies: ['bat', 'skeleton'], dialogue: { before: ['Sera: The deeper we go, the worse it gets.'], after: ['Kira: I can barely see in here.'] } },
      { enemies: ['skeleton', 'goblin'], dialogue: { before: ['Aria: Goblins and skeletons working together?', 'Kira: Something is commanding them.'], after: ['Sera: I feel a powerful dark aura ahead.'] } },
      { enemies: ['wolf', 'skeleton'], dialogue: { before: ['Elwyn: Even the wildlife is corrupted here.'], after: ['Aria: We\'re getting close to something powerful.'] } },
      { enemies: ['shadow'], dialogue: { before: ['Sera: A shadow creature! It feeds on dark energy!', 'Shadow: ...'], after: ['Elwyn: That thing was made of pure darkness.'] } },
      { enemies: ['darkKnight'], dialogue: { before: ["Dark Knight: You shall pass no further. My master's plans will not be interrupted.", 'Aria: Who is your master?', 'Dark Knight: You will learn soon enough... in death.'], after: ['Elwyn: The Dark Knight mentioned a master...', 'Aria: Then we press on to the castle.'] } },
    ],
  },
  {
    id: 'castle', name: 'Obsidian Castle', sprite: 'castle',
    description: 'A foreboding castle where the final threat awaits.',
    battles: [
      { enemies: ['skeleton', 'skeleton'], dialogue: { before: ['Aria: This is it. The Obsidian Castle.', 'Kira: The source of the darkness.'], after: ['Sera: These are stronger than the ones in the caves!'] } },
      { enemies: ['shadow', 'skeleton'], dialogue: { before: ['Elwyn: The dark energy is overwhelming here.', 'Aria: Stay strong, everyone!'], after: ['Kira: Something big is ahead.'] } },
      { enemies: ['darkKnight', 'goblin'], dialogue: { before: ['Aria: Dark Knights commanding goblin soldiers?', 'Elwyn: This army is well-organized.'], after: ['Sera: We must be close to the throne room.'] } },
      { enemies: ['skeleton', 'darkKnight'], dialogue: { before: ['Kira: They\'re guarding the inner sanctum.', 'Aria: Then we fight through!'], after: ["Sera: We're ready for whatever lies ahead."] } },
      { enemies: ['darkKnight', 'shadow'], dialogue: { before: ['Elwyn: The dark energy is peaking. We\'re near the end.', 'Aria: One more fight. I can feel it.'], after: ['Kira: The throne room is just ahead!'] } },
      { enemies: ['dragon'], dialogue: { before: ['Dragon: Fools. You have come to your doom.', "Aria: You're the one behind everything!", 'Dragon: I am eternal. I am power. You are nothing but insects.', 'Sera: Together, we can do this!'], after: ["Aria: It's over. The dragon is defeated.", 'Elwyn: But... the dark energy hasn\'t faded.', 'Kira: You feel it too? Something else is here.'] } },
    ],
  },
  {
    id: 'shadow', name: 'Shadow Realm', sprite: 'cave',
    description: 'A void between worlds where the true enemy lurks.',
    battles: [
      { enemies: ['shadow', 'shadow'], dialogue: { before: ['Aria: Where are we? This isn\'t the castle anymore.', 'Elwyn: The dragon\'s death must have opened a rift.', 'Sera: The real mastermind is here.'], after: ['Kira: These shadows are stronger than before.'] } },
      { enemies: ['shadow', 'darkKnight'], dialogue: { before: ['Sera: The Dark Knights are here too. They serve the Shadow Lord.'], after: ['Aria: We\'re getting closer.'] } },
      { enemies: ['darkKnight', 'darkKnight'], dialogue: { before: ['Elwyn: Two Dark Knights at once!', 'Aria: We\'ve trained for this. Let\'s go!'], after: ['Kira: That was intense. We must be near the end.'] } },
      { enemies: ['shadow', 'shadow', 'shadow'], dialogue: { before: ['Sera: A wall of shadows! The Shadow Lord knows we\'re here.', 'Aria: Then let\'s not keep him waiting.'], after: ['Elwyn: The rift is destabilizing. We need to finish this!'] } },
      { enemies: ['shadowLord'], dialogue: { before: ['Shadow Lord: So, the insects who slew my dragon have arrived.', 'Aria: You\'re the one behind everything! The forest, the caves, the castle!', 'Shadow Lord: I am the void between worlds. I am eternal darkness.', 'Sera: Your darkness ends here!', 'Shadow Lord: You cannot destroy what is nothing. Come, let me consume your light!'], after: ['Aria: The Shadow Lord is gone. The rift is closing!', 'Elwyn: The darkness is fading from the land.', 'Kira: We actually did it!', 'Sera: The world is safe. Our adventure... is complete.'] } },
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
    skills: [...tpl.skills], ai: tpl.ai, isBoss: tpl.isBoss || false, weaknesses: tpl.weaknesses || {},
    defending: false, statusEffects: [], isPlayer: false, alive: true,
  }
}

export function createParty() {
  return [createHero('knight')]
}

export function calculateDamage(attacker, defender, baseDamage, isCrit = false, element = 'physical') {
  const variance = 0.85 + Math.random() * 0.3
  const critMult = isCrit ? 1.75 : 1
  // Apply status effect buffs
  const atkBuffs = (attacker.statusEffects || []).filter((e) => e.type === 'attack_up')
  const atkMult = atkBuffs.length > 0 ? 1.5 : 1
  const defBuffs = (defender.statusEffects || []).filter((e) => e.type === 'defense_up')
  let effectiveDef = defender.defending ? defender.defense * 2 : defender.defense
  if (defBuffs.length > 0) effectiveDef = Math.floor(effectiveDef * 1.5)
  let dmg = Math.max(1, Math.floor((baseDamage * atkMult - effectiveDef * 0.5) * variance * critMult))
  // Apply elemental weakness/resistance
  const weaknesses = defender.weaknesses || defender.typeKey && ENEMY_TYPES[defender.typeKey]?.weaknesses
  if (weaknesses && weaknesses[element]) {
    dmg = Math.max(1, Math.floor(dmg * weaknesses[element]))
  }
  return dmg
}

export function rollCrit(critBonus = 0) {
  return Math.random() < 0.1 + critBonus
}

export function xpForLevel(level) {
  return level * 100
}

export function levelUp(hero) {
  const newLevel = hero.level + 1
  const hpGain = Math.floor(hero.maxHp * 0.18) + 6
  const mpGain = Math.floor(hero.maxMp * 0.15) + 3
  const atkGain = Math.max(3, Math.floor(hero.attack * 0.15))
  const defGain = Math.max(2, Math.floor(hero.defense * 0.15))
  return {
    ...hero, level: newLevel,
    maxHp: hero.maxHp + hpGain, maxMp: hero.maxMp + mpGain,
    hp: hero.maxHp + hpGain, mp: hero.maxMp + mpGain,
    attack: hero.attack + atkGain, defense: hero.defense + defGain,
  }
}
