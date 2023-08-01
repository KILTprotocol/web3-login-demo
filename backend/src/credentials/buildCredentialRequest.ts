import * as Kilt from '@kiltprotocol/sdk-js'
import { randomAsHex } from '@polkadot/util-crypto'

import { Request, Response } from 'express'

import { DAPP_DID_MNEMONIC, DAPP_DID_URI, JWT_SIGNER_SECRET } from '../config'

import { SessionValues } from '../utils/types'
import { encryptionCallback } from '../utils/encryptionCallback'
import { generateKeyPairs } from '../utils/generateKeyPairs'

import { readSessionCookie } from '../session/readSessionCookie'

import { setCredentialCookie } from './setCredentialCookie'

export async function buildCredentialRequest(
  request: Request,
  response: Response,
  cTypeRequest: Kilt.IRequestCredentialContent
): Promise<Kilt.IEncryptedMessage> {
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

  const message = requestWrapper(cTypeRequest, challenge, claimerSessionDidUri)

  console.log(
    'the message with the Credential-Request before encryption: ',
    JSON.stringify(message, null, 2)
  )

  setCredentialCookie(challenge, response)

  return await encryptMessage(message, sessionValues)
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
    generateKeyPairs(DAPP_DID_MNEMONIC)

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
