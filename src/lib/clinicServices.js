import { addDoc, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { clinicAppointmentsRef, clinicServicesRef, firestore } from './firestore'

const normalizeLocalized = (value) => ({
  ar: typeof value?.ar === 'string' ? value.ar.trim() : '',
  en: typeof value?.en === 'string' ? value.en.trim() : '',
  fr: typeof value?.fr === 'string' ? value.fr.trim() : '',
})

export const listClinicServices = async (clinicId) => {
  const snapshot = await getDocs(
    query(clinicServicesRef(clinicId), orderBy('order', 'asc')),
  )

  return snapshot.docs.map((document) => ({
    serviceId: document.id,
    ...document.data(),
  }))
}

export const createClinicService = async (clinicId, input) => {
  const name = normalizeLocalized(input.name)
  const description = normalizeLocalized(input.description)

  if (!name.en && !name.ar && !name.fr) {
    throw new Error('SERVICE_NAME_REQUIRED')
  }

  return addDoc(clinicServicesRef(clinicId), {
    name,
    description,
    icon: input.icon?.trim() || '🩺',
    price: Number.isFinite(input.price) && input.price >= 0 ? input.price : 0,
    currency: typeof input.currency === 'string' && /^[A-Z]{3}$/.test(input.currency) ? input.currency : 'DZD',
    order: Number.isFinite(input.order) ? input.order : 0,
    active: input.active !== false,
  })
}

export const updateClinicService = async (clinicId, serviceId, input) => {
  const name = normalizeLocalized(input.name)
  const description = normalizeLocalized(input.description)

  if (!name.en && !name.ar && !name.fr) {
    throw new Error('SERVICE_NAME_REQUIRED')
  }

  await updateDoc(doc(firestore, 'clinics', clinicId, 'services', serviceId), {
    name,
    description,
    icon: input.icon?.trim() || '🩺',
    order: Number.isFinite(input.order) ? input.order : 0,
    active: input.active !== false,
  })
}

export const setClinicServiceActive = async (clinicId, serviceId, active) => {
  await updateDoc(doc(firestore, 'clinics', clinicId, 'services', serviceId), { active })
}

export const deleteClinicService = async (clinicId, serviceId) => {
  const appointments = await getDocs(
    query(clinicAppointmentsRef(clinicId), where('serviceId', '==', serviceId)),
  )

  if (!appointments.empty) {
    throw new Error('SERVICE_IN_USE')
  }

  await deleteDoc(doc(firestore, 'clinics', clinicId, 'services', serviceId))
}
