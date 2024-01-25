import * as Kilt from '@kiltprotocol/sdk-js'

import { WSS_ADDRESS } from '../config'

// Establish which cTypes our dApp accepts and which attesters we trust:

/**
 * Usually, attesters have different DIDs depending on the blockchain, i.e. production or testnet.
 *
 * The cType Hash is calculated from the cType structure.
 * If exactly the same structure is used on the test and production, the cType hash would be the same.
 */

/**
 * Email Credential Type attested from SocialKYC.io
 */
export let emailRequest: Kilt.IRequestCredentialContent

if (WSS_ADDRESS.includes('peregrine')) {
  /**
   * On the Peregrine (Test) KILT Blockchain.
   */
  emailRequest = {
    cTypes: [
      {
        cTypeHash:
          '0x3291bb126e33b4862d421bfaa1d2f272e6cdfc4f96658988fbcffea8914bd9ac',
        trustedAttesters: [
          'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY'
        ],
        requiredProperties: ['Email']
      },
      {
        // SocialKYC will use this cType on the future.
        // includes "'additionalProperties': false,"
        cTypeHash:
          '0xae5bc64e500eb576b7b137288cec5d532094e103be46872f1ad54641e477d9fe',
        trustedAttesters: [
          'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY'
        ],
        requiredProperties: ['Email']
      }
    ]
  }
} else {
  /**
   * On the Spiritnet (Production) KILT Blockchain.
   */
  emailRequest = {
    cTypes: [
      {
        cTypeHash:
          '0x3291bb126e33b4862d421bfaa1d2f272e6cdfc4f96658988fbcffea8914bd9ac',
        trustedAttesters: [
          'did:kilt:4pnfkRn5UurBJTW92d9TaVLR2CqJdY4z5HPjrEbpGyBykare'
        ],
        requiredProperties: ['Email']
      }
    ]
  }
}
