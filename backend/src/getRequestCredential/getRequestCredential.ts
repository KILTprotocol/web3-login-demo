import * as Kilt from '@kiltprotocol/sdk-js'
import { randomAsHex } from '@polkadot/util-crypto'

import { NextFunction, Request, Response } from 'express'

import { encryptionCallback } from '../utils/encryptionCallback'
import { generateKeypairs } from '../utils/generateKeyPairs'
import { readSessionCookie } from '../utils/readSessionCookie'

import { SessionValues } from '../session/startSession'
import {
  DAPP_DID_MNEMONIC,
  DAPP_DID_URI,
  JWT_SIGNER_SECRET
} from '../../config'

// const exampleRequest: Kilt.IRequestCredentialContent = {
//   cTypes: [
//     {
//       cTypeHash:
//         '0x5366521b1cf4497cfe5f17663a7387a87bb8f2c4295d7c40f3140e7ee6afc41b',
//       trustedAttesters: [
//         'did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx' as Kilt.DidUri
//       ],
//       requiredProperties: ['name']
//     }
//   ]
// }

const emailRequest: Kilt.IRequestCredentialContent = {
  cTypes: [
    {
      cTypeHash:
        '0x3291bb126e33b4862d421bfaa1d2f272e6cdfc4f96658988fbcffea8914bd9ac',
      trustedAttesters: [
        'did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx' as Kilt.DidUri
      ],
      requiredProperties: ['Email']
    }
  ]
}

export async function getRequestCredential(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    console.log(`The CType-Request:  ${JSON.stringify(emailRequest, null, 2)}`)

    //FIXME: Error handling for wrong JWT signature or no cookies needed.

    // read cookie from browser
    const sessionValues: SessionValues = await readSessionCookie(
      request,
      response,
      JWT_SIGNER_SECRET
    )

    if (!sessionValues.extension) {
      throw new Error(
        'Extension Session Values not found. Try restarting and verifying the server-extension-session.'
      )
    }

    // We need the encryptionKeyUri from the Extension
    const { did: claimerSessionDidUri } = Kilt.Did.parse(
      sessionValues.extension.encryptionKeyUri
    )

    const message = requestEnveloper(emailRequest, claimerSessionDidUri)

    const { keyAgreement } = generateKeypairs(DAPP_DID_MNEMONIC)

    const dAppKeyAgreementKeyId = request.app.locals.dappDidDocument
      ?.keyAgreement?.[0].id as `#${string}` | undefined

    if (!dAppKeyAgreementKeyId) {
      throw new Error('handle')
    }

    const encryptedMessage = await Kilt.Message.encrypt(
      message,
      encryptionCallback({
        keyAgreement: keyAgreement,
        keyAgreementUri: `${DAPP_DID_URI}${dAppKeyAgreementKeyId}`
      }),
      sessionValues.extension.encryptionKeyUri
    )

    return response.send(encryptedMessage)
  } catch (error) {
    console.log('Get Request Credential Error.', error)
    next(error)
  }
}

/** Turns the Credential Request into a Kilt.Message.
 */
function requestEnveloper(
  credentialRequest: Kilt.IRequestCredentialContent,
  receiverDidUri: Kilt.DidUri
): Kilt.IMessage {
  const challenge = randomAsHex()
  const messageBody: Kilt.IRequestCredential = {
    content: { ...credentialRequest, challenge: challenge },
    type: 'request-credential'
  }

  const message = Kilt.Message.fromBody(
    messageBody,
    DAPP_DID_URI,
    receiverDidUri
  )
  return message
}
