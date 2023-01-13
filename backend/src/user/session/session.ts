// import * as Kilt from "@kiltprotocol/sdk-js";

// const api = Kilt.ConfigService.get('api')

// const did = process.env.VERIFIER_DID_URI as Kilt.DidUri; // example: 'did:kilt:4smcAoiTiCLaNrGhrAM4wZvt5cMKEGm8f3Cu9aFrpsh5EiNV'
// const dAppName = process.env.DAPP_NAME as string;  //'Your dApp Name'

// const encodedFullDid = await api.call.did.query(Kilt.Did.toChain(did));
// const { document } = Kilt.Did.linkedInfoFromChain(encodedFullDid)
// // If there is no DID, or the DID does not have any key agreement key, return
// if (!document.keyAgreement || !document.keyAgreement[0]) {
//   return
// }
// const dAppEncryptionKeyUri =
//   `${document.uri}${document.keyAgreement[0].id}` as Kilt.DidResourceUri

// // Generate and store challenge on the server side for the next step.
// const response = await fetch('/challenge')
// const challenge = await response.text()

// const session = await window.kilt.sporran.startSession(
//   dAppName,
//   dAppEncryptionKeyUri,
//   challenge
// )

// return session