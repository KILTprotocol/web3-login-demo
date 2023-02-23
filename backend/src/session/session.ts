import * as Kilt from '@kiltprotocol/sdk-js';
import { getExtensions } from '../../../frontend/src/utils/getExtension';
import { PubSubSessionV1, PubSubSessionV2 } from '../../../frontend/src/utils/types';
import generateKeypairs from '../utils/attester/generateKeyPairs';
import { getApi } from '../utils/connection';


export default async function getSessionValues(): Promise<Object> {
    const api = await getApi();
    // const api = Kilt.ConfigService.get('api');

    const didUri = process.env.DAPP_DID_URI as Kilt.DidUri;
    const dAppName = process.env.DAPP_NAME ?? 'Your dApp Name';

    if (!didUri) throw new Error("enter your dApp's DID URI on the .env-file first");

    // fetch the DID document from the blockchain
    const resolved = await Kilt.Did.resolve(didUri);

    // Assure this did has a document on chain
    if (resolved === null) {
        throw new Error("DID could not be resolved");
    }
    if (!resolved.document) {
        throw new Error("No DID document could be fetched from your given dApps URI");
    }
    const didDocument = resolved.document;
    // If there the DID does not have any key agreement key, throw
    if (!didDocument.keyAgreement || !didDocument.keyAgreement[0]) {
        throw new Error("The DID of your dApp needs to have an Key Agreement to comunicate. Go get one and register in on chain.");
    }
    if (!didDocument.authentication || !didDocument.authentication[0]) {
        throw new Error("The DID of your dApp needs to have an authentification Key to sing stuff. Go get one and register in on chain.");
    }

    // this basiclly says how are you going to encrypt:
    const dAppEncryptionKeyUri =
        `${didUri}${didDocument.keyAgreement[0].id}` as Kilt.DidResourceUri;

    // Generate and store sessionID and challenge on the server side for the next step.
    // A UUID is a universally unique identifier, a 128-bit label. Here express as a string of a hexaheximal number.
    const sessionID = Kilt.Utils.UUID.generate();
    const challenge = Kilt.Utils.UUID.generate();

    const sessionValues = {
        sessionID: sessionID,
        dAppName: dAppName,
        dAppEncryptionKeyUri: dAppEncryptionKeyUri,
        challenge: challenge,
    };

    return sessionValues;

}

export async function verifySession(session: PubSubSessionV1 | PubSubSessionV2) {

    const { encryptedChallenge, nonce } = session;
    let encryptionKeyUri: Kilt.DidResourceUri;
    if ("encryptionKeyId" in session) { // if session is type PubSubSessionV1
        encryptionKeyUri = session.encryptionKeyId as Kilt.DidResourceUri;
    } else {
        encryptionKeyUri = session.encryptionKeyUri;
    }
    const encryptionKey = await Kilt.Did.resolveKey(encryptionKeyUri);
    if (!encryptionKey) {
        throw new Error('an encryption key is required');
    }

    // get your encryption Key, a.k.a. Key Agreement
    const dAppDidMnemonic = process.env.DAPP_DID_MNEMONIC;
    if (!dAppDidMnemonic) throw new Error("Enter your dApps mnemonic on the .env file");

    const { keyAgreement } = generateKeypairs(dAppDidMnemonic);

    const decryptedBytes = Kilt.Utils.Crypto.decryptAsymmetric(
        { box: encryptedChallenge, nonce },
        encryptionKey.publicKey,
        keyAgreement.secretKey // derived from your seed phrase
    );
    // If it fails to decrypt, return.
    if (!decryptedBytes) {
        throw new Error('Could not decode');
    }

    const decryptedChallenge = Kilt.Utils.Crypto.u8aToHex(decryptedBytes);

    // Compare the decrypted challenge to the challenge you stored earlier.
    if (decryptedChallenge) {
        throw new Error('Invalid challenge');
    }
    return session;
}
