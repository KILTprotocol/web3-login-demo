import jwt from 'jsonwebtoken'
import { Response, Request } from 'express'

/**
 *  Mean to facilitate working with the JSON-Web-Token inside the Cookie.
 *  This function reads, decodes and verifies the 'credentialJWT' Cookie from the browser.
 *  Verification in this context means that it will check, that the JWT was signed with the dApp's secret pen (key).
 *
 *  Will throw an error if it fail one of it functions.
 *
 * @param request
 * @param response
 * @param secretKey The JWT secret signer (or pen).
 * @returns The decoded content of the Payload of the JWT. Here the challenge from the cType-Request.
 */
export async function readCredentialCookie(
  request: Request,
  response: Response,
  secretKey: string
): Promise<string> {
  // read cookie from browser
  console.log('trying to read the cookie via readCredentialCookie()\n')
  const credentialCookie = request.cookies.credentialJWT
  if (!credentialCookie) {
    response
      .status(401)
      .send(
        `Could not find Cookie with challenge of the Credential-Request (as JWT). Enable Cookies and try again.`
      )
    throw new Error(
      'Cookie with the Credential-Request (as JWT) not found. Enable Cookies and try again.'
    )
  }

  // decode the JWT and verify if it was signed with our SecretKey

  let cookieCredentialJWTPayload: jwt.JwtPayload | string
  try {
    // will throw error if verification fails
    cookieCredentialJWTPayload = jwt.verify(credentialCookie, secretKey)
  } catch (error) {
    throw new Error(`Could not verify JWT. ${error}`)
  }
  if (typeof cookieCredentialJWTPayload === 'string') {
    throw new Error(
      `Payload of unexpected type. Content: ${cookieCredentialJWTPayload}`
    )
  }

  const { challengeOnRequest } = cookieCredentialJWTPayload
  if (!challengeOnRequest) {
    throw new Error(
      'Challenge sent with the Credential-Request could not be extracted from the Cookie.'
    )
  }

  return challengeOnRequest
}
