import * as Kilt from '@kiltprotocol/sdk-js'

import { CTYPE_HASH, REQUIRED_PROPERTIES, TRUSTED_ATTESTERS } from '../config'

// Here you can set which type of credential (cType) your dApp will request users to login.
// You can change it by importing a different one.
// Establish which cTypes our dApp accepts and which attesters we trust:

const cTypeHashes = CTYPE_HASH.split('/').map(s => s.trim());

const trustedAttesterList = TRUSTED_ATTESTERS.split('/').map(s => s.trim());

const requiredPropertiesList = REQUIRED_PROPERTIES.split('/').map((s)=> s.trim())

let cTypes = []

for(let i = 0;i<cTypeHashes.length;i++){
  const trustedAttesters = trustedAttesterList[i].split(',').map((s)=> {
    const trimmed = s.trim()
    Kilt.Did.validateUri(trimmed)
    return trimmed as Kilt.DidUri
  })
  const requiredProperties = requiredPropertiesList[i].split(',').map((s)=> s.trim())
  let cType = {
    cTypeHash: cTypeHashes[i] as `0x${string}`,
    trustedAttesters,
    requiredProperties
  }
  cTypes.push(cType)
}
export const cTypeToRequest: Kilt.IRequestCredentialContent = {
  cTypes
}

console.log(cTypes);
