const PET_TYPES = new Set(['cat', 'dog', 'bird', 'other'])

export const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const normalizeAppointmentInput = (input) => ({
  petName: input.petName.trim(),
  petType: input.petType,
  ownerName: input.ownerName.trim(),
  ownerPhone: input.ownerPhone.trim(),
  ownerEmail: input.ownerEmail.trim(),
  serviceId: input.serviceId,
  date: input.date,
  time: input.time,
  notes: input.notes.trim(),
})

export const validateAppointmentInput = (input) => {
  const value = normalizeAppointmentInput(input)
  const errors = {}

  if (!value.petName || value.petName.length > 120) errors.petName = 'invalid'
  if (!PET_TYPES.has(value.petType)) errors.petType = 'invalid'
  if (!value.ownerName || value.ownerName.length > 160) errors.ownerName = 'invalid'
  if (!value.ownerPhone || value.ownerPhone.length > 40) errors.ownerPhone = 'invalid'
  if (value.ownerEmail.length > 254) errors.ownerEmail = 'invalid'
  if (!value.serviceId) errors.serviceId = 'required'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date) || value.date < getTodayDate()) errors.date = 'invalid'
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)) errors.time = 'invalid'
  if (value.notes.length > 2000) errors.notes = 'invalid'

  return { value, errors, valid: Object.keys(errors).length === 0 }
}
