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
import { callNetlifyFunction } from './apiClient'

export const firebaseAuth = getAuth(firebaseApp)

export const signInClinicUser = async (email, password) => {
  await setPersistence(firebaseAuth, browserLocalPersistence)
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export const signOutClinicUser = () => signOut(firebaseAuth)

export const getClinicMembership = async (uid) => {
  const snapshot = await getDoc(userRef(uid))
  return snapshot.exists() ? snapshot.data() : null
}

export const changePasswordAndCompleteSetup = async (user, newPassword) => {
  await updatePassword(user, newPassword)
  await callNetlifyFunction('completeClinicPasswordSetup', {}, { authRequired: true })
}

export const getPlatformOwnerClaim = async (user, forceRefresh = false) => {
  if (!user) return false
  const tokenResult = await getIdTokenResult(user, forceRefresh)
  return tokenResult.claims.platformOwner === true
}
