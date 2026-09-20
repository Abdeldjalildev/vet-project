import { getDocs, onSnapshot, query, where } from 'firebase/firestore'
import {
  clinicFaqsRef,
  clinicRef,
  clinicsRef,
  clinicServicesRef,
} from './firestore'

export const localized = (value, language, fallback = 'en') => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value[fallback] || Object.values(value).find(Boolean) || ''
}

export const getPublicClinicBySlug = async (slug) => {
  const snapshot = await getDocs(
    query(
      clinicsRef,
      where('public', '==', true),
      where('active', '==', true),
      where('slug', '==', slug),
    ),
  )
  const clinic = snapshot.docs[0]

  if (!clinic) throw new Error('CLINIC_NOT_FOUND')
  return { clinicId: clinic.id, ...clinic.data() }
}

export const subscribePublicClinic = (clinicId, { onClinic, onServices, onFaqs, onError }) => {
  const clinicUnsubscribe = onSnapshot(
    clinicRef(clinicId),
    (snapshot) => {
      if (!snapshot.exists() || snapshot.data().public !== true || snapshot.data().active === false) {
        onError?.(new Error('CLINIC_NOT_FOUND'))
        return
      }
      onClinic({ clinicId: snapshot.id, ...snapshot.data() })
    },
    onError,
  )

  const servicesUnsubscribe = onSnapshot(
    query(clinicServicesRef(clinicId), where('active', '==', true)),
    (snapshot) => {
      onServices(
        snapshot.docs
          .map((document) => ({ serviceId: document.id, ...document.data() }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      )
    },
    onError,
  )

  const faqsUnsubscribe = onSnapshot(
    query(clinicFaqsRef(clinicId), where('active', '==', true)),
    (snapshot) => {
      onFaqs(
        snapshot.docs
          .map((document) => ({ faqId: document.id, ...document.data() }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      )
    },
    onError,
  )

  return () => {
    clinicUnsubscribe()
    servicesUnsubscribe()
    faqsUnsubscribe()
  }
}
