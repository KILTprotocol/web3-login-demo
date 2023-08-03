import { Response } from 'express'

import jwt from 'jsonwebtoken'

import { JWT_SIGNER_SECRET, cookieOptions } from '../config'

/**
 * Saves the authenticationToken as a JSON-Web-Token on a Cookie of the browser.
 * This allows us to keep track of who has already been granted access, after completing their login with credentials.
 *
 * Prevents needing to login on each site refresh.
 *
 * The cookie is called 'accessJWT'.
 */
export function setAccessCookie(
  response: Response,
  authenticationToken: string
) {
  // Create a Json-Web-Token:
  // set the expiration of JWT same as the Cookie
  const jwtOptions = {
    expiresIn: `${cookieOptions.maxAge} seconds`
  }

  const token = jwt.sign({ authenticationToken }, JWT_SIGNER_SECRET, jwtOptions)

  // Set a Cookie in the header including the JWT and our options:

  response.cookie('accessJWT', token, cookieOptions)

  console.log(
    "The user's authentication token has been saved on the 'accessJWT'-Cookie.\n"
  )

  // After saving 'accessJWT' we could actually delete the other cookies.
  // On this demo-App we leave them there to easier the understanding.
}
