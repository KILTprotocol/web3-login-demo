import * as Kilt from '@kiltprotocol/sdk-js';
import { hexToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

/**
 * from a DID address in hexadecimal numbers to a DIDUri as a string.
 */
export default function decodeDidUri(hexadecimal: string): string {
    const didUri = encodeAddress(hexToU8a(hexadecimal), Kilt.Utils.ss58Format);
    console.log(didUri);
    return didUri;
}

