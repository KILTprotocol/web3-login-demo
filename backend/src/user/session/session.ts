import * as Kilt from '@kiltprotocol/sdk-js';
import { getExtensions } from '../../../../frontend/src/utils/getExtension';
import { PubSubSessionV1, PubSubSessionV2 } from '../../../../frontend/src/utils/types';
import generateKeypairs from '../../utils/attester/generateKeyPairs';
import { getApi } from '../../utils/connection';


export default async function startSession() {
    const api = await getApi();
    // const api = Kilt.ConfigService.get('api');

    const did = process.env.DAPP_DID_URI as Kilt.DidUri;
    const dAppName = process.env.DAPP_NAME ?? 'Your dApp Name';

    if (!did) throw new Error("enter your dApp's DID URI on the .env-file first");

    const encodedFullDid = await api.call.did.query(Kilt.Did.toChain(did));
    const { didDocument } = Kilt.Did.linkedInfoFromChain(encodedFullDid);

    if (!didDocument) {
        throw new Error("No DID document could be fetched from your given dApps URI");
    }
    // If there is no DID, or the DID does not have any key agreement key, throw
    if (!didDocument.keyAgreement || !didDocument.keyAgreement[0]) {
        throw new Error("The DID of your dApp needs to have an Key Agreement to comunicate. Go get one and register in on chain.");
    }
    // this basiclly says how are you going to encrypt:
    const dAppEncryptionKeyUri =
        `${didDocument.uri}${didDocument.keyAgreement[0].id}` as Kilt.DidResourceUri;

    // Generate and store challenge on the server side for the next step.
    const response = await fetch('/challenge');
    const challenge = await response.text();

    const kiltedWindow = await getExtensions();

    const session = await kiltedWindow.kilt.sporran.startSession(
        dAppName,
        dAppEncryptionKeyUri,
        challenge
    );

    return session;
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
    if (decryptedChallenge !== originalChallenge) {
        throw new Error('Invalid challenge');
    }
    return session;
}
