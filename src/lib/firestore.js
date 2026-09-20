import { getFirestore } from 'firebase/firestore'
import { firebaseApp } from './firebase'

export const firestore = getFirestore(firebaseApp)
