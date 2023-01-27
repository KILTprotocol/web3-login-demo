import * as Kilt from '@kiltprotocol/sdk-js';
import { generateKeypairs } from './attester/generateKeyPairs';
import createCompleteFullDid from './createCompleteFullDid';

// In order to have access to my private keys, from my Seed, I need to regenerate my Full DID with all Keypairs and the same derivation path as the first time. This time not uploading it to the blockchain. 

const dAppURI = process.env.ATTESTER_DID as Kilt.DidUri || `did:kilt:4${'noURIEstablished'}` as Kilt.DidUri; // maybe createCompleFullDID(an account with money)
const domainOrigin = process.env.ORIGIN || 'no origin assiged';
const dAppMnemonic = process.env.ATTESTER_DID_MNEMONIC || 'failure';
const endpoint = process.env.WSS_ADDRESS;

async function main() {
    // @ts-ignore
    await Kilt.connect(process.env.WSS_ADDRESS);

    const api = Kilt.ConfigService.get('api');
    //Kilt.Did.
    const myKeys = generateKeypairs(dAppMnemonic);

    // Try to decleare the object explixitly
    // const did: Kilt.DidDocument = {
    //     uri: Kilt.Did.getFullDidUriFromKey(myKeys.authentication),
    //     authentication: [myKeys.authentication],
    //     assertionMethod: [myKeys.attestation],
    //     capabilityDelegation: [myKeys.delegation],
    //     keyAgreement: [myKeys.encryption],
    // }

    const didUri = Kilt.Did.getFullDidUriFromKey(myKeys.authentication);
    const encodedFullDid = await api.call.did.query(Kilt.Did.toChain(didUri));

    console.log(encodedFullDid);
}
main().then(() => { });

