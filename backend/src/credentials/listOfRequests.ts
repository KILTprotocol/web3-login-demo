import * as Kilt from '@kiltprotocol/sdk-js'
import { CTYPE_HASH, REQUIRED_PROPERTIES, TRUSTED_ATTESTERS } from '../config'

// Establish which cTypes our dApp accepts and which attesters we trust:

/**
 * Email Credential Type attested from SocialKYC.io
 */
export const emailRequest: Kilt.IRequestCredentialContent = {
  cTypes: [
    {
      cTypeHash:
        '0x3291bb126e33b4862d421bfaa1d2f272e6cdfc4f96658988fbcffea8914bd9ac',
      trustedAttesters: [
        'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY'
      ],
      requiredProperties: ['Email']
    }
  ]
}
const trustedAttestersValues = TRUSTED_ATTESTERS.split(',')
const requiredPropertiesValues = REQUIRED_PROPERTIES.split(',')

const requiredProperties = requiredPropertiesValues.map(
  (requiredProperties) => requiredProperties
)

const trustedAttesters = trustedAttestersValues.map(
  (trustedAttesters) => trustedAttesters as Kilt.DidUri
)

/**
 * Email Credential Type attested from SocialKYC.io
 */
export const requestedCType: Kilt.IRequestCredentialContent = {
  cTypes: [
    {
      cTypeHash: CTYPE_HASH as `0x${string}`,
      trustedAttesters,
      requiredProperties
    }
  ]
}
