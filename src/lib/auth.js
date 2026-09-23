import {
  browserLocalPersistence,
  getAuth,
  getIdTokenResult,
  updatePassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { firebaseApp } from './firebase'
import { getDoc } from 'firebase/firestore'
import { userRef } from './firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

export const firebaseAuth = getAuth(firebaseApp)

export const signInClinicUser = async (email, password) => {
  await setPersistence(firebaseAuth, browserLocalPersistence)
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export const signOutClinicUser = () => signOut(firebaseAuth)

const functions = getFunctions(firebaseApp, 'us-central1')

export const getClinicMembership = async (uid) => {
  const snapshot = await getDoc(userRef(uid))
  return snapshot.exists() ? snapshot.data() : null
}

export const changePasswordAndCompleteSetup = async (user, newPassword) => {
  await updatePassword(user, newPassword)
  const complete = httpsCallable(functions, 'completeClinicPasswordSetup')
  await complete({})
}

export const getPlatformOwnerClaim = async (user, forceRefresh = false) => {
  if (!user) return false
  const tokenResult = await getIdTokenResult(user, forceRefresh)
  return tokenResult.claims.platformOwner === true
}
