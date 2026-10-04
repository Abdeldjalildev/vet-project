// Netlify Function: provisionClinic
// Target: /.netlify/functions/provisionClinic
// Migrated from Firebase Callable: functions/index.js exports.provisionClinic

const { getAuthAdmin, getFirestoreAdmin } = require('./lib/firebaseAdmin')
const crypto = require('node:crypto')
const {
  handleCorsPreflight,
  requirePostMethod,
  parseJsonBody,
  successResponse,
  errorResponse,
  fail,
} = require('./lib/http')
const { requireAuth, requirePlatformOwner } = require('./lib/auth')
const { requireString, rejectUnknownFields } = require('./lib/validation')
const { FieldValue } = require('firebase-admin/firestore')

function normalizeSlug(value) {
  const slug = requireString(value, 'slug', 63).toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 3) {
    fail('invalid-argument', 'slug must contain only lowercase letters, numbers, and single hyphens.')
  }
  return slug
}

function normalizeLocalizedMap(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('invalid-argument', field + ' must contain ar, en, and fr strings.')
  }
  for (const language of ['ar', 'en', 'fr']) {
    if (typeof value[language] !== 'string' || value[language].trim().length > 160) {
      fail('invalid-argument', field + ' is invalid.')
    }
  }
  return { ar: value.ar.trim(), en: value.en.trim(), fr: value.fr.trim() }
}

function validateOwnerEmail(value) {
  const email = requireString(value, 'ownerEmail', 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('invalid-argument', 'ownerEmail is invalid.')
  return email
}

function validateTemporaryPassword(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128) {
    fail('invalid-argument', 'temporaryPassword must be between 12 and 128 characters.')
  }
  return value
}

async function createOwnerUser(authAdmin, email, temporaryPassword) {
  try {
    await authAdmin.getUserByEmail(email)
    fail('already-exists', 'The selected owner email is already registered.')
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error
  }

  const user = await authAdmin.createUser({
    email,
    emailVerified: false,
    disabled: false,
    password: temporaryPassword,
  })
  return user
}

exports.handler = async (event) => {
  const preflight = handleCorsPreflight(event)
  if (preflight) return preflight

  const methodError = requirePostMethod(event)
  if (methodError) return methodError

  try {
    const decodedToken = await requireAuth(event)
    requirePlatformOwner(decodedToken)

    const data = parseJsonBody(event)
    rejectUnknownFields(data, new Set(['name', 'slug', 'ownerEmail', 'temporaryPassword', 'public']), 'clinic provisioning')

    const name = normalizeLocalizedMap(data?.name, 'name')
    const slug = normalizeSlug(data?.slug)
    const ownerEmail = validateOwnerEmail(data?.ownerEmail)
    const temporaryPassword = validateTemporaryPassword(data?.temporaryPassword)
    const publish = data?.public === true

    const db = getFirestoreAdmin()
    const authAdmin = getAuthAdmin()
    const clinics = db.collection('clinics')
    const users = db.collection('users')

    const existingSlug = await clinics.where('slug', '==', slug).limit(1).get()
    if (!existingSlug.empty) fail('already-exists', 'That clinic slug is already in use.')

    const ownerUser = await createOwnerUser(authAdmin, ownerEmail, temporaryPassword)
    // P08: stamp a server-side verifier for the temporary credential. The Admin SDK
    // exposes passwordHash (firebase-admin@13.10.0, Auth emulator PROBE PASS), so the
    // fresh record is read immediately after creation and ONLY its SHA-256 digest is
    // persisted. Plaintext and raw hashes are never stored or logged.
    const freshOwnerUser = await authAdmin.getUser(ownerUser.uid)
    const initialPasswordHash = freshOwnerUser.passwordHash
    if (typeof initialPasswordHash !== 'string' || initialPasswordHash.length === 0) {
      try {
        await authAdmin.deleteUser(ownerUser.uid)
      } catch (cleanupError) {
        console.error('Provisioning cleanup failed:', { uid: ownerUser.uid, error: cleanupError?.message })
      }
      fail('internal', 'Password setup could not be initialized.')
    }
    const passwordSetupHashDigest = crypto.createHash('sha256').update(initialPasswordHash, 'utf8').digest('hex')
    const passwordSetupIssuedAt = Date.now()
    const clinicRef = clinics.doc()
    const now = FieldValue.serverTimestamp()

    try {
      await db.runTransaction(async (transaction) => {
        const slugCheck = await transaction.get(clinics.where('slug', '==', slug).limit(1))
        if (!slugCheck.empty) fail('already-exists', 'That clinic slug is already in use.')

        transaction.create(clinicRef, {
          slug,
          public: publish,
          active: true,
          lifecycle: 'provisioned',
          name,
          createdAt: now,
          updatedAt: now,
        })

        transaction.create(users.doc(ownerUser.uid), {
          uid: ownerUser.uid,
          clinicId: clinicRef.id,
          role: 'owner',
          status: 'active',
          mustChangePassword: true,
          passwordSetupIssuedAt,
          passwordSetupHashDigest,
          createdAt: now,
          updatedAt: now,
        })
      })
    } catch (error) {
      try {
        await authAdmin.deleteUser(ownerUser.uid)
      } catch (cleanupError) {
        console.error('Provisioning cleanup failed:', { uid: ownerUser.uid, error: cleanupError?.message })
      }
      throw error
    }

    return successResponse({
      clinicId: clinicRef.id,
      slug,
      ownerUid: ownerUser.uid,
      ownerEmail,
    })
  } catch (err) {
    return errorResponse(err)
  }
}
