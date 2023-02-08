import * as Kilt from '@kiltprotocol/sdk-js';
import { hexToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';

/**
 * from a DID address in hexadecimal numbers to a DIDUri as a string.
 */
export function decodeDidUri(hexadecimal: HexString): string {
    const didUri = encodeAddress(hexToU8a(hexadecimal), Kilt.Utils.ss58Format);
    console.log(didUri);
    return didUri;
}



/**
 * This fetchtes the DID Document from the blockchain. So only the public information. 
 * It also check if the DID was deleted (deactivatd).
 * 
 * @param didUri URI of the DID to be fetched from the chain.  
 * @returns DID-Document and metadata.
 */
export async function queryFullDid(
    didUri: Kilt.DidUri
): Promise<Kilt.DidDocument | null> {
    const resolvedDid = await Kilt.Did.resolve(didUri);
    if (resolvedDid) {
        const document = resolvedDid.document;
        const metadata = resolvedDid.metadata;
        if (metadata.deactivated) {
            console.log(`DID ${didUri} has been deleted.`);
            return null;
        } else if (document === undefined) {
            console.log(`DID ${didUri} does not exist.`);
            return null;
        } else {
            return document;
        }
    }

    return null;

}