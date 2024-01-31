import path from 'path'

import dotenv from 'dotenv'

import * as Kilt from '@kiltprotocol/sdk-js'
import { u8aEq } from '@polkadot/util'
import { CookieOptions } from 'express'

import { generateAccount } from './utils/generateAccount'
import { generateKeyPairs } from './utils/generateKeyPairs'
import { fetchDidDocument } from './utils/fetchDidDocument'
import { getApi } from './utils/connection'

// Letting the server know where the environment variables are.
// Since we are inside a monorepo, the `.env` file is not part of this package, but of the parent directory of this package; the root's directory.
const envPath = path.resolve(__dirname, '../..', '.env')
dotenv.config({ path: envPath })

export const WSS_ADDRESS = process.env.WSS_ADDRESS ?? 'wss://peregrine.kilt.io'
export const BACKEND_PORT = process.env.BACKEND_PORT ?? 2525
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
export async function validateOurKeys(didDocument: Kilt.DidDocument) {
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

// Set Cookie Options: (list of ingredients)
export const cookieOptions: CookieOptions = {
  // Indicates the number of milliseconds until the Cookie expires.
  // On this demo the cookies have a lifetime of 1 hour. The shorter the securest.
  maxAge: 60 * 60 * 1000,
  // only send over HTTPS
  secure: true,
  // prevent cross-site request forgery attacks
  sameSite: 'strict',
  // restricts URL that can request the Cookie from the browser. '/' works for the entire domain.
  path: '/',
  // Forbids JavaScript from accessing the cookie
  httpOnly: true
}
