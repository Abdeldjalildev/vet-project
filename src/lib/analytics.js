import { httpsCallable, getFunctions } from 'firebase/functions'
import { firebaseApp } from './firebase'
import { clinicAnalyticsAggregatesRef } from './firestore'
import { getDocs, limit, orderBy, query } from 'firebase/firestore'

const functions = getFunctions(firebaseApp, 'us-central1')

const ANALYTICS_KEYS = {
  visitor: 'vetlife_visitor_id',
  session: 'vetlife_session_id',
  sessionStarted: 'vetlife_session_started',
}

const getOrCreateId = (key) => {
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const value = crypto.randomUUID()
  window.localStorage.setItem(key, value)
  return value
}

const getSessionId = () => {
  const existing = window.sessionStorage.getItem(ANALYTICS_KEYS.session)
  if (existing) return existing
  const value = crypto.randomUUID()
  window.sessionStorage.setItem(ANALYTICS_KEYS.session, value)
  return value
}

export const getAnalyticsIdentity = () => ({
  visitorId: getOrCreateId(ANALYTICS_KEYS.visitor),
  sessionId: getSessionId(),
})

export const trackAnalyticsEvent = async ({
  clinicId,
  eventType,
  page,
  serviceId = '',
  sessionId,
  visitorId,
  language,
}) => {
  const callable = httpsCallable(functions, 'recordAnalyticsEvent')
  return callable({
    clinicId,
    eventType,
    page,
    serviceId,
    sessionId,
    visitorId,
    language,
    deviceType: window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'pointer',
  })
}

export const trackPublicEvent = async (payload) => {
  try {
    return await trackAnalyticsEvent({
      ...payload,
      ...getAnalyticsIdentity(),
    })
  } catch (error) {
    console.warn('Analytics event was not recorded', error)
    return null
  }
}

export const trackSessionStartOnce = async (payload) => {
  if (window.sessionStorage.getItem(ANALYTICS_KEYS.sessionStarted)) return null
  window.sessionStorage.setItem(ANALYTICS_KEYS.sessionStarted, 'true')
  return trackPublicEvent({ ...payload, eventType: 'session_start' })
}

export const listAnalyticsAggregates = async (clinicId, days = 30) => {
  const snapshot = await getDocs(
    query(clinicAnalyticsAggregatesRef(clinicId), orderBy('date', 'desc'), limit(days)),
  )
  return snapshot.docs.map((document) => ({ aggregateId: document.id, ...document.data() }))
}
