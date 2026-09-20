import { collection, doc, getFirestore } from 'firebase/firestore'
import { firebaseApp } from './firebase'

export const firestore = getFirestore(firebaseApp)

export const clinicRef = (clinicId) => doc(firestore, 'clinics', clinicId)

export const userRef = (uid) => doc(firestore, 'users', uid)

export const clinicServicesRef = (clinicId) =>
  collection(firestore, 'clinics', clinicId, 'services')

export const clinicFaqsRef = (clinicId) =>
  collection(firestore, 'clinics', clinicId, 'faqs')

export const clinicAppointmentsRef = (clinicId) =>
  collection(firestore, 'clinics', clinicId, 'appointments')

export const clinicAnalyticsEventsRef = (clinicId) =>
  collection(firestore, 'clinics', clinicId, 'analyticsEvents')

export const clinicAnalyticsAggregatesRef = (clinicId) =>
  collection(firestore, 'clinics', clinicId, 'analyticsAggregates')
