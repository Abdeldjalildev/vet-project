import { getApp, getApps, initializeApp } from 'firebase/app'

const requiredConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingConfig = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingConfig.length > 0) {
  throw new Error(
    `Firebase configuration is incomplete. Missing: ${missingConfig.join(', ')}`,
  )
}

// Reuse the existing app during HMR so development does not create duplicate Firebase apps.
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(requiredConfig)
