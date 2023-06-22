import jwt from 'jsonwebtoken'
import { Request } from 'express'

/**
 *  Mean to facilitate working with the JSON-Web-Token inside the Cookie.
 *  This function reads, decodes and verifies the 'accessJWT' Cookie from the browser.
 *  Verification in this context means that it will check, that the JWT was signed with the dApp's secret pen (key).
 *
 *  Will throw an error if it fail one of it functions.
 *
 * @param request
 * @param response
 * @param secretKey The JWT secret signer (or pen).
 * @returns The decoded content of the Payload of the JWT. Here the user's authentication token.
 */
export async function readAccessCookie(
  request: Request,
  secretKey: string
): Promise<string> {
  // read cookie from browser
  console.log(
    'trying to read the cookie via readAccessCookie().\n Users with access already granted would have there authentication token here.'
  )
  const accessCookie = request.cookies.accessJWT
  if (!accessCookie) {
    throw new Error('Cookie with the access token (as JWT) not found. ')
  }

  // decode the JWT and verify if it was signed with our SecretKey

  let cookieAccessJWTPayload: jwt.JwtPayload | string
  try {
    // will throw error if verification fails
    cookieAccessJWTPayload = jwt.verify(accessCookie, secretKey)
  } catch (error) {
    throw new Error(`Could not verify JWT. ${error}`)
  }
  if (typeof cookieAccessJWTPayload === 'string') {
    throw new Error(
      `Payload of unexpected type. Content: ${cookieAccessJWTPayload}`
    )
  }

  const { authenticationToken } = cookieAccessJWTPayload
  if (!authenticationToken) {
    throw new Error('No authentication Token found. ')
  }

  return authenticationToken
}
