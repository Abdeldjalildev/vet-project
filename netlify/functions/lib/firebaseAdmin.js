// Netlify Functions Shared Firebase Admin Initialization
// Initializes Firebase Admin exactly once per process and reuses the instance across warm invocations.
// Does NOT hard-code credentials or expose them to the browser.
// Uses applicationDefault or FIREBASE_SERVICE_ACCOUNT or emulator host environment variables.

const admin = require('firebase-admin')

let initialized = false

function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app()
  }

  // If already initialized in this process
  if (initialized && admin.apps.length > 0) {
    return admin.app()
  }

  const options = {}

  // 1. Service Account JSON in environment variable (production Netlify secret)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      options.credential = admin.credential.cert(serviceAccount)
      if (serviceAccount.project_id) {
        options.projectId = serviceAccount.project_id
      }
    } catch (err) {
      // If parsing fails, fall back to default
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message)
    }
  }

  // 2. Project ID fallback
  if (!options.projectId && (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT)) {
    options.projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
  }

  // 3. Application Default Credentials if not explicitly certed
  if (!options.credential && !process.env.FIREBASE_AUTH_EMULATOR_HOST && !process.env.FIRESTORE_EMULATOR_HOST) {
    try {
      options.credential = admin.credential.applicationDefault()
    } catch {
      // Local development or emulator mode might not have applicationDefault
    }
  }

  // If emulator is active and no project ID set, default to vet-life
  if (!options.projectId) {
    options.projectId = 'vet-life'
  }

  const app = admin.initializeApp(options)
  initialized = true
  return app
}

function getAuthAdmin() {
  getAdminApp()
  return admin.auth()
}

function getFirestoreAdmin() {
  getAdminApp()
  return admin.firestore()
}

module.exports = {
  admin,
  getAdminApp,
  getAuthAdmin,
  getFirestoreAdmin,
}
