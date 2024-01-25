import * as Kilt from '@kiltprotocol/sdk-js'

// Establish which cTypes our dApp accepts and which attesters we trust:

/**
 * Usually, attesters have different DIDs depending on the blockchain, i.e. production or testnet.
 *
 * On the other hand, a cType Hash is calculated from the cType structure.
 * If exactly the same structure is used on the test and production , the cType hash would be the same.
 */

/**
 * Email Credential Type attested from SocialKYC.io
 */
export const emailRequest: Kilt.IRequestCredentialContent = {
  cTypes: [
    {
      cTypeHash:
        '0x3291bb126e33b4862d421bfaa1d2f272e6cdfc4f96658988fbcffea8914bd9ac',
      trustedAttesters: [
        /** SocialKYC on the KILT Peregrine (Test) Blockchain: */
        'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
        /** SocialKYC on the KILT Spiritnet (Production) Blockchain: */
        'did:kilt:4pnfkRn5UurBJTW92d9TaVLR2CqJdY4z5HPjrEbpGyBykare'
      ],
      requiredProperties: ['Email']
    },
    {
      // On the future, SocialKYC will use this cType instead.
      // which includes "'additionalProperties': false,"
      cTypeHash:
        '0xae5bc64e500eb576b7b137288cec5d532094e103be46872f1ad54641e477d9fe',
      trustedAttesters: [
        /** SocialKYC on the KILT Peregrine (Test) Blockchain: */
        'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
        /** SocialKYC on the KILT Spiritnet (Production) Blockchain: */
        'did:kilt:4pnfkRn5UurBJTW92d9TaVLR2CqJdY4z5HPjrEbpGyBykare'
      ],
      requiredProperties: ['Email']
    }
  ]
}
