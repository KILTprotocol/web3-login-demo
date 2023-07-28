import { Response, Request } from 'express'

import { emailRequest } from '../credentials/listOfRequests'
import { getRequestCredential } from '../credentials/getRequestCredential'
import { postSubmitCredential } from '../credentials/postSubmitCredential'

import { saveAccessOnCookie } from './saveAccessOnCookie'

// Here you can set which type of credential (cType) your dApp will request users to login.
// You can change it by importing a different one from the list.
const requestedCTypeForLogin = emailRequest

/** First half of the login with credentials */
export async function getLoginCredentialRequest(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const encryptedCredentialRequest = await getRequestCredential(
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

/** Second half of the login with credentials */
export async function postLoginSubmitCredential(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const verifiedCredential = await postSubmitCredential(
      request,
      response,
      requestedCTypeForLogin
    )

    // Send a little something to the frontend, so that the user interface can display who logged in.
    // "Email" is capitalized on this cType schema
    const plainUserInfo = verifiedCredential.claim.contents.Email

    console.log(
      'Plain User Info that we are passing to the frontend:',
      plainUserInfo
    )

    // From here on it's all like web2:

    // Please, replace/complete here with your websites method of encoding authentication tokens:
    const authenticationToken = plainUserInfo as string

    saveAccessOnCookie(authenticationToken, response)

    response.status(200).send(plainUserInfo)
  } catch (error) {
    const errorMessage = `Post Submit Credential Error. ${error}`
    console.log(errorMessage)
    response.status(420).send(errorMessage)
  }
}
