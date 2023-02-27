# web3-login-demo

In order to run this recipe you need an on-chain DID, domain linkage credential and test Claimer credentials. Please use the KILT Distillery CLI to quickly setup this project or generate the assets needed.

## Enviroment Variables

Each instance of this repository needs to include a local list of environment variables. This variables determine the comunication with the blockchain, your dApps identity and possibly influence some function. Defining them is part of the set up of your project.

The .env-file should be on the root directory of this repository. It's just called `.env`. It is include on the .gitignore list, so that it never gets push to github.

There is a script to facilitate the generetion of the environment variables that are needed to set up your decentralized App. This script is called `genesisEnvironmentVariables` you can either
run:
`yarn  ts-node ./scripts/genesisEnvironmentVariables.ts`
or just:
`environment`
to execute it once.

It is forseen that you run this file a couple of times and follow the instructions that it provides, depending on your project's state. After running this script each time, you need to manually copy the output and save it on the .env-file on the main project folder.

Alternativly, you could manually add the values that you created somehow elsewhere. But this is only recommended, if you really know what you are doing.
