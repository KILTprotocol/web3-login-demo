import { useState, useEffect } from 'react';
import { cryptoWaitReady, randomAsHex, signatureVerify } from '@polkadot/util-crypto';
import { getApi } from '../../backend/src/utils/connection';
import { getExtensions, apiWindow } from './utils/getExtension';

async function startExtensionSession() {
    const api = await getApi();
    getExtensions();

    // generate and get session values from the backend:
    const values = await fetch('/api/session', { method: "GET" });
    if (!values.ok) throw Error(values.statusText);

    const {
        sessionId,
        challenge,
        dAppName,
        dAppEncryptionKeyUri,
    } = await values.json();

    console.log(
        "Values fetched from the backend", '\n',
        "sessionId:", sessionId, '\n',
        "challenge:", challenge, '\n',
        "dAppName:", dAppName, '\n',
        "dAppEncryptionKeyUri:", dAppEncryptionKeyUri, '\n',
    );

    try {
        const session = await apiWindow.kilt.sporran.startSession(dAppName, dAppEncryptionKeyUri, challenge);

        // Resolve the `session.encryptionKeyUri` and use this key and the nonce 
        // to decrypt `session.encryptedChallenge` and confirm that it’s equal to the original challenge.
        // This verification must happen on the server-side.

        return session;
    } catch (error) {
        console.error(`Error initializing ${apiWindow.kilt.sporran.name}: ${apiWindow.kilt.sporran.message}`);
        throw error;
    }

}