import { useState, useCallback, useEffect } from 'react'
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

      if (nextBattleIndex >= area.battles.length) {
        const nextAreaIndex = s.currentAreaIndex + 1
        if (nextAreaIndex >= AREAS.length) {
          return { ...s, phase: PHASES.GAME_COMPLETE }
        }
        return {
          ...s,
          currentAreaIndex: nextAreaIndex,
          currentBattleIndex: 0,
          phase: PHASES.AREA_MAP,
          battleResult: null,
          enemies: [],
        }
      }

      const afterDialogue = s.dialogueAfter
      if (afterDialogue && afterDialogue.length > 0) {
        return {
          ...s,
          currentBattleIndex: nextBattleIndex,
          phase: PHASES.DIALOGUE,
          dialogueLines: afterDialogue,
          dialogueIndex: 0,
          enemies: [],
          battleResult: null,
        }
      }

      return {
        ...s,
        currentBattleIndex: nextBattleIndex,
        phase: PHASES.AREA_MAP,
        battleResult: null,
        enemies: [],
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

  const advanceTurn = (s) => {
    const currentQueuedActor = s.turnOrder[s.currentTurnIndex % s.turnOrder.length]
    const livingOrder = getLivingTurnOrder(s)
    if (livingOrder.length === 0) return s

    const currentLivingIndex = livingOrder.findIndex((actor) => actor.id === currentQueuedActor?.id)
    const nextLivingIndex = currentLivingIndex >= 0
      ? (currentLivingIndex + 1) % livingOrder.length
      : 0
    const nextActor = livingOrder[nextLivingIndex]
    const nextTurnIndex = s.turnOrder.findIndex((actor) => actor.id === nextActor.id)
    const isEnemy = nextActor && !nextActor.isPlayer

    return {
      ...s,
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
      const isCrit = rollCrit()
      const dmg = calculateDamage(attacker, target, attacker.attack, isCrit)
      const newHp = Math.max(0, target.hp - dmg)
      const updatedTarget = { ...target, hp: newHp, alive: newHp > 0 }
      const party = updatedTarget.isPlayer
        ? s.party.map((h) => h.id === updatedTarget.id ? updatedTarget : h)
        : s.party
      const enemies = !updatedTarget.isPlayer
        ? s.enemies.map((e) => e.id === updatedTarget.id ? updatedTarget : e)
        : s.enemies
      const log = addLog(s.log, `${attacker.name} attacks! ${dmg} damage!${isCrit ? ' CRIT!' : ''}`)
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
      const updatedActor = { ...actor, mp: actor.mp - skill.mpCost }
      let party = s.party.map((h) => h.id === actor.id ? updatedActor : h)
      let enemies = s.enemies
      let log = [...s.log]
      let floats = s.floatTexts

      if (skill.type === 'support') {
        const healed = { ...target, hp: Math.min(target.maxHp, target.hp + skill.heal) }
        party = party.map((h) => h.id === healed.id ? healed : h)
        log = addLog(log, `${actor.name} casts ${skill.name}! +${skill.heal} HP!`)
        floats = addFloatText(s, `+${skill.heal}`, 50, 50, '#4ecca3')
      } else if (skill.type === 'buff') {
        if (skill.effect === 'defense_up') {
          const buffed = { ...updatedActor, defending: true }
          party = party.map((h) => h.id === buffed.id ? buffed : h)
          log = addLog(log, `${actor.name} uses ${skill.name}! Defense up!`)
        } else if (skill.effect === 'attack_up') {
          const buffed = { ...target, attack: target.attack + 5 }
          party = party.map((h) => h.id === buffed.id ? buffed : h)
          log = addLog(log, `${actor.name} casts ${skill.name} on ${target.name}! ATK up!`)
        }
      } else {
        const hits = skill.hits || 1
        let totalDmg = 0
        let currentTarget = target
        for (let h = 0; h < hits; h++) {
          const isCrit = rollCrit(skill.critBonus || 0)
          const dmg = calculateDamage(updatedActor, currentTarget, skill.damage, isCrit)
          totalDmg += dmg
          const newHp = Math.max(0, currentTarget.hp - dmg)
          currentTarget = { ...currentTarget, hp: newHp, alive: newHp > 0 }
        }
        if (currentTarget.isPlayer) {
          party = party.map((p) => p.id === currentTarget.id ? currentTarget : p)
        } else {
          enemies = enemies.map((e) => e.id === currentTarget.id ? currentTarget : e)
        }
        log = addLog(log, `${actor.name} casts ${skill.name}! ${totalDmg} damage!`)
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
      const inventory = { ...s.inventory, [itemId]: s.inventory[itemId] - 1 }
      let party = s.party
      let log = [...s.log]
      let targetHero = target || actor

      if (item.revive) {
        const revived = s.party.find((h) => !h.alive || h.hp <= 0)
        if (revived) {
          const r = { ...revived, alive: true, hp: Math.min(revived.maxHp, item.heal) }
          party = s.party.map((h) => h.id === r.id ? r : h)
          log = addLog(log, `${actor.name} uses ${item.name}! ${r.name} is revived!`)
        }
      } else if (item.heal) {
        const healed = { ...targetHero, hp: Math.min(targetHero.maxHp, targetHero.hp + item.heal) }
        party = s.party.map((h) => h.id === healed.id ? healed : h)
        log = addLog(log, `${actor.name} uses ${item.name}! +${item.heal} HP!`)
      } else if (item.mpRestore) {
        const restored = { ...targetHero, mp: Math.min(targetHero.maxMp, targetHero.mp + item.mpRestore) }
        party = s.party.map((h) => h.id === restored.id ? restored : h)
        log = addLog(log, `${actor.name} uses ${item.name}! +${item.mpRestore} MP!`)
      }

      const newState = { ...s, party, inventory, log, busy: false }
      const ended = checkBattleEnd(newState)
      if (ended) return ended
      return advanceTurn(newState)
    })
  }

  const executeDefend = (actor) => {
    setState((s) => {
      const party = s.party.map((h) => h.id === actor.id ? { ...h, defending: true } : h)
      const log = addLog(s.log, `${actor.name} raises their guard!`)
      const newState = { ...s, party, log, busy: false }
      return advanceTurn(newState)
    })
  }

  // ============ ACTION HANDLER ============
  const handleAction = useCallback((action, payload) => {
    const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])

    switch (action) {
      case 'attack':
        setState((s) => ({ ...s, phase: PHASES.PLAYER_TARGET, pendingAction: { type: 'attack' } }))
        break
      case 'target_enemy': {
        if (state.pendingAction?.type === 'attack') {
          executeAttack(actor, payload)
        } else if (state.pendingAction?.type === 'skill') {
          executeSkill(actor, state.pendingAction.skillId, payload)
        }
        setState((s) => ({ ...s, pendingAction: null }))
        break
      }
      case 'target_ally': {
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
          executeItem(actor, payload, null)
        } else if (item.heal || item.mpRestore) {
          setState((s) => ({ ...s, phase: PHASES.PLAYER_ALLY_TARGET, pendingAction: { type: 'item', itemId: payload } }))
        } else {
          executeItem(actor, payload, actor)
        }
        break
      }
      case 'defend':
        executeDefend(actor)
        break
      case 'back_to_menu':
        setState((s) => ({ ...s, phase: PHASES.PLAYER_MENU, pendingAction: null }))
        break
      default:
        break
    }
  }, [state])

  // ============ ENEMY AI ============
  const enemyTurn = useCallback(async () => {
    await sleep(250)

    setState((s) => {
      if (s.phase !== PHASES.ENEMY_TURN) return s
      const actor = resolveActor(s, s.turnOrder[s.currentTurnIndex % s.turnOrder.length])
      if (!actor || actor.isPlayer || !actor.alive || actor.hp <= 0) {
        return advanceTurn({ ...s, turnNonce: (s.turnNonce || 0) + 1 })
      }

      const aliveParty = s.party.filter((h) => h.alive && h.hp > 0)
      if (aliveParty.length === 0) return s

      const target = aliveParty[Math.floor(Math.random() * aliveParty.length)]
      const ai = actor.ai || { skillChance: 0.2 }
      const useSkill = actor.mp >= 8 && Math.random() < (ai.skillChance || 0.2)

      let log = [...s.log]
      let party = s.party
      let floats = s.floatTexts

      if (useSkill) {
        const skillId = actor.skills[Math.floor(Math.random() * actor.skills.length)]
        const skill = SKILLS[skillId]
        if (actor.mp >= skill.mpCost) {
          const updatedActor = { ...actor, mp: actor.mp - skill.mpCost }
          const enemies = s.enemies.map((e) => e.id === actor.id ? updatedActor : e)

          if (skill.target === 'enemy_all') {
            let totalDmg = 0
            let newParty = s.party.map((h) => {
              if (!h.alive || h.hp <= 0) return h
              const dmg = calculateDamage(updatedActor, h, skill.damage)
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
            return advanceTurn(shaken)
          } else {
            const dmg = calculateDamage(updatedActor, target, skill.damage)
            const newHp = Math.max(0, target.hp - dmg)
            const hit = { ...target, hp: newHp, alive: newHp > 0 }
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
            return advanceTurn(shaken)
          }
        }
      }

      const dmg = calculateDamage(actor, target, actor.attack)
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
      return advanceTurn(shaken)
    })
  }, [])

  useEffect(() => {
    if (state.phase === PHASES.ENEMY_TURN && !state.busy) {
      enemyTurn()
    }
  }, [state.phase, state.busy, state.turnNonce, enemyTurn])

  useEffect(() => {
    if (state.phase === PHASES.BATTLE_INTRO) {
      const t = setTimeout(() => {
        setState((s) => ({ ...s, phase: PHASES.PLAYER_MENU }))
      }, 450)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === PHASES.BATTLE_VICTORY && !state.battleResult?.applied) {
      setState((s) => applyXpAndLevelUps(s))
    }
  }, [state.phase, state.battleResult?.applied])

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
        return <VictoryScreen state={state} onContinue={continueAfterVictory} />
      case PHASES.BATTLE_DEFEAT:
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
    <div className="min-h-screen bg-retro-bg flex items-start justify-center p-2 sm:p-4">
      <div className={`w-full max-w-md mx-auto flex flex-col gap-2 ${isBattlePhase ? '' : 'min-h-[100dvh]'}`}>
        <Header gold={state.gold} showGold={state.phase !== PHASES.TITLE} />
        {renderPhase()}
      </div>
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
