import { mnemonicToMiniSecret } from '@polkadot/util-crypto';

import * as Kilt from '@kiltprotocol/sdk-js';

export default function generateKeypairs(mnemonic: string) {

    // Currently, the default the keytype used by the Kilt-team is "sr25519"
    const authentication = Kilt.Utils.Crypto.makeKeypairFromSeed(
        mnemonicToMiniSecret(mnemonic), "sr25519"
    ).derive('//did');
    const encryption = Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
        mnemonicToMiniSecret(mnemonic)
    );
    const assertionMethod = authentication.derive(
        '//attestation//0'
    ) as Kilt.KiltKeyringPair;

    // the delegation Keys are not needed for this project. 
    const capabilityDelegation = authentication.derive(
        '//delegation//0'
    ) as Kilt.KiltKeyringPair;

    const authentication0 = authentication.derive('//0') as Kilt.KiltKeyringPair;
    return {
        authentication: authentication0,
        keyAgreement: encryption,
        assertionMethod: assertionMethod,
        capabilityDelegation: capabilityDelegation
    };
}