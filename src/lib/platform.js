import { getFunctions, httpsCallable } from 'firebase/functions'
import { firebaseApp } from './firebase'

const functions = getFunctions(firebaseApp, 'us-central1')

export const provisionClinic = async (input) => {
  const call = httpsCallable(functions, 'provisionClinic')
  const result = await call(input)
  return result.data
}

export const listProvisionedClinics = async () => {
  const call = httpsCallable(functions, 'listProvisionedClinics')
  const result = await call({})
  return result.data.clinics || []
}
