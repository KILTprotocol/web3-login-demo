# web3-login-demo

In order to run this recipe you need an on-chain DID, domain linkage credential and test Claimer credentials.
Please use the KILT Distillery CLI to quickly setup this project or generate the assets needed.

## Enviroment Variables

Each instance of this repository needs to include a local list of environment variables.
This variables determine the comunication with the blockchain, your dApps identity and possibly influence some functions.
Defining them is part of the set up of your project.

The .env-file should be on the root directory of this repository. It's just called `.env`.
It is include on the `.gitignore` list, so that it never gets push to github.

It is a standard that all enviroment variables are name with capitalized letters.
Please, follow the standard and use these names for your environment variables:

- `WSS_ADDRESS` = _This is the websocket address of the RPC node_
- `ORIGIN` = _This is the URL domain origin of your website (frontend)_
- `PORT` = _This is the local Port on wich your server would be reachable (backend)_
- `DAPP_ACCOUNT_MNEMONIC` = _This is the mnemonic of the Kilt account paying for all transactions_
- `DAPP_ACCOUNT_ADDRESS` = _This is the address of the Kilt account paying for all transactions_
- `DAPP_DID_MNEMONIC` = _This is the mnemonic of the Kilt DID that identifies your dApp_
- `DAPP_DID_URI` = _This is the URI of the Kilt DID that identifies your dApp_
- `DAPP_NAME` = _This should be a custom name for your dApp_
- `JWT_UNIQUE_PEN` = _This is secret key (string) that signs the Json-Web-Tokens before saving them in the Cookies_

There is a script to facilitate the generetion of the environment variables that are needed to set up your decentralized App.
This script is called `genesisEnvironmentVariables` you can either
run:

- `yarn  ts-node ./scripts/genesisEnvironmentVariables.ts`

or just:

- `yarn environment`

to execute it once.

It is forseen that you run this file a couple of times and follow the instructions that it provides, depending on your project's state.
After running this script each time, you need to manually copy the output and save it on the .env-file on the main project folder.

Alternativly, you could manually add the values that you created somehow elsewhere.
But this is only recommended, if you really know what you are doing.
