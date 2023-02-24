// import { useState, useEffect } from 'react';
// import { cryptoWaitReady, randomAsHex, signatureVerify } from '@polkadot/util-crypto';
import { getExtensions, apiWindow } from './utils/getExtension';
export async function startExtensionSession() {
    getExtensions();

    // generate and get session values from the backend:
    const sessionValues = await fetch(`/api/session`, {
        method: "GET", credentials: 'include', headers: {
            accessControlAllowOrigin: '*',
            ContentType: 'application/json',
            Accept: 'application/json',

        },
    });
    if (!sessionValues.ok) throw Error(sessionValues.statusText);

    const {
        sessionID,
        challenge,
        dAppName,
        dAppEncryptionKeyUri,
    } = await sessionValues.json();

    console.log(
        "Session Values fetched from the backend", '\n',
        "sessionId:", sessionID, '\n',
        "challenge:", challenge, '\n',
        "dAppName:", dAppName, '\n',
        "dAppEncryptionKeyUri:", dAppEncryptionKeyUri, '\n',
    );

    try {
        const session = await apiWindow.kilt.sporran.startSession(dAppName, dAppEncryptionKeyUri, challenge);
        console.log("the session was initialized :) (:  ");

        // Resolve the `session.encryptionKeyUri` and use this key and the nonce 
        // to decrypt `session.encryptedChallenge` and confirm that it’s equal to the original challenge.
        // This verification must happen on the server-side.

        return session;
    } catch (error) {
        console.error(`Error initializing ${apiWindow.kilt.sporran.name}: ${apiWindow.kilt.sporran.version}`);
        throw error;
    }

};