import path from 'path'
import fs from 'fs'

import dotenv from 'dotenv'

import * as Kilt from '@kiltprotocol/sdk-js'
import { u8aEq } from '@polkadot/util'

import { generateAccount } from './utils/generateAccount'
import { generateKeyPairs } from './utils/generateKeyPairs'
import { fetchDidDocument } from './utils/fetchDidDocument'
import { VerifiableDomainLinkagePresentation } from './utils/types'
import { getApi } from './utils/connection'

// Letting the server know where the environment variables are.
// Since we are inside a monorepo, the `.env` file is not part of this package, but of the parent directory of this package; the root's directory.
const envPath = path.resolve(__dirname, '../..', '.env')
dotenv.config({ path: envPath })

export const WSS_ADDRESS = process.env.WSS_ADDRESS || 'wss://peregrine.kilt.io'
export const BACKEND_PORT = process.env.BACKEND_PORT || 3000
export const DAPP_ACCOUNT_MNEMONIC = process.env.DAPP_ACCOUNT_MNEMONIC as string
export const DAPP_DID_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string
export const DAPP_DID_URI = process.env.DAPP_DID_URI as Kilt.DidUri
export const DAPP_NAME = process.env.DAPP_NAME ?? 'Web3-Login-Demo'
export const JWT_SIGNER_SECRET = process.env.JWT_SIGNER_SECRET as string

export let DAPP_ACCOUNT_ADDRESS: string

export async function validateEnvironmentConstants() {
  assertThatAllEnvisAreThere()
  await getApi()
  DAPP_ACCOUNT_ADDRESS = await deduceAccountAddress()
  Kilt.Did.validateUri(DAPP_DID_URI, 'Did')
  const ourDidDocumentOnChain = await fetchDidDocument()
  await validateOurKeys(ourDidDocumentOnChain)
  await corroborateMyIdentity(DAPP_DID_URI)
}
/**
 * Checks if all the necessary environment constants where defined.
 *
 * Throws an error if a constant is `falsy`.
 */
function assertThatAllEnvisAreThere() {
  // Do you have all cups on the shelf?
  const shelf: { [key: string]: string | number | undefined } = {
    WSS_ADDRESS,
    BACKEND_PORT,
    DAPP_ACCOUNT_MNEMONIC,
    DAPP_DID_MNEMONIC,
    DAPP_DID_URI,
    DAPP_NAME,
    JWT_SIGNER_SECRET
  }
  for (const cup in shelf) {
    if (!shelf[cup]) {
      throw new Error(
        `Environment constant '${cup}' is missing. Define it on the project's root directory '.env'-file. \n`
      )
    }
  }
}

/**  To avoid the possibility of having a mnemonic and account that don't match, the address is generated from the mnemonic each time.
 * @returns DAPP_ACCOUNT_ADDRESS
 */
async function deduceAccountAddress(): Promise<string> {
  const dAppAccount = generateAccount(DAPP_ACCOUNT_MNEMONIC)
  return dAppAccount.address
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
  const localKeyPairs = generateKeyPairs(DAPP_DID_MNEMONIC)

  if (!didDocument.authentication) {
    throw new Error('No Key "authentication" for your DID found on chain.')
  }
  if (
    !u8aEq(
      didDocument.authentication[0].publicKey,
      localKeyPairs.authentication.publicKey
    )
  ) {
    throw new Error(
      'Public Key "authentication" on chain does not match what we are generating.'
    )
  }

  if (!didDocument.keyAgreement) {
    throw new Error('No Key "keyAgreement" for your DID found on chain.')
  }
  if (
    !u8aEq(
      didDocument.keyAgreement[0].publicKey,
      localKeyPairs.keyAgreement.publicKey
    )
  ) {
    throw new Error(
      'Public Key "keyAgreement" on chain does not match what we are generating.'
    )
  }

  if (!didDocument.assertionMethod) {
    throw new Error('No Key "assertionMethod" for your DID found on chain.')
  }
  if (
    !u8aEq(
      didDocument.assertionMethod[0].publicKey,
      localKeyPairs.assertionMethod.publicKey
    )
  ) {
    throw new Error(
      'Public Key "assertionMethod" on chain does not match what we are generating.'
    )
  }

  // don't throw if capabilityDelegation is missing because it is not really necessary for this project
  if (!didDocument.capabilityDelegation) {
    console.log('No Key "capabilityDelegation" for your DID found on chain.')
  }

  if (
    didDocument.capabilityDelegation &&
    !u8aEq(
      didDocument.capabilityDelegation[0].publicKey,
      localKeyPairs.capabilityDelegation.publicKey
    )
  ) {
    console.log(
      'Public Key "capabilityDelegation" on chain does not match what we are generating.'
    )
  }

  // A DID can have several keys of type 'keyAgreement', but only one key of each of the other types.
}

/**
 * Check if the **Well-Known DID Configuration** being displayed on the website uses the same DID URI as the one on the `.env`-file.
 *
 * If the DID URIs do not match, the extensions would not trust us. Your ID would be saying a different name as what you claim.
 *
 * @param DAPP_DID_URI
 */
async function corroborateMyIdentity(dAppDidUri: Kilt.DidUri) {
  // Letting the server know where the current Well-Known-DID-Config is stored
  const wellKnownPath = path.resolve(
    __dirname,
    '../..',
    './frontend/public/.well-known/did-configuration.json'
  )

  const fileContent = await fs.promises.readFile(wellKnownPath, {
    encoding: 'utf8'
  })
  if (!fileContent) {
    throw new Error(
      'No well-known-did-configuration file found on your repository. (or file is empty)'
    )
  }
  const wellKnownDidConfig = JSON.parse(
    fileContent
  ) as VerifiableDomainLinkagePresentation

  if (wellKnownDidConfig.linked_dids[0].credentialSubject.id !== dAppDidUri) {
    throw new Error(`
    The 'Well-Known DID Configuration' that your dApp displays was issued with a different DID than the one, that the server has at disposition.
    
    The DID from the Well-Known: ${wellKnownDidConfig.linked_dids[0].credentialSubject.id}
    The DID as environment constant: ${dAppDidUri}
    
    Try running \`build:well-known\` to make a new well-known-did-config.  `)
  }
}
