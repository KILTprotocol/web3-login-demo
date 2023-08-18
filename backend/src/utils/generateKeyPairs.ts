import * as Kilt from '@kiltprotocol/sdk-js'

const signingKeyPairType = 'sr25519'

export function generateKeyPairs(mnemonic: string) {
  const authentication = Kilt.Utils.Crypto.makeKeypairFromUri(
    mnemonic,
    signingKeyPairType
  )

  const assertionMethod = Kilt.Utils.Crypto.makeKeypairFromUri(
    mnemonic,
    signingKeyPairType
  )

  const keyAgreement = Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
    Kilt.Utils.Crypto.mnemonicToMiniSecret(mnemonic)
  )

  return {
    authentication,
    assertionMethod,
    keyAgreement
  }
}
