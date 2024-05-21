import dotenv from 'dotenv'
import * as Kilt from '@kiltprotocol/sdk-js'
import { mnemonicGenerate } from '@polkadot/util-crypto'

import { generateKeyPairs } from './launchUtils/generateKeyPairs'
import { generateAccount } from './launchUtils/generateAccount'
import { generateFullDid } from './launchUtils/generateFullDid'

// try to read the variables from the .env-file:
dotenv.config()
const {
  // This is the websocket address of the rpc node
  WSS_ADDRESS,
  // This is the local Port on which your website (client-side) will be reachable
  FRONTEND_PORT,
  // This is the local Port on which your server will be reachable
  BACKEND_PORT,
  // This is the mnemonic of the Kilt account paying for all transactions
  DAPP_ACCOUNT_MNEMONIC,
  // This is the mnemonic of the Kilt DID that identifies your dApp
  DAPP_DID_MNEMONIC,
  // This is the URI of the Kilt DID that identifies your dApp
  DAPP_DID_URI,
  // This should be a custom name for your dApp
  DAPP_NAME,
  // This is secret key (string) that signs the Json-Web-Tokens before saving them in the Cookies
  JWT_SIGNER_SECRET,
  // This is the CType hash for Email credentials from SocialKYC
  CTYPE_HASH,
  // These are the trusted attesters for the CType
  TRUSTED_ATTESTERS,
  // These are the required properties for the CType
  REQUIRED_PROPERTIES
} = process.env

async function main() {
  // Making the output light purple
  console.log('\u001B[38;5;133m')

  console.log(
    "This is a script for an easy creation of the environment variables needed for your dApp's functionality.\n",

    'All environment variables need to be saved on a file called ".env" that you need to create and save on the project\'s root directory.',
    'It is a standard that all environment variables are name with capitalized letters.',
    'Please, follow the standard.\n',

    "Alternatively, you could create some of the environment values otherwise and let this script do the rest for you. Or (for pros) make them all otherwise and don't use this.\n"
  )

  // Making the output strong purple
  console.log('\u001B[38;5;201m')
  // figure out your project's current state:
  let step = 0
  const stairs = {
    WSS_ADDRESS,
    FRONTEND_PORT,
    BACKEND_PORT,
    DAPP_ACCOUNT_MNEMONIC,
    DAPP_DID_MNEMONIC,
    DAPP_DID_URI,
    DAPP_NAME,
    JWT_SIGNER_SECRET,
    CTYPE_HASH,
    TRUSTED_ATTESTERS,
    REQUIRED_PROPERTIES
  }

  // find the first element in the object "stairs" that still has an undefined value.
  step = Object.values(stairs).findIndex(
    (value) => value === undefined || value === ''
  )
  // `.findIndex()`returns -1 on no match.

  if (step > 0) {
    console.log(
      `The environment variable "${
        Object.keys(stairs)[step]
      }" has not been defined yet. \n`
    )
  }
  // Go through the current step:
  switch (step) {
    // first assign a websocket of the blockchain you want to interact with:
    case 0:
      imploreWebSocket()
      break

    // then assign where the dApp BackEnd is going to be reachable
    case 1:
      imploreClientSidePort()
      break

    // then assign where the dApp's FrontEnd is going to be reachable
    case 2:
      imploreServerPort()
      break

    // then we generate an account
    case 3:
      await spawnAccount()
      break

    // then we generate a FullDID with all the key types
    // and ask you to save the mnemonic and URI
    case 4:
      await spawnDid()
      break

    // Just in case you did not save the URI of the DID
    // save the DID's URI as well:
    case 5:
      await getURI(DAPP_DID_MNEMONIC as string)
      break
    // ask you to choose a name for your dApp
    case 6:
      imploreName()
      break
    // ask you to choose a Secret Key for encoding JWTs
    case 7:
      imploreJwtSecretKey()
      break
    case 8:
      imploreCtypeHash()
      break
    // ask you to choose a Ctype Hash
    case 9:
      imploreTrustedAttesters()
      break
    // ask you to choose a Ctype Hash
    case 10:
      imploreRequestedProperties()
      break
    // ask you to choose a Ctype Hash
    // if (step = -1):
    default:
      console.log(
        `It seems like all environment variables are already defined.\n
               >> Take in consideration, that this script does not verify if the environment values already defined are valid. <<\n\n`,
        'If you want new values, delete the old ones first.\n'
      )
      break
  }
  // Making the output light purple
  console.log('\u001B[38;5;133m')
  console.log(
    'If you are still missing some environment values and want the easy way, run this file again.\n'
  )
  // reset output's appearance:
  console.log('\u001b[0m')
  return
}
// The JavaScript (ergo also the Typescript) interpreter hoists the entire function declaration to the top of the current scope.
// So the main function can use the following functions without problem.
function imploreWebSocket() {
  console.log(
    'Please, define a value for WSS_ADDRESS on the .env-file to continue \n',
    'To connect to the KILT-Test-Blockchain, named Peregrine (recommended), please save the following: \n\n',
    'WSS_ADDRESS=wss://peregrine.kilt.io/',
    '\n\n',

    'In the future, if you wish to interact with the production KILT-Blockchain, named Spiritnet, change the address to a web-socket (public Endpoint) of Spiritnet.',
    'More info under: https://docs.kilt.io/docs/develop/chain/deployments',
    '\n\n'
  )
}

function imploreClientSidePort() {
  console.log(
    'Please, define a value for FRONTEND_PORT on the .env-file to continue\n',
    'For this demonstration the dApp should only run locally. You can use a custom IP-port or just the default:\n\n',
    'Default dApps domain port: \n',
    'FRONTEND_PORT=6565',
    '\n\n'
  )
}

function imploreServerPort() {
  console.log(
    'Please, define a value for PORT on the .env-file to continue\n',
    'You can use a custom IP-port or just the default:\n\n',
    "Default dApp-Server's port: \n",
    'BACKEND_PORT=2525',
    '\n\n'
  )
}

async function spawnAccount() {
  console.log('An account is being generated for your dApp...')
  await Kilt.init()
  // You could also pass a specific mnemonic, but here we generate a random mnemonic.
  // for custom, replace here with a string of 12 BIP-39 words
  const mnemonic = mnemonicGenerate()
  const account = generateAccount(mnemonic)
  console.log(
    '\n Please, save mnemonic of your dApps account to the .env-file to continue!\n\n',
    `DAPP_ACCOUNT_MNEMONIC=${mnemonic}\n\n`,
    `Kilt account public address generated using that mnemonic: ${account.address}\n\n`,
    `You also need to deposit funds on this account, to be able to create a DID.\n`,
    `For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/?${account.address} \n\n`
  )
  // no need for disconnecting while using init()
}

async function spawnDid() {
  await Kilt.connect(WSS_ADDRESS as string)
  console.log(
    '\n\nA decentralized identity (DID) is trying to be generated for your dApp.',
    'This could take some minutes.\n',
    'Make sure you have enough funds! \n\n'
  )
  // Load attester account
  const attesterAccount = generateAccount(DAPP_ACCOUNT_MNEMONIC as string)
  // the DID can be generated by a different mnemonic than from the account. This is also the preferred option.
  // You could also pass a specific mnemonic, but here we generate a random mnemonic.
  // for custom, replace here with a string of 12 BIP-39 words
  const didMnemonic = mnemonicGenerate()
  // the next function requires connect()
  const fullDid = await generateFullDid(attesterAccount, didMnemonic)

  console.log(
    "\n Please, save the mnemonic and URI of your dApp's DID to the .env-file to continue!\n",
    `DAPP_DID_MNEMONIC=${didMnemonic}\n`,
    `DAPP_DID_URI=${fullDid.uri}\n`
  )
  await Kilt.disconnect()
}

async function getURI(mnemonic: string) {
  console.log('getting the URI of the DID corresponding the provided mnemonic')
  await Kilt.connect(WSS_ADDRESS as string)
  const { authentication } = generateKeyPairs(mnemonic)
  const dAppDidUri = Kilt.Did.getFullDidUriFromKey(authentication)
  const resolved = await Kilt.Did.resolve(dAppDidUri)
  if (!resolved) {
    console.log(
      'There is no DID-Document on the chain for the given mnemonic. The corresponding Uri would be useless.',
      'Please, provide a mnemonic of registered DID!',
      'Easy way: delete current mnemonic from the .env-file and run this script again'
    )
  } else {
    console.log(
      "\n please, save the URI of your dApp's DID to the .env-file to continue!\n",
      `DAPP_DID_URI=${dAppDidUri}\n`
    )
  }
  await Kilt.disconnect()
}

function imploreName() {
  console.log(
    'Please provide a name for your dApp inside the .env file using this constant name: \n',
    `DAPP_NAME={your dApp's name here}\n`
  )
}

function imploreJwtSecretKey() {
  console.log(
    `Please provide a string value for 'JWT_SIGNER_SECRET' inside the .env file. \n`,
    '\nThis is would be a Secret Key your dApps use to encode the JSON-Web-Tokens\n',
    `JWT_SIGNER_SECRET={Oh my God, you are so cryptic!}\n`
  )
}

function imploreCtypeHash() {
  console.log(
    `Please specify with types of credentials your dApp should consider valid.`,
    `For this, please, provide the CType Hash(es) inside the .env file using the constant name 'CTYPE_HASH'. \n`,
    'Your dApp will only accept credentials of the given Claim Type(s).\n\n',

    `If you wish to accept Email Credentials, as the ones issued by SocialKYC.io, please add the following line to your .env file:\n`,
    `CTYPE_HASH=0x3291bb126e33b4862d421bfaa1d2f272e6cdfc4f96658988fbcffea8914bd9ac\n\n`,

    `If you rather work with other CTypes, we recommend checking out the registry under https://ctypehub.galaniprojects.de/.`
  )
}
function imploreTrustedAttesters() {
  console.log(
    `Please provide a list your dApp's Trusted Attesters (Credential Issuers) inside the .env file using the constant name 'TRUSTED_ATTESTERS'. \n`,
    'Only credentials attested on chain by one the specified DIDs will be accepted by your dApp.\n\n',
    `If you wish to accept Credentials issued by the peregrine (test) version of SocialKYC.io, please add the following line to your .env file:\n`,
    `TRUSTED_ATTESTERS=did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY\n`
  )
}
function imploreRequestedProperties() {
  console.log(
    `Please provide a list of Required Properties inside the .env file using this constant name 'REQUIRED_PROPERTIES' \n`,
    `The users will only be Required to disclose the listed Properties during credential presentation (≙login).\n\n`,
    `If you wish to use the default Email Credential settings, please add the following line to your .env file:\n`,
    `REQUIRED_PROPERTIES=Email\n`
  )
}

//run the code
main()
