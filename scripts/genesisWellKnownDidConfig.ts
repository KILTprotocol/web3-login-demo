import fs from 'fs'

import path from 'path'

import * as Kilt from '@kiltprotocol/sdk-js'
import dotenv from 'dotenv'

import { generateAccount } from './launchUtils/generateAccount'
import { generateKeyPairs } from './launchUtils/generateKeyPairs'
import { VerifiableDomainLinkagePresentation } from './launchUtils/types'

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
 * @returns a json object from read file.
 */
async function readCurrentDidConfig(): Promise<VerifiableDomainLinkagePresentation> {
  const wellKnownPath = path.resolve(
    __dirname,
    '..',
    './frontend/public/.well-known/did-configuration.json'
  )

  const fileContent = await fs.promises.readFile(wellKnownPath, {
    encoding: 'utf8'
  })

  if (fileContent) {
    // if I can read the file without any problem
    console.log(
      '\n\nYour projects repository already has a well-known-did-configuration file.'
    )
    console.log('You can find it under this path: \n', wellKnownPath)
  }
  if (!fileContent) {
    console.log(
      'No well-known-did-configuration file found on your repository.'
    )
  }
  const wellKnownDidConfig = JSON.parse(fileContent)
  return wellKnownDidConfig
}

async function main() {
  // Fetch variables from .env file:
  dotenv.config()

  const dAppURI =
    (process.env.DAPP_DID_URI as Kilt.DidUri) ??
    (`did:kilt:4noURIEstablished` as Kilt.DidUri)
  const dAppMnemonic =
    process.env.DAPP_DID_MNEMONIC ?? 'your dApp needs an Identity '
  const fundsMnemonic =
    process.env.DAPP_ACCOUNT_MNEMONIC ?? 'your dApp needs an Sponsor '

  let domainOrigin = 'no origin assigned'
  if (process.env.FRONTEND_PORT) {
    // don't put a slash "/" at the end of the origin!
    domainOrigin = `http://localhost:${process.env.FRONTEND_PORT}`
  }

  // Connect to the webSocket. This tells the Kilt Api to which node to interact, and ergo also the
  // blockchain (Spiritnet or Peregrine)
  const webSocket = process.env.WSS_ADDRESS
  if (webSocket) {
    await Kilt.connect(webSocket)
  } else {
    throw new Error(
      'You need to define, on the .env, the WebSocket you want to connect with.'
    )
  }

  console.log(
    '\n',
    'The variables defining/verifying the Well-Known-DID-Configuration are: \n',
    `webSocket=${webSocket}   (tells you the blockchain)\n`,
    `dAppURI=${dAppURI} \n`,
    `domainOrigin=${domainOrigin} \n`,
    `dAppMnemonic=${dAppMnemonic} \n`,
    `fundsMnemonic=${fundsMnemonic} \n`,
    '\n'
  )

  // Before we start, it makes sense to check if the project already has a well-known-did-configuration.
  // Why? Because each time we make a new one, an attestation is needed and that costs a fee. If
  // working with the production Blockchain, you would want to spare this fee.

  try {
    // this will deliver an error, if the file can't be found
    const currentWellKnown = await readCurrentDidConfig()

    // if no error:
    console.log(
      "An old well-known-did-config file was found. Let's check if it still valid"
    )
    try {
      // this will deliver an error, if the presentation can´t be verify
      await verifyDidConfigPresentation(dAppURI, currentWellKnown, domainOrigin)

      //if no error:
      console.log(
        'A valid well-known-did-config was found on of your project. No need to make a new one.\n If you still want to make a new one, delete the old one first.'
      )
      // Stop running this script:
      Kilt.disconnect()
      return
    } catch (err) {
      console.log(
        "The current well-known-did-config of your project is not valid (anymore). \n Let's proceed to make a new one!"
      )
      // if this is case, don't trow an error to the next catch
    }
  } catch (error) {
    console.log(
      "No old well-known-did-config was found. Let's proceed to make one!"
    )
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // First Step: Create a Claim
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // The claim has to be based on the Domain Linkage CType. This CType is fetched from the Blockchain on './wellKnownDIDConfiguration' and imported here as cTypeDomainLinkage

  const domainCredential = await createCredential(domainOrigin, dAppURI)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Second Step: Self-attesting the credential of this claim
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // A valid credential requires an attestation. Since the website wants to link itself to the DID just created, it has to self-attest the domain linkage credential, i.e., write the credential attestation on chain using the same DID it is trying to link to.

  const dAppsDidKeys = generateKeyPairs(dAppMnemonic)
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
  if (didResolveResult.document.assertionMethod === undefined) {
    throw new Error('No assertion Key available.')
  }
  const assertionMethodKeyId = didResolveResult.document.assertionMethod[0].id

  const presentationSignCallback = async ({
    data
  }): Promise<Kilt.SignResponseData> => {
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

  //  the following roughly means “find me the parent path to the current folder.”
  const parentDirectory = path.dirname(__dirname)

  // creates a folder where to save the did-config file
  await fs.promises.mkdir(`${parentDirectory}/frontend/public/.well-known`, {
    recursive: true
  })

  const outFilePath = `${parentDirectory}/frontend/public/.well-known/did-configuration.json`
  fs.writeFile(
    outFilePath,
    JSON.stringify(wellKnownDidconfig, null, 2),
    (err) => {
      if (err) {
        throw err
      }
      console.log(`Well known did configuration was written to ${outFilePath}`)
    }
  )
}

main()
