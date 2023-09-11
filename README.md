# web3-login-demo

## Intro

This project demonstrates how to enable **login using KILT Protocol**.
It is an educational project, everything is broken down to little steps and has explanations to ease your understanding.

During [the login procedure](#login-process), the user is required to present a credential.
You can decide which credentials to accept.
They could be issued by yourself or by other attesters.

This is basically like asking for an ID-Card instead of a customer number, in order to provide a personalized service.
This means that users don't not need to setup an account and password just for your website.
Additionally, this avoids third parties (usually powerful data-collecting companies) from tracking your interactions with your clients.
Not even the KILT developers can track it.

In order for a **dApp** to support logging in with KILT Credentials, it needs:

1. It's on-chain DID

- This DID is used so that the user knows the parties to whom they talk.

2. It's [Domain Linkage Credential](#Well-Known-DID-Configuration)

- Bind your DID to a specific domain.
- This prevents Man-in-the-Middle attacks.
- Also known as the _well-known-did-configuration_.

3. A CType to request from the user

- The type of credentials the dApp considers valid.
- In this demo, as a default, we request a credential that contains an email address.
  For that we rely on [SocialKYC](https://socialkyc.io) to issue email credentials after verifying the user owns it.
  You could easily modified this.

If you don't have some of the above, don't worry, we help you get them on the sections below.

After setting up and running this project locally on your computer, you will know how the [login process](#Process) works and have code that you can implement on your website.
We encourage you to customize the code for your specific usecase, just keep in mind the [specifications](https://github.com/KILTprotocol/spec-ext-credential-api) to retain compatibility.

If you want to implement KILT Login without understanding it, we also have a solution for you.
There is a [containerized version under this repository](https://github.com/KILTprotocol/kilt-login).

## Prerequisite

This code makes use of a mix of different technologies.
If you are not familiar with some of these, we recommend to first get an overview about them.

- [decentralized identifier (DID)](https://docs.kilt.io/docs/concepts/did)
- [typescript](https://www.typescriptlang.org/)
- [JSON](https://www.json.org/json-en.html)
- [JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [express.js](https://expressjs.com/)
- [react.js](https://react.dev/)

## Installation

After [cloning the repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) to install all required modules,

- run: `yarn install`.

## Environment Variables

Before you can run this project, you need to setup your environment variables.
This variables specify which blockchain we use and they hold the secrets for your DID and to sign JWTs.
Defining them is part of the set up of your project.

The `.env`-file should be on the root directory of this repository.
_This file maybe hidden._
It is included on the `.gitignore` list so that the secrets that are contained in the file never get pushed to GitHub.
On the root directory, there is a `.env.example`-file that depicts the how your variables should look like.

The following variables are required:

- `WSS_ADDRESS` = _This is the websocket address of the RPC node_
- `FRONTEND_PORT` = _This is the local Port on which your website (client-side) would be reachable_
- `BACKEND_PORT` = _This is the local Port on which your server would be reachable_
- `DAPP_ACCOUNT_MNEMONIC` = _This is the mnemonic of the Kilt account paying for all transactions_
- `DAPP_DID_MNEMONIC` = _This is the mnemonic of the Kilt DID that identifies your dApp_
- `DAPP_DID_URI` = _This is the URI of the Kilt DID that identifies your dApp_
- `DAPP_NAME` = _This should be a custom name for your dApp_
- `JWT_SIGNER_SECRET` = _This is secret key (string) that signs the Json-Web-Tokens before saving them in the Cookies_

### How do I get mine?

You have three different options:

1. Using `yarn environment`:

   There is a script to facilitate the generation of the environment variables inside of this repository.
   This script is called `./scripts/genesisEnvironmentVariables.ts`.

   - You can execute it by running `yarn environment`.

   Setting up your environment with this script is a step by step process.
   You will need to run the script repeatedly and follow the instructions that it provides, depending on your project's state.
   After running this script each time, you need to manually copy the output and save it on the `.env`-file .

2. Usign the [kilt-distillery-cli](https://github.com/KILTprotocol/kilt-distillery-cli)

   This is a _Command Line Interface_ tool that can help you obtaining this variables and also does other common tasks (unrelated to this project).
   The distillery uses the same key derivation as this repository, wich means that it is highly compatible.

3. Without help:

   If you are a _pro_, you could defined and generate them externally and add them to the `.env`-file.
   You would probably have to modify the `generateKeyPairs.ts` files (on _scripts_ and _backend_) to match your key derivation though.

## Well-Known-DID-Configuration

After having all your enviorement variables, to build a **Domain Linkage Credential**:

- run: `yarn well-known-config`.

If you want know more about this, check out the [Identity Foundation Documentation](https://identity.foundation/.well-known/resources/did-configuration/).
[Our dApp documentation also have a section about this.](https://docs.kilt.io/docs/develop/dApp/well-known-did-config)

## Build

After having all your environment variables and your well-known-did-configuration:

- run `yarn build`.

## Starting the dApp locally

After having all your environment variables, your well-known-did-configuration and a build version:

- run `yarn start`.

## Login Process

After having set up the whole project, when the website is up and running, the login process can take place.
Each user that wants to login would trigger the process that is displayed below.
The process is full of HTTPS queries and extension-api's messages.

A user could trigger the whole process with just one click on the website, for example "Login with extension X" or "Login with extension Y".

On this example project, several (2-3) interactions are need because it is broken down on steps.
We encourage you to open and read the browser's and backend's consoles.
Try to understand what is happening on each step, which function is responsible for what, how did the cookies changed.

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
      |               | Server-Extension-Session established ✉️ ⛓️ |-|                                                                            |
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
