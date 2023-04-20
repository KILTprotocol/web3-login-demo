import * as Kilt from '@kiltprotocol/sdk-js'
import { randomAsHex } from '@polkadot/util-crypto'
import jwt from 'jsonwebtoken'

import { NextFunction, Request, Response } from 'express'

import { encryptionCallback } from '../utils/encryptionCallback'
import { generateKeypairs } from '../utils/generateKeyPairs'
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
    console.log('Request', request.body)
    console.log(exampleRequest)

    // Dudley's version, without cookies: // This wont work with the JWT:
    // const sessionValues = sessionStorage[request.body.sessionID]

    // read cookie from browser
    const sessionCookie = request.cookies.sessionJWT
    if (!sessionCookie) {
      response
        .status(401)
        .send(
          `Could not find Cookie with session values (as JWT). Log-in and try again.`
        )
      throw new Error(
        'Cookie with Session JWT not found. Enable Cookies, Log-in and try again.'
      )
    }

    // decode the JWT and verify if it was signed with our SecretKey
    let cookiePayloadServerSession: jwt.JwtPayload | string
    try {
      // will throw error if verification fails
      cookiePayloadServerSession = jwt.verify(sessionCookie, JWT_SIGNER_SECRET)
    } catch (error) {
      throw new Error(`Could not verify JWT. ${error}`)
    }
    if (typeof cookiePayloadServerSession === 'string') {
      throw new Error(
        `Payload of unexpected type. Content: ${cookiePayloadServerSession}`
      )
    }

    const sessionValues = cookiePayloadServerSession

    // We need the encryptionKeyUri from the Extension
    const { did: claimerSessionDidUri } = Kilt.Did.parse(
      sessionValues.encryptionKeyUri
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

    const dAppDid = await Kilt.Did.resolve(DAPP_DID_URI)

    const dAppKeyAgreementKeyId = dAppDid?.document?.keyAgreement?.[0].id

    if (!dAppKeyAgreementKeyId) {
      throw new Error('handle')
    }

    const encryptedMessage = Kilt.Message.encrypt(
      credentialRequest,
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
