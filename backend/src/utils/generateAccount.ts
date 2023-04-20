import { mnemonicToMiniSecret } from '@polkadot/util-crypto'
import * as Kilt from '@kiltprotocol/sdk-js'

/**
 * Makes a KiltKeyringPair from a mnemonic.
 *
 * The WASM needs to be loaded before.
 * For that, use either 'Kilt.init()', 'Kilt.connect()' or getApi().
 *
 * @param mnemonic
 * @returns
 */
export function generateAccount(mnemonic: string): Kilt.KiltKeyringPair {
  // Currently, the default the key type used by the Kilt-team is "sr25519"
  // transform to a U8 Array.
  const mnemonicToU8A = mnemonicToMiniSecret(mnemonic)
  const account = Kilt.Utils.Crypto.makeKeypairFromSeed(
    mnemonicToU8A,
    'sr25519'
  )

  return account
}
