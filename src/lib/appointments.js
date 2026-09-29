import { getDocs, limit, orderBy, query } from 'firebase/firestore'
import { clinicAppointmentsRef } from './firestore'
import { callNetlifyFunction } from './apiClient'

export const createPublicAppointment = async (clinicId, appointment) => {
  // Public endpoint: no ID token is required (the caller is an unauthenticated visitor).
  const { data } = await callNetlifyFunction('createPublicAppointment', {
    clinicId,
    ...appointment,
  })

  return data.appointmentId
}

export const transitionAppointment = async (clinicId, appointmentId, status) => {
  const { data } = await callNetlifyFunction('transitionAppointment', {
    clinicId,
    appointmentId,
    status,
  }, { authRequired: true })

  return data
}

export const listClinicAppointments = async (clinicId) => {
  const snapshot = await getDocs(
    query(
      clinicAppointmentsRef(clinicId),
      orderBy('date', 'desc'),
      orderBy('time', 'desc'),
      limit(100),
    ),
  )

  return snapshot.docs
    .map((document) => ({
      appointmentId: document.id,
      ...document.data(),
    }))
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
}
