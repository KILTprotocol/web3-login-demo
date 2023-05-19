# web3-login-demo

In order to run this recipe you need an on-chain DID, domain linkage credential and test Claimer credentials.
Please use the KILT Distillery CLI to quickly setup this project or generate the assets needed.

## Environment Variables

Each instance of this repository needs to include a local list of environment variables.
This variables determine the communication with the blockchain, your dApps identity and possibly influence some functions.
Defining them is part of the set up of your project.

The .env-file should be on the root directory of this repository. It's just called `.env`.
It is include on the `.gitignore` list, so that it never gets push to github.

It is a standard that all environment variables are name with capitalized letters.
Please, follow the standard and use these names for your environment variables:

- `WSS_ADDRESS` = _This is the websocket address of the RPC node_
- `FRONTEND_PORT` = _This is the local Port on which your website (client-side) would be reachable (frontend)_
- `BACKEND_PORT` = _This is the local Port on which your server would be reachable (backend)_
- `DAPP_ACCOUNT_MNEMONIC` = _This is the mnemonic of the Kilt account paying for all transactions_
- `DAPP_DID_MNEMONIC` = _This is the mnemonic of the Kilt DID that identifies your dApp_
- `DAPP_DID_URI` = _This is the URI of the Kilt DID that identifies your dApp_
- `DAPP_NAME` = _This should be a custom name for your dApp_
- `JWT_SIGNER_SECRET` = _This is secret key (string) that signs the Json-Web-Tokens before saving them in the Cookies_

There is a script to facilitate the generation of the environment variables that are needed to set up your decentralized App.
This script is called `genesisEnvironmentVariables` you can either
run:

- `yarn  ts-node ./scripts/genesisEnvironmentVariables.ts`

or just:

- `yarn environment`

to execute it once.

It is forseen that you run this file a couple of times and follow the instructions that it provides, depending on your project's state.
After running this script each time, you need to manually copy the output and save it on the .env-file on the main project folder.

Alternatively, you could manually add the values that you created somehow elsewhere.
But this is only recommended, if you really know what you are doing.

## Process

```
+-----------+                                                   +---------+                                                     +---------+
| Extension |                                                   | Browser |                                                     | Server  |
+-----------+                                                   +---------+                                                     +---------+
      |                                                              | ------------------------\                                     |
      |                                                              |-| User visits web3login |                                     |
      |                                                              | |-----------------------|                                     |
      |                                                              | ---------------------------------------------------------\    |
      |                                                              |-| User clicks button "login with Extension X"            |    |
      |                                                              | | Here the user chooses which extension they want to use |    |
      |                                                              | |--------------------------------------------------------|    |
      |                                                              |                                                               |
      |                                please allow use on this page |                                                               |
      |<-------------------------------------------------------------|                                                               |
      | ---------------------------------\                           |                                                               |
      |-| Only the "Extension X" pops up |                           |                                                               |
      | |--------------------------------|                           |                                                               |
      | ---------------------------------------\                     |                                                               |
      |-| The Domain Linkage Credentials under |                     |                                                               |
      | | .well-known/did-configuration.json   |                     |                                                               |
      | | is verified.                         |                     |                                                               |
      | |--------------------------------------|                     |                                                               |
      |                                                              |                                                               |
      | User granted access                                          |                                                               |
      |------------------------------------------------------------->|                                                               |
      |                                                              |                                                               |
      |                                                              | GET /api/initializeSessionSetup                               |
      |                                                              |-------------------------------------------------------------->|
      |                                                              |                                                               |
      |                                                              |                                                        200 OK |
      |                                                              |                                    set-cookie: JWT{challenge} |
      |                                                              |                   {dAppName, dAppEncryptionKeyUri, challenge} |
      |                                                              |<--------------------------------------------------------------|
      |                                                              |                                                               |
      |      startSession(dAppName, dAppEncryptionKeyUri, challenge) |                                                               |
      |<-------------------------------------------------------------|                                                               |
      |                                                              |                                                               |
      | {encryptionKeyId, encryptedChallenge, nonce}                 |                                                               |
      |------------------------------------------------------------->|                                                               |
      |                                                              |                                                               |
      |                                                              | POST /api/finalizeSessionSetup                                |
      |                                                              | Cookie: JWT{challenge}                                        |
      |                                                              | {encryptionKeyId, encryptedChallenge, nonce}                  |
      |                                                              |-------------------------------------------------------------->|
      |                                                              |   ----------------------------------------------------------\ |
      |                                                              |   | verify JWT{challenge}                                   |-|
      |                                                              |   | decrypt challenge using nonce and encryptionKeyId       | |
      |                                                              |   | Assert that jwt-challenge and decrypted-challenge match | |
      |                                                              |   |---------------------------------------------------------| |
      |                                                              |                                                               |
      |                                                              |                                                        200 OK |
      |                                                              |                               set-cookie:JWT{encryptionKeyId} |
      |                                                              |<--------------------------------------------------------------|
      |                                                              |                                                               |
      |                                                              | GET /api/loginRequirements                                    |
      |                                                              | Cookie:JWT{encryptionKeyId}                                   |
      |                                                              |-------------------------------------------------------------->|
      |                                                              |                                                               |
      |                                                              |                                                        200 Ok |
      |                                                              |                                   KiltMsg{request-credential} |
      |                                                              |<--------------------------------------------------------------|
      |                                                              |                                                               |
      |                                  KiltMsg{request-credential} |                                                               |
      |<-------------------------------------------------------------|                                                               |
      | -----------------------------------\                         |                                                               |
      |-| User approves the request        |                         |                                                               |
      | | and selects credential to share. |                         |                                                               |
      | |----------------------------------|                         |                                                               |
      |                                                              |                                                               |
      | KiltMsg{submit-credential}                                   |                                                               |
      |------------------------------------------------------------->|                                                               |
      |                                                              |                                                               |
      |                                                              | Post /api/provideCredential                                   |
      |                                                              | KiltMsg{submit-credential}                                    |
      |                                                              |-------------------------------------------------------------->|
      |                                                              |          ---------------------------------------------------\ |
      |                                                              |          | Verify the credential.                           |-|
      |                                                              |          | Note the DID inside the credential.              | |
      |                                                              |          | If verification was successful,                  | |
      |                                                              |          | DID was authenticated with provided credentials. | |
      |                                                              |          |--------------------------------------------------| |
      |                                                              |                                                               |
      |                                                              |                                                        200 Ok |
      |                                                              |                set-cookie:JWT{DID,claimHash,"LOGIN COMPLETE"} |
      |                                                              |<--------------------------------------------------------------|
      |                                                              |                                                               |
```