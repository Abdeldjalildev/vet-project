// Netlify Function: recordAnalyticsEvent
// Target: /.netlify/functions/recordAnalyticsEvent
// Migrated from Firebase Callable: functions/index.js exports.recordAnalyticsEvent (lines 434-509)
//
// PUBLIC OPERATION: intentionally unauthenticated, matching the original callable.
// No Authorization header is required and no body value is trusted as authorization.
// Idempotency, validation, clinic scoping, and aggregate/visitor increments are preserved exactly.

const { getFirestoreAdmin } = require('./lib/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const {
  handleCorsPreflight,
  requirePostMethod,
  parseJsonBody,
  successResponse,
  errorResponse,
  fail,
} = require('./lib/http')
const { requireString, requireDocumentId, rejectUnknownFields } = require('./lib/validation')

// --- Analytics validation contract (preserved verbatim from functions/index.js) ---

const ANALYTICS_EVENT_TYPES = new Set([
  'page_view',
  'session_start',
  'booking_started',
  'booking_completed',
  'service_view',
])

const ANALYTICS_ALLOWED_PAGES = new Set([
  'home',
  'services',
  'faq',
  'booking',
])

const safeDimensionKey = (value) =>
  Buffer.from(String(value || ''), 'utf8').toString('base64url').slice(0, 120)

function validateAnalyticsPayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail('invalid-argument', 'Analytics payload is invalid.')
  }

  const clinicId = requireString(data.clinicId, 'clinicId', 128)
  const eventType = requireString(data.eventType, 'eventType', 40)
  const page = requireString(data.page, 'page', 80)
  const sessionId = requireString(data.sessionId, 'sessionId', 128)
  const visitorId = requireString(data.visitorId, 'visitorId', 128)
  if (visitorId.includes('/')) fail('invalid-argument', 'visitorId is invalid.')
  const language = requireString(data.language, 'language', 10)
  const deviceType = requireString(data.deviceType || 'unknown', 'deviceType', 20)
  const eventId = requireDocumentId(data.eventId, 'eventId')
  const serviceId = typeof data.serviceId === 'string' ? data.serviceId.trim() : ''
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!ANALYTICS_EVENT_TYPES.has(eventType)) fail('invalid-argument', 'Analytics event type is invalid.')
  if (!ANALYTICS_ALLOWED_PAGES.has(page)) fail('invalid-argument', 'Analytics page is invalid.')
  if (!/^[a-z]{2}$/.test(language)) fail('invalid-argument', 'Analytics language is invalid.')
  if (!uuidPattern.test(sessionId)) fail('invalid-argument', 'sessionId is invalid.')
  if (!uuidPattern.test(visitorId)) fail('invalid-argument', 'visitorId is invalid.')
  if (!uuidPattern.test(eventId)) fail('invalid-argument', 'eventId is invalid.')
  if (serviceId.length > 128 || serviceId.includes('/')) fail('invalid-argument', 'Analytics service identifier is invalid.')

  return { clinicId, eventType, page, sessionId, visitorId, language, deviceType, serviceId, eventId }
}

// --- HTTP handler ---

exports.handler = async (event) => {
  const preflight = handleCorsPreflight(event)
  if (preflight) return preflight

  const methodError = requirePostMethod(event)
  if (methodError) return methodError

  try {
    const data = parseJsonBody(event)

    rejectUnknownFields(data, new Set(['clinicId', 'eventType', 'page', 'sessionId', 'visitorId', 'language', 'deviceType', 'eventId', 'serviceId']), 'analytics')
    const analyticsEvent = validateAnalyticsPayload(data)

    const db = getFirestoreAdmin()
    const clinics = db.collection('clinics')
    const clinicRef = clinics.doc(analyticsEvent.clinicId)
    const date = new Date().toISOString().slice(0, 10)
    const eventRef = clinicRef.collection('analyticsEvents').doc(analyticsEvent.eventId)
    const aggregateRef = clinicRef.collection('analyticsAggregates').doc(date)
    const visitorRef = clinicRef.collection('analyticsVisitors').doc(
      `${date}_${safeDimensionKey(analyticsEvent.visitorId)}`,
    )

    await db.runTransaction(async (transaction) => {
      const [clinicSnapshot, visitorSnapshot, eventSnapshot] = await Promise.all([
        transaction.get(clinicRef),
        transaction.get(visitorRef),
        transaction.get(eventRef),
      ])

      // Idempotency: an already-recorded event is a silent no-op success. Preserved exactly,
      // including the fact that this check precedes the clinic availability check.
      if (eventSnapshot.exists) return

      if (!clinicSnapshot.exists || clinicSnapshot.data().public !== true || clinicSnapshot.data().active !== true) {
        fail('failed-precondition', 'Clinic is not available for analytics.')
      }

      transaction.create(eventRef, {
        clinicId: analyticsEvent.clinicId,
        eventType: analyticsEvent.eventType,
        page: analyticsEvent.page,
        serviceId: analyticsEvent.serviceId,
        timestamp: FieldValue.serverTimestamp(),
        sessionId: analyticsEvent.sessionId,
        language: analyticsEvent.language,
        deviceType: analyticsEvent.deviceType,
      })

      const aggregateUpdate = {
        clinicId: analyticsEvent.clinicId,
        date,
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (analyticsEvent.eventType === 'page_view') {
        aggregateUpdate.pageViews = FieldValue.increment(1)
        aggregateUpdate[`pages.${safeDimensionKey(analyticsEvent.page)}`] = FieldValue.increment(1)
      }

      if (analyticsEvent.eventType === 'session_start') {
        aggregateUpdate.sessions = FieldValue.increment(1)
      }

      if (analyticsEvent.eventType === 'booking_started') {
        aggregateUpdate.bookingsStarted = FieldValue.increment(1)
      }

      if (analyticsEvent.eventType === 'service_view' && analyticsEvent.serviceId) {
        aggregateUpdate[`services.${safeDimensionKey(analyticsEvent.serviceId)}`] = FieldValue.increment(1)
      }

      if (analyticsEvent.eventType === 'booking_completed') {
        aggregateUpdate.bookingsCompleted = FieldValue.increment(1)
      }

      if (!visitorSnapshot.exists) {
        transaction.create(visitorRef, {
          visitorId: analyticsEvent.visitorId,
          date,
          createdAt: FieldValue.serverTimestamp(),
        })
        aggregateUpdate.uniqueVisitors = FieldValue.increment(1)
      }

      transaction.set(aggregateRef, aggregateUpdate, { merge: true })
    })

    return successResponse({ recorded: true })
  } catch (err) {
    return errorResponse(err)
  }
}
