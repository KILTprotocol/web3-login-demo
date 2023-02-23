// import { useState, useEffect } from 'react';
// import { cryptoWaitReady, randomAsHex, signatureVerify } from '@polkadot/util-crypto';
// import { getApi } from '../../backend/src/utils/connection';
// import { getExtensions } from './utils/getExtension';


// export default function useSporran() {
//     const [sporran, setSporran] = useState(null);
//     const [session, setSession] = useState(null);
//     const [waiting, setWaiting] = useState(false);

//     // async function presentCredential() {
//     //     setWaiting(true);
//     //     if (!session) throw Error('start Session first');

//     //     const { sessionId } = session;
//     //     const result = await fetch(`/api/verify?sessionId=${sessionId}`);

//     //     const message = await result.json();
//     //     try {
//     //         console.log("inside sporran.js the message:", message);
//     //         await session.listen(async (message) => {
//     //             console.log("enter");
//     //             await fetch('/api/verify', {
//     //                 method: 'POST',
//     //                 headers: { ContentType: 'application/json' },
//     //                 body: JSON.stringify({ sessionId, message }),
//     //             });
//     //             // console.log("inside sporran,js result:", result)
//     //         }
//     //         );
//     //     } catch (e) { console.log(e); }

//     //     setWaiting(false);


//     //     await session.send(message);
//     // }

//     async function startSession() {
//         setWaiting(true);

//         //last try:
//         //await cryptoWaitReady();
//         console.log("starting session");
//         //await getApi();
//         //await connect("wss://peregrine.kilt.io/parachain-public-ws");

//         // generate and get session values from the backend:
//         const values = await fetch('/api/session', { method: "GET" });
//         if (!values.ok) throw Error(values.statusText);

//         const {
//             sessionId,
//             challenge,
//             dappName,
//             dAppEncryptionKeyUri,
//         } = await values.json();

//         console.log(
//             "awesome, the Sporran-hook is working!", '\n',
//             "sessionId:", sessionId, '\n',
//             "challenge:", challenge, '\n',
//             "dAppName:", dappName, '\n',
//             "dAppEncryptionKeyUri:", dAppEncryptionKeyUri, '\n',
//         );

//         const session = await window.kilt.sporran.startSession(dappName, dAppEncryptionKeyUri, challenge);
//         console.log("here is the stuff", session);

//         const valid = await fetch('/api/session', {
//             method: 'POST',
//             headers: { ContentType: 'application/json' },
//             body: JSON.stringify({ ...session, sessionId }),
//         });

//         if (!valid.ok) throw Error(valid.statusText); //it is stuck here

//         setWaiting(false);
//         setSession({ sessionId, ...session });
//     }

//     useEffect(() => {
//         const inState = !!sporran;
//         const inWindow = window.kilt && window.kilt.sporran;
//         if (!inState && inWindow) {
//             setSporran(window.kilt.sporran);
//         }

//         // probably need this somewhere: 
//         // meta: {
//         //   versions: {
//         //     credentials: '3.0'
//         //   }
//         // }

//         if (!inState) {
//             window.kilt = new Proxy({}, {
//                 set(target, prop, value) {
//                     if (prop === 'sporran') {
//                         setSporran(value);

//                     }
//                     return !!(target[prop] = value);
//                 }
//             });
//         }
//     });

//     return {
//         sporran,
//         session,
//         waiting,
//         startSession,
//         presentCredential,
//     };
// }