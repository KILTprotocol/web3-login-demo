import * as Kilt from '@kiltprotocol/sdk-js'
import { generateAccount } from '../utils/attester/generateAccount'

// Enviorement variables:
// - `WSS_ADDRESS` = _This is the websocket address of the RPC node_
// - `ORIGIN` = _This is the URL domain origin of your website (frontend)_
// - `PORT` = _This is the local Port on wich your server would be reachable (backend)_
// - `DAPP_ACCOUNT_MNEMONIC` = _This is the mnemonic of the Kilt account paying for all transactions_
// - `DAPP_DID_MNEMONIC` = _This is the mnemonic of the Kilt DID that identifies your dApp_
// - `DAPP_DID_URI` = _This is the URI of the Kilt DID that identifies your dApp_
// - `DAPP_NAME` = _This should be a custom name for your dApp_
// - `JWT_SIGNER_SECRET` = _This is secret key (string) that signs the Json-Web-Tokens before saving them in the Cookies_

interface ServerConfig {
  webSocket: string
  origin: string
  port: number
  accountMnemonic: string
  accountAddress?: Kilt.KiltAddress
  didMnemonic: string
  didUri: Kilt.DidUri
  dAppName?: string
  jwtSigner?: string
}

/**
 * This is a function to set up the configuration object.
 * It should be run on server start.
 * The dotenv.config('path of .env-file') should be runed before this.
 */
export async function configurateServer(): Promise<ServerConfig> {
  const webSocket = process.env.WSS_ADDRESS
  const origin = process.env.ORIGIN
  const port = process.env.PORT
  const accountMnemonic = process.env.DAPP_ACCOUNT_MNEMONIC
  const accountAddress = generateAccount(accountMnemonic)
  const didMnemonic = process.env.DAPP_DID_MNEMONIC
  const didUri = process.env.DAPP_DID_URI
  const dAppName = process.env.DAPP_NAME
  const jwtSigner = process.env.JWT_SIGNER_SECRET

  const configgy: ServerConfig = {
    webSocket,
    origin,
    port,
    accountMnemonic,
    accountAddress,
    didMnemonic,
    didUri,
    dAppName,
    jwtSigner
  }

  console.log(process.env)

  return configgy
}

// const configuration: ServerConfig = configurateServer()
