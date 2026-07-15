import { useState, useCallback, useEffect, useRef } from 'react'
import {
  createInitialState, PHASES, SKILLS, ITEMS, AREAS,
  calculateDamage, rollCrit, startBattle, advanceDialogue,
  checkBattleEnd, computeTurnOrder, xpForLevel, levelUp,
} from './gameState'
import { createHero, ENEMY_TYPES } from './gameData'
import { BattleScreen } from './components/BattleScreen'
import {
  TitleScreen, AreaMapScreen, ShopScreen, DialogueScreen,
  VictoryScreen, DefeatScreen, GameCompleteScreen, SettingsScreen,
  TravelScreen,
} from './components/Overworld'
import { GoldDisplay } from './components/Shared'
import { WorldMap } from './components/WorldMap'
import { PathSelection } from './components/PathSelection'
import { ExplorationMap } from './components/ExplorationMap'
import {
  ensureAnonymousUser, saveGame, loadGame, deleteGame,
  saveLocalGame, loadLocalGame, deleteLocalGame,
} from './firebase'

const CLOUD_SYNC_ENABLED = true

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let floatId = 0

export default function App() {
  const [state, setState] = useState(createInitialState)
  const [anim, setAnim] = useState({ type: null, target: null })
  const [screenFade, setScreenFade] = useState(false)
  const [updateNotice, setUpdateNotice] = useState(false)
  const enemyTurnInProgress = useRef(false)
  const uidRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [hasCloudSave, setHasCloudSave] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const local = await loadLocalGame()
      if (local && mounted) {
        setHasCloudSave(true)
        setLastSavedAt(local.savedAt)
      }
      if (CLOUD_SYNC_ENABLED) {
        const user = await ensureAnonymousUser()
        if (!mounted) return
        if (user) {
          uidRef.current = user.uid
          const cloud = await loadGame(user.uid)
          if (cloud && mounted) {
            setHasCloudSave(true)
            setLastSavedAt(cloud.savedAt)
          }
        }
      }
    })()
    return () => { mounted = false }
  }, [])

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

  const requestPersistentStorage = () => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {})
    }
  }

  // ============ GAME FLOW ============
  const startGame = async () => {
    requestPersistentStorage()
    if (CLOUD_SYNC_ENABLED && uidRef.current) await deleteGame(uidRef.current)
    await deleteLocalGame()
    setHasCloudSave(false)
    const fresh = createInitialState()
    // Start on the area map. Path selection only happens when traveling into a
    // branching area (see finishTravel / continueAfterVictory) — never here.
    setState({ ...fresh, phase: PHASES.AREA_MAP })
  }

  const handleSaveGame = async () => {
    requestPersistentStorage()
    setSaveStatus('saving')
    const local = await saveLocalGame(state)
    if (local.success) {
      setLastSavedAt(local.savedAt)
      console.log('[handleSaveGame] local save success', { savedAt: local.savedAt })
    } else {
      console.error('[handleSaveGame] local save failed')
    }

    if (CLOUD_SYNC_ENABLED) {
      let uid = uidRef.current
      if (!uid) {
        console.log('[handleSaveGame] waiting for anonymous auth before cloud save')
        const user = await ensureAnonymousUser()
        if (user) {
          uid = user.uid
          uidRef.current = uid
        }
      }
      if (uid) {
        console.log('[handleSaveGame] attempting cloud save', { uid })
        const cloud = await saveGame(uid, state)
        if (cloud.success) {
          setLastSavedAt(cloud.savedAt)
          console.log('[handleSaveGame] cloud save success', { savedAt: cloud.savedAt })
        } else {
          console.error('[handleSaveGame] cloud save failed')
        }
      } else {
        console.warn('[handleSaveGame] no UID available; skipping cloud save')
      }
    } else {
      console.log('[handleSaveGame] cloud sync disabled')
    }

    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
    return true
  }

  const handleLoadGame = async () => {
    requestPersistentStorage()
    setSaveStatus('loading')

    // Load local save immediately so Continue feels fast
    const local = await loadLocalGame()
    if (local) {
      const base = createInitialState()
      setState({ ...base, ...local.state, phase: PHASES.AREA_MAP })
      setHasCloudSave(true)
      setLastSavedAt(local.savedAt)
      setSaveStatus('loaded')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }

    // Sync with cloud in the background in case it's newer
    let user = uidRef.current ? { uid: uidRef.current } : null
    if (!user) {
      user = await ensureAnonymousUser()
    }
    if (user) {
      uidRef.current = user.uid
      const saved = await loadGame(user.uid)
      if (saved) {
        const localTs = local?.savedAt || 0
        if (saved.savedAt > localTs) {
          const base = createInitialState()
          setState({ ...base, ...saved.state, phase: PHASES.AREA_MAP })
          setLastSavedAt(saved.savedAt)
          await saveLocalGame(saved.state)
        }
        if (!local) {
          setHasCloudSave(true)
          setSaveStatus('loaded')
          setTimeout(() => setSaveStatus('idle'), 2000)
        }
      } else if (!local) {
        setSaveStatus('none')
        setHasCloudSave(false)
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } else if (!local) {
      setSaveStatus('none')
      setHasCloudSave(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  // ============ TRANSFER CODE ============
  const encodeBase64 = (str) => {
    const bytes = new TextEncoder().encode(str)
    let bin = ''
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i])
    }
    return btoa(bin)
  }

  const decodeBase64 = (str) => {
    try {
      const bin = atob(str.trim())
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i)
      }
      return new TextDecoder().decode(bytes)
    } catch (e) {
      return null
    }
  }

  const handleExportCode = () => {
    try {
      return encodeBase64(JSON.stringify(state))
    } catch (e) {
      return ''
    }
  }

  const handleImportCode = async (code) => {
    try {
      const json = decodeBase64(code)
      if (!json) return { success: false, error: 'Invalid code' }
      const parsed = JSON.parse(json)
      if (!parsed || !parsed.party || !parsed.phase) {
        return { success: false, error: 'Invalid save data' }
      }
      const merged = { ...createInitialState(), ...parsed }
      setState(merged)
      setHasCloudSave(true)
      await saveLocalGame(merged)
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Invalid code' }
    }
  }

  useEffect(() => {
    if (state.phase === PHASES.TITLE) return
    // Save to localStorage/IndexedDB immediately so progress isn't lost on refresh/close
    let cancelled = false
    saveLocalGame(state).then((local) => {
      if (!cancelled && local.success) setLastSavedAt(local.savedAt)
    })
    // Debounce cloud save to avoid excessive Firestore writes
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      let uid = uidRef.current
      if (!uid) {
        const user = await ensureAnonymousUser()
        if (user) {
          uid = user.uid
          uidRef.current = uid
        }
      }
      if (uid) {
        console.log('[autoSave] attempting cloud save', { uid })
        saveGame(uid, state).then((cloud) => {
          if (cloud.success) {
            setLastSavedAt(cloud.savedAt)
            console.log('[autoSave] cloud save success', { savedAt: cloud.savedAt })
          } else {
            console.error('[autoSave] cloud save failed')
          }
        }).catch((err) => {
          console.error('[autoSave] cloud save error', err)
        })
      } else {
        console.warn('[autoSave] no UID available; skipping cloud save')
      }
    }, 30000)
    return () => {
      cancelled = true
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [state])

  useEffect(() => {
    const flushSave = async () => {
      if (state.phase !== PHASES.TITLE) {
        saveLocalGame(state)
        let uid = uidRef.current
        if (!uid) {
          const user = await ensureAnonymousUser()
          if (user) {
            uid = user.uid
            uidRef.current = uid
          }
        }
        if (uid) {
          console.log('[flushSave] attempting cloud save', { uid })
          saveGame(uid, state).then((cloud) => {
            if (cloud.success) {
              console.log('[flushSave] cloud save success')
            } else {
              console.error('[flushSave] cloud save failed')
            }
          }).catch((err) => {
            console.error('[flushSave] cloud save error', err)
          })
        } else {
          console.warn('[flushSave] no UID available; skipping cloud save')
        }
      }
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushSave()
    }
    window.addEventListener('beforeunload', flushSave)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('beforeunload', flushSave)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [state])

  const openWorldMap = () => {
    setState((s) => ({ ...s, phase: PHASES.WORLD_MAP }))
  }

  const startExploration = () => {
    setState((s) => ({ ...s, phase: PHASES.EXPLORATION }))
  }

  const handleTreasureFound = useCallback((treasure) => {
    setState((s) => {
      if (s.discoveredTreasures[treasure.id]) return s
      // Find the treasure data from the current area
      const area = AREAS[s.currentAreaIndex]
      const treasureData = area.hiddenTreasures?.find(t => t.id === treasure.id)
      
      if (treasureData) {
        return {
          ...s,
          gold: s.gold + (treasureData.gold || 0),
          inventory: { ...s.inventory, [treasureData.item]: (s.inventory[treasureData.item] || 0) + 1 },
          discoveredTreasures: { ...s.discoveredTreasures, [treasure.id]: true },
          log: [...s.log, `Found ${treasureData.name}! +${treasureData.gold} gold, +1 ${treasureData.item}`].slice(-6),
        }
      }
      return s
    })
  }, [])

  const handleExplorationBattle = useCallback((battle) => {
    setState((s) => {
      if (s.completedSecretBattles[battle.id]) return s
      // Find the battle data from the current area
      const area = AREAS[s.currentAreaIndex]
      const battleData = area.secretBattles?.find(b => b.id === battle.id)
      
      if (battleData) {
        return { 
          ...startBattle(s, battleData.enemies),
          explorationBattleId: battle.id,
        }
      }
      return s
    })
  }, [])

  const exitExploration = () => {
    setState((s) => ({ ...s, phase: PHASES.AREA_MAP }))
  }

  const selectPath = (pathKey) => {
    setState((s) => {
      const areaIndex = s.selectedAreaIndex ?? s.currentAreaIndex
      const area = AREAS[areaIndex]
      const path = area.paths[pathKey]
      if (!path) return s

      const baseState = {
        ...s,
        selectedPaths: { ...s.selectedPaths, [areaIndex]: pathKey },
        selectedAreaIndex: null,
        currentAreaIndex: areaIndex,
        currentBattleIndex: path.battles[0],
        // Set up battles based on selected path
        pathBattles: path.battles,
        pathRewards: path.rewards,
      }

      if (path.intro && path.intro.length > 0) {
        return {
          ...baseState,
          phase: PHASES.DIALOGUE,
          dialogueLines: path.intro,
          dialogueIndex: 0,
          dialogueAfter: null,
        }
      }

      return { ...baseState, phase: PHASES.AREA_MAP }
    })
  }

  const selectArea = (areaIndex) => {
    setState((s) => {
      if (areaIndex < 0 || areaIndex >= AREAS.length) return s
      const maxReached = s.maxAreaReached ?? s.currentAreaIndex
      if (areaIndex > maxReached) return s // Can't travel to areas not yet unlocked by clearing

      // Check for random encounter when traveling
      const distance = Math.abs(areaIndex - s.currentAreaIndex)
      const encounterChance = distance * 0.3 // 30% chance per area traveled

      if (areaIndex !== s.currentAreaIndex) {
        // Route travel through the travel animation phase
        const currentArea = AREAS[s.currentAreaIndex]
        const randomEnemies = currentArea.battles[Math.floor(Math.random() * currentArea.battles.length)].enemies
        const hasEncounter = Math.random() < encounterChance
        return {
          ...s,
          phase: PHASES.TRAVEL,
          travel: {
            targetAreaIndex: areaIndex,
            hasEncounter,
            randomEnemies,
          },
        }
      }

      // Clicking the area you're already in just returns to its hub — never
      // resets progress or re-opens path selection.
      return {
        ...s,
        phase: PHASES.AREA_MAP,
        battleResult: null,
        enemies: [],
        dialogueAfter: null,
        activeBattleIndex: null,
      }
    })
  }

  const finishTravel = useCallback(() => {
    setState((s) => {
      const travel = s.travel
      if (!travel) return { ...s, phase: PHASES.WORLD_MAP }

      if (travel.hasEncounter) {
        // Random encounters happen in the source area; don't advance to the destination yet.
        // If the player kills the app during the encounter, they should still be in the source area.
        const validEncounter = Array.isArray(travel.randomEnemies) && travel.randomEnemies.length > 0 && travel.randomEnemies.every((e) => ENEMY_TYPES[e])
        if (!validEncounter) {
          console.error('Invalid travel encounter', travel)
          return { ...s, phase: PHASES.WORLD_MAP, travel: null }
        }
        return {
          ...startBattle(s, travel.randomEnemies, null, null, null),
          currentAreaIndex: s.currentAreaIndex,
          currentBattleIndex: s.currentBattleIndex,
          activeBattleIndex: null,
          travel: null,
        }
      }

      const newArea = AREAS[travel.targetAreaIndex]
      const hasSelectedPath = s.selectedPaths[travel.targetAreaIndex]
      const needsPathSelection = newArea.paths && !hasSelectedPath

      // Don't advance currentAreaIndex until the player actually picks a path
      return {
        ...s,
        currentAreaIndex: needsPathSelection ? s.currentAreaIndex : travel.targetAreaIndex,
        currentBattleIndex: 0,
        phase: needsPathSelection ? PHASES.PATH_SELECTION : PHASES.AREA_MAP,
        selectedAreaIndex: needsPathSelection ? travel.targetAreaIndex : null,
        battleResult: null,
        enemies: [],
        dialogueAfter: null,
        activeBattleIndex: null,
        travel: null,
      }
    })
  }, [])

  const selectBattle = (battleIndex) => {
    setState((s) => {
      const area = AREAS[s.currentAreaIndex]
      const battle = area.battles[battleIndex]
      const selectedPathKey = s.selectedPaths[s.currentAreaIndex]
      const selectedPath = selectedPathKey ? area.paths[selectedPathKey] : null
      const pathBattles = selectedPath ? [...selectedPath.battles, ...(area.core || [])] : area.battles.map((_, i) => i)
      const currentPos = pathBattles.indexOf(s.currentBattleIndex)
      const clearedThrough = currentPos === -1 ? pathBattles.length : currentPos
      const isReplay = pathBattles.indexOf(battleIndex) < clearedThrough
      const recruit = isReplay ? null : battle.recruit
      const dialogueBefore = isReplay ? null : battle.dialogue?.before
      const dialogueAfter = isReplay ? null : battle.dialogue?.after
      return { ...startBattle(s, battle.enemies, dialogueBefore, dialogueAfter, recruit), activeBattleIndex: battleIndex }
    })
  }

  const advanceDialogueHandler = () => {
    setState((s) => {
      const nextState = advanceDialogue(s)
      if (nextState.pendingPathSelectionAfterDialogue && nextState.phase === PHASES.AREA_MAP) {
        const area = AREAS[nextState.currentAreaIndex]
        const needsPathSelection = area?.paths && !nextState.selectedPaths[nextState.currentAreaIndex]
        return {
          ...nextState,
          phase: needsPathSelection ? PHASES.PATH_SELECTION : PHASES.AREA_MAP,
          selectedAreaIndex: needsPathSelection ? nextState.currentAreaIndex : null,
          pendingPathSelectionAfterDialogue: false,
        }
      }
      return nextState
    })
  }

  const continueAfterVictory = () => {
    setState((s) => {
      // Winning the battle gets KO'd party members back on their feet with a
      // little HP, so the victory scene and the next fight stay consistent.
      const healedParty = s.party.map((h) => {
        const revived = (!h.alive || h.hp <= 0)
          ? { ...h, alive: true, hp: Math.max(1, Math.round(h.maxHp * 0.25)) }
          : h
        return { ...revived, defending: false, statusEffects: [] }
      })

      if (s.explorationBattleId) {
        return {
          ...s,
          party: healedParty,
          phase: PHASES.EXPLORATION,
          battleResult: null,
          enemies: [],
          dialogueAfter: null,
          activeBattleIndex: null,
          explorationBattleId: null,
          completedSecretBattles: { ...s.completedSecretBattles, [s.explorationBattleId]: true },
        }
      }

      const area = AREAS[s.currentAreaIndex]
      const completedBattleIndex = s.activeBattleIndex ?? s.currentBattleIndex

      const selectedPathKey = s.selectedPaths[s.currentAreaIndex]
      const selectedPath = selectedPathKey ? area.paths[selectedPathKey] : null
      // Effective run = chosen approach battles + the area's shared core (ends on the boss).
      const pathBattles = selectedPath ? [...selectedPath.battles, ...(area.core || [])] : area.battles.map((_, i) => i)
      // Progress is tracked by POSITION in the path — path indices aren't contiguous.
      const currentPos = pathBattles.indexOf(s.currentBattleIndex)
      const clearedThrough = currentPos === -1 ? pathBattles.length : currentPos
      const completedPos = pathBattles.indexOf(completedBattleIndex)
      const isReplay = completedPos < clearedThrough
      const isLastPathBattle = completedPos === pathBattles.length - 1
      // Advance to the next battle in path order; a value past the list marks "cleared".
      const nextBattleIndex = isReplay
        ? s.currentBattleIndex
        : (completedPos >= 0 && completedPos < pathBattles.length - 1 ? pathBattles[completedPos + 1] : completedBattleIndex + 1)

      // The area's climax (last core battle) owns the concluding dialogue.
      const afterDialogue = isReplay ? null : s.dialogueAfter

      // Last path battle: the area is cleared. Unlock the next area but stay on
      // this area's hub — the player travels onward from the World Map, which is
      // what triggers the next area's path selection. (No forced jump ahead.)
      if (!isReplay && isLastPathBattle) {
        const nextAreaIndex = s.currentAreaIndex + 1
        if (nextAreaIndex >= AREAS.length) {
          return { ...s, phase: PHASES.GAME_COMPLETE, dialogueAfter: null, activeBattleIndex: null }
        }
        const nextMaxReached = Math.max(s.maxAreaReached ?? s.currentAreaIndex, nextAreaIndex)
        if (afterDialogue && afterDialogue.length > 0) {
          return {
            ...s,
            party: healedParty,
            maxAreaReached: nextMaxReached,
            currentBattleIndex: nextBattleIndex,
            phase: PHASES.DIALOGUE,
            dialogueLines: afterDialogue,
            dialogueIndex: 0,
            dialogueAfter: null,
            battleResult: null,
            enemies: [],
            activeBattleIndex: null,
            selectedAreaIndex: null,
            pendingPathSelectionAfterDialogue: false,
          }
        }
        return {
          ...s,
          party: healedParty,
          maxAreaReached: nextMaxReached,
          currentBattleIndex: nextBattleIndex,
          phase: PHASES.AREA_MAP,
          selectedAreaIndex: null,
          battleResult: null,
          enemies: [],
          dialogueAfter: null,
          activeBattleIndex: null,
          pendingPathSelectionAfterDialogue: false,
        }
      }

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
          activeBattleIndex: null,
        }
      }

      if (isReplay) {
        return {
          ...s,
          party: healedParty,
          currentBattleIndex: nextBattleIndex,
          phase: PHASES.AREA_MAP,
          battleResult: null,
          enemies: [],
          dialogueAfter: null,
          activeBattleIndex: null,
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
        activeBattleIndex: null,
      }
    })
  }

  const confirmXpAllocation = (xpAlloc) => {
    setState((s) => {
      const leveledUp = []
      let party = s.party.map((hero) => {
        let h = { ...hero, xp: (hero.xp || 0) + (xpAlloc[hero.id] || 0) }
        while (h.xp >= xpForLevel(h.level)) {
          h.xp -= xpForLevel(h.level)
          h = levelUp(h)
          leveledUp.push(h.name)
        }
        return h
      })

      let recruited = null
      if (s.pendingRecruit && !party.some((hero) => hero.classKey === s.pendingRecruit)) {
        recruited = createHero(s.pendingRecruit)
        party = [...party, recruited]
      }

      return {
        ...s,
        party,
        pendingRecruit: null,
        battleResult: {
          ...s.battleResult,
          leveledUp,
          recruited,
          applied: true,
        },
      }
    })
    setTimeout(() => continueAfterVictory(), 100)
  }

  const newGame = async () => {
    if (uidRef.current) {
      await deleteGame(uidRef.current)
    }
    await deleteLocalGame()
    setHasCloudSave(false)
    setState(createInitialState())
  }

  const returnToTitle = () => {
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

  const useOverworldItem = (itemId, heroId) => {
    setState((s) => {
      if (!s.inventory[itemId] || s.inventory[itemId] <= 0) return s
      const item = ITEMS[itemId]
      const hero = s.party.find((h) => h.id === heroId)
      if (!hero) return s

      let updatedHero = hero
      if (item.revive && (!hero.alive || hero.hp <= 0)) {
        updatedHero = { ...hero, alive: true, hp: Math.min(hero.maxHp, item.heal) }
      } else if (item.heal && hero.alive) {
        updatedHero = { ...hero, hp: Math.min(hero.maxHp, hero.hp + item.heal) }
      } else if (item.mpRestore && hero.alive) {
        updatedHero = { ...hero, mp: Math.min(hero.maxMp, hero.mp + item.mpRestore) }
      } else if (item.cure && hero.alive) {
        updatedHero = { ...hero, statusEffects: (hero.statusEffects || []).filter((e) => e.type !== item.cure) }
      } else {
        return s
      }

      const inventory = { ...s.inventory, [itemId]: s.inventory[itemId] - 1 }
      const party = s.party.map((h) => h.id === updatedHero.id ? updatedHero : h)
      return { ...s, party, inventory }
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
    let updated = { ...actor, defending: false }
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

    const stunned = effects.some((e) => e.type === 'stun')
    const slowed = effects.some((e) => e.type === 'slow')

    const newEffects = effects.map((e) => ({ ...e, duration: e.duration - 1 })).filter((e) => e.duration > 0)
    updated = { ...updated, statusEffects: newEffects }

    return { actor: updated, log, floats, stunned, slowed }
  }

  const advanceTurn = (s, skipCount = 0) => {
    // Recompute turn order to account for slow status effect changes
    const recomputedOrder = computeTurnOrder(s.party, s.enemies)
    const currentActor = s.turnOrder[s.currentTurnIndex % s.turnOrder.length]
    const newIdx = recomputedOrder.findIndex(a => a.id === currentActor?.id)
    s = { ...s, turnOrder: recomputedOrder, currentTurnIndex: newIdx >= 0 ? newIdx : 0 }

    const currentQueuedActor = s.turnOrder[s.currentTurnIndex % s.turnOrder.length]
    let livingOrder = getLivingTurnOrder(s)
    if (livingOrder.length === 0) return s

    // If we've skipped through all living actors (all stunned/dead from poison),
    // advance to the next round and retry — stun durations have been decremented,
    // so eventually someone will be able to act
    if (skipCount >= livingOrder.length) {
      const nextIdx = (s.currentTurnIndex + 1) % s.turnOrder.length
      return advanceTurn({ ...s, currentTurnIndex: nextIdx }, 0)
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
    const animTarget = Array.isArray(target) ? target[0]?.id : target?.id
    setAnim({ type: 'skill', target: animTarget })
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
        const targets = Array.isArray(target) ? target : [target]
        const hits = skill.hits || 1
        let totalDmg = 0

        for (let h = 0; h < hits; h++) {
          const t = targets[h % targets.length]
          const currentTarget = t?.isPlayer
            ? party.find((p) => p.id === t.id)
            : enemies.find((e) => e.id === t?.id)
          if (!currentTarget || !currentTarget.alive || currentTarget.hp <= 0) continue

          let ct = { ...currentTarget }
          const isCrit = rollCrit(skill.critBonus || 0)
          const dmg = calculateDamage(updatedActor, ct, skill.damage, isCrit, skill.element || 'physical')
          totalDmg += dmg
          const newHp = Math.max(0, ct.hp - dmg)
          ct = { ...ct, hp: newHp, alive: newHp > 0 }

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

      let party = s.party
      let log = [...s.log]

      const returnToItems = (message) => ({ ...s, phase: PHASES.PLAYER_ITEMS, busy: false, log: addLog(log, message) })

      if (item.revive) {
        const targetHero = s.party.find((h) => !h.alive || h.hp <= 0)
        if (!targetHero) return returnToItems('No fallen allies to revive!')
        const inventory = { ...s.inventory, [itemId]: s.inventory[itemId] - 1 }
        const r = { ...targetHero, alive: true, hp: Math.min(targetHero.maxHp, item.heal) }
        party = s.party.map((h) => h.id === r.id ? r : h)
        log = addLog(log, `${currentActor.name} uses ${item.name}! ${r.name} is revived!`)
        const newState = { ...s, party, inventory, log, busy: false }
        const ended = checkBattleEnd(newState)
        if (ended) return ended
        return advanceTurn(newState)
      }

      if (item.heal) {
        const targetHero = target?.isPlayer
          ? s.party.find((h) => h.id === target.id)
          : currentActor
        if (!targetHero) return returnToItems('No valid target!')
        if (targetHero.hp >= targetHero.maxHp) return returnToItems(`${targetHero.name} is already at full health!`)
        const inventory = { ...s.inventory, [itemId]: s.inventory[itemId] - 1 }
        const healed = { ...targetHero, hp: Math.min(targetHero.maxHp, targetHero.hp + item.heal) }
        party = s.party.map((h) => h.id === healed.id ? healed : h)
        log = addLog(log, `${currentActor.name} uses ${item.name}! +${item.heal} HP!`)
        const newState = { ...s, party, inventory, log, busy: false }
        const ended = checkBattleEnd(newState)
        if (ended) return ended
        return advanceTurn(newState)
      }

      if (item.mpRestore) {
        const targetHero = target?.isPlayer
          ? s.party.find((h) => h.id === target.id)
          : currentActor
        if (!targetHero) return returnToItems('No valid target!')
        if (targetHero.mp >= targetHero.maxMp) return returnToItems(`${targetHero.name} is already at full MP!`)
        const inventory = { ...s.inventory, [itemId]: s.inventory[itemId] - 1 }
        const restored = { ...targetHero, mp: Math.min(targetHero.maxMp, targetHero.mp + item.mpRestore) }
        party = s.party.map((h) => h.id === restored.id ? restored : h)
        log = addLog(log, `${currentActor.name} uses ${item.name}! +${item.mpRestore} MP!`)
        const newState = { ...s, party, inventory, log, busy: false }
        const ended = checkBattleEnd(newState)
        if (ended) return ended
        return advanceTurn(newState)
      }

      if (item.cure) {
        const targetHero = target?.isPlayer
          ? s.party.find((h) => h.id === target.id)
          : currentActor
        if (!targetHero) return returnToItems('No valid target!')
        if (!(targetHero.statusEffects || []).some((e) => e.type === item.cure)) return returnToItems(`${targetHero.name} is not ${item.cure}ed!`)
        const inventory = { ...s.inventory, [itemId]: s.inventory[itemId] - 1 }
        const cured = { ...targetHero, statusEffects: (targetHero.statusEffects || []).filter((e) => e.type !== item.cure) }
        party = s.party.map((h) => h.id === cured.id ? cured : h)
        log = addLog(log, `${currentActor.name} uses ${item.name}! ${targetHero.name} is cured of ${item.cure}!`)
        const newState = { ...s, party, inventory, log, busy: false }
        const ended = checkBattleEnd(newState)
        if (ended) return ended
        return advanceTurn(newState)
      }

      return advanceTurn({ ...s, busy: false })
    })
  }

  const executeDefend = (actor) => {
    setState((s) => {
      const currentActor = resolveActor(s, { id: actor.id, isPlayer: actor.isPlayer })
      if (!currentActor) return advanceTurn({ ...s, busy: false })
      const party = s.party.map((h) => h.id === currentActor.id ? { ...h, defending: true } : h)
      const log = addLog(s.log, `${currentActor.name} raises their guard!`)
      const floats = addFloatText(s, 'DEF', 50, 50, '#4ea8de')
      const newState = { ...s, party, log, floatTexts: floats, busy: false }
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
        } else if (skill.target === 'multi_enemy') {
          const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
          setState((s) => ({ ...s, phase: PHASES.PLAYER_MULTI_TARGET, pendingAction: { type: 'skill', skillId: payload, selectedTargets: [] } }))
        } else {
          setState((s) => ({ ...s, phase: PHASES.PLAYER_TARGET, pendingAction: { type: 'skill', skillId: payload } }))
        }
        break
      }
      case 'select_multi_target': {
        const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
        if (state.pendingAction?.type !== 'skill') break
        const skill = SKILLS[state.pendingAction.skillId]
        const selected = [...(state.pendingAction.selectedTargets || []), payload]
        if (selected.length >= (skill.hits || 1)) {
          executeSkill(actor, state.pendingAction.skillId, selected)
        } else {
          setState((s) => ({ ...s, pendingAction: { ...s.pendingAction, selectedTargets: selected } }))
        }
        break
      }
      case 'open_items':
        setState((s) => ({ ...s, phase: PHASES.PLAYER_ITEMS }))
        break
      case 'use_item': {
        const item = ITEMS[payload]
        const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
        if (item.revive) {
          executeItem(actor, payload, null)
        } else if (item.heal || item.mpRestore) {
          const hasValidTarget = state.party.some((h) => h.alive && h.hp > 0 && (
            (item.heal && h.hp < h.maxHp) || (item.mpRestore && h.mp < h.maxMp)
          ))
          if (hasValidTarget) {
            setState((s) => ({ ...s, phase: PHASES.PLAYER_ALLY_TARGET, pendingAction: { type: 'item', itemId: payload } }))
          } else {
            setState((s) => ({ ...s, log: addLog(s.log, 'No ally needs that item right now.') }))
          }
        } else if (item.cure) {
          const hasValidTarget = state.party.some((h) => h.alive && h.hp > 0 && (h.statusEffects || []).some((e) => e.type === item.cure))
          if (hasValidTarget) {
            setState((s) => ({ ...s, phase: PHASES.PLAYER_ALLY_TARGET, pendingAction: { type: 'item', itemId: payload } }))
          } else {
            setState((s) => ({ ...s, log: addLog(s.log, 'No ally is suffering from that status.') }))
          }
        } else {
          executeItem(actor, payload, actor)
        }
        break
      }
      case 'defend': {
        const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
        executeDefend(actor)
        break
      }
      case 'surrender': {
        const actor = resolveActor(state, state.turnOrder[state.currentTurnIndex % state.turnOrder.length])
        if (!actor || !actor.isPlayer) break
        const surrenderCost = Math.max(10, Math.ceil(state.gold * 0.5))
        setState((s) => {
          const newGold = Math.max(0, s.gold - surrenderCost)
          const log = addLog(s.log, `${actor.name} surrenders! The party escapes but loses ${surrenderCost} gold.`)
          const floats = addFloatText(s, `-${surrenderCost}G`, 50, 50, '#f5c518')
          const isExplorationBattle = !!s.explorationBattleId
          return {
            ...s,
            gold: newGold,
            phase: isExplorationBattle ? PHASES.EXPLORATION : PHASES.AREA_MAP,
            enemies: [],
            busy: false,
            log,
            floatTexts: floats,
            pendingAction: null,
            battleResult: null,
            activeBattleIndex: null,
            explorationBattleId: null,
          }
        })
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
      const availableSkills = actor.skills
        .map((skillId) => SKILLS[skillId])
        .filter((skill) => skill && actor.mp >= skill.mpCost)
      const useSkill = availableSkills.length > 0 && Math.random() < (ai.skillChance || 0.2)

      let log = [...s.log]
      let party = s.party
      let floats = s.floatTexts
      let enemies = s.enemies

      if (useSkill) {
        const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)]
        if (skill) {
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
            if (ended) {
              enemyTurnInProgress.current = false
              return ended
            }
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
            if (ended) {
              enemyTurnInProgress.current = false
              return ended
            }
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
      if (ended) {
        enemyTurnInProgress.current = false
        return ended
      }
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
        setState((s) => {
          const queuedActor = s.turnOrder[s.currentTurnIndex % s.turnOrder.length]
          const activeActor = resolveActor(s, queuedActor)
          if (!activeActor) return { ...s, phase: PHASES.PLAYER_MENU, activeActor: null }
          return {
            ...s,
            activeActor,
            phase: activeActor.isPlayer ? PHASES.PLAYER_MENU : PHASES.ENEMY_TURN,
          }
        })
      }, 450)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === PHASES.BATTLE_VICTORY || state.phase === PHASES.BATTLE_DEFEAT) {
      setScreenFade(true)
      const t = setTimeout(() => {
        setScreenFade(false)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    const currentScript = document.querySelector('script[type="module"]')
    const currentHash = currentScript ? currentScript.src.split('/').pop() : null
    const storedHash = localStorage.getItem('jrpg-game-hash')

    if (currentHash && storedHash && currentHash !== storedHash) {
      setUpdateNotice(true)
      setTimeout(() => setUpdateNotice(false), 4000)
    }

    if (currentHash) {
      localStorage.setItem('jrpg-game-hash', currentHash)
    }
  }, [])

  // ============ RENDER ============
  const renderPhase = () => {
    switch (state.phase) {
      case PHASES.TITLE:
        return (
          <TitleScreen
            onStart={startGame}
            onContinue={handleLoadGame}
            hasCloudSave={hasCloudSave}
          />
        )
      case PHASES.AREA_MAP:
        return (
          <AreaMapScreen
            state={state}
            onSelectBattle={selectBattle}
            onUseItem={useOverworldItem}
            onShop={() => setState((s) => ({ ...s, phase: PHASES.SHOP }))}
            onWorldMap={openWorldMap}
            onExplore={startExploration}
            onSettings={() => setState((s) => ({ ...s, phase: PHASES.SETTINGS }))}
          />
        )
      case PHASES.EXPLORATION:
        return (
          <ExplorationMap
            area={AREAS[state.currentAreaIndex]}
            party={state.party}
            onTreasureFound={handleTreasureFound}
            onBattleStart={handleExplorationBattle}
            onExit={exitExploration}
            discoveredTreasures={state.discoveredTreasures}
            completedSecretBattles={state.completedSecretBattles}
          />
        )
      case PHASES.PATH_SELECTION:
        return (
          <PathSelection
            area={AREAS[state.selectedAreaIndex ?? state.currentAreaIndex]}
            onSelectPath={selectPath}
            onBack={() => setState((s) => ({ ...s, phase: PHASES.AREA_MAP, selectedAreaIndex: null }))}
          />
        )
      case PHASES.TRAVEL:
        return <TravelScreen state={state} onComplete={finishTravel} />
      case PHASES.WORLD_MAP:
        return (
          <WorldMap
            state={state}
            onSelectArea={selectArea}
            onBack={() => setState((s) => ({ ...s, phase: PHASES.AREA_MAP }))}
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
      case PHASES.PLAYER_MULTI_TARGET:
      case PHASES.PLAYER_ALLY_TARGET:
      case PHASES.ENEMY_TURN:
        return <BattleScreen state={state} anim={anim} onAction={handleAction} />
      case PHASES.BATTLE_VICTORY:
        if (screenFade) return <BattleScreen state={state} anim={anim} onAction={handleAction} />
        return <VictoryScreen state={state} onConfirm={confirmXpAllocation} />
      case PHASES.BATTLE_DEFEAT:
        if (screenFade) return <BattleScreen state={state} anim={anim} onAction={handleAction} />
        return <DefeatScreen onRetry={returnToTitle} />
      case PHASES.SETTINGS:
        return (
          <SettingsScreen
            onReset={newGame}
            onBack={() => setState((s) => ({ ...s, phase: PHASES.AREA_MAP }))}
            onSave={handleSaveGame}
            onLoad={handleLoadGame}
            onExport={handleExportCode}
            onImport={handleImportCode}
            saveStatus={saveStatus}
            lastSavedAt={lastSavedAt}
          />
        )
      case PHASES.GAME_COMPLETE:
        return <GameCompleteScreen onRestart={newGame} />
      default:
        return (
          <TitleScreen
            onStart={startGame}
            onContinue={handleLoadGame}
            hasCloudSave={hasCloudSave}
          />
        )
    }
  }

  const isBattlePhase = [
    PHASES.BATTLE_INTRO,
    PHASES.PLAYER_MENU,
    PHASES.PLAYER_SKILLS,
    PHASES.PLAYER_ITEMS,
    PHASES.PLAYER_TARGET,
    PHASES.PLAYER_MULTI_TARGET,
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

      {updateNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 pixel-panel border-retro-gold animate-fade-in">
          <div className="font-pixel text-[8px] text-retro-gold text-center">
            Game updated to the latest version!
          </div>
        </div>
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
