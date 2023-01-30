import * as Kilt from '@kiltprotocol/sdk-js';
import fs from 'fs';
import path from 'path';
import { SubmittableExtrinsic } from '@kiltprotocol/sdk-js';
import { queryFullDid } from '../backend/src/utils/utils';
import { generateKeypairs } from '../backend/src/utils/attester/generateKeyPairs';
import createCompleteFullDid from "./createCompleteFullDid";
import { ctypeDomainLinkage } from './wellKnownDIDConfiguration';
import dotenv from 'dotenv';
import { generateAccount } from '../backend/src/utils/attester/generateAccount';

async function main() {

    // Fetch variables from .env file:
    dotenv.config();

    const dAppURI = process.env.ATTESTER_DID_URI as Kilt.DidUri ?? `did:kilt:4${'noURIEstablished'}` as Kilt.DidUri; // maybe createCompleFullDID(an account with money)
    const domainOrigin = process.env.ORIGIN ?? 'no origin assiged';
    const dAppMnemonic = process.env.ATTESTER_DID_MNEMONIC ?? 'failure';
    const fundsMnemonic = process.env.ATTESTER_ACCOUNT_MNEMONIC ?? 'no Sugar Daddy';

    console.log("dAppURI", dAppURI);
    console.log("domainOrigin", domainOrigin);
    console.log("dAppMnemonic", dAppMnemonic);
    console.log("fundsMnemonic", fundsMnemonic, "\n");


    //Connect to the webSocket. This tells the Kilt Api to wich node to interact, and ergo also the blockchain (Spiritnet or Peregrine)
    let webSocket = process.env.WSS_ADDRESS;
    if (webSocket) {
        await Kilt.connect(webSocket);

    } else {
        throw new Error("You need to define on the .env the WebSocket you want to connect with.");
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // First Step: Create a Claim 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // The claim has to be based on the Domain Linkage CType. This CType is fetched from the Blockchain on './wellKnownDIDConfiguration' and imported here as cTypeDomeinLinkage

    const claimContents: Kilt.IClaimContents = {
        id: dAppURI,
        origin: domainOrigin
    };

    const claim = Kilt.Claim.fromCTypeAndClaimContents(
        ctypeDomainLinkage,
        claimContents,
        dAppURI
    );
    const domainLinkageCredential = Kilt.Credential.fromClaim(claim); // a credential with the claim. Not attested yet, ergo not valid. (Like saying: "I have a girlfriend in Canada", but nobody has ever seen her.)

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Second Step: Self-attesting the credential of this claim
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //A valid credential requires an attestation. Since the website wants to link itself to the DID just created, it has to self-attest the domain linkage credential, i.e., write the credential attestation on chain using the same DID it is trying to link to.

    const api = Kilt.ConfigService.get('api');

    const { cTypeHash, claimHash } = Kilt.Attestation.fromCredentialAndDid(
        domainLinkageCredential,
        dAppURI
    );

    const attestationTx = api.tx.attestation.add(claimHash, cTypeHash, null);

    // We need to get the Keypairs to be able to sing. Keypairs: public and private key. 

    const myKeys = generateKeypairs(dAppMnemonic);

    const dappAccount = generateAccount(fundsMnemonic);
    //const dappAccount = new Kilt.Utils.Keyring().addFromMnemonic(fundsMnemonic) as Kilt.KiltKeyringPair;

    // We authorize the call using the attestation key of the Dapps DID.

    const assertionMethodKey = myKeys.attestation;

    let submitTx: SubmittableExtrinsic;

    const signCallback = async ({ data }: any) => ({
        signature: assertionMethodKey.sign(data),
        keyType: assertionMethodKey.type
    });

    if (assertionMethodKey) {
        submitTx = await Kilt.Did.authorizeTx(
            dAppURI,
            attestationTx,
            signCallback,
            dappAccount.address
        );
    } else {
        console.log("Failed to fetch my dApp's DID-Document");
        throw new Error("Could not sing the self-attestation of the credential");

    }

    // Since DIDs can not hold any balance, we pay for the transaction using our blockchain account
    const result = await Kilt.Blockchain.signAndSubmitTx(submitTx, dappAccount);

    if (result.isError) {
        console.log('Attestation failed');
    } else {
        console.log('Attestation successful');
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Third Step: Create a presentation for the attested credential
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // To use the newly attested credential, we need to derive a presentation from it to host on the dapp website.


    // We need the KeyId of the AssertionMethod Key. There is only
    // one AssertionMethodKey and its id is stored on the blockchain.
    const didResolveResult = await Kilt.Did.resolve(dAppURI);
    if (typeof didResolveResult?.document === 'undefined') {
        throw new Error('DID must be resolvable (i.e. not deleted)');
    }
    const assertionMethodKeyId = didResolveResult.document.assertionMethod![0].id;

    const domainLinkagePresentation = await Kilt.Credential.createPresentation({
        credential: domainLinkageCredential,
        signCallback: async ({ data }) => ({
            signature: assertionMethodKey.sign(data),
            keyType: assertionMethodKey.type,
            keyUri: `${dAppURI}${assertionMethodKeyId}`
        })
    });

    // The Well-Known DID Configuration specification requires a verifiable credential. 
    // For now we have to manually convert our KILT credential into the required format.

    const credentialSubject = {
        ...domainLinkagePresentation.claim.contents,
        rootHash: domainLinkagePresentation.rootHash
    };

    const encodedAttestationDetails = await api.query.attestation.attestations(
        domainLinkagePresentation.rootHash
    );
    const issuer = Kilt.Attestation.fromChain(
        encodedAttestationDetails,
        domainLinkagePresentation.claim.cTypeHash
    ).owner;

    const issuanceDate = new Date().toISOString();

    const claimerSignature = domainLinkagePresentation.claimerSignature;
    if (!claimerSignature) {
        throw new Error('Claimer signature is required.');
    }

    const proof = {
        type: 'KILTSelfSigned2020',
        proofPurpose: 'assertionMethod',
        verificationMethod: claimerSignature.keyUri,
        signature: claimerSignature.signature,
        challenge: claimerSignature.challenge
    };

    const wellKnownDidconfig = {
        '@context': 'https://identity.foundation/.well-known/did-configuration/v1',
        linked_dids: [
            {
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://identity.foundation/.well-known/did-configuration/v1'
                ],
                issuer,
                issuanceDate,
                type: [
                    'VerifiableCredential',
                    'DomainLinkageCredential',
                    'KiltCredential2020'
                ],
                credentialSubject,
                proof
            }
        ]
    };

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
