const { getAuth } = require('firebase-admin/auth')
const { initializeApp, applicationDefault } = require('firebase-admin/app')

initializeApp({ credential: applicationDefault() })

const email = process.argv[2]

if (!email) {
  console.error('Usage: node functions/scripts/set-platform-owner.js <owner-email>')
  process.exit(1)
}

async function main() {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await getAuth().getUserByEmail(normalizedEmail)
  const existingClaims = user.customClaims || {}
  await getAuth().setCustomUserClaims(user.uid, {
    ...existingClaims,
    platformOwner: true,
  })
  console.log('Platform Owner claim granted to ' + user.uid + ' (' + normalizedEmail + ').')
  console.log('The user must sign in again or force-refresh the ID token before the claim is visible to the client.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
