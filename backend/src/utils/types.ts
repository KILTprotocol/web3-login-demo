import { DidUri, Hash } from '@kiltprotocol/types'
import {
  SelfSignedProof,
  VerifiableCredential,
  constants
} from '@kiltprotocol/vc-export'

const DEFAULT_VERIFIABLECREDENTIAL_CONTEXT =
  constants.DEFAULT_VERIFIABLECREDENTIAL_CONTEXT // 'https://www.w3.org/2018/credentials/v1';

export interface CredentialSubject {
  id: DidUri
  origin: string
  rootHash: Hash
}

const context = [
  DEFAULT_VERIFIABLECREDENTIAL_CONTEXT,
  'https://identity.foundation/.well-known/did-configuration/v1'
]
export interface DomainLinkageCredential
  extends Omit<
    VerifiableCredential,
    '@context' | 'legitimationIds' | 'credentialSubject' | 'proof'
  > {
  '@context': typeof context
  credentialSubject: CredentialSubject
  proof: SelfSignedProof
}

export interface VerifiableDomainLinkagePresentation {
  '@context': string
  linked_dids: [DomainLinkageCredential]
}
