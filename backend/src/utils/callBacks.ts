/* eslint-disable @typescript-eslint/no-unused-vars */
//from https://docs.kilt.io/docs/develop/sdk/cookbook/signCallback
import * as Kilt from '@kiltprotocol/sdk-js';
import { Extrinsic } from '@polkadot/types/interfaces';


/**
 * SignCallback
 * 
   * The plain SignCallback signs arbitrary data. It is called with SignRequestData which contains
    *
    * - the data as UInt8Array that should be signed
    * - the keyRelationship which specifies which DID key must be used
    * - and the did (DidUri) which specifies the DID that must sign the data
    *
    * The callback is expected to return a SignResponseData which contains:
    *
    * - the signature as an UInt8Array
    * - the keyUri which identifies the key that was used for signing
    * - and the keyType which specifies the signature scheme that was used (either sr25519, ed25519 or ecdsa)
    * The signed callback can be used as a closure. If you already have the private key of the DID stored in the surrounding scope, you can just use this key.
 * 
 * @param keyUri 
 * @param didSigningKey 
 * @returns
 */
export function useSignCallback(
    keyUri: Kilt.DidResourceUri,
    didSigningKey: Kilt.KeyringPair & { type: 'sr25519' | 'ed25519'; }
): Kilt.SignCallback {
    const signCallback: Kilt.SignCallback = async ({
        data,
        // The key relationship specifies which DID key must be used.
        keyRelationship,
        // The DID URI specifies which DID must be used. We already know which DID
        // this will be since we will use this callback just a few lines later (did === didUri).
        did
    }) => ({
        signature: didSigningKey.sign(data),
        keyType: didSigningKey.type,
        keyUri
    });

    return signCallback;
}

/**
 * SignExtrinsicCallback
 * 
    *The SignExtrinsicCallback is a special case of the SignCallback. Signing an extrinsic doesn't require the keyUri as a return value since the chain will pick the appropriate key using information from the extrinsic. The extrinsic that is submitted has a specific VerificationKeyRelationship, which defines which key must be used to sign the extrinsic. Using this relation between extrinsic and key, the chain looks up the public key and verifies the signature.
    *
    * The SignExtrinsicCallback is called with the same SignRequestData, but can return a SignResponseData that doesn't contain the keyUri but only
    *
    * - the signature as an UInt8Array
    * - and the keyType which specifies the signature scheme that was used (either sr25519, ed25519 or ecdsa).
    *
    *
 * 
 * @param didUri 
 * @param didSigningKey 
 * @param extrinsic 
 * @param submitterAddress 
 * @returns 
 */


export async function useSignExtrinsicCallback(
    didUri: Kilt.DidUri,
    didSigningKey: Kilt.KeyringPair & { type: 'sr25519' | 'ed25519'; },
    extrinsic: Extrinsic,
    submitterAddress: Kilt.KiltKeyringPair['address']
) {
    // The SignExtrinsicCallback is a more specialized SignCallback since it doesn't
    // need to return the keyUri.
    const signCallback: Kilt.SignExtrinsicCallback = async ({
        data,
        // The key relationship specifies which DID key must be used.
        keyRelationship,
        // The DID URI specifies which DID must be used. We already know which DID
        // this will be since we will use this callback just a few lines later (did === didUri).
        did
    }) => ({
        signature: didSigningKey.sign(data),
        keyType: didSigningKey.type
    });

    return await Kilt.Did.authorizeTx(
        didUri,
        extrinsic,
        signCallback,
        submitterAddress
    );
}

/**
 * GetStoreTxSignCallback
 * 
 * The GetStoreTxSignCallback is only used to sign the data that is submitted to the blockchain when a DID is being created. Because there is no DID identifier before the DID is registered on chain, this callback doesn't receive the DID as a parameter. There is also no DID document and no public key stored if the DID hasn't yet been created. Therefore the keyUri cannot point to a valid DID key and is not included in the return data.
 * 
 * @param submitterAddress 
 * @returns 
 */


export async function useStoreTxSignCallback(
    submitterAddress: Kilt.KiltKeyringPair['address']
): Promise<Kilt.SubmittableExtrinsic> {
    // Here we create a new key pair for the DID that will be created later.
    // This step might happen in an extension or else where, depending on your application.
    const authenticationKey: Kilt.KiltKeyringPair =
        Kilt.Utils.Crypto.makeKeypairFromSeed();

    // This is the sign callback. We use the just created key to sign arbitrary data
    // and return the signature together with the key type.
    const getStoreTxSignCallback: Kilt.Did.GetStoreTxSignCallback = async ({
        data
    }) => ({
        signature: authenticationKey.sign(data),
        keyType: authenticationKey.type
    });

    // Here we use the call back
    return await Kilt.Did.getStoreTx(
        {
            authentication: [authenticationKey]
        },
        submitterAddress,
        getStoreTxSignCallback
    );
}