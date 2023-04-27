import { PubSubSessionV1, PubSubSessionV2 } from './utils/types'

export async function tryToLogIn(
  extensionSession: PubSubSessionV1 | PubSubSessionV2 | null
) {
  if (!extensionSession) {
    throw new Error(
      'No Extension Session Object found. Start the Server-Extension-Session first! '
    )
  }

  const encryptedCredentialRequest = await fetch(`/api/credential/getRequest`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      accessControlAllowOrigin: '*',
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  if (!encryptedCredentialRequest.ok) {
    throw Error(encryptedCredentialRequest.statusText)
  }

  console.log(await encryptedCredentialRequest.json())
}
