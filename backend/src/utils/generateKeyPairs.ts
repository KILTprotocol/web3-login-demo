import * as Kilt from '@kiltprotocol/sdk-js'

const signingKeyPairType = 'ed25519'

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

  // This key is not necessary for this project.
  // for the sake of completeness, your dApp's DID also gets one
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
