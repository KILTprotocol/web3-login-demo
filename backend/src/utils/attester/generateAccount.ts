import { mnemonicToMiniSecret } from '@polkadot/util-crypto';
import * as Kilt from '@kiltprotocol/sdk-js';

export default function generateAccount(
  mnemonic: string
): Kilt.KiltKeyringPair {
  // console.log("mnemonic as input for generateAccount()", mnemonic);

  // Currently, the default the keytype used by the Kilt-team is "sr25519"
  const mnemonicToU8A = mnemonicToMiniSecret(mnemonic); //transform to a U8 Array.
  const account = Kilt.Utils.Crypto.makeKeypairFromSeed(
    mnemonicToU8A,
    'sr25519'
  );

  // // Alternative:
  // const keyring = new Kilt.Utils.Keyring({
  //     ss58Format: 38,
  //     type: 'sr25519'
  // });
  // const account = keyring.addFromMnemonic(mnemonic) as Kilt.KiltKeyringPair;

  // try loging it out:
  // console.log('acount', JSON.stringify(account, null, 2));

  return account;
}
