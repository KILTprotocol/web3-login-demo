import * as Kilt from '@kiltprotocol/sdk-js'

import * as validUrl from 'valid-url'

import { SelfSignedProof, constants } from '@kiltprotocol/vc-export'
import { hexToU8a } from '@polkadot/util'

import {
  CredentialSubject,
  DomainLinkageCredential,
  VerifiableDomainLinkagePresentation
} from './launchUtils/recycledUtils/preEnvironment'

// This constants are needed to create a credential and/or presentation.
// They are standard, an so it's better to fetch them from the @kiltprotocol/vc-export package, to keep them up to date.
// On the right it is comment the values used when this repository was made. They can change in the future (maybe your past).
export const DEFAULT_VERIFIABLECREDENTIAL_TYPE =
  constants.DEFAULT_VERIFIABLECREDENTIAL_TYPE
// 'VerifiableCredential';
export const KILT_VERIFIABLECREDENTIAL_TYPE =
  constants.KILT_VERIFIABLECREDENTIAL_TYPE
// 'KiltCredential2020';
export const KILT_SELF_SIGNED_PROOF_TYPE = constants.KILT_SELF_SIGNED_PROOF_TYPE
// 'KILTSelfSigned2020';
export const DID_CONFIGURATION_CONTEXT =
  'https://identity.foundation/.well-known/did-configuration/v1'
// this constant is not yet in the kilt-sdk
export const DID_VC_CONTEXT = constants.DEFAULT_VERIFIABLECREDENTIAL_CONTEXT
// 'https://www.w3.org/2018/credentials/v1';
export const KILT_CREDENTIAL_IRI_PREFIX = constants.KILT_CREDENTIAL_IRI_PREFIX
// 'kilt:cred:';

export const ctypeDomainLinkage = Kilt.CType.fromProperties(
  'Domain Linkage Credential',
  {
    origin: {
      type: 'string'
    },
    id: {
      type: 'string'
    }
  }
)

/**
 *  Creates credential for just one kind of Claim-Type: ctypeDomainLinkage.
 *
 * @param origin URL of the dApp. Domain of your site,
 * @param didUri URI of the dApp. Kilt Decentralized Identity string.
 * @returns Credential to present.
 */
export async function createCredential(
  origin: string,
  didUri: Kilt.DidUri
): Promise<Kilt.ICredential> {
  const fullDid = await Kilt.Did.resolve(didUri)

  if (!fullDid?.document) {
    throw new Error('No Did found: Please create a Full DID')
  }

  const { document } = fullDid

  if (document.uri !== didUri) {
    throw new Error('Trouble resolving the DID-URI')
  }

  if (!validUrl.isUri(origin)) {
    throw new Error('The origin is not a valid url')
  }

  const domainClaimContents = {
    origin
  }

  // Make sure that `ctypeDomainLinkage` contains the correct Domain Linkage CType.
  // Extensions expect this specific CTypes other CTypes will not be recognized.
  const cTypeUri =
    'kilt:ctype:0xb08800a574c436831a2b9fce00fd16e9df489b2b3695e88a0895d148eca0311e'
  if (ctypeDomainLinkage.$id !== cTypeUri) {
    console.log(
      'The following CType URI is not the expected one:',
      ctypeDomainLinkage.$id
    )
    console.log('Expected CType URI', cTypeUri)
    throw new Error('Wrong cType for creating a well-known-did-configuration.')
  }

  const claim = Kilt.Claim.fromCTypeAndClaimContents(
    ctypeDomainLinkage,
    domainClaimContents,
    didUri
  )

  const credential = Kilt.Credential.fromClaim(claim)

  // In order to later attest this credential, the DID needs an assertion key.
  // We assure that this is the case here:
  const assertionKey = document.assertionMethod?.[0]

  if (!assertionKey) {
    throw new Error(
      'Full DID doesnt have assertion key: Please add assertion key'
    )
  }

  return credential
}

export async function createPresentation(
  credential: Kilt.ICredential,
  signCallback: Kilt.SignCallback
): Promise<Kilt.ICredentialPresentation> {
  return Kilt.Credential.createPresentation({
    credential,
    signCallback
  })
}

export async function getDomainLinkagePresentation(
  credentialPresentation: Kilt.ICredentialPresentation,
  expirationDate: string = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 365 * 5
  ).toISOString()
): Promise<VerifiableDomainLinkagePresentation> {
  const {
    claim,
    rootHash: credentialRootHash,
    claimerSignature
  } = credentialPresentation
  // The owner of a claim is the issuer of it. It´s identified with its DID-URI.
  const { owner: issuerDidUri, contents: claimContents, cTypeHash } = claim
  const { origin: domainsOrigin } = claimContents
  const issuanceDate = new Date().toISOString()
  const api = Kilt.ConfigService.get('api')

  // check if the claim is up for the task
  if (!issuerDidUri) {
    throw new Error('Claim does not have an owner')
  }
  if (!domainsOrigin) {
    throw new Error('Claim do not content an origin')
  }
  if (!claimerSignature) {
    throw new Error('Claimer signature is required.')
  }

  // validateUri  validate if string is a valid DID Uri
  Kilt.Did.validateUri(issuerDidUri)

  // Make sure the origin is valid:
  if (typeof domainsOrigin !== 'string') {
    throw new Error('claim contents origin is not a string')
  }
  if (!validUrl.isUri(domainsOrigin)) {
    throw new Error('The claim contents origin is not a valid url')
  }

  // craft credential Subject
  const credentialSubject = {
    id: issuerDidUri,
    origin: domainsOrigin,
    rootHash: credentialRootHash
  } as CredentialSubject

  // assure that the credential is self attested
  const encodedAttestationDetails = await api.query.attestation.attestations(
    credentialRootHash
  )
  const attestation = Kilt.Attestation.fromChain(
    encodedAttestationDetails,
    cTypeHash
  )

  //the attestation owner is the issuer of the attestation
  if (attestation.owner !== issuerDidUri) {
    throw new Error('the well-known-did should be self attested.')
  }

  // preparing the input for the Did.verifySignature function. To make it more readable.
  // the signature and the message needs to be a Unit8 Array
  const encodedClaimerSignature = hexToU8a(claimerSignature.signature)
  const messageU8Array = Kilt.Utils.Crypto.coToUInt8(credentialRootHash)

  await Kilt.Did.verifyDidSignature({
    expectedVerificationMethod: 'assertionMethod',
    signature: encodedClaimerSignature,
    keyUri: claimerSignature.keyUri,
    message: messageU8Array
  })

  // add self-signed proof
  const proof: SelfSignedProof = {
    type: KILT_SELF_SIGNED_PROOF_TYPE,
    proofPurpose: 'assertionMethod',
    verificationMethod: claimerSignature.keyUri,
    signature: claimerSignature.signature,
    challenge: claimerSignature.challenge
  }

  const wellKnownDidConfig = {
    '@context': DID_CONFIGURATION_CONTEXT,
    linked_dids: [
      {
        '@context': [DID_VC_CONTEXT, DID_CONFIGURATION_CONTEXT],
        id: credentialRootHash,
        issuer: issuerDidUri,
        issuanceDate,
        expirationDate,
        type: [
          DEFAULT_VERIFIABLECREDENTIAL_TYPE,
          'DomainLinkageCredential',
          KILT_VERIFIABLECREDENTIAL_TYPE
        ],
        credentialSubject,
        proof
      }
    ]
  } as VerifiableDomainLinkagePresentation

  return wellKnownDidConfig
}

async function asyncSome(
  credentials: DomainLinkageCredential[],
  verify: (credential: DomainLinkageCredential) => Promise<void>
) {
  await Promise.all(credentials.map((credential) => verify(credential)))
}

/**
 * A valid credential requires an attestation.
 * Since the website wants to link itself to the DID just created, it has to self-attest the domain
 * linkage credential, i.e., write the credential attestation on chain using the same DID it is
 * trying to link to.
 *
 * @param credential - Credential from the claim to be attested.
 * @param assertionMethodKey - Attestation Keypair from the DID of the dApp.
 * @param submitterAccount - Account paying for the transaction (attestation)
 */
export async function selfAttestCredential(
  credential: Kilt.ICredential,
  assertionMethodKey: Kilt.KiltKeyringPair,
  submitterAccount: Kilt.KiltKeyringPair
) {
  const api = Kilt.ConfigService.get('api')

  // In order to attest the credential we go through the following steps:

  // Step 1: calculating the claim hash

  const { cTypeHash, claimHash } = Kilt.Attestation.fromCredentialAndDid(
    credential,
    credential.claim.owner
  )

  // Step 2:  creating the attest transaction

  const attestationTx = api.tx.attestation.add(claimHash, cTypeHash, null)

  // Step 3: authorizing the transaction with the dApps DID
  // We authorize the call using the attestation key of the dApps DID.

  let submitTx: Kilt.SubmittableExtrinsic

  const signCallback = async ({ data }: { data: string | Uint8Array }) => ({
    signature: assertionMethodKey.sign(data),
    keyType: assertionMethodKey.type
  })

  // Step 4: paying for the transaction with a KILT account and submitting it to the chain

  try {
    submitTx = await Kilt.Did.authorizeTx(
      credential.claim.owner,
      attestationTx,
      signCallback,
      submitterAccount.address
    )
  } catch (error) {
    throw new Error('Could not sing the self-attestation of the credential')
  }

  // Since DIDs can not hold any balance, we pay for the transaction using our blockchain account
  const result = await Kilt.Blockchain.signAndSubmitTx(
    submitTx,
    submitterAccount
  ).catch((reason) => {
    throw new Error(
      'Could not sing and submit transaction:' +
        JSON.stringify(reason, null, 2) +
        '\n' +
        'Make sure the keys saved on chain match the ones being derived from your mnemonic on this projects.'
    )
  })

  if (result?.isError) {
    throw new Error('Attestation failed')
  } else {
    console.log('Attestation successful')
  }
}

export async function verifyDidConfigPresentation(
  didUri: Kilt.DidUri,
  domainLinkageCredentialPresentation: VerifiableDomainLinkagePresentation,
  origin: string
): Promise<void> {
  // Verification steps outlined in Well Known DID Configuration
  // https://identity.foundation/.well-known/resources/did-configuration/#did-configuration-resource-verification

  console.log('Verifying a well-known-did-configuration presentation...')
  await asyncSome(
    domainLinkageCredentialPresentation.linked_dids,
    async (credential) => {
      const {
        issuer,
        credentialSubject,
        id: credentialRootHash,
        proof
      } = credential

      const matchesSessionDid = didUri === credentialSubject.id
      if (!matchesSessionDid) {
        throw new Error('session did does not match')
      }

      Kilt.Did.validateUri(credentialSubject.id)
      const matchesIssuer = issuer === credentialSubject.id
      if (!matchesIssuer) {
        throw new Error('does not match the issuer')
      }

      const matchesOrigin = origin === credentialSubject.origin
      if (!matchesOrigin) {
        throw new Error('does not match the origin')
      }
      if (!validUrl.isUri(origin)) {
        throw new Error('not a valid uri')
      }

      const fullDid = await Kilt.Did.resolve(didUri)

      if (!fullDid?.document) {
        throw new Error('No Did found: Please create a Full DID')
      }

      const { document } = fullDid

      if (!document?.assertionMethod?.[0].id) {
        throw new Error('No DID attestation key on-chain')
      }

      // preparing the input for the Did.verifySignature function. To make it more readable.
      // the signature and the message needs to be a Unit8 Array
      const encodedClaimerSignature = hexToU8a(proof.signature)
      const messageU8Array = Kilt.Utils.Crypto.coToUInt8(credentialRootHash)

      await Kilt.Did.verifyDidSignature({
        expectedVerificationMethod: 'assertionMethod',
        signature: encodedClaimerSignature,
        keyUri: proof.verificationMethod as Kilt.DidResourceUri,
        message: messageU8Array
      })
    }
  )
}
