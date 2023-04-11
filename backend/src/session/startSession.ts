import * as Kilt from '@kiltprotocol/sdk-js'
import { Response, Request, NextFunction, CookieOptions } from 'express'
import jwt from 'jsonwebtoken'

import { getApi } from '../utils/connection'

// Define how the Session Values are packaged:
interface SessionValues {
  dAppName: string
  dAppEncryptionKeyUri: Kilt.DidResourceUri
  challenge: string
}

export async function generateSessionValues(
  didDocument: Kilt.DidDocument
): Promise<SessionValues> {
  // connects to the websocket of your, in '.env', specified blockchain
  await getApi()
  const dAppName = process.env.DAPP_NAME ?? 'Your dApp Name'

  // Build the EncryptionKeyUri so that the client can encrypt messages for us:
  const dAppEncryptionKeyUri =
    `${didDocument.uri}${didDocument.keyAgreement?.[0].id}` as Kilt.DidResourceUri

  if (typeof didDocument.keyAgreement === undefined) {
    throw new Error('This DID has no Key Agreement. Cannot encrypt like this.')
  }

  // Generate a challenge to ensure all messages we receive are fresh.
  // A UUID is a universally unique identifier, a 128-bit label. Here express as a string of a hexadecimal number.
  const challenge = Kilt.Utils.UUID.generate()

  const sessionValues = {
    dAppName: dAppName,
    dAppEncryptionKeyUri: dAppEncryptionKeyUri,
    challenge: challenge
  }

  console.log('sesssion Values just generated', sessionValues)

  return sessionValues
}

/**
 * Saving the session values as a JSON-Web-Token on a Cookie of the browser
 */
export async function startSession(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    // we use the DID-Document from the dApp fetched on server-start to generate our Session Values:
    const payload = await generateSessionValues(
      request.app.locals.dappDidDocument
    )
    const secretKey = process.env.JWT_SIGNER_SECRET
    if (!secretKey) {
      throw new Error(
        "Define a value for 'JWT_SIGNER_SECRET' on the '.env'-file first!"
      )
    }

    // Create a Json-Web-Token:
    const options = {
      expiresIn: '1d'
    }
    // default to algorithm: 'HS256',
    const token = jwt.sign(payload, secretKey, options)

    // Set cookie options (list of ingredients)
    const cookieOptions: CookieOptions = {
      // Indicates the number of seconds until the Cookie expires.
      maxAge: 60 * 60 * 24,
      // only send over HTTPS
      secure: true,
      // prevent cross-site request forgery attacks
      sameSite: 'strict',
      // restricts URL that can request the Cookie from the browser. '/' works for the entire domain.
      path: '/',
      // Forbids JavaScript from accessing the cookie
      httpOnly: true
    }

    // Set a Cookie in the header including the JWT and our options:
    // Using 'cookie-parser' deendency:
    response.cookie('sessionJWT', token, cookieOptions)

    console.log(
      'The JSON-Web-Token with Session Values generated by the backend is: \n',
      token
    )

    // send the Payload as plain text on the response, this facilitates the start of the extension session.
    response.status(200).send(payload)
  } catch (error) {
    // print the possible error on the frontend
    next(error)
    response
      .status(500)
      .send(`Could not set Cookie with session values. \n Error: ${error}.`)
  }
}