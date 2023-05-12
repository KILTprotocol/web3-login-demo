import path from 'path'

import dotenv from 'dotenv'

import * as Kilt from '@kiltprotocol/sdk-js'

import { generateAccount } from './src/utils/generateAccount'

// Letting the server know where the environment variables are
const projectRootDirectory = path.dirname(__dirname)
dotenv.config({ path: `${projectRootDirectory}/.env` })

export const BACKEND_PORT = process.env.PORT || 3000
export const WSS_ADDRESS = process.env.WSS_ADDRESS || 'wss://peregrine.kilt.io'
export const DAPP_DID_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string
export const DAPP_DID_URI = process.env.DAPP_DID_URI as Kilt.DidUri
export const DAPP_NAME = process.env.DAPP_NAME ?? 'Web3-Login-Demo'
export const DAPP_ACCOUNT_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string

export const JWT_SIGNER_SECRET = process.env.JWT_SIGNER_SECRET as string

export const DAPP_ACCOUNT_ADDRESS = deduceAccountAddress()

/**  To avoid the possibility of having a mnemonic and account that don't match, the address is generated from the mnemonic each time.
 * @returns DAPP_ACCOUNT_ADDRESS
 */
async function deduceAccountAddress(): Promise<string> {
  await Kilt.init()
  const dAppAccount = generateAccount(DAPP_ACCOUNT_MNEMONIC)

  return dAppAccount.address
}

// // for the future:
// async function validateEnvironmentConstants() {
//   await deduceAccountAddress()
// did_Uri valid
// generate key_agreement
// }
