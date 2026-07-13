import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCcJ3MxJN_wUwwalFjFl7ORlAXixCRbujY',
  authDomain: 'jrpg-game.firebaseapp.com',
  projectId: 'jrpg-game',
  storageBucket: 'jrpg-game.firebasestorage.app',
  messagingSenderId: '616783672443',
  appId: '1:616783672443:web:4affcc429bf68e52f65ede',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export function ensureAnonymousUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if (user) {
        resolve(user)
      } else {
        signInAnonymously(auth)
          .then((credential) => resolve(credential.user))
          .catch((err) => {
            console.error('Anonymous sign-in failed:', err)
            resolve(null)
          })
      }
    })
  })
}

async function ensureAuthUid() {
  const user = await ensureAnonymousUser()
  return user?.uid || null
}

export async function saveGame(uid, gameState) {
  try {
    const currentUid = await ensureAuthUid()
    if (!currentUid) {
      console.error('[saveGame] no authenticated user available')
      return { success: false, savedAt: null }
    }
    if (currentUid !== uid) {
      console.warn('[saveGame] UID mismatch, using current auth UID', { requested: uid, current: currentUid })
    }
    const saveRef = doc(db, 'saves', currentUid)
    const serializable = JSON.parse(JSON.stringify(gameState))
    const savedAt = Date.now()
    await setDoc(saveRef, {
      state: serializable,
      savedAt,
      updatedAt: serverTimestamp(),
    })
    return { success: true, savedAt }
  } catch (err) {
    console.error('Failed to save game:', err)
    return { success: false, savedAt: null }
  }
}

export async function loadGame(uid) {
  try {
    const currentUid = await ensureAuthUid()
    if (!currentUid) {
      console.error('[loadGame] no authenticated user available')
      return null
    }
    if (currentUid !== uid) {
      console.warn('[loadGame] UID mismatch, using current auth UID', { requested: uid, current: currentUid })
    }
    const saveRef = doc(db, 'saves', currentUid)
    const snap = await getDoc(saveRef)
    if (snap.exists()) {
      const data = snap.data()
      return { state: data.state, savedAt: data.savedAt || null }
    }
    return null
  } catch (err) {
    console.error('Failed to load game:', err)
    return null
  }
}

export async function deleteGame(uid) {
  try {
    const currentUid = await ensureAuthUid()
    if (!currentUid) {
      console.error('[deleteGame] no authenticated user available')
      return false
    }
    if (currentUid !== uid) {
      console.warn('[deleteGame] UID mismatch, using current auth UID', { requested: uid, current: currentUid })
    }
    const saveRef = doc(db, 'saves', currentUid)
    await deleteDoc(saveRef)
    return true
  } catch (err) {
    console.error('Failed to delete save:', err)
    return false
  }
}

const LOCAL_KEY = 'pixelQuestSave'
const DB_NAME = 'pixelQuestDB'
const DB_STORE = 'saves'
const DB_KEY = 'localSave'
const CACHE_NAME = 'pixelQuestSaveCache'
const CACHE_KEY = '/__save.json'

function openLocalDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function saveToIndexedDB(gameState, savedAt) {
  const db = await openLocalDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    const store = tx.objectStore(DB_STORE)
    store.put({ state: gameState, savedAt }, DB_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function loadFromIndexedDB() {
  const db = await openLocalDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly')
    const store = tx.objectStore(DB_STORE)
    const request = store.get(DB_KEY)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

async function deleteFromIndexedDB() {
  const db = await openLocalDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    const store = tx.objectStore(DB_STORE)
    store.delete(DB_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function saveToLocalStorage(gameState, savedAt) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ state: gameState, savedAt }))
    return true
  } catch (err) {
    console.error('Failed to save local storage game:', err)
    return false
  }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const hasWrapper = parsed && typeof parsed === 'object' && 'state' in parsed
    const state = hasWrapper ? parsed.state : parsed
    const savedAt = hasWrapper ? parsed.savedAt || null : null
    return { state, savedAt }
  } catch (err) {
    console.error('Failed to load local storage game:', err)
    return null
  }
}

function deleteLocalStorage() {
  try {
    localStorage.removeItem(LOCAL_KEY)
    return true
  } catch (err) {
    console.error('Failed to delete local storage save:', err)
    return false
  }
}

async function saveToCache(gameState, savedAt) {
  if (typeof caches === 'undefined') return
  try {
    const cache = await caches.open(CACHE_NAME)
    const payload = JSON.stringify({ state: gameState, savedAt })
    const response = new Response(payload, { headers: { 'Content-Type': 'application/json' } })
    await cache.put(CACHE_KEY, response)
  } catch (err) {
    console.error('Failed to save to cache:', err)
  }
}

async function loadFromCache() {
  if (typeof caches === 'undefined') return null
  try {
    const cache = await caches.open(CACHE_NAME)
    const response = await cache.match(CACHE_KEY)
    if (!response) return null
    const payload = await response.text()
    const parsed = JSON.parse(payload)
    const hasWrapper = parsed && typeof parsed === 'object' && 'state' in parsed
    const state = hasWrapper ? parsed.state : parsed
    const savedAt = hasWrapper ? parsed.savedAt || null : null
    return { state, savedAt }
  } catch (err) {
    console.error('Failed to load from cache:', err)
    return null
  }
}

async function deleteFromCache() {
  if (typeof caches === 'undefined') return
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.delete(CACHE_KEY)
  } catch (err) {
    console.error('Failed to delete from cache:', err)
  }
}

export async function saveLocalGame(gameState) {
  const savedAt = Date.now()
  console.log('[saveLocalGame] called', { savedAt, phase: gameState?.phase })
  const lsSuccess = saveToLocalStorage(gameState, savedAt)
  console.log('[saveLocalGame] localStorage success:', lsSuccess)
  try {
    await saveToIndexedDB(gameState, savedAt)
    console.log('[saveLocalGame] IndexedDB saved')
  } catch (err) {
    console.error('Failed to save to IndexedDB:', err)
  }
  try {
    await saveToCache(gameState, savedAt)
    console.log('[saveLocalGame] Cache saved')
  } catch (err) {
    console.error('Failed to save to Cache:', err)
  }
  return { success: lsSuccess, savedAt }
}

export async function loadLocalGame() {
  const candidates = []
  try {
    const idb = await loadFromIndexedDB()
    console.log('[loadLocalGame] IndexedDB:', idb ? 'found' : 'empty')
    if (idb?.state) candidates.push(idb)
  } catch (err) {
    console.error('Failed to load from IndexedDB:', err)
  }
  try {
    const ls = loadFromLocalStorage()
    console.log('[loadLocalGame] localStorage:', ls ? 'found' : 'empty')
    if (ls?.state) candidates.push(ls)
  } catch (err) {
    console.error('Failed to load from localStorage:', err)
  }
  try {
    const cache = await loadFromCache()
    console.log('[loadLocalGame] Cache:', cache ? 'found' : 'empty')
    if (cache?.state) candidates.push(cache)
  } catch (err) {
    console.error('Failed to load from Cache:', err)
  }

  if (candidates.length === 0) {
    console.log('[loadLocalGame] no candidates')
    return null
  }

  // Pick the latest save
  candidates.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
  console.log('[loadLocalGame] returning', candidates[0]?.savedAt)
  return candidates[0]
}

export async function deleteLocalGame() {
  deleteLocalStorage()
  try {
    await deleteFromIndexedDB()
  } catch (err) {
    console.error('Failed to delete from IndexedDB:', err)
  }
  try {
    await deleteFromCache()
  } catch (err) {
    console.error('Failed to delete from Cache:', err)
  }
  return true
}
