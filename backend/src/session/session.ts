import * as Kilt from '@kiltprotocol/sdk-js'
import { Response, Request, NextFunction } from 'express'
import { sessionStorage } from '../utils/sessionStorage'
import { generateKeypairs } from '../utils/generateKeyPairs'
import { DAPP_DID_URI, DAPP_NAME } from '../config'

export async function generateSessionValues(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  console.log('creating session Values')
  try {
    if (!DAPP_DID_URI)
      throw new Error("enter your dApp's DID URI on the .env-file first")

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
    // If there the DID does not have any key agreement key, throw
    if (!didDocument.keyAgreement || !didDocument.keyAgreement[0]) {
      throw new Error(
        'The DID of your dApp needs to have an Key Agreement to comunicate. Go get one and register in on chain.'
      )
    }
    if (!didDocument.authentication || !didDocument.authentication[0]) {
      throw new Error(
        'The DID of your dApp needs to have an authentification Key to sing stuff. Go get one and register in on chain.'
      )
    }

    // this basiclly says how are you going to encrypt:
    const dAppEncryptionKeyUri =
      `${DAPP_DID_URI}${didDocument.keyAgreement[0].id}` as Kilt.DidResourceUri

    // Generate and store sessionID and challenge on the server side for the next step.
    // A UUID is a universally unique identifier, a 128-bit label. Here express as a string of a hexaheximal number.
    const sessionID = Kilt.Utils.UUID.generate()
    const challenge = Kilt.Utils.UUID.generate()

    const sessionValues = {
      sessionID: sessionID,
      dAppName: DAPP_NAME,
      dAppEncryptionKeyUri: dAppEncryptionKeyUri,
      challenge: challenge
    }

    console.log(sessionValues)

    sessionStorage[sessionID] = sessionValues

    // You can see all sessions Values (including old ones) with this:
    // console.log('All sessions stored:', sessionStorage);
    // to reset this list restart the server

    response.status(200).send(sessionValues)
  } catch (error) {
    // print the possible error on the frontend
    next(error)
  }
}

export async function verifySession(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    // the body is the wrapper for the information send by the frontend
    // You could print it with:
    // console.log("body", request.body);

    // extract variables:
    const { extensionSession: session, serverSessionID } = request.body
    const { encryptedChallenge, nonce } = session
    // This varible has different name depending on the session version
    let encryptionKeyUri: Kilt.DidResourceUri
    // if session is type PubSubSessionV1
    if ('encryptionKeyId' in session) {
      encryptionKeyUri = session.encryptionKeyId as Kilt.DidResourceUri
    } else {
      // if session is type PubSubSessionV2
      encryptionKeyUri = session.encryptionKeyUri
    }
    const encryptionKey = await Kilt.Did.resolveKey(encryptionKeyUri)
    if (!encryptionKey) {
      throw new Error('an encryption key is required')
    }

    // get your encryption Key, a.k.a. Key Agreement
    const dAppDidMnemonic = process.env.DAPP_DID_MNEMONIC
    if (!dAppDidMnemonic)
      throw new Error('Enter your dApps mnemonic on the .env file')

    const { keyAgreement } = generateKeypairs(dAppDidMnemonic)

    const decryptedBytes = Kilt.Utils.Crypto.decryptAsymmetric(
      { box: encryptedChallenge, nonce },
      encryptionKey.publicKey,
      keyAgreement.secretKey // derived from your seed phrase
    )
    // If it fails to decrypt, throw.
    if (!decryptedBytes) {
      throw new Error(
        'Could not decode/decrypt the challange from the extension'
      )
    }

    const decryptedChallenge = Kilt.Utils.Crypto.u8aToHex(decryptedBytes)
    const originalChallenge = sessionStorage[serverSessionID].challenge

    // Compare the decrypted challenge to the challenge you stored earlier.
    console.log(
      'originalChallenge: ',
      originalChallenge,
      '\n',
      'decrypted challenge: ',
      decryptedChallenge
    )
    if (decryptedChallenge !== originalChallenge) {
      response
        .status(401)
        .send("Session verification failed. The challenges don't match.")
      throw new Error('Invalid challenge')
    }

    response
      .status(200)
      .send(
        'Session succesfully verified. Extension and dApp understand each other.'
      )
  } catch (err) {
    // print the possible error on the frontend
    next(err)
  }

  return
}
