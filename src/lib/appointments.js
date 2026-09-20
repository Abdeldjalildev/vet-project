import { addDoc, serverTimestamp } from 'firebase/firestore'
import { clinicAppointmentsRef } from './firestore'

export const createPublicAppointment = async (clinicId, appointment) => {
  const document = await addDoc(clinicAppointmentsRef(clinicId), {
    clinicId,
    petName: appointment.petName.trim(),
    petType: appointment.petType,
    ownerName: appointment.ownerName.trim(),
    ownerPhone: appointment.ownerPhone.trim(),
    ownerEmail: appointment.ownerEmail?.trim() || '',
    serviceId: appointment.serviceId,
    date: appointment.date,
    time: appointment.time,
    notes: appointment.notes?.trim() || '',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return document.id
}
