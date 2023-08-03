import * as Kilt from '@kiltprotocol/sdk-js'
import { Response, Request } from 'express'

import { getApi } from '../utils/connection'
import { DAPP_NAME } from '../config'
import { SessionValues } from '../utils/types'

import { setSessionCookie } from './setSessionCookie'

export async function generateSessionValues(
  didDocument: Kilt.DidDocument
): Promise<SessionValues> {
  // connects to the websocket of your, in '.env', specified blockchain
  await getApi()

  // Build the EncryptionKeyUri so that the client can encrypt messages for us:
  const dAppEncryptionKeyUri =
    `${didDocument.uri}${didDocument.keyAgreement?.[0].id}` as Kilt.DidResourceUri

  if (typeof didDocument.keyAgreement === undefined) {
    throw new Error('This DID has no Key Agreement. Cannot encrypt like this.')
  }

  // Generate a challenge to ensure all messages we receive are fresh.
  // A UUID is a universally unique identifier, a 128-bit label. Here expressed as a string of a hexadecimal number.
  // It is encourage that you personalize your challenge generation.
  const challenge = Kilt.Utils.UUID.generate()

  const sessionValues = {
    server: {
      dAppName: DAPP_NAME,
      dAppEncryptionKeyUri: dAppEncryptionKeyUri,
      challenge: challenge
    }
  }

  console.log('Session Values just generated', sessionValues)

  return sessionValues
}

/**
 * Saving the session values as a JSON-Web-Token on a Cookie of the browser
 */
export async function startSession(
  request: Request,
  response: Response
): Promise<void> {
  // we use the DID-Document from the dApp fetched on server-start to generate our Session Values:
  const serverSessionValues = await generateSessionValues(
    request.app.locals.dappDidDocument
  )

  setSessionCookie(serverSessionValues, response)

  // send the Payload as plain text on the response, this facilitates the start of the extension session by the frontend.
  response.status(200).send(serverSessionValues)
}
