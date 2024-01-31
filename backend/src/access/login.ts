import { Response, Request } from 'express'

import { requestedCTypeForLogin } from '../credentials/listOfRequests'
import { buildCredentialRequest } from '../credentials/buildCredentialRequest'
import { verifySubmittedCredential } from '../credentials/verifySubmittedCredential'

import { setAccessCookie } from './setAccessCookie'


/** First half of the login with credentials.*/
export async function buildLoginCredentialRequest(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const encryptedCredentialRequest = await buildCredentialRequest(
      request,
      response,
      requestedCTypeForLogin
    )
    // With this, the extension will know what kind of credential to share
    response.status(200).send(encryptedCredentialRequest)
  } catch (error) {
    console.log('Get Request Credential Error.', error)
  }
}

/** Second half of the login with credentials. */
export async function handleLoginCredentialSubmission(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const verifiedCredential = await verifySubmittedCredential(
      request,
      response,
      requestedCTypeForLogin
    )

    // Send a little something to the frontend, so that the user interface can display who logged in.
    // The frontend can't read the encrypted credential; only the backend has the key to decrypt it.
    // "Email" is capitalized on this cType schema
    const plainUserInfo = verifiedCredential.claim.contents.Email

    console.log(
      'Decrypted User Info that we are passing to the frontend:',
      plainUserInfo
    )

    // From here on it's all like web2:

    // Please, replace/complete here with your websites method of encoding authentication tokens:
    const authenticationToken = plainUserInfo as string

    setAccessCookie(response, authenticationToken)

    response.status(200).send(plainUserInfo)
  } catch (error) {
    const errorMessage = `Post Submit Credential Error. ${error}`
    console.log(errorMessage)
    response.status(420).send(errorMessage)
  }
}
