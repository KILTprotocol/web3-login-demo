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
} from '../../configuration'

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
    console.log(
      `The CType-Request:  ${JSON.stringify(exampleRequest, null, 2)}`
    )

    //FIXME: Error handling for wrong JWT signature or no cookies needed.

    // read cookie from browser
    const sessionValues: SessionValues = (await readSessionCookie(
      request,
      response,
      JWT_SIGNER_SECRET
    )) as SessionValues

    if (!sessionValues.extension) {
      throw new Error(
        'Extension Session Values not found. Try restarting and verifying the server-extension-session.'
      )
    }

    // We need the encryptionKeyUri from the Extension
    const { did: claimerSessionDidUri } = Kilt.Did.parse(
      sessionValues.extension.encryptionKeyUri
    )

    const challenge = randomAsHex()
    const messageBody: Kilt.IRequestCredential = {
      content: { ...exampleRequest, challenge: challenge },
      type: 'request-credential'
    }

    const { keyAgreement } = generateKeypairs(DAPP_DID_MNEMONIC)

    const credentialRequest = Kilt.Message.fromBody(
      messageBody,
      DAPP_DID_URI,
      claimerSessionDidUri
    )

    const dAppKeyAgreementKeyId = request.app.locals.dappDidDocument
      ?.keyAgreement?.[0].id as `#${string}` | undefined

    if (!dAppKeyAgreementKeyId) {
      throw new Error('handle')
    }

    const encryptedMessage = await Kilt.Message.encrypt(
      credentialRequest,
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
