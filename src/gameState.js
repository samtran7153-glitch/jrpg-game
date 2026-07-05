import { createHero, createEnemy, SKILLS, ITEMS, calculateDamage } from './gameData'

const PHASES = {
  INTRO: 'intro',
  PLAYER_MENU: 'player_menu',
  PLAYER_SKILLS: 'player_skills',
  PLAYER_ITEMS: 'player_items',
  ENEMY_TURN: 'enemy_turn',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
}

const initialState = {
  hero: createHero(),
  enemy: createEnemy(),
  phase: PHASES.INTRO,
  log: ['A wild Goblin King appears!'],
  busy: false,
}

export function createInitialState() {
  return {
    hero: createHero(),
    enemy: createEnemy(),
    phase: PHASES.INTRO,
    log: ['A wild Goblin King appears!'],
    busy: false,
  }
}

export { PHASES, SKILLS, ITEMS, calculateDamage }
