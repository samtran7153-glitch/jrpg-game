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

export async function saveGame(uid, gameState) {
  try {
    const saveRef = doc(db, 'saves', uid)
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
    const saveRef = doc(db, 'saves', uid)
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
    const saveRef = doc(db, 'saves', uid)
    await deleteDoc(saveRef)
    return true
  } catch (err) {
    console.error('Failed to delete save:', err)
    return false
  }
}

const LOCAL_KEY = 'pixelQuestSave'

export function saveLocalGame(gameState) {
  try {
    const savedAt = Date.now()
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ state: gameState, savedAt }))
    return { success: true, savedAt }
  } catch (err) {
    console.error('Failed to save local game:', err)
    return { success: false, savedAt: null }
  }
}

export function loadLocalGame() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const hasWrapper = parsed && typeof parsed === 'object' && 'state' in parsed
    const state = hasWrapper ? parsed.state : parsed
    const savedAt = hasWrapper ? parsed.savedAt || null : null
    return { state, savedAt }
  } catch (err) {
    console.error('Failed to load local game:', err)
    return null
  }
}

export function deleteLocalGame() {
  try {
    localStorage.removeItem(LOCAL_KEY)
    return true
  } catch (err) {
    console.error('Failed to delete local save:', err)
    return false
  }
}
