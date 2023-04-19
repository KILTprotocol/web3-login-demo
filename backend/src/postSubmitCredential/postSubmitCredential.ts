import * as Kilt from '@kiltprotocol/sdk-js'

import { NextFunction, Request, Response } from 'express'

import { generateKeypairs } from '../utils/attester/generateKeyPairs'
import { decryptionCallback } from '../utils/decryptionCallback'
import { DAPP_DID_MNEMONIC } from '../../configuration'

export async function postSubmitCredential(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const { encryptedMessage } = request.body
    const api = Kilt.ConfigService.get('api')

    const { keyAgreement } = generateKeypairs(DAPP_DID_MNEMONIC)
    const decryptedMessage = await Kilt.Message.decrypt(
      encryptedMessage,
      decryptionCallback(keyAgreement)
    )

    if (decryptedMessage.body.type !== 'submit-credential') {
      throw new Error('Unexpected message type')
    }
    const credential = decryptedMessage.body.content[0]

    await Kilt.Credential.verifyPresentation(credential)

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

    response.send(200)
  } catch (error) {
    console.log('Post Submit Credential Error', error)
    next(error)
  }
}
