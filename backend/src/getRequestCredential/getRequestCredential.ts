import * as Kilt from '@kiltprotocol/sdk-js'
import { randomAsHex } from '@polkadot/util-crypto'
import { encryptionCallback } from '../utils/encryptionCallback'
import { NextFunction, Request, Response } from 'express'
import { generateKeypairs } from '../utils/generateKeyPairs'
import { sessionStorage } from '../utils/sessionStorage'

const exampleRequest: Kilt.IRequestCredentialContent = {
  cTypes: [
    {
      cTypeHash:
        '0x5366521b1cf4497cfe5f17663a7387a87bb8f2c4295d7c40f3140e7ee6afc41b',
      trustedAttesters: [
        'did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx' as Kilt.DidUri
      ],
      requiredProperties: ['name']
    }
  ]
}

export async function getRequestCredential(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    console.log('Request', JSON.parse(request.body))
    console.log(exampleRequest)

    const sessionValues = sessionStorage[request.body.sessionID]

    const { did: claimerSessionDidUri } = Kilt.Did.parse(
      sessionValues.encryptionKeyUri
    )

    const challenge = randomAsHex()
    const messageBody: Kilt.IRequestCredential = {
      content: { ...exampleRequest, challenge: challenge },
      type: 'request-credential'
    }

    const DAPP_DID_URI = process.env.DAPP_DID_URI as Kilt.DidUri
    const DAPP_DID_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string
    const { keyAgreement } = generateKeypairs(DAPP_DID_MNEMONIC)

    const message = Kilt.Message.fromBody(
      messageBody,
      DAPP_DID_URI,
      claimerSessionDidUri
    )

    const dAppDid = await Kilt.Did.resolve(DAPP_DID_URI)

    const dAppKeyAgreementKeyId = dAppDid?.document?.keyAgreement?.[0].id

    if (!dAppKeyAgreementKeyId) throw new Error('handle')

    const encryptedMessage = Kilt.Message.encrypt(
      message,
      encryptionCallback({
        keyAgreement: keyAgreement,
        keyAgreementUri: `${DAPP_DID_URI}${dAppKeyAgreementKeyId}`
      }),
      sessionValues.encryptionKeyUri
    )
    return response.send(encryptedMessage)
  } catch (error) {
    console.log('Get Request Credential Error', error)
    next(error)
  }
}
