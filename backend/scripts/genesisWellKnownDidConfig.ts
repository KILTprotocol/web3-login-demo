import fs from 'fs'

import path from 'path'

import * as Kilt from '@kiltprotocol/sdk-js'
import dotenv from 'dotenv'

import generateAccount from '../src/utils/generateAccount'
import generateKeypairs from '../src/utils/generateKeyPairs'
import { VerifiableDomainLinkagePresentation } from '../src/utils/types'

import {
  createCredential,
  createPresentation,
  selfAttestCredential,
  getDomainLinkagePresentation,
  verifyDidConfigPresentation
} from './wellKnownDIDConfiguration'

/**
 * Reads the file of the current well-known-did-configuration from it's place on the frontend.
 * This will throw if no file can be found.
 *
 * @returns a json object from readed file.
 */
async function readCurrentDidConfig(): Promise<VerifiableDomainLinkagePresentation> {
  // let present: boolean = false;

  const parentDirectory = path.dirname(__dirname)
  const fullpath = `${parentDirectory}/frontend/public/.well-known/did-configuration.json`

  const filecontent = await fs.promises.readFile(fullpath, {
    encoding: 'utf8'
  })

  if (filecontent) {
    // if I can read the file without any problem
    // present = true;
    console.log(
      '\n\nYour projects repository already has a well-known-did-configuration file.'
    )
    console.log('You can find it under this path: \n', fullpath)
    console.log('here is the content of that file')
    console.log(filecontent)
  }
  if (!filecontent) {
    console.log(
      'No well-known-did-configuration file found on your repository.'
    )
  }
  const wellKnownDidconfig = JSON.parse(filecontent)
  // console.log("print the json object", wellKnownDidconfig);
  return wellKnownDidconfig

  // console.log("Is there a Well-known-did-config file already present? ", present);
  // return present;
}

async function main() {
  // Fetch variables from .env file:
  dotenv.config()

  const dAppURI =
    (process.env.DAPP_DID_URI as Kilt.DidUri) ??
    (`did:kilt:4${'noURIEstablished'}` as Kilt.DidUri)
  const domainOrigin = process.env.ORIGIN ?? 'no origin assiged'
  const dAppMnemonic =
    process.env.DAPP_DID_MNEMONIC ?? 'your dApp needs an Identity '
  const fundsMnemonic =
    process.env.DAPP_ACCOUNT_MNEMONIC ?? 'your dApp needs an Sponsor '

  console.log('The enviorment variables are:')
  console.log('dAppURI= ', dAppURI)
  console.log('domainOrigin= ', domainOrigin)
  console.log('dAppMnemonic= ', dAppMnemonic)
  console.log('fundsMnemonic= ', fundsMnemonic, '\n')

  //Connect to the webSocket. This tells the Kilt Api to wich node to interact, and ergo also the blockchain (Spiritnet or Peregrine)
  const webSocket = process.env.WSS_ADDRESS
  if (webSocket) {
    await Kilt.connect(webSocket)
  } else {
    throw new Error(
      'You need to define, on the .env, the WebSocket you want to connect with.'
    )
  }

  // Before we start, it makes sense to check if the project already has a well-known-did-configuration.
  // Why? Because each time we make a new one, an attestation is needed and that costs a fee. If working with the production Blockchain, you would want to spare this fee.

  try {
    const currentWellKnown = await readCurrentDidConfig() // this will deliver an error, if the file can't be found

    // if no error:
    console.log(
      "An old well-known-did-config file was found. Let's check if it still valid"
    )
    try {
      await verifyDidConfigPresentation(dAppURI, currentWellKnown, domainOrigin) // this will deliver an error, if the presentation can´t be verify

      //if no error:
      console.log(
        'A valid well-known-did-config was found on of your project. No need to make a new one.\n If you still want to make a new one, delete the old one first.'
      )
      // Stop running this script:
      Kilt.disconnect()
      return
    } catch (err) {
      console.log(
        "The current well-known-did-config of your project is not valid (anymore). \n Let's proceed with the first step to make a new one!"
      )
      // if this is case, don't trow an error to the next catch
    }
  } catch (error) {
    console.log(
      "No old well-known-did-config was found. Let's proceed with the first step to make one!"
    )
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // First Step: Create a Claim
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // The claim has to be based on the Domain Linkage CType. This CType is fetched from the Blockchain on './wellKnownDIDConfiguration' and imported here as cTypeDomeinLinkage

  const domainCredential = await createCredential(domainOrigin, dAppURI)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Second Step: Self-attesting the credential of this claim
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // A valid credential requires an attestation. Since the website wants to link itself to the DID just created, it has to self-attest the domain linkage credential, i.e., write the credential attestation on chain using the same DID it is trying to link to.

  const dAppsDidKeys = generateKeypairs(dAppMnemonic)
  const dappAccount = generateAccount(fundsMnemonic)

  await selfAttestCredential(
    domainCredential,
    dAppsDidKeys.assertionMethod,
    dappAccount
  )

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Third Step: Create a presentation for the attested credential
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // To use the newly attested credential, we need to derive a presentation from it to host on the dApp website.

  // We need the KeyId of the AssertionMethod Key. There is only
  // one AssertionMethodKey and its id is stored on the blockchain.
  const didResolveResult = await Kilt.Did.resolve(dAppURI)
  if (typeof didResolveResult?.document === 'undefined') {
    console.log('dAppURI', dAppURI)
    console.log('didResolveResult', didResolveResult)
    throw new Error('DID must be resolvable (i.e. not deleted)')
  }
  const assertionMethodKeyId = didResolveResult.document.assertionMethod![0].id

  // to declare the SignCallBacks is a bit tricky. You either have to speficy the type of every return variable, or of the whole return.

  // const presentationSignCallback = async ({ data }: any) => ({
  //     signature: assertionMethodKey.sign(data) as Uint8Array,
  //     keyUri: `${dAppURI}${assertionMethodKeyId}` as Kilt.DidResourceUri,
  //     keyType: assertionMethodKey.type as Kilt.DidVerificationKey['type']
  // });

  const presentationSignCallback = async ({
    data
  }: any): Promise<Kilt.SignResponseData> => {
    return {
      signature: dAppsDidKeys.assertionMethod.sign(data),
      keyUri: `${dAppURI}${assertionMethodKeyId}`,
      keyType: dAppsDidKeys.assertionMethod.type
    }
  }

  const domainCredentialPresentation = await createPresentation(
    domainCredential,
    presentationSignCallback
  )

  const wellKnownDidconfig = await getDomainLinkagePresentation(
    domainCredentialPresentation
  )

  // disconnect from the blockchain API
  await Kilt.disconnect()

  console.log(
    'this is the well-known-DID-configuration of your dApp that was just created: \n',
    JSON.stringify(wellKnownDidconfig, null, 2)
  )

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Fourth Step: Host the presentation in your web App
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // __dirname is the folder where this file is; here currently 'scripts'

  const parentDirectory = path.dirname(__dirname) //  it roughly means “find me the parent path to the current folder.”

  await fs.promises.mkdir(`${parentDirectory}/frontend/public/.well-known`, {
    recursive: true
  }) // creates a folder where to save the did-config file

  fs.writeFile(
    `${parentDirectory}/frontend/public/.well-known/did-configuration.json`,
    JSON.stringify(wellKnownDidconfig, null, 2),
    (err) => {
      if (err) throw err
      console.log('Data written to file on the Front-End.')
    }
  )
}

main()
