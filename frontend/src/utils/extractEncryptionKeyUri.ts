import * as Kilt from '@kiltprotocol/sdk-js'

/**
 * The EncryptionKeyURI has different name depending on the session version that the extension uses.
 * For practical reason, we ut this on a extra utility-function.
 *
 * @param extensionSession either PubSubSessionV1 or PubSubSessionV1
 * @returns encryptionKeyUri as Kilt.DidResourceUri
 */
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
