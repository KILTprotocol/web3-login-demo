# web3-login-demo

This website demonstrates how to build a logging using KILT Protocol.
During the logging procedure, the user is required to present a credential.
You can decide which credentials to accept.
They could be issued by yourself or by other attesters.
In this demo we request a credential that contains an email address that the user owns.
For that we rely on https://socialkyc.io to issue email credentials.

In order to run this demo you need the following:

1. An on-chain DID
  * This DID is used so that the user knows the parties to whom they talk
2. Domain linkage credential
  * Bind your DID to a specific domain
  * This prevents Man-in-the-Middle attacks
3. A CType you want to request from the user
  * In this example, we use the email CType, but you could use any CType you want

If you don't have some of the above, make sure to go though the [setup section](#setup).

## Prerequisite

This code makes use of a different mix of technology.
If you are not familiar with some of these, we recommend to first get an overview about them.

* [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token)
* [JSON](https://www.json.org/json-en.html)
* [decentralized identifier (DID)](https://docs.kilt.io/docs/concepts/did)
* [express.js](https://expressjs.com/)
* [react.js](https://react.dev/)
* [typescript](https://www.typescriptlang.org/)

## Setup

Before you can run this project, you need to setup your environment variables.
This variables specify which blockchain we use and they hold the secrets for your DID and to sign JWTs.
Defining them is part of the set up of your project.

The `.env`-file should be on the root directory of this repository.
*This file maybe hidden.*
It is included on the `.gitignore` list so that the secrets that are contained in the file never get pushed to GitHub.

The following variables are required:

- `WSS_ADDRESS` = _This is the websocket address of the RPC node_
- `ORIGIN` = _This is the URL domain origin of your website (frontend)_
- `PORT` = _This is the local Port on which your server would be reachable (backend)_
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
+-----------+                                                   +---------+                                                                      +---------+
| Extension |                                                   | Browser |                                                                      | Server  |
+-----------+                                                   +---------+                                                                      +---------+
      |                                                              | ------------------------\                                                      |
      |                                                              |-| User visits web3login |                                                      |
      |                                                              | |-----------------------|                                                      |
      |                                                              | ---------------------------------------------------------\                     |
      |                                                              |-| User clicks button "login with Extension X"            |                     |
      |                                                              | | Here the user chooses which extension they want to use |                     |
      |                                                              | |--------------------------------------------------------|                     |
      |                                                              |                                                                                |
      |                                please allow use on this page |                                                                                |
      |<-------------------------------------------------------------|                                                                                |
      | ---------------------------------\                           |                                                                                |
      |-| Only the "Extension X" pops up |                           |                                                                                |
      | |--------------------------------|                           |                                                                                |
      |                                                              |                                                                                |
      | User granted access                                          |                                                                                |
      |------------------------------------------------------------->|                                                                                |
      |                                                              |                                                                                |
      |                                                              | GET /api/initializeSessionSetup                                                |
      |                                                              |------------------------------------------------------------------------------->|
      |                                                              |                                                                                |
      |                                                              |                                                                         200 OK |
      |                                                              |                                                     set-cookie: JWT{challenge} |
      |                                                              |                                    {dAppName, dAppEncryptionKeyUri, challenge} |
      |                                                              |<-------------------------------------------------------------------------------|
      |                                                              |                                                                                |
      |      startSession(dAppName, dAppEncryptionKeyUri, challenge) |                                                                                |
      |<-------------------------------------------------------------|                                                                                |
      |                                                              |                                                                                |
      | {encryptionKeyId, encryptedChallenge, nonce}                 |                                                                                |
      |------------------------------------------------------------->|                                                                                |
      |                                                              |                                                                                |
      |                                                              | POST /api/finalizeSessionSetup                                                 |
      |                                                              | Cookie: JWT{challenge}                                                         |
      |                                                              | {encryptionKeyId, encryptedChallenge, nonce}                                   |
      |                                                              |------------------------------------------------------------------------------->|
      |                                                              |                    ----------------------------------------------------------\ |
      |                                                              |                    | verify JWT{challenge}                                   |-|
      |                                                              |                    | decrypt challenge using nonce and encryptionKeyId       | |
      |                                                              |                    | Assert that jwt-challenge and decrypted-challenge match | |
      |                                                              |                    |---------------------------------------------------------| |
      |                                                              |                                                                                |
      |                                                              |                                                                         200 OK |
      |                                                              |                                                set-cookie:JWT{encryptionKeyId} |
      |                                                              |<-------------------------------------------------------------------------------|
      |                                                              |                                                                                |
      |                                                              | GET /api/loginRequirements                                                     |
      |                                                              | Cookie:JWT{encryptionKeyId}                                                    |
      |                                                              |------------------------------------------------------------------------------->|
      |                                                              |                                                                                |
      |                                                              |                                                                         200 Ok |
      |                                                              |                                                    KiltMsg{request-credential} |
      |                                                              |<-------------------------------------------------------------------------------|
      |                                                              |                                                                                |
      |                                  KiltMsg{request-credential} |                                                                                |
      |<-------------------------------------------------------------|                                                                                |
      | ----------------------------------\                          |                                                                                |
      |-| User approves the request       |                          |                                                                                |
      | | and selects credential to share |                          |                                                                                |
      | |---------------------------------|                          |                                                                                |
      |                                                              |                                                                                |
      | KiltMsg{submit-credential}                                   |                                                                                |
      |------------------------------------------------------------->|                                                                                |
      |                                                              |                                                                                |
      |                                                              | Post /api/provideCredential                                                    |
      |                                                              | KiltMsg{submit-credential}                                                     |
      |                                                              |------------------------------------------------------------------------------->|
      |                                                              |------------------------------------------------------------------------------\ |
      |                                                              || Verify the credential                                                       |-|
      |                                                              || Note the DID inside the credential                                          | |
      |                                                              || if verification was successful, DID authenticated with provided credentials | |
      |                                                              ||-----------------------------------------------------------------------------| |
      |                                                              |                                                                                |
      |                                                              |                                                                         200 Ok |
      |                                                              |                                 set-cookie:JWT{DID,claimHash,"LOGIN COMPLETE"} |
      |                                                              |<-------------------------------------------------------------------------------|
      |                                                              |                                                                                |
```