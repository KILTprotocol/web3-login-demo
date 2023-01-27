import * as Kilt from '@kiltprotocol/sdk-js';
import { hexToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

// from a did in hex to a didUri as string
async function main() {
    const did = encodeAddress(hexToU8a('0xf435ed850745057c2dea816df8a6da3fa941acc476ccbef6c81eb4265d2015cb'), Kilt.Utils.ss58Format);
    console.log(did);
}

main().then(() => { });