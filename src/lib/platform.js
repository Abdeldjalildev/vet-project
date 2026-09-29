import { callNetlifyFunction } from './apiClient'

export const provisionClinic = async (input) => {
  const { data } = await callNetlifyFunction('provisionClinic', input, { authRequired: true })
  return data
}

export const listProvisionedClinics = async () => {
  const { data } = await callNetlifyFunction('listProvisionedClinics', {}, { authRequired: true })
  return data.clinics || []
}
