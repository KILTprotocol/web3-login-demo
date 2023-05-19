import path from 'path'

import dotenv from 'dotenv'

import * as Kilt from '@kiltprotocol/sdk-js'

import { generateAccount } from './utils/generateAccount'
import { generateKeyPairs } from './utils/generateKeyPairs'
import { fetchDidDocument } from './utils/fetchDidDocument'

// Letting the server know where the environment variables are
const backendDirectory = path.dirname(__dirname)
const projectRootDirectory = path.dirname(backendDirectory)
dotenv.config({ path: `${projectRootDirectory}/.env` })

export const BACKEND_PORT = process.env.BACKEND_PORT || 3000
export const WSS_ADDRESS = process.env.WSS_ADDRESS || 'wss://peregrine.kilt.io'
export const DAPP_DID_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string
export const DAPP_DID_URI = process.env.DAPP_DID_URI as Kilt.DidUri
export const DAPP_NAME = process.env.DAPP_NAME ?? 'Web3-Login-Demo'
export const DAPP_ACCOUNT_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string

export const JWT_SIGNER_SECRET = process.env.JWT_SIGNER_SECRET as string

export let DAPP_ACCOUNT_ADDRESS: string

/**  To avoid the possibility of having a mnemonic and account that don't match, the address is generated from the mnemonic each time.
 * @returns DAPP_ACCOUNT_ADDRESS
 */
async function deduceAccountAddress(): Promise<string> {
  await Kilt.init()
  const dAppAccount = generateAccount(DAPP_ACCOUNT_MNEMONIC)

  return dAppAccount.address
}

// async function validateOurDidUri() {
//   Kilt.Did.validateUri(DAPP_DID_URI, 'Did')
// Should it have something more on it??
// }

export async function validateEnvironmentConstants() {
  DAPP_ACCOUNT_ADDRESS = await deduceAccountAddress()
  Kilt.Did.validateUri(DAPP_DID_URI, 'Did')
  const ourDidDocumentOnChain = await fetchDidDocument()
  await validateOurKeys(ourDidDocumentOnChain)
}

/**
 * This function checks that the public keys linked to our DID on chain match the ones we generate now.
 *
 * This would fail if the keys derivation path has changed.
 *
 * If this fails, it means you can not sign or encrypt anything that could be verified or decrypted by your counterpart.
 *
 * @param didDocument
 */
async function validateOurKeys(didDocument: Kilt.DidDocument) {
  if (!DAPP_DID_MNEMONIC) {
    throw new Error("No mnemonic for your dApp's DID was found.")
  }

  const keyChain = generateKeyPairs(DAPP_DID_MNEMONIC)

  if (!didDocument.authentication) {
    throw new Error('No Key "authentication" for your DID found on chain.')
  }
  if (
    didDocument.authentication[0].publicKey !==
    keyChain.authentication.publicKey
  ) {
    throw new Error(
      'Public Key "authentication" do not match what we are generating.'
    )
  }

  if (!didDocument.keyAgreement) {
    throw new Error('No Key "keyAgreement" for your DID found on chain.')
  }
  if (
    didDocument.keyAgreement[0].publicKey !== keyChain.keyAgreement.publicKey
  ) {
    throw new Error(
      'Public Key "keyAgreement" do not match what we are generating.'
    )
  }

  if (!didDocument.assertionMethod) {
    throw new Error('No Key "assertionMethod" for your DID found on chain.')
  }
  if (
    didDocument.assertionMethod[0].publicKey !==
    keyChain.assertionMethod.publicKey
  ) {
    throw new Error(
      'Public Key "assertionMethod" do not match what we are generating.'
    )
  }

  // don't throw if capabilityDelegation is missing because it is not really necessary for this project
  if (!didDocument.capabilityDelegation) {
    console.log('No Key "capabilityDelegation" for your DID found on chain.')
  }

  if (
    didDocument.capabilityDelegation &&
    didDocument.capabilityDelegation[0].publicKey !==
      keyChain.capabilityDelegation.publicKey
  ) {
    console.log(
      'Public Key "capabilityDelegation" do not match what we are generating.'
    )
  }
}
