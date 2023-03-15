import path from 'path'
import dotenv from 'dotenv'

import * as Kilt from '@kiltprotocol/sdk-js'

dotenv.config()

// Letting the server know where the environment varibles are
const projectRoootDirectory = path.dirname(__dirname)
dotenv.config({ path: `${projectRoootDirectory}/.env` })

export const PORT = process.env.PORT || 3000
export const WSS_ADDRESS = process.env.WSS_ADDRESS || 'wss://peregrine.kilt.io'
export const DAPP_DID_URI = process.env.DAPP_DID_URI as Kilt.DidUri
export const DAPP_NAME = process.env.DAPP_NAME ?? 'Your dApp Name'
export const DAPP_DID_MNEMONIC = process.env.DAPP_DID_MNEMONIC as string
