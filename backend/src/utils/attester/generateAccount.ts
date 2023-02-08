import { config as envConfig } from 'dotenv';

import { mnemonicGenerate, mnemonicToMiniSecret } from '@polkadot/util-crypto';

import * as Kilt from '@kiltprotocol/sdk-js';

export default function generateAccount(mnemonic: string): Kilt.KiltKeyringPair {

    // console.log("mnemonic from generate Account", mnemonic);

    // Currently, the default the keytype used by the Kilt-team is "sr25519"
    const mnemonicToU8A = mnemonicToMiniSecret(mnemonic); //transform to a U8 Array. 
    const account = Kilt.Utils.Crypto.makeKeypairFromSeed(
        mnemonicToU8A, "sr25519"
    );

    return account;
}
