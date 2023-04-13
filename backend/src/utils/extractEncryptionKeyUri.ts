import * as Kilt from '@kiltprotocol/sdk-js'

export function extractEncryptionKeyUri(
  extensionSession: unknown
): Kilt.DidResourceUri {
  if (typeof extensionSession !== 'object' || !extensionSession) {
    throw new Error(
      `Not the type of variable expected. This function can only handle either "PubSubSessionV1" or "PubSubSessionV2"`
    )
  }

  let encryptionKeyUri: Kilt.DidResourceUri
  // if session is type PubSubSessionV1
  if ('encryptionKeyId' in extensionSession) {
    encryptionKeyUri = extensionSession.encryptionKeyId as Kilt.DidResourceUri
    // Version 1 had a misleading name for this variable
  } else if ('encryptionKeyUri' in extensionSession) {
    // if session is type PubSubSessionV2
    encryptionKeyUri = extensionSession.encryptionKeyUri as Kilt.DidResourceUri
  } else {
    throw new Error(`encryptionKeyUri or encryptionKeyId not found`)
  }
  return encryptionKeyUri
}
