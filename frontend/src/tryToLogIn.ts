import { PubSubSessionV1, PubSubSessionV2 } from './utils/types'

export async function tryToLogIn(
  extensionSession: PubSubSessionV1 | PubSubSessionV2 | null
) {
  if (!extensionSession) {
    throw new Error(
      'No Extension Session Object found. Start the Server-Extension-Session first! '
    )
  }

  const getRequestResponse = await fetch(`/api/credential/getRequest`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      accessControlAllowOrigin: '*',
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  if (!getRequestResponse.ok) {
    throw Error(getRequestResponse.statusText)
  }

  const encryptedCredentialRequest = await getRequestResponse.json()
  console.log(
    `encryptedCredentialRequest gotten from the server: ${JSON.stringify(
      encryptedCredentialRequest,
      null,
      2
    )}`
  )

  // Now we can pass the message to the extension.
  // The encrypted Credential-Request is the message.

  extensionSession.send(await encryptedCredentialRequest)

  // Now the extension should ask the user to give a Credential fitting the requested cType.
}
