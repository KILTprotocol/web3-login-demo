import { Response, Request } from 'express'

/**
 *
 *  This function deletes 'sessionJWT' Cookie from the browser.
 *
 * @param request
 * @param response
 */
export async function deleteSessionCookie(
  request: Request,
  response: Response
): Promise<void> {
  // read cookie from browser
  console.log('trying to delete the cookie via deleteSessionCookie()\n')
  const sessionJWT = request.cookies.sessionJWT
  if (!sessionJWT) {
    console.log('Cookie with Session JWT not found. Nothing to delete.')
    return
  }

  // delete the cookie from browser
  response.clearCookie('sessionJWT')

  console.log('Cookie "sessionJWT" deleted from clients browser.')
}
