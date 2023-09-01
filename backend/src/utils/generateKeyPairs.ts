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

  // This key is not necessary for this project:
  const capabilityDelegation = Kilt.Utils.Crypto.makeKeypairFromUri(
    mnemonic,
    signingKeyPairType
  )

  return {
    authentication,
    assertionMethod,
    keyAgreement,
    capabilityDelegation
  }
}
