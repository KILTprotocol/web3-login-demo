import jwt from 'jsonwebtoken'
import { Response, Request } from 'express'

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
): Promise<jwt.JwtPayload> {
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

  return cookieSessionJWTPayload
}
