import * as Kilt from '@kiltprotocol/sdk-js'
import { Response, Request } from 'express'
import jwt from 'jsonwebtoken'

import { generateKeypairs } from '../utils/attester/generateKeyPairs'
import { getApi } from '../utils/connection'
import { extractEncryptionKeyUri } from '../utils/extractEncryptionKeyUri'

export async function verifySession(
  request: Request,
  response: Response
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
    throw new Error(
      'Cookie with Session JWT not found. Enable Cookies, Log-in and try again.'
    )
  }

  // decode the JWT and verify if it was signed with our SecretKey

  let cookiePayloadServerSession: jwt.JwtPayload | string
  try {
    // will throw error if verification fails
    cookiePayloadServerSession = jwt.verify(sessionCookie, secretKey)
  } catch (error) {
    throw new Error(`Could not verify JWT. ${error}`)
  }
  if (typeof cookiePayloadServerSession === 'string') {
    throw new Error(
      `Payload of unexpected type. Content: ${cookiePayloadServerSession}`
    )
  }

  // Important/Real Verification:

  const { extensionSession } = request.body
  const { encryptedChallenge, nonce } = extensionSession
  // This variable has different name depending on the session version that the extension uses

  const encryptionKeyUri = extractEncryptionKeyUri(extensionSession)
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
    // resolved from extension-URI
    encryptionKey.publicKey,
    // derived from your seed phrase:
    keyAgreement.secretKey
  )
  // If it fails to decrypt, throw.
  if (!decryptedBytes) {
    throw new Error('Could not decode/decrypt the challenge from the extension')
  }

  const decryptedChallenge = Kilt.Utils.Crypto.u8aToHex(decryptedBytes)
  const originalChallenge = cookiePayloadServerSession.challenge

  // Compare the decrypted challenge to the challenge you stored earlier.
  console.log(
    '\n',
    `(from server) original Challenge: ${originalChallenge} \n`,
    `(from extension) decrypted Challenge: ${decryptedChallenge} \n`
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
      'Session successfully verified. Extension and dApp understand each other.'
    )
}
