import { mnemonicToMiniSecret } from '@polkadot/util-crypto'
import * as Kilt from '@kiltprotocol/sdk-js'

export function generateAccount(mnemonic: string): Kilt.KiltKeyringPair {
  // Currently, the default the key type used by the Kilt-team is "sr25519"
  // transform to a U8 Array.
  const mnemonicToU8A = mnemonicToMiniSecret(mnemonic)
  const account = Kilt.Utils.Crypto.makeKeypairFromSeed(
    mnemonicToU8A,
    'ed25519'
  )

  return account
}
