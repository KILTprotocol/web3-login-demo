import * as Kilt from '@kiltprotocol/sdk-js'

import { CTYPE_HASH, REQUIRED_PROPERTIES, TRUSTED_ATTESTERS } from '../config'

/** Establish the types of credentials (cTypes) that our dApp will request from users to log in,
 * identify which properties are necessary, and specify which attesters we trust.
 *
 * These settings are defined by the constants imported from the config file.
 * Modify the `env` file to adapt it to your preferences.
 */

const cTypeHashes = CTYPE_HASH.split('/').map((s) => s.trim())

const trustedAttesterList = TRUSTED_ATTESTERS.split('/').map((s) => s.trim())

const requiredPropertiesList = REQUIRED_PROPERTIES.split('/').map((s) =>
  s.trim()
)

const cTypes: {
  cTypeHash: `0x${string}`
  trustedAttesters: Kilt.DidUri[]
  requiredProperties: string[]
}[] = []

for (let i = 0; i < cTypeHashes.length; i++) {
  const trustedAttesters = trustedAttesterList[i].split(',').map((s) => {
    const trimmed = s.trim()
    Kilt.Did.validateUri(trimmed)
    return trimmed as Kilt.DidUri
  })
  const requiredProperties = requiredPropertiesList[i]
    .split(',')
    .map((s) => s.trim())
  const cType = {
    cTypeHash: cTypeHashes[i] as `0x${string}`,
    trustedAttesters,
    requiredProperties
  }
  cTypes.push(cType)
}
export const cTypesToRequest: Kilt.IRequestCredentialContent = {
  cTypes
}
