import * as Kilt from '@kiltprotocol/sdk-js';
import { queryFullDid } from '../backend/src/utils/utils';
import { generateKeypairs } from './attester/generateKeyPairs';
import createCompleteFullDid from "./createCompleteFullDid";
import { ctypeDomainLinkage } from './wellKnownDIDConfiguration';


// Fetch variables from .env file:
const dAppURI = process.env.ATTESTER_DID_URI as Kilt.DidUri || `did:kilt:4${'noURIEstablished'}` as Kilt.DidUri; // maybe createCompleFullDID(an account with money)
const domainOrigin = process.env.ORIGIN || 'no origin assiged';
const dAppMnemonic = process.env.ATTESTER_DID_MNEMONIC || 'failure';
const fundsMnemonic = process.env.ATTESTER_ACCOUNT_MNEMONIC || 'no Sugar Daddy';

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

// To get the keys, we query the full DID

const dAppDidDocument = await queryFullDid(dAppURI); //gets public DID document. here useless
//I need the did with the private keys as well





// We authorize the call using the attestation key of the Dapps DID.

//const assertionMethodKey = dAppDidDocument?.assertionMethod![0];
const assertionMethodKey = generateKeypairs(dAppMnemonic);

const dappAccount = new Kilt.Utils.Keyring().addFromMnemonic(fundsMnemonic) as Kilt.KiltKeyringPair;



if (assertionMethodKey) {
    const submitTx = await Kilt.Did.authorizeTx(
        dAppURI,
        attestationTx,
        async ({ data }) => ({
            signature: assertionMethodKey.sign(data),
            keyType: assertionMethodKey.type
        }),
        dappAccount.address
    );
} else {
    console.log("Failed to fetch my dApp's DID-Document");
}

// Since DIDs can not hold any balance, we pay for the transaction using our blockchain account
const result = await Kilt.Blockchain.signAndSubmitTx(submitTx, dappAccount);

if (result.isError) {
    console.log('Attestation failed');
} else {
    console.log('Attestation successful');
}