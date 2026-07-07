import { useState, useCallback, useEffect, useRef } from 'react'
import {
  createInitialState, PHASES, SKILLS, ITEMS, AREAS,
  calculateDamage, rollCrit, startBattle, advanceDialogue,
  checkBattleEnd, applyXpAndLevelUps,
} from './gameState'
import { BattleScreen } from './components/BattleScreen'
import {
  TitleScreen, AreaMapScreen, ShopScreen, DialogueScreen,
  VictoryScreen, DefeatScreen, GameCompleteScreen,
} from './components/Overworld'
import { GoldDisplay } from './components/Shared'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let floatId = 0

export default function App() {
  const [state, setState] = useState(createInitialState)
  const [anim, setAnim] = useState({ type: null, target: null })
  const [screenFade, setScreenFade] = useState(false)
  const enemyTurnInProgress = useRef(false)

  const addLog = (prev, msg) => [...prev, msg].slice(-6)

  const addFloatText = (s, text, x, y, color) => {
    const id = ++floatId
    const floats = [...s.floatTexts, { id, text, x, y, color }]
    setTimeout(() => {
      setState((prev) => ({ ...prev, floatTexts: prev.floatTexts.filter((f) => f.id !== id) }))
    }, 1200)
    return floats
  }

  const triggerShake = (s) => {
    setTimeout(() => setState((prev) => ({ ...prev, screenShake: 0 })), 300)
    return { ...s, screenShake: 1 }
  }

  // ============ GAME FLOW ============
  const startGame = () => {
    setState((s) => ({ ...s, phase: PHASES.AREA_MAP }))
  }

  const selectBattle = (battleIndex) => {
    setState((s) => {
      const area = AREAS[s.currentAreaIndex]
      const battle = area.battles[battleIndex]
      return startBattle(s, battle.enemies, battle.dialogue?.before, battle.dialogue?.after, battle.recruit)
    })
  }

  const advanceDialogueHandler = () => {
    setState((s) => advanceDialogue(s))
  }

  const continueAfterVictory = () => {
    setState((s) => {
      const area = AREAS[s.currentAreaIndex]
      const nextBattleIndex = s.currentBattleIndex + 1
      const afterDialogue = s.dialogueAfter

      const healedParty = s.party.map((h) => ({
        ...h,
        hp: h.alive ? Math.min(h.maxHp, h.hp + Math.floor(h.maxHp * 0.5)) : h.hp,
        mp: h.alive ? Math.min(h.maxMp, h.mp + Math.floor(h.maxMp * 0.5)) : h.mp,
        defending: false,
      }))

      if (afterDialogue && afterDialogue.length > 0) {
        return {
          ...s,
          party: healedParty,
          currentBattleIndex: nextBattleIndex,
          phase: PHASES.DIALOGUE,
          dialogueLines: afterDialogue,
          dialogueIndex: 0,
          dialogueAfter: null,
          battleResult: null,
        }
      }

      if (nextBattleIndex >= area.battles.length) {
        const nextAreaIndex = s.currentAreaIndex + 1
        if (nextAreaIndex >= AREAS.length) {
          return { ...s, phase: PHASES.GAME_COMPLETE, dialogueAfter: null }
        }
        return {
          ...s,
          party: healedParty,
          currentAreaIndex: nextAreaIndex,
          currentBattleIndex: 0,
          phase: PHASES.AREA_MAP,
          battleResult: null,
          enemies: [],
          dialogueAfter: null,
        }
      }

      return {
        ...s,
        party: healedParty,
        currentBattleIndex: nextBattleIndex,
        phase: PHASES.AREA_MAP,
        battleResult: null,
        enemies: [],
        dialogueAfter: null,
      }
    })
  }

  const retry = () => {
    setState((s) => {
      const area = AREAS[s.currentAreaIndex]
      const battle = area.battles[s.currentBattleIndex]
      return startBattle(s, battle.enemies, battle.dialogue?.before, battle.dialogue?.after, battle.recruit)
    })
  }

  const newGame = () => {
    setState(createInitialState())
  }

  // ============ SHOP ============
  const buyItem = (itemId) => {
    setState((s) => {
      const item = ITEMS[itemId]
      if (s.gold < item.price) return s
      const inventory = { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 1 }
      return { ...s, gold: s.gold - item.price, inventory }
    })
  }

  // ============ COMBAT ACTIONS ============
  const resolveActor = (s, queuedActor) => {
    if (!queuedActor) return null
    const actors = queuedActor.isPlayer ? s.party : s.enemies
    return actors.find((actor) => actor.id === queuedActor.id) || null
  }

  const getLivingTurnOrder = (s) => {
    return s.turnOrder
      .map((queuedActor) => resolveActor(s, queuedActor))
      .filter((actor) => actor && actor.alive && actor.hp > 0)
  }

  const applyStatusEffect = (target, effect, duration) => {
    const existing = target.statusEffects || []
    const filtered = existing.filter((e) => e.type !== effect)
    return { ...target, statusEffects: [...filtered, { type: effect, duration }] }
  }

  const processStatusEffects = (s, actor) => {
    let updated = { ...actor }
    let log = [...s.log]
    let floats = s.floatTexts
    const effects = updated.statusEffects || []

    for (const effect of effects) {
      if (effect.type === 'poison') {
        const dmg = Math.max(1, Math.floor(updated.maxHp * 0.08))
        updated = { ...updated, hp: Math.max(0, updated.hp - dmg), alive: updated.hp - dmg > 0 }
        log = addLog(log, `${updated.name} takes ${dmg} poison damage!`)
        floats = addFloatText(s, `-${dmg}`, 50, 50, '#4ecca3')
      }
    }

    const newEffects = effects.map((e) => ({ ...e, duration: e.duration - 1 })).filter((e) => e.duration > 0)
    updated = { ...updated, statusEffects: newEffects }

    const stunned = newEffects.some((e) => e.type === 'stun')
    const slowed = newEffects.some((e) => e.type === 'slow')

    return { actor: updated, log, floats, stunned, slowed }
  }

  const advanceTurn = (s, skipCount = 0) => {
    const currentQueuedActor = s.turnOrder[s.currentTurnIndex % s.turnOrder.length]
    let livingOrder = getLivingTurnOrder(s)
    if (livingOrder.length === 0) return s

    // If we've skipped through all living actors (all stunned/dead from poison),
    // advance to the next round by moving past the current actor
    if (skipCount >= livingOrder.length) {
      const nextIdx = (s.currentTurnIndex + 1) % s.turnOrder.length
      return {
        ...s,
        currentTurnIndex: nextIdx,
        turnNonce: (s.turnNonce || 0) + 1,
        activeActor: null,
        phase: PHASES.PLAYER_MENU,
      }
    }

    const currentLivingIndex = livingOrder.findIndex((actor) => actor.id === currentQueuedActor?.id)
    let nextLivingIndex = currentLivingIndex >= 0
      ? (currentLivingIndex + 1) % livingOrder.length
      : 0
    let nextActor = livingOrder[nextLivingIndex]

    // Process status effects on the next actor before their turn
    let party = s.party
    let enemies = s.enemies
    let log = [...s.log]
    let floats = s.floatTexts

    if (nextActor) {
      const result = processStatusEffects(s, nextActor)
      log = result.log
      floats = result.floats
      const updatedActor = result.actor

      if (updatedActor.isPlayer) {
        party = party.map((h) => h.id === updatedActor.id ? updatedActor : h)
      } else {
        enemies = enemies.map((e) => e.id === updatedActor.id ? updatedActor : e)
      }

      // Check if actor died from poison
      if (!updatedActor.alive || updatedActor.hp <= 0) {
        const newState = { ...s, party, enemies, log, floatTexts: floats }
        const ended = checkBattleEnd(newState)
        if (ended) return ended
        const skipTurnIndex = s.turnOrder.findIndex((a) => a.id === nextActor.id)
        return advanceTurn({ ...newState, currentTurnIndex: skipTurnIndex }, skipCount + 1)
      }

      // If stunned, skip their turn
      if (result.stunned) {
        log = addLog(log, `${updatedActor.name} is stunned and skips their turn!`)
        const skipState = { ...s, party, enemies, log, floatTexts: floats }
        const skipTurnIndex = s.turnOrder.findIndex((a) => a.id === nextActor.id)
        return advanceTurn({ ...skipState, currentTurnIndex: skipTurnIndex }, skipCount + 1)
      }

      nextActor = updatedActor
    }

    const nextTurnIndex = s.turnOrder.findIndex((actor) => actor.id === nextActor.id)
    const isEnemy = nextActor && !nextActor.isPlayer

    return {
      ...s,
      party,
      enemies,
      log,
      floatTexts: floats,
      currentTurnIndex: nextTurnIndex >= 0 ? nextTurnIndex : 0,
      turnNonce: (s.turnNonce || 0) + 1,
      activeActor: nextActor,
      phase: isEnemy ? PHASES.ENEMY_TURN : PHASES.PLAYER_MENU,
    }
  }

  const executeAttack = async (attacker, target) => {
    setState((s) => ({ ...s, busy: true }))
    setAnim({ type: 'attack', target: target.id })
    await sleep(400)

    setState((s) => {
      const currentAttacker = resolveActor(s, { id: attacker.id, isPlayer: attacker.isPlayer })
      const currentTarget = target.isPlayer
        ? s.party.find((h) => h.id === target.id)
        : s.enemies.find((e) => e.id === target.id)
      if (!currentAttacker || !currentTarget) return advanceTurn({ ...s, busy: false })

      const isCrit = rollCrit()
      const dmg = calculateDamage(currentAttacker, currentTarget, currentAttacker.attack, isCrit, 'physical')
      const newHp = Math.max(0, currentTarget.hp - dmg)
      const updatedTarget = { ...currentTarget, hp: newHp, alive: newHp > 0 }
      const party = updatedTarget.isPlayer
        ? s.party.map((h) => h.id === updatedTarget.id ? updatedTarget : h)
        : s.party
      const enemies = !updatedTarget.isPlayer
        ? s.enemies.map((e) => e.id === updatedTarget.id ? updatedTarget : e)
        : s.enemies
      const log = addLog(s.log, `${currentAttacker.name} attacks! ${dmg} damage!${isCrit ? ' CRIT!' : ''}`)
      const floats = addFloatText(s, `-${dmg}${isCrit ? '!' : ''}`, 50, 50, isCrit ? '#f5c518' : '#e94560')
      const shaken = triggerShake({ ...s, party, enemies, log, floatTexts: floats, busy: false })
      const ended = checkBattleEnd(shaken)
      if (ended) return ended
      return advanceTurn(shaken)
    })
    setAnim(null)
  }

  const executeSkill = async (actor, skillId, target) => {
    const skill = SKILLS[skillId]
    setState((s) => ({ ...s, busy: true }))
    setAnim({ type: 'skill', target: target?.id })
    await sleep(500)

    setState((s) => {
      const currentActor = resolveActor(s, { id: actor.id, isPlayer: actor.isPlayer })
      if (!currentActor) return advanceTurn({ ...s, busy: false })
      if (currentActor.mp < skill.mpCost) return advanceTurn({ ...s, busy: false })

      const updatedActor = { ...currentActor, mp: currentActor.mp - skill.mpCost }
      let party = s.party.map((h) => h.id === currentActor.id ? updatedActor : h)
      let enemies = s.enemies
      let log = [...s.log]
      let floats = s.floatTexts

      if (skill.type === 'support') {
        const currentTarget = target?.isPlayer
          ? s.party.find((h) => h.id === target.id)
          : target
        if (!currentTarget) return advanceTurn({ ...s, busy: false })
        const healed = { ...currentTarget, hp: Math.min(currentTarget.maxHp, currentTarget.hp + skill.heal) }
        party = party.map((h) => h.id === healed.id ? healed : h)
        log = addLog(log, `${currentActor.name} casts ${skill.name}! +${skill.heal} HP!`)
        floats = addFloatText(s, `+${skill.heal}`, 50, 50, '#4ecca3')
      } else if (skill.type === 'buff') {
        if (skill.effect === 'defense_up') {
          const buffed = applyStatusEffect(updatedActor, 'defense_up', skill.duration || 3)
          party = party.map((h) => h.id === buffed.id ? buffed : h)
          log = addLog(log, `${currentActor.name} uses ${skill.name}! Defense up for ${skill.duration || 3} turns!`)
        } else if (skill.effect === 'attack_up') {
          const currentTarget = target?.isPlayer
            ? s.party.find((h) => h.id === target.id)
            : target
          if (!currentTarget) return advanceTurn({ ...s, busy: false })
          const buffed = applyStatusEffect(currentTarget, 'attack_up', skill.duration || 3)
          party = party.map((h) => h.id === buffed.id ? buffed : h)
          log = addLog(log, `${currentActor.name} casts ${skill.name} on ${currentTarget.name}! ATK up for ${skill.duration || 3} turns!`)
        }
      } else {
        const currentTarget = target?.isPlayer
          ? s.party.find((h) => h.id === target.id)
          : s.enemies.find((e) => e.id === target?.id)
        if (!currentTarget) return advanceTurn({ ...s, busy: false })
        const hits = skill.hits || 1
        let totalDmg = 0
        let ct = { ...currentTarget }
        for (let h = 0; h < hits; h++) {
          if (!ct.alive && ct.hp <= 0) break
          const isCrit = rollCrit(skill.critBonus || 0)
          const dmg = calculateDamage(updatedActor, ct, skill.damage, isCrit, skill.element || 'physical')
          totalDmg += dmg
          const newHp = Math.max(0, ct.hp - dmg)
          ct = { ...ct, hp: newHp, alive: newHp > 0 }
        }
        // Apply status effect if skill has one and target is alive
        if (ct.alive && ct.hp > 0 && skill.effect && Math.random() < (skill.effectChance || 0.5)) {
          ct = applyStatusEffect(ct, skill.effect, skill.duration || 3)
          log = addLog(log, `${currentActor.name} applies ${skill.effect} to ${ct.name}!`)
        }
        if (ct.isPlayer) {
          party = party.map((p) => p.id === ct.id ? ct : p)
        } else {
          enemies = enemies.map((e) => e.id === ct.id ? ct : e)
        }
        log = addLog(log, `${currentActor.name} casts ${skill.name}! ${totalDmg} damage!`)
        floats = addFloatText(s, `-${totalDmg}`, 50, 50, '#e94560')
      }

      const newState = { ...s, party, enemies, log, floatTexts: floats, busy: false }
      const shaken = triggerShake(newState)
      const ended = checkBattleEnd(shaken)
      if (ended) return ended
      return advanceTurn(shaken)
    })
    setAnim(null)
  }

  const executeItem = async (actor, itemId, target) => {
    const item = ITEMS[itemId]
    setState((s) => ({ ...s, busy: true }))
    await sleep(300)

    setState((s) => {
      const currentActor = resolveActor(s, { id: actor.id, isPlayer: actor.isPlayer })
      if (!currentActor) return advanceTurn({ ...s, busy: false })
      if (!s.inventory[itemId] || s.inventory[itemId] <= 0) return advanceTurn({ ...s, busy: false })

      const inventory = { ...s.inventory, [itemId]: s.inventory[itemId] - 1 }
      let party = s.party
      let log = [...s.log]

      if (item.revive) {
        const revived = s.party.find((h) => !h.alive || h.hp <= 0)
        if (revived) {
          const r = { ...revived, alive: true, hp: Math.min(revived.maxHp, item.heal) }
          party = s.party.map((h) => h.id === r.id ? r : h)
          log = addLog(log, `${currentActor.name} uses ${item.name}! ${r.name} is revived!`)
        }
      } else if (item.heal) {
        const targetHero = target?.isPlayer
          ? s.party.find((h) => h.id === target.id)
          : currentActor
        if (targetHero) {
          const healed = { ...targetHero, hp: Math.min(targetHero.maxHp, targetHero.hp + item.heal) }
          party = s.party.map((h) => h.id === healed.id ? healed : h)
          log = addLog(log, `${currentActor.name} uses ${item.name}! +${item.heal} HP!`)
        }
      } else if (item.mpRestore) {
        const targetHero = target?.isPlayer
          ? s.party.find((h) => h.id === target.id)
          : currentActor
        if (targetHero) {
          const restored = { ...targetHero, mp: Math.min(targetHero.maxMp, targetHero.mp + item.mpRestore) }
          party = s.party.map((h) => h.id === restored.id ? restored : h)
          log = addLog(log, `${currentActor.name} uses ${item.name}! +${item.mpRestore} MP!`)
        }
      } else if (item.cure) {
        const targetHero = target?.isPlayer
          ? s.party.find((h) => h.id === target.id)
          : currentActor
        if (targetHero) {
          const cured = { ...targetHero, statusEffects: (targetHero.statusEffects || []).filter((e) => e.type !== item.cure) }
          party = s.party.map((h) => h.id === cured.id ? cured : h)
          log = addLog(log, `${currentActor.name} uses ${item.name}! ${targetHero.name} is cured of ${item.cure}!`)
        }
      }

      const newState = { ...s, party, inventory, log, busy: false }
      const ended = checkBattleEnd(newState)
      if (ended) return ended
      return advanceTurn(newState)
    })
  }

  const executeDefend = (actor) => {
    setState((s) => {
      const currentActor = resolveActor(s, { id: actor.id, isPlayer: actor.isPlayer })
      if (!currentActor) return advanceTurn({ ...s, busy: false })
      const party = s.party.map((h) => h.id === currentActor.id ? { ...h, defending: true } : h)
      const log = addLog(s.log, `${currentActor.name} raises their guard!`)
      const newState = { ...s, party, log, busy: false }
      return advanceTurn(newState)
    })
  }

  // ============ ACTION HANDLER ============
  const handleAction = useCallback((action, payload) => {

    switch (action) {
      case 'attack':
        setState((s) => ({ ...s, phase: PHASES.PLAYER_TARGET, pendingAction: { type: 'attack' } }))
        break
      case 'target_enemy': {
        const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
        if (state.pendingAction?.type === 'attack') {
          executeAttack(actor, payload)
        } else if (state.pendingAction?.type === 'skill') {
          executeSkill(actor, state.pendingAction.skillId, payload)
        }
        setState((s) => ({ ...s, pendingAction: null }))
        break
      }
      case 'target_ally': {
        const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
        if (state.pendingAction?.type === 'skill') {
          executeSkill(actor, state.pendingAction.skillId, payload)
        } else if (state.pendingAction?.type === 'item') {
          executeItem(actor, state.pendingAction.itemId, payload)
        }
        setState((s) => ({ ...s, pendingAction: null }))
        break
      }
      case 'open_skills':
        setState((s) => ({ ...s, phase: PHASES.PLAYER_SKILLS }))
        break
      case 'select_skill': {
        const skill = SKILLS[payload]
        if (skill.target === 'self') {
          const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
          executeSkill(actor, payload, actor)
        } else if (skill.target === 'ally') {
          setState((s) => ({ ...s, phase: PHASES.PLAYER_ALLY_TARGET, pendingAction: { type: 'skill', skillId: payload } }))
        } else {
          setState((s) => ({ ...s, phase: PHASES.PLAYER_TARGET, pendingAction: { type: 'skill', skillId: payload } }))
        }
        break
      }
      case 'open_items':
        setState((s) => ({ ...s, phase: PHASES.PLAYER_ITEMS }))
        break
      case 'use_item': {
        const item = ITEMS[payload]
        if (item.revive) {
          const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
          executeItem(actor, payload, null)
        } else if (item.heal || item.mpRestore) {
          setState((s) => ({ ...s, phase: PHASES.PLAYER_ALLY_TARGET, pendingAction: { type: 'item', itemId: payload } }))
        } else {
          const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
          executeItem(actor, payload, actor)
        }
        break
      }
      case 'defend': {
        const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
        executeDefend(actor)
        break
      }
      case 'back_to_menu':
        setState((s) => ({ ...s, phase: PHASES.PLAYER_MENU, pendingAction: null }))
        break
      default:
        break
    }
  }, [state])

  // ============ ENEMY AI ============
  const enemyTurn = async () => {
    if (enemyTurnInProgress.current) return
    enemyTurnInProgress.current = true
    await sleep(250)

    setState((s) => {
      if (s.phase !== PHASES.ENEMY_TURN) {
        enemyTurnInProgress.current = false
        return s
      }
      const actor = resolveActor(s, s.turnOrder[s.currentTurnIndex % s.turnOrder.length])
      if (!actor || actor.isPlayer || !actor.alive || actor.hp <= 0) {
        enemyTurnInProgress.current = false
        return advanceTurn({ ...s, turnNonce: (s.turnNonce || 0) + 1 })
      }

      const aliveParty = s.party.filter((h) => h.alive && h.hp > 0)
      if (aliveParty.length === 0) {
        enemyTurnInProgress.current = false
        return s
      }

      // Smart targeting: bosses prioritize healers, then low HP; normal enemies prefer low HP
      let target
      if (actor.isBoss) {
        const healer = aliveParty.find((h) => h.classKey === 'healer')
        if (healer && Math.random() < 0.5) {
          target = healer
        } else {
          target = aliveParty.reduce((lowest, h) => h.hp < lowest.hp ? h : lowest, aliveParty[0])
        }
      } else {
        // 60% chance target lowest HP, 40% random
        if (Math.random() < 0.6) {
          target = aliveParty.reduce((lowest, h) => h.hp < lowest.hp ? h : lowest, aliveParty[0])
        } else {
          target = aliveParty[Math.floor(Math.random() * aliveParty.length)]
        }
      }

      const ai = actor.ai || { skillChance: 0.2 }
      const useSkill = actor.mp >= 8 && Math.random() < (ai.skillChance || 0.2)

      let log = [...s.log]
      let party = s.party
      let floats = s.floatTexts
      let enemies = s.enemies

      if (useSkill) {
        const skillId = actor.skills[Math.floor(Math.random() * actor.skills.length)]
        const skill = SKILLS[skillId]
        if (actor.mp >= skill.mpCost) {
          const updatedActor = { ...actor, mp: actor.mp - skill.mpCost }
          enemies = s.enemies.map((e) => e.id === actor.id ? updatedActor : e)

          if (skill.target === 'enemy_all') {
            let totalDmg = 0
            let newParty = s.party.map((h) => {
              if (!h.alive || h.hp <= 0) return h
              const dmg = calculateDamage(updatedActor, h, skill.damage, false, skill.element || 'physical')
              totalDmg += dmg
              const newHp = Math.max(0, h.hp - dmg)
              return { ...h, hp: newHp, alive: newHp > 0 }
            })
            party = newParty
            log = addLog(log, `${actor.name} casts ${skill.name}! Hits all for ${totalDmg} total!`)
            floats = addFloatText(s, `-${totalDmg}`, 50, 50, '#e94560')
            const newState = { ...s, party, enemies, log, floatTexts: floats }
            const shaken = triggerShake(newState)
            const ended = checkBattleEnd(shaken)
            if (ended) return ended
            enemyTurnInProgress.current = false
            return advanceTurn(shaken)
          } else {
            const dmg = calculateDamage(updatedActor, target, skill.damage, false, skill.element || 'physical')
            const newHp = Math.max(0, target.hp - dmg)
            let hit = { ...target, hp: newHp, alive: newHp > 0 }
            // Apply status effect from enemy skill
            if (hit.alive && skill.effect && Math.random() < (skill.effectChance || 0.5)) {
              hit = applyStatusEffect(hit, skill.effect, skill.duration || 3)
              log = addLog(log, `${actor.name} applies ${skill.effect} to ${hit.name}!`)
            }
            party = s.party.map((h) => h.id === hit.id ? hit : h)
            log = addLog(log, `${actor.name} casts ${skill.name}! ${dmg} damage!`)
            if (actor.isBoss && actor.ai?.taunts && Math.random() < (actor.ai.tauntChance || 0.3)) {
              const taunt = actor.ai.taunts[Math.floor(Math.random() * actor.ai.taunts.length)]
              log = addLog(log, `${actor.name}: "${taunt}"`)
            }
            floats = addFloatText(s, `-${dmg}`, 50, 50, '#e94560')
            const newState = { ...s, party, enemies, log, floatTexts: floats }
            const shaken = triggerShake(newState)
            const ended = checkBattleEnd(shaken)
            if (ended) return ended
            enemyTurnInProgress.current = false
            return advanceTurn(shaken)
          }
        }
      }

      const dmg = calculateDamage(actor, target, actor.attack, false, 'physical')
      const newHp = Math.max(0, target.hp - dmg)
      const hit = { ...target, hp: newHp, alive: newHp > 0 }
      party = s.party.map((h) => h.id === hit.id ? hit : h)
      log = addLog(log, `${actor.name} attacks ${target.name}! ${dmg} damage!`)
      if (actor.isBoss && actor.ai?.taunts && Math.random() < (actor.ai.tauntChance || 0.3)) {
        const taunt = actor.ai.taunts[Math.floor(Math.random() * actor.ai.taunts.length)]
        log = addLog(log, `${actor.name}: "${taunt}"`)
      }
      floats = addFloatText(s, `-${dmg}`, 50, 50, '#e94560')
      const newState = { ...s, party, log, floatTexts: floats }
      const shaken = triggerShake(newState)
      const ended = checkBattleEnd(shaken)
      if (ended) return ended
      enemyTurnInProgress.current = false
      return advanceTurn(shaken)
    })
  }

  const enemyTurnRef = useRef(enemyTurn)
  enemyTurnRef.current = enemyTurn

  useEffect(() => {
    if (state.phase === PHASES.ENEMY_TURN && !state.busy) {
      enemyTurnRef.current()
    }
  }, [state.phase, state.busy, state.turnNonce])

  useEffect(() => {
    if (state.phase === PHASES.BATTLE_INTRO) {
      const t = setTimeout(() => {
        setState((s) => ({ ...s, phase: PHASES.PLAYER_MENU }))
      }, 450)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === PHASES.BATTLE_VICTORY || state.phase === PHASES.BATTLE_DEFEAT) {
      setScreenFade(true)
      const t = setTimeout(() => {
        setScreenFade(false)
        if (state.phase === PHASES.BATTLE_VICTORY) {
          setState((s) => applyXpAndLevelUps(s))
        }
      }, 600)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  // ============ RENDER ============
  const renderPhase = () => {
    switch (state.phase) {
      case PHASES.TITLE:
        return <TitleScreen onStart={startGame} />
      case PHASES.AREA_MAP:
        return (
          <AreaMapScreen
            state={state}
            onSelectBattle={selectBattle}
            onShop={() => setState((s) => ({ ...s, phase: PHASES.SHOP }))}
            onContinue={() => {
              setState((s) => {
                const area = AREAS[s.currentAreaIndex]
                if (!area || s.currentBattleIndex < area.battles.length) return s
                const nextArea = s.currentAreaIndex + 1
                if (nextArea >= AREAS.length) return { ...s, phase: PHASES.GAME_COMPLETE }
                return { ...s, currentAreaIndex: nextArea, currentBattleIndex: 0 }
              })
            }}
          />
        )
      case PHASES.SHOP:
        return (
          <ShopScreen
            state={state}
            onBuy={buyItem}
            onBack={() => setState((s) => ({ ...s, phase: PHASES.AREA_MAP }))}
          />
        )
      case PHASES.DIALOGUE:
        return <DialogueScreen state={state} onAdvance={advanceDialogueHandler} />
      case PHASES.BATTLE_INTRO:
      case PHASES.PLAYER_MENU:
      case PHASES.PLAYER_SKILLS:
      case PHASES.PLAYER_ITEMS:
      case PHASES.PLAYER_TARGET:
      case PHASES.PLAYER_ALLY_TARGET:
      case PHASES.ENEMY_TURN:
        return <BattleScreen state={state} anim={anim} onAction={handleAction} />
      case PHASES.BATTLE_VICTORY:
        if (screenFade) return <BattleScreen state={state} anim={anim} onAction={handleAction} />
        return <VictoryScreen state={state} onContinue={continueAfterVictory} />
      case PHASES.BATTLE_DEFEAT:
        if (screenFade) return <BattleScreen state={state} anim={anim} onAction={handleAction} />
        return <DefeatScreen onRetry={newGame} />
      case PHASES.GAME_COMPLETE:
        return <GameCompleteScreen onRestart={newGame} />
      default:
        return <TitleScreen onStart={startGame} />
    }
  }

  const isBattlePhase = [
    PHASES.BATTLE_INTRO,
    PHASES.PLAYER_MENU,
    PHASES.PLAYER_SKILLS,
    PHASES.PLAYER_ITEMS,
    PHASES.PLAYER_TARGET,
    PHASES.PLAYER_ALLY_TARGET,
    PHASES.ENEMY_TURN,
  ].includes(state.phase)

  return (
    <div className="h-screen bg-retro-bg flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md mx-auto flex flex-col gap-2 h-full">
        <Header gold={state.gold} showGold={state.phase !== PHASES.TITLE} />
        {renderPhase()}
      </div>
      {screenFade && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-black animate-fade-in" />
      )}
    </div>
  )
}

function Header({ gold, showGold }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <h1 className="font-pixel text-[10px] sm:text-xs text-retro-gold tracking-wider">
        PIXEL QUEST
      </h1>
      {showGold && <GoldDisplay gold={gold} />}
    </div>
  )
}
