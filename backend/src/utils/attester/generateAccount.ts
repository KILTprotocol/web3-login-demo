import { config as envConfig } from 'dotenv';

import { mnemonicGenerate, mnemonicToMiniSecret } from '@polkadot/util-crypto';

import * as Kilt from '@kiltprotocol/sdk-js';

export function generateAccount(mnemonic: string): Kilt.KiltKeyringPair {

    //console.log("mnemonic from generate Account", mnemonic);
    // Currently, the default the keytype used by the Kilt-team is "sr25519"
    const mnemonicToU8A = mnemonicToMiniSecret(mnemonic); //transform to a U8 Array. 
    const account = Kilt.Utils.Crypto.makeKeypairFromSeed(
        mnemonicToU8A, "sr25519"
    );

    return account;
}

// Don't execute if this is imported by another file.
if (require.main === module) {
    ; (async () => {
        envConfig();

        try {
            await Kilt.init();

            const mnemonic = mnemonicGenerate();

            const account = generateAccount(mnemonic);
            console.log('save to mnemonic and address to .env to continue!\n\n');
            console.log(`ATTESTER_ACCOUNT_MNEMONIC="${mnemonic}"`);
            console.log(`ATTESTER_ACCOUNT_ADDRESS="${account.address}"\n\n`);
        } catch (e) {
            console.log('Error while setting up attester account');
            throw e;
        }
    })();
}