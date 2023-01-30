import * as Kilt from '@kiltprotocol/sdk-js';
import {
    CredentialSubject,
    DomainLinkageCredential,
    VerifiableDomainLinkagePresentation,
} from '../frontend/src/utils/types';
import * as validUrl from 'valid-url';

import { SelfSignedProof } from '@kiltprotocol/vc-export';
import { hexToU8a } from '@polkadot/util';

export const DEFAULT_VERIFIABLECREDENTIAL_TYPE = 'VerifiableCredential';
export const KILT_VERIFIABLECREDENTIAL_TYPE = 'KiltCredential2020';
export const KILT_SELF_SIGNED_PROOF_TYPE = 'KILTSelfSigned2020';
export const DID_CONFIGURATION_CONTEXT =
    'https://identity.foundation/.well-known/did-configuration/v1';
export const DID_VC_CONTEXT = 'https://www.w3.org/2018/credentials/v1';
export const KILT_CREDENTIAL_IRI_PREFIX = 'kilt:cred:';

export const ctypeDomainLinkage = Kilt.CType.fromProperties(
    'Domain Linkage Credential',
    {
        origin: {
            type: 'string',
        },
    }
);

export async function createCredential(
    origin: string,
    didUri: Kilt.DidUri
): Promise<Kilt.ICredential> {
    const fullDid = await Kilt.Did.resolve(didUri);

    if (!fullDid?.document) {
        throw new Error('No Did found: Please create a Full DID');
    }

    const { document } = fullDid;

    if (!validUrl.isUri(origin)) {
        throw new Error('The origin is not a valid url');
    }

    const domainClaimContents = {
        origin,
    };

    const claim = Kilt.Claim.fromCTypeAndClaimContents(
        ctypeDomainLinkage,
        domainClaimContents,
        document.uri
    );

    const credential = Kilt.Credential.fromClaim(claim);

    const assertionKey = document.assertionMethod?.[0];

    if (!assertionKey) {
        throw new Error(
            'Full DID doesnt have assertion key: Please add assertion key'
        );
    }

    return credential;
}

export async function createPresentation(credential: Kilt.ICredential, signCallback: Kilt.SignCallback): Promise<Kilt.ICredentialPresentation> {
    return Kilt.Credential.createPresentation({
        credential,
        signCallback,
    });
}

export async function getDomainLinkagePresentation(
    credentialPresentation: Kilt.ICredentialPresentation,
    expirationDate: string = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 365 * 5
    ).toISOString()
): Promise<VerifiableDomainLinkagePresentation> {
    const claimContents = credentialPresentation.claim.contents;
    if (!credentialPresentation.claim.owner && !claimContents.origin) {
        throw new Error('Claim do not content an owner or origin');
    }

    Kilt.Did.validateUri(credentialPresentation.claim.owner);

    const didUri = credentialPresentation.claim.owner;

    let origin: string;
    if (typeof claimContents.origin !== 'string') {
        throw new Error('claim contents origin is not a string');
    } else if (!validUrl.isUri(claimContents.origin)) {
        throw new Error('The claim contents origin is not a valid url');
    } else {
        origin = claimContents.origin;
    }

    const credentialSubject = {
        id: didUri,
        origin,
        rootHash: credentialPresentation.rootHash,
    };

    // assuere that the credential is self attested 
    const api = Kilt.ConfigService.get('api');
    const encodedAttestationDetails = await api.query.attestation.attestations(
        credentialPresentation.rootHash
    );
    const issuer = Kilt.Attestation.fromChain(
        encodedAttestationDetails,
        credentialPresentation.claim.cTypeHash
    ).owner;

    if (issuer !== didUri) {
        throw new Error('the well-known-did should be self attested.');
    }

    const issuanceDate = new Date().toISOString();

    const { claimerSignature, rootHash } = credentialPresentation;

    if (!claimerSignature) {
        throw new Error('Claimer signature is required.');
    }

    const id = rootHash;

    await Kilt.Did.verifyDidSignature({
        expectedVerificationMethod: 'assertionMethod',
        signature: hexToU8a(claimerSignature.signature),
        keyUri: claimerSignature.keyUri,
        message: Kilt.Utils.Crypto.coToUInt8(rootHash),
    });

    // add self-signed proof
    const proof: SelfSignedProof = {
        type: KILT_SELF_SIGNED_PROOF_TYPE,
        proofPurpose: 'assertionMethod',
        verificationMethod: claimerSignature.keyUri,
        signature: claimerSignature.signature,
        challenge: claimerSignature.challenge,
    };

    const wellKnownDidconfig = {
        '@context': DID_CONFIGURATION_CONTEXT,
        linked_dids: [
            {
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    DID_CONFIGURATION_CONTEXT,
                ],
                id,
                issuer: didUri,
                issuanceDate,
                expirationDate,
                type: [
                    DEFAULT_VERIFIABLECREDENTIAL_TYPE,
                    'DomainLinkageCredential',
                    KILT_VERIFIABLECREDENTIAL_TYPE,
                ],
                credentialSubject,
                proof,
            },
        ],
    } as VerifiableDomainLinkagePresentation;

    return wellKnownDidconfig;
}

async function asyncSome(
    credentials: DomainLinkageCredential[],
    verify: (credential: DomainLinkageCredential) => Promise<void>
) {
    await Promise.all(credentials.map((credential) => verify(credential)));
}

/**
 * A valid credential requires an attestation. 
 * Since the website wants to link itself to the DID just created, it has to self-attest the domain linkage credential, i.e., write the credential attestation on chain using the same DID it is trying to link to.
 * 
 * @param credential - Credential from the claim to be attested. 
 * @param attestationKey - Attestation Keypair from the DID of the dApp.
 * @param payerAccount - Account paying for the transaction (attestation)
 */
export async function selfAttestCredential(credential: Kilt.ICredential, attestationKey: Kilt.KiltKeyringPair, payerAccount: Kilt.KiltKeyringPair) {

    const api = Kilt.ConfigService.get('api');

    // In order to attest the credential we go through the following steps:

    // Step 1: calculating the claim hash

    const { cTypeHash, claimHash } = Kilt.Attestation.fromCredentialAndDid(
        credential,
        credential.claim.owner
    );

    // Step 2:  creating the attest transaction

    const attestationTx = api.tx.attestation.add(claimHash, cTypeHash, null);

    // Step 3: authorizing the transaction with your DID
    // We authorize the call using the attestation key of the Dapps DID.

    const assertionMethodKey = attestationKey; //just for you to see the two synonims.

    let submitTx: Kilt.SubmittableExtrinsic;

    const signCallback = async ({ data }: any) => ({
        signature: assertionMethodKey.sign(data),
        keyType: assertionMethodKey.type
    });

    // Step 4: paying for the transaction with a KILT account and submitting it to the chain

    try {
        submitTx = await Kilt.Did.authorizeTx(
            credential.claim.owner,
            attestationTx,
            signCallback,
            payerAccount.address
        );
    } catch (error) {
        console.log("Failed to fetch my dApp's DID-Document");
        throw new Error("Could not sing the self-attestation of the credential");

    }

    // Since DIDs can not hold any balance, we pay for the transaction using our blockchain account
    const result = await Kilt.Blockchain.signAndSubmitTx(submitTx, payerAccount);

    if (result.isError) {
        console.log('Attestation failed');
    } else {
        console.log('Attestation successful');
    }

}


export async function verifyDidConfigPresentation(
    didUri: Kilt.DidUri,
    domainLinkageCredential: VerifiableDomainLinkagePresentation,
    origin: string
): Promise<void> {
    // Verification steps outlined in Well Known DID Configuration
    // https://identity.foundation/.well-known/resources/did-configuration/#did-configuration-resource-verification

    await asyncSome(domainLinkageCredential.linked_dids, async (credential) => {
        const { issuer, credentialSubject, id } = credential;

        const matchesSessionDid = didUri === credentialSubject.id;
        if (!matchesSessionDid) throw new Error('session did doesnt match');

        Kilt.Did.validateUri(credentialSubject.id);
        const matchesIssuer = issuer === credentialSubject.id;
        if (!matchesIssuer) throw new Error('does not match the issuer');

        const matchesOrigin = origin === credentialSubject.origin;
        if (!matchesOrigin) throw new Error('does not match the origin');
        if (!validUrl.isUri(origin)) throw new Error('not a valid uri');

        const fullDid = await Kilt.Did.resolve(didUri);

        if (!fullDid?.document) {
            throw new Error('No Did found: Please create a Full DID');
        }

        const { document } = fullDid;

        if (!document?.assertionMethod?.[0].id) {
            throw new Error('No DID attestation key on-chain');
        }

        // Stripping off the prefix to get the root hash
        const rootHash = id;
        //const rootHash = fromCredentialIRI(id); //old

        await Kilt.Did.verifyDidSignature({
            expectedVerificationMethod: 'assertionMethod',
            signature: hexToU8a(credential.proof.signature),
            keyUri: credential.proof.verificationMethod as Kilt.DidResourceUri,
            message: Kilt.Utils.Crypto.coToUInt8(rootHash),
        });
    });
}