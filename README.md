# web3-login-demo

This project demonstrates how to enable **login using KILT Protocol**.

During the login procedure, the user is required to present a credential.
You can decide which credentials to accept.
They could be issued by yourself or by other attesters.

This is basically like asking for an ID-Card insead of a customer number, in order to provide a personalized service.
This means that each user does not need to setup an account and password just for your website.
Additionally, this avoids third parties (usually powerfull data-collecting companies) from tracking your interactions with your clients. Not even the KILT developers can track it. 


In order for a **dApp** to support logging in with KILT Credentials, it needs:

1. It's on-chain DID

- This DID is used so that the user knows the parties to whom they talk.

2. It's Domain linkage credential

- Bind your DID to a specific domain.
- This prevents Man-in-the-Middle attacks.

3. A CType to request from the user
- The type of credentials you consider valid. 
- In this demo, as a default, we request a credential that contains an email address.
For that we rely on [SocialKYC](https://socialkyc.io) to issue email credentials after verifing the user owns it.
You could easily modified this. 

If you don't have some of the above, make sure to go though the [setup section](#setup).

## Prerequisite

This code makes use of a mix of different technologies.
If you are not familiar with some of these, we recommend to first get an overview about them.

- [decentralized identifier (DID)](https://docs.kilt.io/docs/concepts/did)
- [typescript](https://www.typescriptlang.org/)
- [JSON](https://www.json.org/json-en.html)
- [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token)
- [express.js](https://expressjs.com/)
- [react.js](https://react.dev/)

## Environment Variables

Before you can run this project, you need to setup your environment variables.
This variables specify which blockchain we use and they hold the secrets for your DID and to sign JWTs.
Defining them is part of the set up of your project.

The `.env`-file should be on the root directory of this repository.
_This file maybe hidden._
It is included on the `.gitignore` list so that the secrets that are contained in the file never get pushed to GitHub.

The following variables are required:

- `WSS_ADDRESS` = _This is the websocket address of the RPC node_
- `FRONTEND_PORT` = _This is the local Port on which your website (client-side) would be reachable (frontend)_
- `BACKEND_PORT` = _This is the local Port on which your server would be reachable (backend)_
- `DAPP_ACCOUNT_MNEMONIC` = _This is the mnemonic of the Kilt account paying for all transactions_
- `DAPP_DID_MNEMONIC` = _This is the mnemonic of the Kilt DID that identifies your dApp_
- `DAPP_DID_URI` = _This is the URI of the Kilt DID that identifies your dApp_
- `DAPP_NAME` = _This should be a custom name for your dApp_
- `JWT_SIGNER_SECRET` = _This is secret key (string) that signs the Json-Web-Tokens before saving them in the Cookies_

There is a script to facilitate the generation of the environment variables that are needed to set up your decentralized App (dApp).
This script is called `./scripts/genesisEnvironmentVariables.ts`.
You can execute it by running `yarn environment`.

Setting up is a step by step process.
You will need to run the script repeatedly and follow the instructions that it provides, depending on your project's state.
After running this script each time, you need to manually copy the output and save it on the .env-file on the main project folder.

## Process

```
+-----------+                                                   +---------+                                                                 +---------+
| Extension |                                                   | Browser |                                                                 | Server  |
+-----------+                                                   +---------+                                                                 +---------+
      |                                                              | ------------------------\                                                 |
      |                                                              |-| User visits web3login |                                                 |
      |                                                              | |-----------------------|                                                 |
      |                                                              | --------------------------------------\                                   |
      |                                                              |-| User chooses an Extension X         |                                   |
      |                                                              | | and clicks on the "Connect" button. |                                   |
      |                                                              | |-------------------------------------|                                   |
      |                                                              |                                                                           |
      |                                please allow use on this page |                                                                           |
      |<-------------------------------------------------------------|                                                                           |
      | -------------------------------------------------------\     |                                                                           |
      |-| Only the "Extension X" pops up, only the first time. |     |                                                                           |
      | |------------------------------------------------------|     |                                                                           |
      | ---------------------------------------\                     |                                                                           |
      |-| The Domain Linkage Credentials under |                     |                                                                           |
      | | .well-known/did-configuration.json   |                     |                                                                           |
      | | is verified.                         |                     |                                                                           |
      | |--------------------------------------|                     |                                                                           |
      |                                                              |                                                                           |
      | User granted access                                          |                                                                           |
      |------------------------------------------------------------->|                                                                           |
      |                                                              |                                                                           |
      |                                                              | GET /api/session/start                                                    |
      |                                                              |-------------------------------------------------------------------------->|
      |                                                              |                                                                           |
      |                                                              |                                                                    200 OK |
      |                                                              |        set-cookie: sessionJWT={dAppName, dAppEncryptionKeyUri, challenge} |
      |                                                              |                               {dAppName, dAppEncryptionKeyUri, challenge} |
      |                                                              |<--------------------------------------------------------------------------|
      |                                                              |                                                                           |
      |      startSession(dAppName, dAppEncryptionKeyUri, challenge) |                                                                           |
      |<-------------------------------------------------------------|                                                                           |
      |                                                              |                                                                           |
      | {encryptionKeyId, encryptedChallenge, nonce}                 |                                                                           |
      |------------------------------------------------------------->|                                                                           |
      |                                                              |                                                                           |
      |                                                              | POST /api/session/verify                                                  |
      |                                                              | Cookie: sessionJWT={dAppName, dAppEncryptionKeyUri, challenge}            |
      |                                                              | {encryptionKeyId, encryptedChallenge, nonce}                              |
      |                                                              |-------------------------------------------------------------------------->|
      |                                                              |                     ----------------------------------------------------\ |
      |                                                              |                     | Verify sessionJWT.                                |-|
      |                                                              |                     | Decrypt challenge using nonce and encryptionKeyId | |
      |                                                              |                     | Verify Extension Session:                         | |
      |                                                              |                     | Assert that jwt-challenge (our)                   | |
      |                                                              |                     | and decrypted-challenge (theirs) match.           | |
      |                                                              |                     |---------------------------------------------------| |
      |                                                              |                                                                           |
      |                                                              |                                                                    200 OK |
      |                                                              |      set-cookie: sessionJWT={{dAppName, dAppEncryptionKeyUri, challenge}, |
      |                                                              |                             {encryptionKeyId, encryptedChallenge, nonce}} |
      |                                                              |<--------------------------------------------------------------------------|
      |               ---------------------------------------------\ |                                                                           |
      |               | Server-Extension-Session established ✉️ ⛓️ |-|                                                                           |
      |               |--------------------------------------------| |                                                                           |
      |                                                              | -----------------------\                                                  |
      |                                                              |-| User clicks on Login |                                                  |
      |                                                              | |----------------------|                                                  |
      |                                                              |                                                                           |
      |                                                              | GET /api/credential/login/request                                         |
      |                                                              | Cookie: sessionJWT                                                        |
      |                                                              |-------------------------------------------------------------------------->|
      |                                                              |       ------------------------------------------------------------------\ |
      |                                                              |       | The Server is asking for a Credential of a cType from the User. |-|
      |                                                              |       |-----------------------------------------------------------------| |
      |                                                              |                                                                           |
      |                                                              |                                                                    200 OK |
      |                                                              |                            set-cookie: credentialJWT={challengeOnRequest} |
      |                                                              |                                               KiltMsg{request-credential} |
      |                                                              |<--------------------------------------------------------------------------|
      |                                                              |                                                                           |
      |                            send(KiltMsg{request-credential}) |                                                                           |
      |<-------------------------------------------------------------|                                                                           |
      | -----------------------------------\                         |                                                                           |
      |-| User approves the request        |                         |                                                                           |
      | | and selects credential to share. |                         |                                                                           |
      | |----------------------------------|                         |                                                                           |
      |                                                              |                                                                           |
      | KiltMsg{submit-credential}                                   |                                                                           |
      |------------------------------------------------------------->|                                                                           |
      |                                                              |                                                                           |
      |                                                              | Post /api/credential/login/submit                                         |
      |                                                              | Cookie: credentialJWT                                                     |
      |                                                              | KiltMsg{submit-credential}                                                |
      |                                                              |-------------------------------------------------------------------------->|
      |                                                              |                      ---------------------------------------------------\ |
      |                                                              |                      | Verify the credential.                           |-|
      |                                                              |                      | Note the DID inside the credential.              | |
      |                                                              |                      | If verification was successful,                  | |
      |                                                              |                      | DID was authenticated with provided credentials. | |
      |                                                              |                      |--------------------------------------------------| |
      |                                                              |                      ---------------------------------------------------\ |
      |                                                              |                      | The login with credential process was completed. |-|
      |                                                              |                      | An authentication token is given to the user.    | |
      |                                                              |                      | It's all like web2 from here on.                 | |
      |                                                              |                      |--------------------------------------------------| |
      |                                                              |                                                                           |
      |                                                              |                                                                    200 OK |
      |                                                              |                                set-cookie: accessJWT{authenticationToken} |
      |                                                              |<--------------------------------------------------------------------------|
      |                                                              |                                                                           |
```
