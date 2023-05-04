import * as Kilt from '@kiltprotocol/sdk-js'

import jwt from 'jsonwebtoken'
import { Response, Request } from 'express'

import { SessionValues } from '../session/startSession'
/**
 *  Mean to facilitate working with JSON-Web-tokens inside the Cookie.
 *  This function reads, decodes and verifies the 'sessionJWT' Cookie from the browser.
 *  Verification in this context means that it will check, that the JWT was signed with the dApp's secret pen (key).
 *
 *  Will throw an error if it fail one of it functions.
 *
 * @param request
 * @param response
 * @param secretKey The JWT secret signer (or pen).
 * @returns The decoded content of the Payload of the JWT.
 */
export async function readSessionCookie(
  request: Request,
  response: Response,
  secretKey: string
): Promise<SessionValues> {
  // read cookie from browser
  console.log('trying to read the cookie via readSessionCookie()\n')
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

  let cookieSessionJWTPayload: jwt.JwtPayload | string
  try {
    // will throw error if verification fails
    cookieSessionJWTPayload = jwt.verify(sessionCookie, secretKey)
  } catch (error) {
    throw new Error(`Could not verify JWT. ${error}`)
  }
  if (typeof cookieSessionJWTPayload === 'string') {
    throw new Error(
      `Payload of unexpected type. Content: ${cookieSessionJWTPayload}`
    )
  }

  // now make sure that the payload is carrying our type of SessionValues

  // extract the session.server and session.extension Objects from payload
  const { server, extension } = cookieSessionJWTPayload
  if (!server) {
    throw new Error(
      'Server Session Values could not be extracted from the Cookie.'
    )
  }

  checkSessionValuesTypes(server, extension)

  // after our check, we can cast the Object as SessionValues with a clean conscience
  const sessionObject = { server, extension } as SessionValues
  return sessionObject
}

/**
 * Checks that types fits the SessionValues Interface
 *
 * Will throw if any property does not matches expectation.
 * @param server -- session.server Object
 * @param extension -- session.extension Object (optional)
 */
function checkSessionValuesTypes(
  server: Record<string, unknown>,
  extension?: Record<string, unknown>
) {
  // Cheek the session.server:

  if (typeof server !== 'object' || server === null) {
    throw new Error(
      'The server session values are not packed in an Object as expected. '
    )
  }

  // try to replace with for...in loop

  for (const property of ['dAppName', 'challenge']) {
    if (!(property in server)) {
      throw new Error(
        `Property '${property}' of session.server Object could not be found.`
      )
    }
    if (!(typeof server[property] == 'string')) {
      throw new Error(
        `Property '${property}' of session.server Object should be of type 'string'.
         Instead it is of type: ${typeof server[property]}`
      )
    }
  }

  if ('dAppEncryptionKeyUri' in server) {
    Kilt.Did.validateUri(server.dAppEncryptionKeyUri, 'ResourceUri')
  } else {
    throw new Error(
      "Property 'dAppEncryptionKeyUri' of session.server could not be found"
    )
  }

  // if the extension session values are not there yet, stop here.
  if (!extension) {
    return
  }

  // Check the session.extension

  if (typeof extension !== 'object' || extension === null) {
    throw new Error(
      'The extension session values are not packed in an Object as expected. '
    )
  }

  for (const property of ['encryptedChallenge', 'nonce']) {
    if (!(property in extension)) {
      throw new Error(
        `Property '${property}' of session.server Object could not be found.`
      )
    }
    if (!(typeof extension[property] == 'string')) {
      throw new Error(
        `Property '${property}' of session.server Object should be of type 'string'.
         Instead it is of type: ${typeof extension[property]}`
      )
    }
  }

  if ('encryptionKeyUri' in extension) {
    Kilt.Did.validateUri(extension.encryptionKeyUri, 'ResourceUri')
  } else {
    throw new Error(
      "Property 'encryptionKeyUri' of session.extension could not be found"
    )
  }

  // if nothing threw until here you are good to go
}
