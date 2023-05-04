import * as Kilt from '@kiltprotocol/sdk-js'
import { Response, Request } from 'express'
import jwt from 'jsonwebtoken'

import { JWT_SIGNER_SECRET } from '../../config'

import { generateKeypairs } from '../utils/generateKeyPairs'
import { getApi } from '../utils/connection'
import { extractEncryptionKeyUri } from '../utils/extractEncryptionKeyUri'
import { readSessionCookie } from '../utils/readSessionCookie'

import { cookieOptions, SessionValues } from './startSession'

export async function verifySession(
  request: Request,
  response: Response
): Promise<void> {
  await getApi()

  const secretKey = JWT_SIGNER_SECRET
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
  const cookiePayload = await readSessionCookie(request, response, secretKey)
  const serverSession = cookiePayload.server

  // Important/Real Verification:

  const { extensionSession } = request.body
  const { encryptedChallenge, nonce } = extensionSession
  // This variable has different name depending on the session version that the extension uses

  const extensionEncryptionKeyUri = extractEncryptionKeyUri(extensionSession)
  const encryptionKey = await Kilt.Did.resolveKey(extensionEncryptionKeyUri)
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
  const originalChallenge = serverSession.challenge

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

  console.log(
    'Session successfully verified.\n',
    'Cookie is being updated to include the extension session values.\n'
  )

  // update the cookie so that it also includes the extensionSession-Values

  const completeSessionValues: SessionValues = {
    server: {
      dAppName: serverSession.dAppName,
      dAppEncryptionKeyUri: serverSession.dAppEncryptionKeyUri,
      challenge: serverSession.challenge
    },
    extension: {
      encryptedChallenge: extensionSession.encryptedChallenge,
      encryptionKeyUri: extensionEncryptionKeyUri,
      nonce: extensionSession.nonce
    }
  }

  // Create a Json-Web-Token:
  // cookieOptions are imported from startSession for unanimity
  // set the expiration of JWT same as the Cookie
  const optionsJwt = {
    expiresIn: `${cookieOptions.maxAge} seconds`
  }
  // default to algorithm: 'HS256',
  const token = jwt.sign(completeSessionValues, secretKey, optionsJwt)

  // Set a Cookie in the header including the JWT and our options:
  // Using 'cookie-parser' dependency:
  response.cookie('sessionJWT', token, cookieOptions)

  response
    .status(200)
    .send(
      'Session successfully verified. Extension and dApp understand each other. Server and Extension Session Values now on the Cookie.'
    )
}
