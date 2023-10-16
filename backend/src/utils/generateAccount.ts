import { mnemonicToMiniSecret } from '@polkadot/util-crypto'
import * as Kilt from '@kiltprotocol/sdk-js'

/**
 * Generates a KiltKeyringPair from a mnemonic.
 *
 * The WASM needs to be loaded before.
 * For that, use either 'Kilt.init()', 'Kilt.connect()' or 'getApi()'.
 *
 * @param mnemonic
 * @returns
 */
export function generateAccount(mnemonic: string): Kilt.KiltKeyringPair {
  const mnemonicToU8A = mnemonicToMiniSecret(mnemonic)
  const account = Kilt.Utils.Crypto.makeKeypairFromSeed(
    mnemonicToU8A,
    'ed25519'
  )

  return account
}
