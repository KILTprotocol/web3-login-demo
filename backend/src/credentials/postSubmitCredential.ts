import * as Kilt from '@kiltprotocol/sdk-js'

import { Request, Response } from 'express'

import { DAPP_DID_MNEMONIC, JWT_SIGNER_SECRET } from '../config'

import { generateKeyPairs } from '../utils/generateKeyPairs'
import { decryptionCallback } from '../utils/decryptionCallback'
import { getApi } from '../utils/connection'

import { readCredentialCookie } from './readCredentialCookie'

export async function postSubmitCredential(
  request: Request,
  response: Response,
  cTypeRequested: Kilt.IRequestCredentialContent
) {
  const encryptedMessage = request.body
  console.log(
    `encrypted Message that the server obtained ${JSON.stringify(
      encryptedMessage,
      null,
      2
    )}`
  )
  const api = await getApi()

  const { keyAgreement } = generateKeyPairs(DAPP_DID_MNEMONIC)
  const decryptedMessage = await Kilt.Message.decrypt(
    encryptedMessage,
    decryptionCallback(keyAgreement)
  )

  // Verifying this is a properly-formatted message
  Kilt.Message.verify(decryptedMessage)
  // Here a 400 could be sent, if this fails and you really appreciate Http Status Codes

  if (decryptedMessage.body.type !== 'submit-credential') {
    throw new Error(`Unexpected message type: ${decryptedMessage.body.type}`)
  }

  // TODO:  maybe allow for several credentials in the future
  const credential = decryptedMessage.body.content[0]

  console.log('Decrypted Credential being verify: \n', credential)

  // Know against to what structure you want to compare to:
  const requestedCTypeHash = cTypeRequested.cTypes[0].cTypeHash
  const requestedCTypeDetailed = await Kilt.CType.fetchFromChain(
    `kilt:ctype:${requestedCTypeHash}`
  )

  // The function Credential.verifyPresentation can check against a specific cType structure.
  // This cType needs to match the ICType-interface.
  // To fullfil this structure we need to remove the 'creator' and 'createdAt' properties from our fetched object.
  const { $id, $schema, title, properties, type } = requestedCTypeDetailed
  const requestedCType = { $id, $schema, title, properties, type }

  const challengeOnRequest = await readCredentialCookie(
    request,
    response,
    JWT_SIGNER_SECRET
  )

  await Kilt.Credential.verifyPresentation(credential, {
    challenge: challengeOnRequest,
    ctype: requestedCType
  })

  const attestationChain = await api.query.attestation.attestations(
    credential.rootHash
  )

  const attestation = Kilt.Attestation.fromChain(
    attestationChain,
    credential.rootHash
  )

  if (attestation.revoked) {
    throw new Error("Credential has been revoked and hence it's not valid.")
  }

  // Check if the credentials was issued by one of our "trusted attesters"

  const ourTrustedAttesters = cTypeRequested.cTypes[0].trustedAttesters
  const attesterOfTheirCredential = attestation.owner

  // If you don't include a list of trusted attester on the credential-request, this check would be skipped
  if (ourTrustedAttesters) {
    if (!ourTrustedAttesters.includes(attesterOfTheirCredential)) {
      throw new Error(
        `The Credential was not issued by any of the trusted Attesters that the dApp relies on. \n List of trusted attesters: ${ourTrustedAttesters}`
      )
    }
  }

  console.log('Credential Successfully Verified!')

  return credential
}
