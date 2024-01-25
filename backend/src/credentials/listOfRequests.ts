import * as Kilt from '@kiltprotocol/sdk-js'

// Establish which cTypes our dApp accepts and which attesters we trust:

/**
 * Email Credential Type attested from SocialKYC.io on the Spiritnet (Production) KILT Blockchain.
 */
export const emailRequest: Kilt.IRequestCredentialContent = {
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
