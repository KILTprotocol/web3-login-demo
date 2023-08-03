import { IEncryptedMessage } from '@kiltprotocol/types'

import { Types } from 'kilt-extension-api'

export async function triggerLogin(
  extensionSession: Types.PubSubSessionV1 | Types.PubSubSessionV2 | null
): Promise<string> {
  if (!extensionSession) {
    throw new Error(
      'No Extension Session Object found. Start the Server-Extension-Session first! '
    )
  }

  const response = await fetch(`/api/credential/login/request`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  if (!response.ok) {
    throw Error(response.statusText)
  }

  const encryptedCredentialRequest = await response.json()
  console.log(
    `encryptedCredentialRequest gotten from the server: ${JSON.stringify(
      encryptedCredentialRequest,
      null,
      2
    )}`
  )

  // prepare to receive the credential from the extension

  // initialize so that typescript don't cry
  let extensionMessage: Types.IEncryptedMessageV1 | IEncryptedMessage = {
    receiverKeyId: 'did:kilt:4YourDecentralizedApp#publicKeyAgreement',
    senderKeyId: 'did:kilt:4someones#publicKeyAgreement',
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
    '/api/credential/login/submit',
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
  const responseText = await credentialVerificationResponse.text()

  if (!credentialVerificationResponse.ok) {
    throw new Error(
      `Login Failed. Error verifying the Credential. ${responseText}`
    )
  }

  const verifiedUserInfo = responseText

  console.log(
    'Decoded Information that the backend sent to the frontend after verifying the credential: ',
    verifiedUserInfo
  )

  console.log('Login process completed.')

  return verifiedUserInfo
}
