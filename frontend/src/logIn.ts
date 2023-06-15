import { IEncryptedMessage } from '@kiltprotocol/types'

import {
  IEncryptedMessageV1,
  PubSubSessionV1,
  PubSubSessionV2
} from 'kilt-extension-api/dist/types/types'

export async function logIn(
  extensionSession: PubSubSessionV1 | PubSubSessionV2 | null
): Promise<string> {
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

  // prepare to receive the credential from the extension

  // initialize so that typescript don't cry
  let extensionMessage: IEncryptedMessageV1 | IEncryptedMessage = {
    receiverKeyId: 'did:kilt:4someones#publicKeyAgreement',
    senderKeyId: 'did:kilt:4YourDecentralizedApp#publicKeyAgreement',
    ciphertext: 'string',
    nonce: 'string'
  }

  await extensionSession.listen(async (message) => {
    extensionMessage = message
  })

  // Now we can pass the message to the extension.
  // Meaning, we can request the Credential.

  await extensionSession.send(encryptedCredentialRequest)
  // Now the extension should ask the user to give a Credential fitting the requested cType.

  // Send the Credential to the Backend to be verified
  const responseToBackend = JSON.stringify(extensionMessage)

  const credentialVerificationResponse = await fetch(
    '/api/credential/postSubmit',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json'
      },
      body: responseToBackend
    }
  )
  if (!credentialVerificationResponse.ok) {
    throw new Error('Login Failed. Error verifying the Credential.')
  }

  const verifiedUserInfo = await credentialVerificationResponse.text()
  console.log(
    'Decoded Information that the backend sent to the frontend after verifying the credential: ',
    verifiedUserInfo
  )

  return verifiedUserInfo
}