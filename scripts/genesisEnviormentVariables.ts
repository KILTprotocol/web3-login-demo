import { config as envConfig } from 'dotenv';
import * as Kilt from '@kiltprotocol/sdk-js';
import { mnemonicGenerate, mnemonicToMiniSecret } from '@polkadot/util-crypto';
import generateKeypairs from '../backend/src/utils/attester/generateKeyPairs';
import generateAccount from '../backend/src/utils/attester/generateAccount';
import generateFullDid from '../backend/src/utils/attester/generateFullDid';

// This scripts facilitate the generetion of the enviorment variables that are needed to set up your decentralized App.
// The Values of this variables define who your dApp is and influence most of it functions. 

// It is forseen that you run this file a couple of times and follow the instructions that it provides, depending on your project's state. 
// So, after running this script, you need to manually copy the output and save it on the .env-file on the main project folder.

if (require.main === module) {
    ; (async () => {
        console.log("\u001B[38;5;201m", "Making this output purple");

        // try to read the variables from the .env-file:
        envConfig();
        const webSocket = process.env.WSS_ADDRESS;
        const domainOrigin = process.env.ORIGIN;
        const fundsMnemonic = process.env.DAPP_ACCOUNT_MNEMONIC;
        const fundsAddress = process.env.DAPP_ACCOUNT_ADDRESS;
        const dAppMnemonic = process.env.DAPP_DID_MNEMONIC;
        const dAppURI = process.env.DAPP_DID_URI;


        // decide where you are: 
        let step: number = 0;
        let stairs: (string | undefined)[] = [webSocket, domainOrigin, fundsMnemonic, fundsAddress, dAppMnemonic, dAppURI];

        for (let index = 0; index < stairs.length; index++) {
            const value = stairs[index];

            if (!value) { // if the variable is still undefined
                step = index;
                console.log(`the ${index}-th enviorment variable is still undefined \n`);
                break; // end this for-loop
            } else if (index === stairs.length - 1) {
                step = stairs.length; // You already climbed up all the stairs
                throw console.log("It seems like all enviorment variables are allready defined.");
            }
        }

        // Go through the current step:
        switch (step) {
            case 0: // first assign a websocket of the blockchain you want to interact with:
                console.log("\ntrouble reading the address of the WebSocket\n");
                console.log("please, define a value for WSS_ADDRESS on .env to continue, and then run this file again\n");
                console.log("to connect to the KILT-Test-Blockchain, named Peregrine (recomended), please save the following:\n\n\n",
                    'WSS_ADDRESS=wss://peregrine.kilt.io/parachain-public-ws\n\n');
                console.log("In the future, if you wish to interact with the production KILT-Blockchain, named Spiritnet, change the address to a web-socket (public Endpoint) of Spiritnet.",
                    "More info under: ", "https://docs.kilt.io/docs/develop/chain/deployments", "\n\n");
                break;

            case 1: // then assing where the dApp is going to be reachable
                console.log("\ntrouble reading the URL-Address of your dApp\n");
                console.log("please, define a value for ORIGIN on .env to continue, and then run this file again\n");
                console.log("first it should only run locally. You can use a custom IP or just the default:\n");
                console.log("Default dApps domain origin: \n",
                    'ORIGIN=http://localhost:8080/', "\n\n");
                break;

            case 2: // then we generate an account
                console.log("\ntrouble reading the account's mnemonic of your dApp\n");
                console.log("An account is being generated for you.");
                await Kilt.connect(webSocket!);
                const mnemonic = mnemonicGenerate();
                // you could manually enter a custom mnemonic here instead
                const account = generateAccount(mnemonic);
                console.log('\n please, save mnemonic and address of your dApps account to .env to continue!\n\n');
                console.log(`DAPP_ACCOUNT_MNEMONIC="${mnemonic}"`);
                console.log(`DAPP_ACCOUNT_ADDRESS="${account.address}"\n\n`);
                console.log('You also need to deposit funds on this account, to be able to create a DID.\n For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/');
                console.log("\nAfterwards run this file again\n");
                await Kilt.disconnect();
                break;

            case 3: // save the account address as well
                console.log("\ntrouble reading the account's address of your dApp\n");
                await Kilt.connect(webSocket!);
                const accounty = generateAccount(fundsMnemonic!);
                console.log('\n please, save the address of your dApps account to .env to continue!\n\n');
                console.log(`DAPP_ACCOUNT_ADDRESS="${accounty.address}"\n\n`);
                console.log('You also need to deposit funds on this account, to be able to create a DID.\n For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/');
                console.log("\nAfterwards run this file again\n");
                await Kilt.disconnect();
                break;

            case 4: // then we generate a FullDID with all the key types
                // Load attester account
                const attesterAccount = generateAccount(fundsMnemonic!);

                // the DID can be generated by a different mnemonic than from the account. This is also the prefered option.
                // You could also pass a specific mnemonic, but here we generate a random mnemonic.
                const didMnemonic = mnemonicGenerate();
                const fullDid = await generateFullDid(attesterAccount, didMnemonic);

                console.log('\nsave following to .env to continue\n');
                console.error(`DAPP_DID_MNEMONIC=${didMnemonic}\n`);
                console.error(`DAPP_DID_URI=${fullDid.uri}\n`);
                break;
            default:
                break;
        }





        // // then we generate a FullDID with all the key types
        // // If the account is already defined
        // if (process.env.ATTESTER_ACCOUNT_MNEMONIC) {
        //     try {

        //         // Load attester account
        //         const accountMnemonic = process.env.ATTESTER_ACCOUNT_MNEMONIC as string;
        //         const account = generateAccount(accountMnemonic);
        //         //const dAppMnemonic = process.env.ATTESTER_DID_MNEMONIC as string;

        //         // the DID can be generated by a different mnemonic than from the account. This is also the prefered option.
        //         // I could also pass a specific mnemonic, but here we generate a random mnemonic.
        //         const didMnemonic = mnemonicGenerate();
        //         const fullDid = await generateFullDid(account, didMnemonic);

        //         console.log('\nsave following to .env to continue\n');
        //         console.error(`ATTESTER_DID_MNEMONIC=${didMnemonic}\n`);
        //         console.error(`ATTESTER_DID_URI=${fullDid.uri}\n`);


        //     } catch (e) {
        //         console.log('Error while creating attester DID');
        //         throw e;
        //     }
        // } else {
        //     throw new Error("you need to define the ATTESTER_ACCOUNT_MNEMONIC first");

        // };

        console.log("\u001b[0m", "reset output appareance");
    })();
}