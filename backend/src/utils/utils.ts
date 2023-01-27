import * as Kilt from '@kiltprotocol/sdk-js';


/**
 * 
 * @param didUri URI of the DID to be fetched from the chain. This gets only the public information. 
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