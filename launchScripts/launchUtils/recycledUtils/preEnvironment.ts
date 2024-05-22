/**
 * Most of the utilities needed during the set-up that are also needed by the backend.
 * It is important that this utilities correlate so that the backend can use what was configured during set-up (launch).
 * To avoid duplicated code and discrepancies, it is better to import from the backend the utilities needed for the set-up.
 * That is what is done here on the 'recycledUtils' folder.
 */

//
// Import and Export Types:
//

import {
  CredentialSubject,
  DomainLinkageCredential,
  VerifiableDomainLinkagePresentation
} from '../../../backend/src/utils/types'

export type This = typeof globalThis
export {
  CredentialSubject,
  DomainLinkageCredential,
  VerifiableDomainLinkagePresentation
}

//
// Import and Export Functions:
//

import { generateKeyPairs } from '../../../backend/src/utils/generateKeyPairs'
import { generateAccount } from '../../../backend/src/utils/generateAccount'

export { generateAccount, generateKeyPairs }
