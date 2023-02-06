import { config as envConfig } from 'dotenv';

import { mnemonicGenerate } from '@polkadot/util-crypto';

import * as Kilt from '@kiltprotocol/sdk-js';

import generateAccount from './generateAccount';
import generateKeypairs from './generateKeyPairs';

export default async function createFullDid(
    submitterAccount: Kilt.KiltKeyringPair,
    mnemonic: string
): Promise<
    Kilt.DidDocument
> {
    const didMnemonic = mnemonic;
    // console.log("Mnemonic to generate this DID", didMnemonic);
    const { authentication, encryption, attestation, delegation } =
        generateKeypairs(didMnemonic);

    // Before submitting the transaction, it is worth it to assure that the did does not already exist. 
    // If the did aleady exist, the transaction will fail, but it will still costs the fee. Better to avoid this.
    try {
        const desiredDidUri = Kilt.Did.getFullDidUriFromKey(authentication);
        Kilt.Did.resolve(desiredDidUri);
    } catch (error) {
        throw new Error("this DID is already registered on chain");


    }

    // Get tx that will create the DID on chain and DID-URI that can be used to resolve the DID Document.
    const fullDidCreationTx = await Kilt.Did.getStoreTx(
        {
            authentication: [authentication],
            keyAgreement: [encryption],
            assertionMethod: [attestation],
            capabilityDelegation: [delegation]
        },
        submitterAccount.address,
        async ({ data }) => ({
            signature: authentication.sign(data),
            keyType: authentication.type
        })
    );

    await Kilt.Blockchain.signAndSubmitTx(fullDidCreationTx, submitterAccount);

    const didUri = Kilt.Did.getFullDidUriFromKey(authentication);
    const resolved = await Kilt.Did.resolve(didUri);
    if (!resolved) {
        throw new Error('Full DID could not be fetch from chain. A.K.A.: resolved');
    }
    const { document: didDocument } = resolved;


    // Alternative without the Did.resolve function
    // const api = Kilt.ConfigService.get('api');
    // const encodedFullDid = await api.call.did.query(Kilt.Did.toChain(didUri));
    // const { didDocument } = Kilt.Did.linkedInfoFromChain(encodedFullDid);


    if (!didDocument) {
        throw new Error('Full DID was not successfully created.');
    }

    return didDocument;
}

// Don't execute if this is imported by another file.
if (require.main === module) {
    ; (async () => {
        envConfig();

        try {
            await Kilt.connect(process.env.WSS_ADDRESS as string);

            // Load attester account
            const accountMnemonic = process.env.ATTESTER_ACCOUNT_MNEMONIC as string;
            const account = generateAccount(accountMnemonic);
            //const dAppMnemonic = process.env.ATTESTER_DID_MNEMONIC as string;

            // the DID can be generated by a different mnemonic than from the account. This is also the prefered option.
            // I could also pass a specific mnemonic, but here we generate a random mnemonic.
            const didMnemonic = mnemonicGenerate();
            const fullDid = await createFullDid(account, didMnemonic);

            console.log('\nsave following to .env to continue\n');
            console.error(`ATTESTER_DID_MNEMONIC=${didMnemonic}\n`);
            console.error(`ATTESTER_DID_URI=${fullDid.uri}\n`);


        } catch (e) {
            console.log('Error while creating attester DID');
            throw e;
        }
    })();
}