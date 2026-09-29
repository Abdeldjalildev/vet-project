// VetLife Firebase Functions — decommissioned in Phase 16.
//
// Every trusted operation that used to live in this file as a Firebase HTTPS callable has been
// migrated to the Netlify Functions layer and its legacy implementation removed:
//
//   provisionClinic              -> netlify/functions/provisionClinic.js
//   listProvisionedClinics       -> netlify/functions/listProvisionedClinics.js
//   createPublicAppointment      -> netlify/functions/createPublicAppointment.js
//   transitionAppointment        -> netlify/functions/transitionAppointment.js
//   completeClinicPasswordSetup  -> netlify/functions/completeClinicPasswordSetup.js
//   recordAnalyticsEvent         -> netlify/functions/recordAnalyticsEvent.js
//   deleteClinicService          -> netlify/functions/deleteClinicService.js
//
// The browser reaches those handlers through the shared adapter in src/lib/apiClient.js, which
// POSTs to /.netlify/functions/<operationName> and attaches the Firebase ID token for the
// authenticated operations. No other Firebase Function ever lived in this file, so no unrelated
// function was removed; this module now intentionally declares no functions.
//
// The Firebase project still owns two responsibilities:
//   1. Firestore security rules (firestore.rules) remain the last line of defence.
//   2. functions/scripts/set-platform-owner.js still bootstraps the platformOwner custom claim
//      with the Admin SDK (that is why firebase-admin remains a dependency of functions/).
//
// Removing a deployed callable from source does not undeploy it: the Firebase project must be
// redeployed from this source, or the old callables deleted from the project, as a separate
// deployment step. Repository evidence for the cutover lives in tests/phase16-netlify-cutover.mjs.

'use strict'

module.exports = {}
