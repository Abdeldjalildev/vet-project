// Shared Request Validation Primitives for Netlify Functions

const { fail } = require('./http')

function requireString(value, field, maxLength) {
  if (typeof value !== 'string') fail('invalid-argument', `${field} must be a string.`)
  const normalized = value.trim()
  if (!normalized || normalized.length > maxLength) {
    fail('invalid-argument', `${field} is invalid.`)
  }
  return normalized
}

function requireDocumentId(value, field) {
  const normalized = requireString(value, field, 128)
  if (normalized.includes('/')) fail('invalid-argument', `${field} is invalid.`)
  return normalized
}

function rejectUnknownFields(data, allowedSet, operationName) {
  for (const key of Object.keys(data || {})) {
    if (!allowedSet.has(key)) {
      fail('invalid-argument', `Unsupported ${operationName} field: ${key}`)
    }
  }
}

module.exports = {
  requireString,
  requireDocumentId,
  rejectUnknownFields,
}
