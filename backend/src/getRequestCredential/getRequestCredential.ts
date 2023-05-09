import * as Kilt from '@kiltprotocol/sdk-js'
import { randomAsHex } from '@polkadot/util-crypto'
import jwt from 'jsonwebtoken'

import { Request, Response } from 'express'

import { encryptionCallback } from '../utils/encryptionCallback'
import { generateKeypairs } from '../utils/generateKeyPairs'
import { readSessionCookie } from '../utils/readSessionCookie'

import { SessionValues, cookieOptions } from '../session/startSession'
import {
  DAPP_DID_MNEMONIC,
  DAPP_DID_URI,
  JWT_SIGNER_SECRET,
  emailRequest
} from '../../config'

export async function getRequestCredential(
  request: Request,
  response: Response
) {
  try {
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

    // It is encouraged that you customize your challenge creation
    const challenge = randomAsHex()

    const message = requestWrapper(
      emailRequest,
      challenge,
      claimerSessionDidUri
    )

    console.log(
      'the message with the Credential-Request before encryption: ',
      JSON.stringify(message, null, 2)
    )

    await saveChallengeOnCookie(challenge, response)

    const encryptedMessage = await encryptMessage(message, sessionValues)

    return response.send(encryptedMessage)
  } catch (error) {
    console.log('Get Request Credential Error.', error)
  }
}

/** Turns the Credential Request into a Kilt.Message.
 *  It also adds a challenge to the message for the claimer to signed.
 *  In this way, we make sure that the answer comes from who we asked.
 */
function requestWrapper(
  credentialRequest: Omit<Kilt.IRequestCredentialContent, 'challenge'>,
  challenge: string,
  receiverDidUri: Kilt.DidUri
): Kilt.IMessage {
  const messageBody: Kilt.IRequestCredential = {
    content: { ...credentialRequest, challenge },
    type: 'request-credential'
  }

  const message = Kilt.Message.fromBody(
    messageBody,
    DAPP_DID_URI,
    receiverDidUri
  )
  return message
}

/**
 * Protects from undesired readers.
 */
async function encryptMessage(
  message: Kilt.IMessage,
  sessionObject: SessionValues
): Promise<Kilt.IEncryptedMessage> {
  const { keyAgreement: ourKeyAgreementKeyPair } =
    generateKeypairs(DAPP_DID_MNEMONIC)

  if (!sessionObject.extension) {
    throw new Error(
      'Receivers Encryption Key needed in order to encrypt a message'
    )
  }

  const ourKeyIdentifier = sessionObject.server.dAppEncryptionKeyUri
  const theirKeyIdentifier = sessionObject.extension.encryptionKeyUri

  const cypheredMessage = await Kilt.Message.encrypt(
    message,
    encryptionCallback({
      keyAgreement: ourKeyAgreementKeyPair,
      keyAgreementUri: ourKeyIdentifier
    }),
    theirKeyIdentifier
  )

  return cypheredMessage
}

async function saveChallengeOnCookie(
  challengeOnRequest: string,
  response: Response
) {
  // Create a Json-Web-Token:
  // set the expiration of JWT same as the Cookie
  const optionsJwt = {
    expiresIn: `${cookieOptions.maxAge} seconds`
  }

  // default to algorithm: 'HS256'
  const token = jwt.sign({ challengeOnRequest }, JWT_SIGNER_SECRET, optionsJwt)

  // Set a Cookie in the header including the JWT and our options:
  // Using 'cookie-parser' dependency:
  response.cookie('credentialJWT', token, cookieOptions)

  console.log(
    "The Challenge included on the Credential-Request is now saved on the 'credentialJWT'-Cookie."
  )
}
