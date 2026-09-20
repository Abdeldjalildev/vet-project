import { getDocs, query, where } from 'firebase/firestore'
import {
  clinicFaqsRef,
  clinicRef,
  clinicServicesRef,
} from './firestore'

export const localized = (value, language, fallback = 'en') => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value[fallback] || Object.values(value).find(Boolean) || ''
}

export const getPublicClinicBySlug = async (slug) => {
  const snapshot = await getDocs(
    query(clinicRef('unused').parent, where('public', '==', true)),
  )
  const clinic = snapshot.docs
    .map((document) => ({ clinicId: document.id, ...document.data() }))
    .find((item) => item.slug === slug && item.active !== false)

  if (!clinic) {
    throw new Error('CLINIC_NOT_FOUND')
  }

  return clinic
}

export const getPublicClinicContent = async (clinicId) => {
  const [servicesSnapshot, faqsSnapshot] = await Promise.all([
    getDocs(query(clinicServicesRef(clinicId), where('active', '==', true))),
    getDocs(query(clinicFaqsRef(clinicId), where('active', '==', true))),
  ])

  const services = servicesSnapshot.docs
    .map((document) => ({ serviceId: document.id, ...document.data() }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const faqs = faqsSnapshot.docs
    .map((document) => ({ faqId: document.id, ...document.data() }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return { services, faqs }
}
