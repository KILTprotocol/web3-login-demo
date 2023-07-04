import { Request, Response } from 'express'

import { JWT_SIGNER_SECRET } from '../config'

import { readAccessCookie } from './readAccessCookie'

/** Check if the user already logged in.
 *
 * Check if the browser already has a valid credential-JWT save on the cookies.
 *
 * @param request
 * @param response
 */
export async function alreadyLogin(request: Request, response: Response) {
  try {
    // "readAccessCookie" will throw if something is fishy
    const authenticationToken = await readAccessCookie(
      request,
      JWT_SIGNER_SECRET
    )

    // decode the authenticationToken here and wrap the info that the frontend should get
    const plainUserInfo = authenticationToken as string

    console.log(
      'Plain User Info that we are passing to the frontend, after access verification: ',
      plainUserInfo
    )
    response.status(200).send(plainUserInfo)
  } catch (error) {
    const failMessage = `No user is logged in yet. ${error}`
    console.log(failMessage)
    // The 204 (No Content) HTTP Status Code response should exclude a message-body
    response.status(204).send()
  }
}
