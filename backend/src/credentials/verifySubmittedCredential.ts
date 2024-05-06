import * as Kilt from '@kiltprotocol/sdk-js'

import { Request, Response } from 'express'

import { DAPP_DID_MNEMONIC, JWT_SIGNER_SECRET } from '../config'

import { generateKeyPairs } from '../utils/generateKeyPairs'
import { decryptionCallback } from '../utils/decryptionCallback'
import { getApi } from '../utils/connection'

import { readCredentialCookie } from './readCredentialCookie'

export async function verifySubmittedCredential(
  request: Request,
  response: Response,
  cTypesRequested: Kilt.IRequestCredentialContent
): Promise<Kilt.ICredentialPresentation> {
  const encryptedMessage = request.body
  console.log(
    `encrypted Message that the server obtained ${JSON.stringify(
      encryptedMessage,
      null,
      2
    )}`
  )
  await getApi()

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

  const chosenCType = cTypesRequested.cTypes.find(
    (ctype) => ctype.cTypeHash === credential.claim.cTypeHash
  )

  if (!chosenCType) {
    throw new Error(
      "The User did not complied to the Credential Request. The Server does not accept the submitted Credential's Type."
    )
  }

  // Know against to what structure you want to compare to:
  const requestedCTypeHash = chosenCType.cTypeHash
  const { cType: requestedCType } = await Kilt.CType.fetchFromChain(
    `kilt:ctype:${requestedCTypeHash}`
  )

  const challengeOnRequest = await readCredentialCookie(
    request,
    response,
    JWT_SIGNER_SECRET
  )

  const verifiedCredential = await Kilt.Credential.verifyPresentation(
    credential,
    {
      challenge: challengeOnRequest,
      ctype: requestedCType
    }
  )

  if (verifiedCredential.revoked) {
    throw new Error("Credential has been revoked and hence it's not valid.")
  }

  // Check if the credentials was issued by one of our "trusted attesters"
  const ourTrustedAttesters = chosenCType.trustedAttesters

  // If you don't include a list of trusted attester on the credential-request, this check would be skipped
  if (ourTrustedAttesters) {
    if (!ourTrustedAttesters.includes(verifiedCredential.attester)) {
      throw new Error(
        `The Credential was not issued by any of the trusted Attesters that the dApp relies on. \n List of trusted attesters: ${ourTrustedAttesters}`
      )
    }
  }

  console.log('Credential Successfully Verified!')

  return credential
}
