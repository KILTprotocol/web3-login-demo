import { getExtensions, apiWindow } from './utils/getExtension'

export async function startExtensionSession() {
  getExtensions()

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Saving the session values as a JSON-Web-Token on a Cookie of the browser
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // generate and get a JasonWebToken with session values from the backend:
  const serverSessionJWT = await fetch(`/api/session/start`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      accessControlAllowOrigin: '*',
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  if (!serverSessionJWT.ok) {
    throw Error(serverSessionJWT.statusText)
  }

  const payloadJWT = await serverSessionJWT.json()

  console.log('Plain text accompanying the Cookie (Payload of JWT)', payloadJWT)

  try {
    // destructure the payload:
    const { dAppName, dAppEncryptionKeyUri, challenge } = payloadJWT

    const extensionSession = await apiWindow.kilt.sporran.startSession(
      dAppName,
      dAppEncryptionKeyUri,
      challenge
    )
    console.log('the session was initialized (¬‿¬)')
    console.log('session being returned by the extension:', extensionSession)

    // Resolve the `session.encryptionKeyUri` and use this key and the nonce
    // to decrypt `session.encryptedChallenge` and confirm that it’s equal to the original challenge.
    // This verification must happen on the server-side.

    const responseToBackend = JSON.stringify({
      extensionSession,
      serverSession: payloadJWT
    })
    // console.log("responseToBackend", responseToBackend);
    await fetch(`/api/session/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json'
      },
      body: responseToBackend
    })

    return extensionSession
  } catch (error) {
    console.error(
      `Error verifying Session from:  ${apiWindow.kilt.sporran.name}: ${apiWindow.kilt.sporran.version},  ${error}`
    )
    throw error
  }
}
