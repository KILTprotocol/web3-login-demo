import * as Kilt from '@kiltprotocol/sdk-js'

import { getApi } from './connection'

import { generateKeypairs } from './generateKeyPairs'

export async function generateFullDid(
  submitterAccount: Kilt.KiltKeyringPair,
  mnemonic: string
): Promise<Kilt.DidDocument> {
  await getApi()
  const didMnemonic = mnemonic
  const {
    authentication,
    keyAgreement,
    assertionMethod,
    capabilityDelegation
  } = generateKeypairs(didMnemonic)

  // Before submitting the transaction, it is worth it to assure that the DID does not already exist.
  // If the DID already exist, the transaction will fail, but it will still costs the fee. Better to avoid this.

  // check if DID already exists or if it used to exist:
  const desiredDidUri = Kilt.Did.getFullDidUriFromKey(authentication)
  const oldDidResolved = await Kilt.Did.resolve(desiredDidUri)
  if (oldDidResolved) {
    console.log('this DID is already registered on chain')
    // true if it was deleted:
    const deactivated: boolean = oldDidResolved.metadata.deactivated
    const oldDidDocument = oldDidResolved.document

    if (deactivated) {
      throw new Error(
        'This DID was deleted/deactivated and cannot be created again.'
      )
    }
    if (!oldDidDocument) {
      throw new Error(
        'DID resolved, but document undefined. This should be impossible.'
      )
    }

    // if it exists and it is valid, just return it.
    return oldDidDocument
  }

  // Get tx that will create the DID on chain and DID-URI that can be used to resolve the DID Document.
  const fullDidCreationTx = await Kilt.Did.getStoreTx(
    {
      authentication: [authentication],
      keyAgreement: [keyAgreement],
      assertionMethod: [assertionMethod],
      capabilityDelegation: [capabilityDelegation]
    },
    submitterAccount.address,
    async ({ data }) => ({
      signature: authentication.sign(data),
      keyType: authentication.type
    })
  )

  // This is what register the DID on the chain. This costs, regardless of the result.
  await Kilt.Blockchain.signAndSubmitTx(fullDidCreationTx, submitterAccount)

  const didUri = Kilt.Did.getFullDidUriFromKey(authentication)
  const resolved = await Kilt.Did.resolve(didUri)
  if (!resolved) {
    throw new Error('Full DID could not be fetch from chain. A.K.A.: resolved')
  }
  const { document: didDocument } = resolved

  if (!didDocument) {
    throw new Error('Full DID was not successfully fetched.')
  }

  Kilt.disconnect()
  return didDocument
}
