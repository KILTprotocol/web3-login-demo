import * as Kilt from '@kiltprotocol/sdk-js';
import { PubSubSessionV1, PubSubSessionV2 } from '../../../frontend/src/utils/types';
import generateKeypairs from '../utils/attester/generateKeyPairs';
import { getApi } from '../utils/connection';
import { Response, Request, NextFunction } from 'express';
import cache from 'memory-cache';



export async function generateSessionValues(request: Request, response: Response, next: NextFunction): Promise<void> {
    console.log("creating session Values");
    try {

        await getApi(); // connects to the websocket of your, in .env, specified blockchain

        const didUri = process.env.DAPP_DID_URI as Kilt.DidUri;
        const dAppName = process.env.DAPP_NAME ?? 'Your dApp Name';

        // console.log(`printing the didUri${didUri}`);
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

        console.log(sessionValues);
        cache.put(sessionID, sessionValues);

        response.status(200).send(sessionValues);
    } catch (error) {
        // print the possible error on the frontend
        next(error);
    }
}

export async function verifySession(request: Request, response: Response, next: NextFunction): Promise<void> {

    // check if I got something to verify
    if (!request.body) {
        throw new Error("Nothing to verify was passed.");
    }
    try {
        // console.log("request", request);
        console.log("aqui mmg", typeof request.body);
        console.log("body", request.body);
        // extract variables:
        const { extensionSession: session, serverSessionID } = JSON.parse(request.body);//request.body.json();
        const { encryptedChallenge, nonce } = session;
        // This varible has different name depending on the session version
        let encryptionKeyUri: Kilt.DidResourceUri;
        // if session is type PubSubSessionV1
        if ("encryptionKeyId" in session) {
            encryptionKeyUri = session.encryptionKeyId as Kilt.DidResourceUri;
        } else {
            // if session is type PubSubSessionV2
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
            throw new Error('Could not decode/decrypt the challange from the extension');
        }

        const decryptedChallenge = Kilt.Utils.Crypto.u8aToHex(decryptedBytes);
        const serverSession = cache.get(serverSessionID);
        const { challenge: originalChallenge } = serverSession;

        // Compare the decrypted challenge to the challenge you stored earlier.
        console.log(
            "originalChallenge: ", originalChallenge,
            "decrypted challenge: ", decryptedChallenge,
        );
        if (decryptedChallenge !== originalChallenge) {
            throw new Error('Invalid challenge');
        }
    } catch (err) {
        // print the possible error on the frontend
        next(err);
    }

    return;
}
