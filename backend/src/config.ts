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

export const WSS_ADDRESS = process.env.WSS_ADDRESS ?? 'wss://peregrine.kilt.io'
export const BACKEND_PORT = process.env.BACKEND_PORT ?? 3000
export const FRONTEND_PORT = process.env.FRONTEND_PORT ?? 8080
export const DAPP_ACCOUNT_MNEMONIC = loadEnv('DAPP_ACCOUNT_MNEMONIC')
export const DAPP_DID_MNEMONIC = loadEnv('DAPP_DID_MNEMONIC')
export const DAPP_DID_URI = loadEnv('DAPP_DID_URI') as Kilt.DidUri
export const DAPP_NAME = process.env.DAPP_NAME ?? 'Web3-Login-Demo'
export const JWT_SIGNER_SECRET = loadEnv('JWT_SIGNER_SECRET')

export let DAPP_ACCOUNT_ADDRESS: string

function loadEnv(name: string) {
  const envValue = process.env[name]
  if (!envValue) {
    throw new Error(
      `Environment constant '${name}' is missing. Define it on the project's root directory '.env'-file. \n`
    )
  }
  return envValue
}

export async function validateEnvironmentConstants() {
  await getApi()
  DAPP_ACCOUNT_ADDRESS = await deduceAccountAddress()
  Kilt.Did.validateUri(DAPP_DID_URI, 'Did')
  const ourDidDocumentOnChain = await fetchDidDocument()
  await validateOurKeys(ourDidDocumentOnChain)
  await corroborateMyIdentity(DAPP_DID_URI)
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

  // A DID can have several keys of type 'keyAgreement', but only up to one key of each of the other types.
  // All DIDs need to have an 'authentication' key, so this first assertion should never fail
  const necessaryTypesOfKeys: Kilt.KeyRelationship[] = [
    'authentication',
    'assertionMethod',
    'keyAgreement'
  ]

  for (const keyName of necessaryTypesOfKeys) {
    await compareKey(didDocument[keyName]?.[0], localKeyPairs[keyName], keyName)
  }
  // don't throw if 'capabilityDelegation' key is missing because it is not really necessary for this project
  const trivialKey: Kilt.KeyRelationship = 'capabilityDelegation'
  try {
    await compareKey(
      didDocument[trivialKey]?.[0],
      localKeyPairs[trivialKey],
      trivialKey
    )
  } catch (warning) {
    console.log(
      `Non-essential Key "${trivialKey}" not available. Reason: "${warning}" `
    )
  }
}

async function compareKey(
  resolved: Kilt.DidKey | undefined,
  derived: Kilt.KeyringPair | Kilt.KiltEncryptionKeypair,
  relationship: Kilt.KeyRelationship
): Promise<void> {
  if (!resolved) {
    throw new Error(`No "${relationship}" Key for your DID found on chain.`)
  }

  if (!u8aEq(derived.publicKey, resolved.publicKey)) {
    throw new Error(
      `Public "${relationship}" Key on chain does not match what we are generating.`
    )
  }
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
      'The well-known-did-configuration file found on your repository is empty.'
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
