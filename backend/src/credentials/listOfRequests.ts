import * as Kilt from '@kiltprotocol/sdk-js'

// Establish which cTypes our dApp accepts and which attesters we trust:

/**
 * Email Credential Type attested from SocialKYC.io
 */
export const emailRequest: Kilt.IRequestCredentialContent = {
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
      cTypeHash:
        '0xae5bc64e500eb576b7b137288cec5d532094e103be46872f1ad54641e477d9fe',
      trustedAttesters: [
        'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY'
      ],
      requiredProperties: ['Email']
    }
  ]
}
