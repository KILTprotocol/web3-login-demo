import { getExtensions, apiWindow } from './utils/getExtension'

export async function startExtensionSession() {
  getExtensions()

  // generate a JSON-Web-Token with session values on the backend and save it on a Cookie on the Browser:
  const serverSessionStart = await fetch(`/api/session/start`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      accessControlAllowOrigin: '*',
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  if (!serverSessionStart.ok) {
    throw Error(serverSessionStart.statusText)
  }

  // At the start, we only want the Server Session Values (and they are only ones available)
  const plainPayload = (await serverSessionStart.json()).server

  if (!plainPayload) {
    throw new Error('Trouble generating session values on the backend.')
  }

  console.log('Plain text accompanying the Cookie "sessionJWT": ', plainPayload)

  try {
    // destructure the payload:
    const { dAppName, dAppEncryptionKeyUri, challenge } = plainPayload

    // Let the extension do the counterpart:
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

    const responseToBackend = JSON.stringify({ extensionSession })

    const sessionVerificationResponse = await fetch(`/api/session/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json'
      },
      body: responseToBackend
    })
    if (!sessionVerificationResponse.ok) {
      console.log('Session could not be verified.')
      return
    }

    console.log(
      'Session successfully verified. dApp-Server and Extension trust each other.'
    )
  } catch (error) {
    console.error(
      `Error verifying Session from:  ${apiWindow.kilt.sporran.name}: ${apiWindow.kilt.sporran.version},  ${error}`
    )
  }
}
