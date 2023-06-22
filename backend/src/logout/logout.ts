import { Response, Request } from 'express'

import { deleteCredentialCookie } from '../credentials/deleteCredentialCookie'
import { deleteSessionCookie } from '../session/deleteSessionCookie'

export async function logout(
  request: Request,
  response: Response
): Promise<void> {
  // Activate whatever custom action your dApp's backend should do on users logout here.
  deleteCredentialCookie(request, response)
  deleteSessionCookie(request, response)
  response.status(200).send('User has been logged out.')
}
