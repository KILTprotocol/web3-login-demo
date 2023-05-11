import * as Kilt from '@kiltprotocol/sdk-js'

import { Request, Response } from 'express'

import { generateKeypairs } from '../utils/generateKeyPairs'
import { decryptionCallback } from '../utils/decryptionCallback'
import {
  DAPP_DID_MNEMONIC,
  JWT_SIGNER_SECRET,
  emailRequest
} from '../../config'
import { getApi } from '../utils/connection'
import { readCredentialCookie } from '../utils/readCredentialCookie'

export async function postSubmitCredential(
  request: Request,
  response: Response
) {
  try {
    const encryptedMessage = request.body
    console.log(
      `encrypted Message that the server obtained ${JSON.stringify(
        encryptedMessage,
        null,
        2
      )}`
    )
    const api = await getApi()

    const { keyAgreement } = generateKeypairs(DAPP_DID_MNEMONIC)
    const decryptedMessage = await Kilt.Message.decrypt(
      encryptedMessage,
      decryptionCallback(keyAgreement)
    )

    // Verifying this is a properly-formatted message
    Kilt.Message.verify(decryptedMessage)

    if (decryptedMessage.body.type !== 'submit-credential') {
      throw new Error(`Unexpected message type: ${decryptedMessage.body.type}`)
    }

    // FIX-ME!:  maybe allow for several credentials in the future
    const credential = decryptedMessage.body.content[0]

    console.log('Decrypted Credential being verify: \n', credential)

    // Know against what structure you want to compare to:
    const requestedCTypeID = emailRequest.cTypes[0].cTypeHash
    const requestedCTypeSkeleton = await Kilt.CType.fetchFromChain(
      `kilt:ctype:${requestedCTypeID}`
    )

    // The function Credential.verifyPresentation can check against a specific cType structure.
    // This cType needs to match the ICType-interface.
    // To fullfil this structure we need to remove the 'creator' and 'createdAt' properties from our fetched object.
    const { $id, $schema, title, properties, type } = requestedCTypeSkeleton
    const requestedCTypeSkeleton2 = { $id, $schema, title, properties, type }

    const challengeOnRequest = await readCredentialCookie(
      request,
      response,
      JWT_SIGNER_SECRET
    )

    await Kilt.Credential.verifyPresentation(credential, {
      challenge: challengeOnRequest,
      ctype: requestedCTypeSkeleton2
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

    //FIX-ME!: need to send the email to the frontend

    console.log('Credential Successfully Verified! User is logged in now.')

    response
      .status(200)
      .send(
        'Credential Successfully Verified!  The user is legitimate. ( ͡° ͜ʖ ͡°)'
      )
  } catch (error) {
    console.log('Post Submit Credential Error.', error)
  }
}
