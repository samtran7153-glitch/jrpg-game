import {
  createParty, createEnemy, SKILLS, ITEMS, calculateDamage, rollCrit,
  levelUp, xpForLevel, AREAS,
} from './gameData'

export const PHASES = {
  TITLE: 'title',
  AREA_MAP: 'area_map',
  SHOP: 'shop',
  DIALOGUE: 'dialogue',
  BATTLE_INTRO: 'battle_intro',
  PLAYER_MENU: 'player_menu',
  PLAYER_SKILLS: 'player_skills',
  PLAYER_ITEMS: 'player_items',
  PLAYER_TARGET: 'player_target',
  PLAYER_ALLY_TARGET: 'player_ally_target',
  ENEMY_TURN: 'enemy_turn',
  BATTLE_VICTORY: 'battle_victory',
  BATTLE_DEFEAT: 'battle_defeat',
  GAME_COMPLETE: 'game_complete',
}

export { SKILLS, ITEMS, calculateDamage, rollCrit, levelUp, xpForLevel, AREAS }

export function createInitialState() {
  return {
    party: createParty(),
    enemies: [],
    phase: PHASES.TITLE,
    log: [],
    busy: false,
    gold: 100,
    inventory: { potion: 5, ether: 2, phoenixDown: 1 },
    currentAreaIndex: 0,
    currentBattleIndex: 0,
    turnOrder: [],
    currentTurnIndex: 0,
    turnNonce: 0,
    activeActor: null,
    dialogueLines: [],
    dialogueIndex: 0,
    dialogueAfter: null,
    battleResult: null,
    pendingAction: null,
    floatTexts: [],
    screenShake: 0,
  }
}

export function getAliveActors(state) {
  return [...state.party, ...state.enemies].filter((a) => a.alive && a.hp > 0)
}

export function computeTurnOrder(party, enemies) {
  const all = [...party, ...enemies].filter((a) => a.alive && a.hp > 0)
  return all.sort((a, b) => b.speed - a.speed)
}

export function getCurrentActor(state) {
  if (!state.turnOrder.length) return null
  const idx = state.currentTurnIndex % state.turnOrder.length
  return state.turnOrder[idx]
}

export function getNextAliveActor(state) {
  const order = state.turnOrder
  for (let i = 1; i <= order.length; i++) {
    const idx = (state.currentTurnIndex + i) % order.length
    if (order[idx].alive && order[idx].hp > 0) return order[idx]
  }
  return null
}

export function startBattle(state, enemyTypes, dialogueBefore, dialogueAfter) {
  const enemies = enemyTypes.map((type, i) => createEnemy(type, i))
  const party = state.party.map((h) => ({ ...h, defending: false, statusEffects: [] }))
  const turnOrder = computeTurnOrder(party, enemies)
  return {
    ...state,
    party,
    enemies,
    turnOrder,
    currentTurnIndex: 0,
    activeActor: turnOrder[0],
    phase: dialogueBefore && dialogueBefore.length > 0 ? PHASES.DIALOGUE : PHASES.BATTLE_INTRO,
    dialogueLines: dialogueBefore || [],
    dialogueIndex: 0,
    dialogueAfter: dialogueAfter || null,
    log: ['Battle Start!'],
    floatTexts: [],
    screenShake: 0,
    busy: false,
    pendingAction: null,
  }
}

export function advanceDialogue(state) {
  const nextIdx = state.dialogueIndex + 1
  if (nextIdx >= state.dialogueLines.length) {
    if (state.phase === PHASES.DIALOGUE && state.enemies.length > 0) {
      return { ...state, phase: PHASES.BATTLE_INTRO, dialogueLines: [], dialogueIndex: 0 }
    }
    return { ...state, phase: PHASES.AREA_MAP, dialogueLines: [], dialogueIndex: 0 }
  }
  return { ...state, dialogueIndex: nextIdx }
}

export function checkBattleEnd(state) {
  const aliveEnemies = state.enemies.filter((e) => e.alive && e.hp > 0)
  const aliveParty = state.party.filter((h) => h.alive && h.hp > 0)

  if (aliveEnemies.length === 0) {
    const totalXp = state.enemies.reduce((sum, e) => sum + (e.xp || 0), 0)
    const totalGold = state.enemies.reduce((sum, e) => sum + (e.gold || 0), 0)
    return {
      ...state,
      phase: PHASES.BATTLE_VICTORY,
      battleResult: { xp: totalXp, gold: totalGold },
      gold: state.gold + totalGold,
      log: [...state.log, 'All enemies defeated!'].slice(-6),
    }
  }

  if (aliveParty.length === 0) {
    return {
      ...state,
      phase: PHASES.BATTLE_DEFEAT,
      log: [...state.log, 'Your party has fallen...'].slice(-6),
    }
  }

  return null
}

export function applyXpAndLevelUps(state) {
  if (!state.battleResult) return state
  const xpPerHero = Math.floor(state.battleResult.xp / state.party.length)
  const leveledUp = []
  const party = state.party.map((hero) => {
    if (!hero.alive) return hero
    let h = { ...hero, xp: (hero.xp || 0) + xpPerHero }
    while (h.xp >= xpForLevel(h.level)) {
      h.xp -= xpForLevel(h.level)
      h = levelUp(h)
      leveledUp.push(h.name)
    }
    return h
  })
  return { ...state, party, battleResult: { ...state.battleResult, leveledUp, xpPerHero } }
}
