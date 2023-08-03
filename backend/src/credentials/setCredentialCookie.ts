import { Response } from 'express'

import jwt from 'jsonwebtoken'

import { JWT_SIGNER_SECRET, cookieOptions } from '../config'

/**
 * Saves the challenge from the credential-request as a JSON-Web-Token on a Cookie of the browser.
 * This is necessary for the credential verification.
 *
 * The cookie is called 'credentialJWT'.
 */
export function setCredentialCookie(
  challengeOnRequest: string,
  response: Response
) {
  // Create a Json-Web-Token:
  // set the expiration of JWT same as the Cookie
  const jwtOptions = {
    expiresIn: `${cookieOptions.maxAge} seconds`
  }

  const token = jwt.sign({ challengeOnRequest }, JWT_SIGNER_SECRET, jwtOptions)

  // Set a Cookie in the header including the JWT and our options:

  response.cookie('credentialJWT', token, cookieOptions)

  console.log(
    "The Challenge included on the Credential-Request is now saved on the 'credentialJWT'-Cookie."
  )
}
