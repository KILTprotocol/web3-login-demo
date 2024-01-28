import * as Kilt from '@kiltprotocol/sdk-js'

import { CTYPE_HASH, REQUIRED_PROPERTIES, TRUSTED_ATTESTERS } from '../config'

// Here you can set which type of credential (cType) your dApp will request users to login.
// You can change it by importing a different one.
// The default is the Email CType by SocialKYC and SocialKYC as the Issuer
// Establish which cTypes our dApp accepts and which attesters we trust:

const trustedAttestersValues = TRUSTED_ATTESTERS.split(',')
const requiredPropertiesValues = REQUIRED_PROPERTIES.split(',')

const requiredProperties = requiredPropertiesValues.map(
  (requiredProperties) => requiredProperties
)

const trustedAttesters = trustedAttestersValues.map(
  (trustedAttesters) => trustedAttesters as Kilt.DidUri
)

/**
 * Credential for users to configure default as SocialKYC Email Credential
 */
export const requestedCTypeForLogin: Kilt.IRequestCredentialContent = {
  cTypes: [
    {
      cTypeHash: CTYPE_HASH as `0x${string}`,
      trustedAttesters,
      requiredProperties
    }
  ]
}
