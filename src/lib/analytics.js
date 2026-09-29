import { clinicAnalyticsAggregatesRef } from './firestore'
import { getDocs, limit, orderBy, query } from 'firebase/firestore'
import { callNetlifyFunction } from './apiClient'

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

const getSessionStartedKey = (clinicId) => `${ANALYTICS_KEYS.sessionStarted}:${clinicId}`

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
  eventId = crypto.randomUUID(),
}) => {
  // Public endpoint: no ID token is required (the caller may be an anonymous visitor).
  return callNetlifyFunction('recordAnalyticsEvent', {
    clinicId,
    eventType,
    page,
    serviceId,
    sessionId,
    visitorId,
    language,
    deviceType: window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'pointer',
    eventId,
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
  const startedKey = getSessionStartedKey(payload.clinicId)
  if (window.sessionStorage.getItem(startedKey)) return null
  const result = await trackPublicEvent({ ...payload, eventType: 'session_start' })
  if (result) window.sessionStorage.setItem(startedKey, 'true')
  return result
}

export const listAnalyticsAggregates = async (clinicId, days = 30) => {
  const snapshot = await getDocs(
    query(clinicAnalyticsAggregatesRef(clinicId), orderBy('date', 'desc'), limit(days)),
  )
  return snapshot.docs.map((document) => ({ aggregateId: document.id, ...document.data() }))
}
