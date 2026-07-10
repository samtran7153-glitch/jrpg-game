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
    await setDoc(saveRef, {
      state: serializable,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (err) {
    console.error('Failed to save game:', err)
    return false
  }
}

export async function loadGame(uid) {
  try {
    const saveRef = doc(db, 'saves', uid)
    const snap = await getDoc(saveRef)
    if (snap.exists()) {
      return snap.data().state
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
