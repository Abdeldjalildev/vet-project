import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { firebaseApp } from './firebase'

export const firebaseAuth = getAuth(firebaseApp)

export const signInClinicUser = async (email, password) => {
  await setPersistence(firebaseAuth, browserLocalPersistence)
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export const signOutClinicUser = () => signOut(firebaseAuth)
