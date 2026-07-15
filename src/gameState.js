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
  PLAYER_MULTI_TARGET: 'player_multi_target',
  PLAYER_ALLY_TARGET: 'player_ally_target',
  ENEMY_TURN: 'enemy_turn',
  BATTLE_VICTORY: 'battle_victory',
  BATTLE_DEFEAT: 'battle_defeat',
  WORLD_MAP: 'world_map',
  PATH_SELECTION: 'path_selection',
  EXPLORATION: 'exploration',
  GAME_COMPLETE: 'game_complete',
  SETTINGS: 'settings',
  TRAVEL: 'travel',
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
    maxAreaReached: 0, // Furthest area unlocked by clearing; gates world-map travel
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
    pendingRecruit: null,
    battleCompletions: {},
    // Exploration features
    discoveredTreasures: {},
    completedSecretBattles: {},
    selectedPaths: {}, // Track which path (easy/hard) player chose for each area
    selectedAreaIndex: null, // Area pending path selection before confirming arrival
    explorationMode: null, // 'path_selection' or 'exploring'
    pendingPathSelectionAfterDialogue: false, // Flag for routing to path selection after post-boss dialogue
    explorationBattleId: null, // Track when a battle started from exploration mode
    explorationTreasureId: null, // Set when a battle guards a treasure chest (loot on victory)
  }
}

export function getAliveActors(state) {
  return [...state.party, ...state.enemies].filter((a) => a.alive && a.hp > 0)
}

export function computeTurnOrder(party, enemies) {
  const all = [...party, ...enemies].filter((a) => a.alive && a.hp > 0)
  return all.sort((a, b) => {
    const aSpeed = (a.statusEffects || []).some(e => e.type === 'slow') ? Math.floor(a.speed * 0.5) : a.speed
    const bSpeed = (b.statusEffects || []).some(e => e.type === 'slow') ? Math.floor(b.speed * 0.5) : b.speed
    return bSpeed - aSpeed
  })
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

export function startBattle(state, enemyTypes, dialogueBefore, dialogueAfter, recruit = null) {
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
    pendingRecruit: recruit,
    log: ['Battle Start!'],
    floatTexts: [],
    screenShake: 0,
    busy: false,
    pendingAction: null,
    explorationBattleId: null,
    explorationTreasureId: null,
  }
}

export function advanceDialogue(state) {
  const nextIdx = state.dialogueIndex + 1
  if (nextIdx >= state.dialogueLines.length) {
    const aliveEnemies = state.enemies.filter((e) => e.alive && e.hp > 0)
    if (state.phase === PHASES.DIALOGUE && aliveEnemies.length > 0) {
      return { ...state, phase: PHASES.BATTLE_INTRO, dialogueLines: [], dialogueIndex: 0 }
    }
    return { ...state, phase: PHASES.AREA_MAP, dialogueLines: [], dialogueIndex: 0, enemies: [] }
  }
  return { ...state, dialogueIndex: nextIdx }
}

export function checkBattleEnd(state) {
  const aliveEnemies = state.enemies.filter((e) => e.alive && e.hp > 0)
  const aliveParty = state.party.filter((h) => h.alive && h.hp > 0)

  if (aliveEnemies.length === 0) {
    const baseXp = state.enemies.reduce((sum, e) => sum + (e.xp || 0), 0)
    const baseGold = state.enemies.reduce((sum, e) => sum + (e.gold || 0), 0)
    const battleKey = state.explorationBattleId
      ? `exploration-${state.currentAreaIndex}-${state.explorationBattleId}`
      : `${state.currentAreaIndex}-${state.activeBattleIndex ?? state.currentBattleIndex}`
    const completions = (state.battleCompletions[battleKey] || 0) + 1
    const isReplay = completions > 1
    const penaltyMultiplier = isReplay ? 0.5 : 1
    const totalXp = Math.floor(baseXp * penaltyMultiplier)
    const totalGold = Math.floor(baseGold * penaltyMultiplier)
    return {
      ...state,
      phase: PHASES.BATTLE_VICTORY,
      battleResult: { xp: totalXp, gold: totalGold, isReplay },
      gold: state.gold + totalGold,
      log: [...state.log, isReplay ? `Replay complete! (${Math.floor(penaltyMultiplier * 100)}% rewards)` : 'All enemies defeated!'].slice(-6),
      battleCompletions: { ...state.battleCompletions, [battleKey]: completions },
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

