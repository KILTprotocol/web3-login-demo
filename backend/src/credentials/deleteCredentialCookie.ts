import { Response, Request } from 'express'

/**
 *
 *  This function deletes 'credentialJWT' Cookie from the browser.
 *
 * @param request
 * @param response
 */
export async function deleteCredentialCookie(
  request: Request,
  response: Response
): Promise<void> {
  // read cookie from browser
  console.log('trying to delete the cookie via deleteCredentialCookie()\n')
  const credentialCookie = request.cookies.credentialJWT
  if (!credentialCookie) {
    console.log(
      'Cookie with the Credential-Request (as JWT) not found. Nothing to delete.'
    )
    return
  }

  // delete the cookie from browser
  response.clearCookie('credentialJWT')

  console.log('Cookie "credentialJWT" deleted from clients browser.')
}
