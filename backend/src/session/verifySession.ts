import * as Kilt from '@kiltprotocol/sdk-js'
import { Response, Request, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { generateKeypairs } from '../utils/attester/generateKeyPairs'
import { getApi } from '../utils/connection'

export async function verifySession(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  await getApi()

  const secretKey = process.env.JWT_SIGNER_SECRET
  if (!secretKey) {
    response
      .status(500)
      .send(
        `Could not find JWT-Secret-key; so it is not possible to verify session.`
      )
    throw new Error(
      "Define a value for 'JWT_SIGNER_SECRET' on the '.env'-file first!"
    )
  }

  // read cookie from browser
  const sessionCookie = request.cookies.sessionJWT
  if (!sessionCookie) {
    response
      .status(401)
      .send(
        `Could not find Cookie with session values (as JWT). Log-in and try again.`
      )
    throw new Error('Cookie with Session JWT not found. Log-in and try again.')
  }

  // decode the JWT and verify if it was signed with our SecretKey

  let cookiePayloadServerSession: jwt.JwtPayload
  try {
    // will throw error if verification fails
    const decodedPayload = jwt.verify(sessionCookie, secretKey)
    if (typeof decodedPayload === typeof 'string') {
      throw new Error(`Payload of unexpected type. Content: ${decodedPayload}`)
    }
    cookiePayloadServerSession = decodedPayload as jwt.JwtPayload
  } catch (error) {
    throw new Error(`Could not verify JWT. --> ${error}`)
  }

  try {
    // extract variables:
    const { extensionSession } = request.body
    const { encryptedChallenge, nonce } = extensionSession
    // This varible has different name depending on the session version
    let encryptionKeyUri: Kilt.DidResourceUri
    // if session is type PubSubSessionV1
    if ('encryptionKeyId' in extensionSession) {
      encryptionKeyUri = extensionSession.encryptionKeyId as Kilt.DidResourceUri
      // Version 1 had a misleading name for this variable
    } else {
      // if session is type PubSubSessionV2
      encryptionKeyUri = extensionSession.encryptionKeyUri
    }
    const encryptionKey = await Kilt.Did.resolveKey(encryptionKeyUri)
    if (!encryptionKey) {
      throw new Error('an encryption key is required')
    }

    // get your encryption Key, a.k.a. Key Agreement
    const dAppDidMnemonic = process.env.DAPP_DID_MNEMONIC
    if (!dAppDidMnemonic) {
      throw new Error('Enter your dApps mnemonic on the .env file')
    }

    const { keyAgreement } = generateKeypairs(dAppDidMnemonic)

    const decryptedBytes = Kilt.Utils.Crypto.decryptAsymmetric(
      { box: encryptedChallenge, nonce },
      // fetch from the chain:
      encryptionKey.publicKey,
      // derived from your seed phrase:
      keyAgreement.secretKey
    )
    // If it fails to decrypt, throw.
    if (!decryptedBytes) {
      throw new Error(
        'Could not decode/decrypt the challange from the extension'
      )
    }

    const decryptedChallenge = Kilt.Utils.Crypto.u8aToHex(decryptedBytes)
    const originalChallenge = cookiePayloadServerSession.challenge

    // Compare the decrypted challenge to the challenge you stored earlier.
    console.log(
      '\n',
      `original Challenge: ${originalChallenge} \n`,
      `decrypted Challenge: ${decryptedChallenge} \n`
    )
    if (decryptedChallenge !== originalChallenge) {
      response
        .status(401)
        .send("Session verification failed. The challenges don't match.")
      throw new Error('Invalid challenge')
    }

    console.log('Session successfully verified.\n')
    response
      .status(200)
      .send(
        'Session succesfully verified. Extension and dApp understand each other.'
      )
  } catch (err) {
    // print the possible error on the frontend
    next(err)
  }
}
