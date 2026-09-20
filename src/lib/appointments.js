import { getDocs, limit, orderBy, query } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { getFunctions } from 'firebase/functions'
import { firebaseApp } from './firebase'
import { clinicAppointmentsRef } from './firestore'

const functions = getFunctions(firebaseApp, 'us-central1')
const createPublicAppointmentCall = httpsCallable(functions, 'createPublicAppointment')
const transitionAppointmentCall = httpsCallable(functions, 'transitionAppointment')

export const createPublicAppointment = async (clinicId, appointment) => {
  const result = await createPublicAppointmentCall({
    clinicId,
    ...appointment,
  })

  return result.data.appointmentId
}

export const transitionAppointment = async (clinicId, appointmentId, status) => {
  const result = await transitionAppointmentCall({
    clinicId,
    appointmentId,
    status,
  })

  return result.data
}

export const listClinicAppointments = async (clinicId) => {
  const snapshot = await getDocs(
    query(
      clinicAppointmentsRef(clinicId),
      orderBy('date', 'desc'),
      limit(100),
    ),
  )

  return snapshot.docs.map((document) => ({
    appointmentId: document.id,
    ...document.data(),
  }))
}
