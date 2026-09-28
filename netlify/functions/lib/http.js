// Shared HTTP, CORS, and Error Formatting for Netlify Functions

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
}

const ERROR_STATUS_MAP = {
  'already-exists': 409,
  'invalid-argument': 400,
  'failed-precondition': 412,
  'unauthenticated': 401,
  'permission-denied': 403,
  'not-found': 404,
  'internal': 500,
}

class AppError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

function fail(code, message) {
  throw new AppError(code, message)
}

function handleCorsPreflight(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    }
  }
  return null
}

function requirePostMethod(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: {
          code: 'invalid-argument',
          message: 'Method Not Allowed. Only POST is supported.',
        },
      }),
    }
  }
  return null
}

function successResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  }
}

function errorResponse(error) {
  const code = error?.code && ERROR_STATUS_MAP[error.code] ? error.code : 'internal'
  const statusCode = ERROR_STATUS_MAP[code] || 500

  let message = error?.message
  if (code === 'internal') {
    message = 'An internal error occurred.'
    // Log unexpected errors safely on server without secrets
    console.error('Unhandled internal error:', error)
  }

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      error: {
        code,
        message: message || 'An error occurred.',
      },
    }),
  }
}

function parseJsonBody(event) {
  if (!event.body) return {}
  try {
    const parsed = JSON.parse(event.body)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      fail('invalid-argument', 'Request body must be a JSON object.')
    }
    return parsed
  } catch (err) {
    if (err instanceof AppError) throw err
    fail('invalid-argument', 'Malformed JSON in request body.')
  }
}

module.exports = {
  CORS_HEADERS,
  ERROR_STATUS_MAP,
  AppError,
  fail,
  handleCorsPreflight,
  requirePostMethod,
  successResponse,
  errorResponse,
  parseJsonBody,
}
