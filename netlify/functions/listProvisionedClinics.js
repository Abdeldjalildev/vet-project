// Netlify Function: listProvisionedClinics
// Target: /.netlify/functions/listProvisionedClinics
// Migrated from Firebase Callable: functions/index.js exports.listProvisionedClinics

const { getFirestoreAdmin } = require('./lib/firebaseAdmin')
const {
  handleCorsPreflight,
  requirePostMethod,
  successResponse,
  errorResponse,
} = require('./lib/http')
const { requireAuth, requirePlatformOwner } = require('./lib/auth')

exports.handler = async (event) => {
  const preflight = handleCorsPreflight(event)
  if (preflight) return preflight

  const methodError = requirePostMethod(event)
  if (methodError) return methodError

  try {
    const decodedToken = await requireAuth(event)
    requirePlatformOwner(decodedToken)

    const db = getFirestoreAdmin()
    const clinics = db.collection('clinics')
    const snapshot = await clinics.orderBy('createdAt', 'desc').limit(100).get()

    return successResponse({
      clinics: snapshot.docs.map((document) => {
        const data = document.data()
        return {
          clinicId: document.id,
          slug: data.slug || '',
          name: data.name || { ar: '', en: '', fr: '' },
          public: data.public === true,
          active: data.active === true,
          lifecycle: data.lifecycle || 'unknown',
        }
      }),
    })
  } catch (err) {
    return errorResponse(err)
  }
}
