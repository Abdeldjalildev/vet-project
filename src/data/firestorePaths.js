export const clinicDocument = (clinicId) => ['clinics', clinicId]

export const clinicServicesCollection = (clinicId) => [
  'clinics',
  clinicId,
  'services',
]

export const clinicFaqsCollection = (clinicId) => [
  'clinics',
  clinicId,
  'faqs',
]

export const clinicAppointmentsCollection = (clinicId) => [
  'clinics',
  clinicId,
  'appointments',
]

export const clinicAnalyticsEventsCollection = (clinicId) => [
  'clinics',
  clinicId,
  'analyticsEvents',
]

export const clinicAnalyticsAggregatesCollection = (clinicId) => [
  'clinics',
  clinicId,
  'analyticsAggregates',
]

export const userDocument = (uid) => ['users', uid]
