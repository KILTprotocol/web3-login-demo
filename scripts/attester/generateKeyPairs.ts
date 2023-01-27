import { mnemonicGenerate, mnemonicToMiniSecret } from '@polkadot/util-crypto';

import * as Kilt from '@kiltprotocol/sdk-js';

export function generateKeypairs(mnemonic = mnemonicGenerate()) {

    // Currently, the default the keytype used by the Kilt-team is "sr25519"
    const authentication = Kilt.Utils.Crypto.makeKeypairFromSeed(
        mnemonicToMiniSecret(mnemonic), "sr25519"
    );
    const encryption = Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
        mnemonicToMiniSecret(mnemonic)
    );
    const attestation = authentication.derive(
        '//attestation'
    ) as Kilt.KiltKeyringPair;
    const delegation = authentication.derive(
        '//delegation'
    ) as Kilt.KiltKeyringPair;

    return {
        authentication,
        encryption,
        attestation,
        delegation
    };
}