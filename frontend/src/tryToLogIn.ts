import { extractEncryptionKeyUri } from './utils/extractEncryptionKeyUri'
import { PubSubSessionV1, PubSubSessionV2 } from './utils/types'

export async function tryToLogIn(
  extensionSession: PubSubSessionV1 | PubSubSessionV2 | null
) {
  if (!extensionSession) {
    throw new Error(
      'No Extension Session Values found. Start the Server-Extension-Session first! '
    )
  }

  // building an Object with the interesting values
  const { encryptedChallenge, nonce } = extensionSession
  const encryptionKeyUri = extractEncryptionKeyUri(extensionSession)
  const extensionSessionValues = {
    encryptedChallenge,
    encryptionKeyUri,
    nonce
  }

  const encryptedCredentialRequest = await fetch(`/api/credential/getRequest`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      accessControlAllowOrigin: '*',
      'Content-type': 'application/json',
      Accept: 'application/json',
      package: JSON.stringify(extensionSessionValues)
    }
  })
  if (!encryptedCredentialRequest.ok) {
    throw Error(encryptedCredentialRequest.statusText)
  }
}
