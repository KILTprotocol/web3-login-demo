import * as Kilt from '@kiltprotocol/sdk-js'

import { getApi } from '../utils/connection'

export async function fetchDidDocument(): Promise<Kilt.DidDocument> {
  try {
    // connects to the websocket of your, in '.env', specified blockchain
    await getApi()

    const DAPP_DID_URI = process.env.DAPP_DID_URI as Kilt.DidUri

    if (!DAPP_DID_URI) {
      throw new Error("enter your dApp's DID URI on the .env-file first")
    }

    // fetch the DID document from the blockchain
    const resolved = await Kilt.Did.resolve(DAPP_DID_URI)

    // Assure this did has a document on chain
    if (resolved === null) {
      throw new Error('DID could not be resolved')
    }
    if (!resolved.document) {
      throw new Error(
        'No DID document could be fetched from your given dApps URI'
      )
    }
    const didDocument = resolved.document
    // We require a key agreement key to receive encrypted messages
    if (!didDocument.keyAgreement || !didDocument.keyAgreement[0]) {
      throw new Error(
        'The DID of your dApp needs to have an Key Agreement to comunicate. Info to get one: https://docs.kilt.io/docs/develop/sdk/cookbook/dids/full-did-update'
      )
    }
    if (!didDocument.authentication || !didDocument.authentication[0]) {
      throw new Error(
        'The DID of your dApp needs to have an authentification Key to sign stuff. Info to get one: https://docs.kilt.io/docs/develop/sdk/cookbook/dids/full-did-update'
      )
    }

    Kilt.disconnect()

    return didDocument
  } catch (error) {
    // print the possible error on the frontend
    throw new Error(`Trouble fetching the DID-Document from the chain ${error}`)
  }
}
