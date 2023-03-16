import * as Kilt from '@kiltprotocol/sdk-js'
import { Response, Request, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { generateKeypairs } from '../utils/attester/generateKeyPairs'
import { getApi } from '../utils/connection'

// Define how the Session Values are packaged:
interface SessionValues {
  sessionID: string
  dAppName: string
  dAppEncryptionKeyUri: Kilt.DidResourceUri
  challenge: string
}

// Object to store all session values on the memory-cache:
const sessionStorage: { [key: string]: SessionValues } = {}

export async function generateSessionValues(): Promise<SessionValues> {
  console.log('generating session Values')
  await getApi() // connects to the websocket of your, in '.env', specified blockchain

  const DAPP_DID_URI = process.env.DAPP_DID_URI as Kilt.DidUri
  const dAppName = process.env.DAPP_NAME ?? 'Your dApp Name'

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
    dAppName: dAppName,
    dAppEncryptionKeyUri: dAppEncryptionKeyUri,
    challenge: challenge
  }

  console.log(sessionValues)

  sessionStorage[sessionID] = sessionValues

  // You can see all sessions Values (including old ones) with this:
  // console.log('All sessions stored:', sessionStorage);
  // to reset this list restart the server

  return sessionValues
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Alternative: Not using JWT, but saving values in a array on the memory-cache
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function sendSessionValues(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionValues = await generateSessionValues()
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Saving the session values as a JSON-Web-Token on a Cookie of the browser
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function generateJWT(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payload = await generateSessionValues()
    const secretKey = process.env.JWT_ENCODER
    if (!secretKey)
      throw new Error(
        "Define a value for 'JWT_ENCODER' on the '.env'-file first!"
      )

    // Create a Json-Web-Token
    const options = {
      expiresIn: '1d'
    }
    // default to algorithm: 'HS256',
    const token = jwt.sign(payload, secretKey, options)

    //console.log(token)

    // We want to save the JWT on a cookie on the browser

    // Set cookie options (list of ingredients)
    const cookieOptions: any = {
      expires: new Date(Date.now() + 86400), // expires in 1 day (in seconds)
      maxAge: 86400, // an alternative to expires: Indicates the number of seconds until the Cookie expires.
      secure: true, // only send over HTTPS
      sameSite: 'strict', // prevent cross-site request forgery attacks
      path: false, // restricts URL that can request the Cookie from the browser. '/' works for the entire domain.
      httpOnly: false // Forbids JavaScript from accessing the cookie
    }

    // Set a Cookie in the header including the JWT and our options:

    // Working version:

    // Mixing it all together
    let cookie = `sessionJWT=${token};
    Path=${cookieOptions.path ? `${cookieOptions.path};` : '/;'}
    ${cookieOptions.maxAge ? `Max-Age=${cookieOptions.maxAge};` : ''}
    ${cookieOptions.secure ? 'Secure;' : ''}
    ${cookieOptions.httpOnly ? 'HttpOnly;' : ''}
    ${cookieOptions.sameSite ? `SameSite=${cookieOptions.sameSite};` : ''}`

    // If you prefer to use 'Expires' instead:
    // ${
    //   cookieOptions.expires
    //     ? `Expires=${cookieOptions.expires.toUTCString()};`
    //     : ''
    // }

    // the '.setHeader' method does not accept new lines as part of the argument, so we have to get rid of it:
    // cutting little dinosour forms
    cookie = cookie.replace(/\s/g, ' ')
    console.log('The Cookie fresh out of the Oven: \n', cookie)

    response.setHeader(`Set-Cookie`, cookie)

    // // Experiment:
    // const cookieDough = {
    //   sessionJWT: token,
    //   path: cookieOptions.path ? `${cookieOptions.path}` : '/',
    //   maxAge: cookieOptions.maxAge ? cookieOptions.maxAge : '',
    //   secure: cookieOptions.secure ?? '',
    //   sameSite: cookieOptions.sameSite ? cookieOptions.sameSite : ''
    // }
    // response.setHeader(`Set-Cookie`, JSON.stringify(cookieDough))

    // console.log('The Json-Web-Token generated by the backend is: \n', token)
    response.status(200).send(payload)
  } catch (error) {
    // print the possible error on the frontend
    next(error)
  }
}

export async function verifySessionJWT(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    // the body is the wrapper for the information send by the frontend
    // You could print it with:
    // console.log("body", request.body);

    // extract variables:
    const { extensionSession, serverSession } = request.body
    const { encryptedChallenge, nonce } = extensionSession
    // This varible has different name depending on the session version
    let encryptionKeyUri: Kilt.DidResourceUri
    // if session is type PubSubSessionV1
    if ('encryptionKeyId' in extensionSession) {
      encryptionKeyUri = extensionSession.encryptionKeyId as Kilt.DidResourceUri
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
    const originalChallenge = serverSession.challenge

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
    return
  }

  return
}
