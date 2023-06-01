import { Response, Request } from 'express'

import { deleteCredentialCookie } from '../credentials/deleteCredentialCookie'
import { deleteSessionCookie } from '../session/deleteCredentialCookie'

export async function logout(
  request: Request,
  response: Response
): Promise<void> {
  deleteCredentialCookie(request, response)
  deleteSessionCookie(request, response)
  response.status(200).send('User has been logged out.')
}
