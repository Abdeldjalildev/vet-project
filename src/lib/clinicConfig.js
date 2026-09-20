import { addDoc, deleteDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { clinicFaqsRef, clinicRef } from './firestore'

const localized = (value) => ({
  ar: typeof value?.ar === 'string' ? value.ar.trim() : '',
  en: typeof value?.en === 'string' ? value.en.trim() : '',
  fr: typeof value?.fr === 'string' ? value.fr.trim() : '',
})

export const getClinicConfiguration = async (clinicId) => {
  const snapshot = await getDocs(query(clinicFaqsRef(clinicId), orderBy('order', 'asc')))
  return { faqs: snapshot.docs.map((document) => ({ faqId: document.id, ...document.data() })) }
}

export const updateClinicProfile = (clinicId, input) =>
  updateDoc(clinicRef(clinicId), {
    name: localized(input.name),
    logoUrl: input.logoUrl?.trim() || '',
    description: localized(input.description),
    contact: {
      address: localized(input.address),
      phone: input.phone?.trim() || '',
      email: input.email?.trim() || '',
    },
    openingHours: input.openingHours || {},
    emergencyInformation: localized(input.emergencyInformation),
  })

export const updateClinicBranding = (clinicId, input) =>
  updateDoc(clinicRef(clinicId), {
    branding: {
      primaryColor: input.primaryColor,
      accentColor: input.accentColor,
    },
    logoUrl: input.logoUrl?.trim() || '',
  })

export const updateClinicContent = (clinicId, input) =>
  updateDoc(clinicRef(clinicId), {
    hero: {
      badge: localized(input.hero?.badge),
      title: localized(input.hero?.title),
      description: localized(input.hero?.description),
    },
    about: {
      title: localized(input.about?.title),
      description: localized(input.about?.description),
      quote: localized(input.about?.quote),
      features: Array.isArray(input.about?.features) ? input.about.features : [],
    },
    footer: {
      about: localized(input.footer?.about),
      copyright: localized(input.footer?.copyright),
    },
    socialLinks: {
      facebook: input.socialLinks?.facebook?.trim() || '',
      instagram: input.socialLinks?.instagram?.trim() || '',
      tiktok: input.socialLinks?.tiktok?.trim() || '',
      youtube: input.socialLinks?.youtube?.trim() || '',
      whatsapp: input.socialLinks?.whatsapp?.trim() || '',
      website: input.socialLinks?.website?.trim() || '',
    },
  })

export const listClinicFaqs = async (clinicId) => {
  const snapshot = await getDocs(query(clinicFaqsRef(clinicId), orderBy('order', 'asc')))
  return snapshot.docs.map((document) => ({ faqId: document.id, ...document.data() }))
}

export const createClinicFaq = (clinicId, input) =>
  addDoc(clinicFaqsRef(clinicId), {
    question: localized(input.question),
    answer: localized(input.answer),
    order: Number.isFinite(input.order) ? input.order : 0,
    active: input.active !== false,
  })

export const updateClinicFaq = (clinicId, faqId, input) =>
  updateDoc(faqsDoc(clinicId, faqId), {
    question: localized(input.question),
    answer: localized(input.answer),
    order: Number.isFinite(input.order) ? input.order : 0,
    active: input.active !== false,
  })

export const deleteClinicFaq = (clinicId, faqId) => deleteDoc(faqsDoc(clinicId, faqId))

const faqsDoc = (clinicId, faqId) => {
  const collectionRef = clinicFaqsRef(clinicId)
  return { ...collectionRef, path: `${collectionRef.path}/${faqId}` }
}
