import * as Kilt from '@kiltprotocol/sdk-js';
import fs from 'fs';
import path from 'path';
import generateKeypairs from '../backend/src/utils/attester/generateKeyPairs';
import { createCredential, createPresentation, selfAttestCredential, getDomainLinkagePresentation } from './wellKnownDIDConfiguration';
import dotenv from 'dotenv';
import generateAccount from '../backend/src/utils/attester/generateAccount';
import { getApi } from '../backend/src/utils/connection';

async function main() {

    // Fetch variables from .env file:
    dotenv.config();

    const dAppURI = process.env.ATTESTER_DID_URI as Kilt.DidUri ?? `did:kilt:4${'noURIEstablished'}` as Kilt.DidUri;
    const domainOrigin = process.env.ORIGIN ?? 'no origin assiged';
    const dAppMnemonic = process.env.ATTESTER_DID_MNEMONIC ?? 'your dApp needs an Identity ';
    const fundsMnemonic = process.env.ATTESTER_ACCOUNT_MNEMONIC ?? 'your dApp needs an Sponsor ';

    console.log("The enviorment variables in use are:");
    console.log("dAppURI", dAppURI);
    console.log("domainOrigin", domainOrigin);
    console.log("dAppMnemonic", dAppMnemonic);
    console.log("fundsMnemonic", fundsMnemonic, "\n");


    //Connect to the webSocket. This tells the Kilt Api to wich node to interact, and ergo also the blockchain (Spiritnet or Peregrine)
    let webSocket = process.env.WSS_ADDRESS;
    if (webSocket) {
        await Kilt.connect(webSocket);

    } else {
        throw new Error("You need to define, on the .env, the WebSocket you want to connect with.");
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // First Step: Create a Claim 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // The claim has to be based on the Domain Linkage CType. This CType is fetched from the Blockchain on './wellKnownDIDConfiguration' and imported here as cTypeDomeinLinkage

    const domainCredential = await createCredential(domainOrigin, dAppURI);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Second Step: Self-attesting the credential of this claim
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //A valid credential requires an attestation. Since the website wants to link itself to the DID just created, it has to self-attest the domain linkage credential, i.e., write the credential attestation on chain using the same DID it is trying to link to.

    const dAppsDidKeys = generateKeypairs(dAppMnemonic);
    const dappAccount = generateAccount(fundsMnemonic);

    await selfAttestCredential(domainCredential, dAppsDidKeys.assertionMethod, dappAccount);


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Third Step: Create a presentation for the attested credential
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // To use the newly attested credential, we need to derive a presentation from it to host on the dapp website.


    // We need the KeyId of the AssertionMethod Key. There is only
    // one AssertionMethodKey and its id is stored on the blockchain.
    const didResolveResult = await Kilt.Did.resolve(dAppURI);
    if (typeof didResolveResult?.document === 'undefined') {
        console.log("dAppURI", dAppURI);
        console.log("didResolveResult", didResolveResult);
        throw new Error('DID must be resolvable (i.e. not deleted)');
    }
    const assertionMethodKeyId = didResolveResult.document.assertionMethod![0].id;


    // to declare the SignCallBacks is a bit tricky. You either have to speficy the type of every return variable, or of the whole return.   

    // const presentationSignCallback = async ({ data }: any) => ({
    //     signature: assertionMethodKey.sign(data) as Uint8Array,
    //     keyUri: `${dAppURI}${assertionMethodKeyId}` as Kilt.DidResourceUri,
    //     keyType: assertionMethodKey.type as Kilt.DidVerificationKey['type']
    // });

    const presentationSignCallback = async ({ data }: any) => ({
        signature: dAppsDidKeys.assertionMethod.sign(data),
        keyUri: `${dAppURI}${assertionMethodKeyId}`,
        keyType: dAppsDidKeys.assertionMethod.type
    }) as Kilt.SignResponseData;

    const domainCredentialPresentation = await createPresentation(
        domainCredential,
        presentationSignCallback
    );


    const wellKnownDidconfig = await getDomainLinkagePresentation(domainCredentialPresentation);

    // disconnect from the blockchain API
    await Kilt.disconnect();

    console.log(JSON.stringify(wellKnownDidconfig, null, 2));

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Fourth Step: Host the presentation in your web App
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // __dirname is the folder where this file is; here 'scripts'

    const parentDirectory = path.dirname(__dirname);//  it roughly means “find me the parent path to the current path.”

    fs.writeFile(`${parentDirectory}/frontend/public/.well-known/did-configuration.json`, JSON.stringify(wellKnownDidconfig, null, 2), (err) => {
        if (err) throw err;
        console.log('Data written to file on the Front-End.');
    });


}

main().then(() => { });
