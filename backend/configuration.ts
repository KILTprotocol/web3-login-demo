import path from 'path'

import dotenv from 'dotenv'

import * as Kilt from '@kiltprotocol/sdk-js'

import { generateAccount } from './src/utils/generateAccount'

dotenv.config()

// Letting the server know where the environment variables are
const projectRootDirectory = path.dirname(__dirname)
dotenv.config({ path: `${projectRootDirectory}/.env` })

export const PORT = process.env.PORT || 3000
export const WSS_ADDRESS = process.env.WSS_ADDRESS || 'wss://peregrine.kilt.io'
export const DAPP_DID_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string
export const DAPP_DID_URI = process.env.DAPP_DID_URI as Kilt.DidUri
export const DAPP_NAME = process.env.DAPP_NAME ?? 'Web3-Login-Demo'
export const DAPP_ACCOUNT_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string
// get corresponding public address to the account's mnemonic
export const DAPP_ACCOUNT_ADDRESS = generateAccount(DAPP_ACCOUNT_MNEMONIC)
export const JWT_SIGNER_SECRET = process.env.JWT_SIGNER_SECRET as string
