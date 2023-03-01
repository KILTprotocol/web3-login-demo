import dotenv from 'dotenv';
import * as Kilt from '@kiltprotocol/sdk-js';
import { mnemonicGenerate, mnemonicToMiniSecret } from '@polkadot/util-crypto';
import { generateKeypairs } from '../backend/src/utils/attester/generateKeyPairs';
import { generateAccount } from '../backend/src/utils/attester/generateAccount';
import { generateFullDid } from '../backend/src/utils/attester/generateFullDid';


async function main() {

    console.log("\u001B[38;5;201m", "Making this output purple\n");
    console.log(
        "This is a script for an easy creation of the enviroment variables needed for your dApp's functionality.\n",
        'All eviroment variables need to be saved on a file called ".env" that you need to create and save on the project\'s root directory.\n',
        "Is it a standard that all enviroment variables are name with capitalized letters. Please, follow the standard.\n",
        "Alternatively, you could create some of the environment values otherwise and let this script do the rest for you. Or (for pros) make them all otherwise and don't use this.\n\n"
    );

    // try to read the variables from the .env-file:
    dotenv.config();
    const WSS_ADDRESS = process.env.WSS_ADDRESS; // webSocket
    const ORIGIN = process.env.ORIGIN; // domainOrigin
    const DAPP_ACCOUNT_MNEMONIC = process.env.DAPP_ACCOUNT_MNEMONIC; // fundsMnemonic
    const DAPP_ACCOUNT_ADDRESS = process.env.DAPP_ACCOUNT_ADDRESS; // fundsAddress
    const DAPP_DID_MNEMONIC = process.env.DAPP_DID_MNEMONIC; // dAppMnemonic
    const DAPP_DID_URI = process.env.DAPP_DID_URI; // dAppURI
    const DAPP_NAME = process.env.DAPP_NAME; // Your dApp's name

    // figure out your project's current state: 
    let step: number = 0;
    let stairs: (string | undefined)[] = [WSS_ADDRESS, ORIGIN, DAPP_ACCOUNT_MNEMONIC, DAPP_ACCOUNT_ADDRESS, DAPP_DID_MNEMONIC, DAPP_DID_URI, DAPP_NAME];

    for (let index = 0; index < stairs.length; index++) {
        const value = stairs[index];

        if (!value) { // if the variable is still undefined
            step = index;
            console.log(`the ${index}-th enviorment variable is still undefined \n`);
            break; // end this for-loop
        } else if (index === stairs.length - 1) {
            step = stairs.length; // You already climbed up all the stairs
            //throw new Error("It seems like all enviorment variables are already defined.");
            console.log("It seems like all enviorment variables are already defined.\n",
                "Take in consideration, that this script does not verify if the environment values already defined are valid.\n\n");
        }
    }

    // Go through the current step:
    switch (step) {
        case 0: // first assign a websocket of the blockchain you want to interact with:
            console.log("\ntrouble reading the address of the WebSocket\n");
            console.log("please, define a value for WSS_ADDRESS on the .env-file to continue\n");
            console.log("to connect to the KILT-Test-Blockchain, named Peregrine (recomended), please save the following:\n\n\n",
                'WSS_ADDRESS=wss://peregrine.kilt.io/parachain-public-ws\n\n');
            console.log("In the future, if you wish to interact with the production KILT-Blockchain, named Spiritnet, change the address to a web-socket (public Endpoint) of Spiritnet.",
                "More info under: ", "https://docs.kilt.io/docs/develop/chain/deployments", "\n\n");
            break;

        case 1: // then assign where the dApp is going to be reachable
            console.log("\ntrouble reading the URL-Address of your dApp\n");
            console.log("please, define a value for ORIGIN on the .env-file to continue\n");
            console.log("first it should only run locally. You can use a custom IP or just the default:\n");
            console.log("Default dApps domain origin: \n",
                'ORIGIN=http://localhost:8080', "\n\n");
            break;

        case 2: // then we generate an account
            console.log("\ntrouble reading the account's mnemonic of your dApp\n");
            console.log("An account is being generated for your dApp.");
            await Kilt.connect(WSS_ADDRESS!);
            // You could also pass a specific mnemonic, but here we generate a random mnemonic.
            const mnemonic = mnemonicGenerate();// for costum, replace here with a string of 12 BIP-39 words
            const account = generateAccount(mnemonic);
            console.log('\n please, save mnemonic and address of your dApps account to the .env-file to continue!\n\n');
            console.log(`DAPP_ACCOUNT_MNEMONIC=${mnemonic}`);
            console.log(`DAPP_ACCOUNT_ADDRESS=${account.address}\n\n`);
            console.log(`You also need to deposit funds on this account, to be able to create a DID.\n For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/?${account.address} \n\n`);
            await Kilt.disconnect();
            break;

        case 3: // save the account address as well
            console.log("\ntrouble reading the account's address of your dApp\n");
            await Kilt.connect(WSS_ADDRESS!);
            const accounty = generateAccount(DAPP_ACCOUNT_MNEMONIC!);
            console.log('\n please, save the address of your dApps account to the .env-file to continue!\n\n');
            console.log(`DAPP_ACCOUNT_ADDRESS=${accounty.address}\n\n`);
            console.log(`You also need to deposit funds on this account, to be able to create a DID.\n For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/?${accounty.address} \n\n`);
            await Kilt.disconnect();
            break;

        case 4: // then we generate a FullDID with all the key types
            // Load attester account
            console.log("\ntrouble reading the mnemonic of your dApp's DID\n");
            await Kilt.connect(WSS_ADDRESS!);
            console.log("\n\nA decentralized identity (DID) is trying to be generated for your dApp. This could take some minutes.\n Make sure you have enough funds! \n\n");
            const attesterAccount = generateAccount(DAPP_ACCOUNT_MNEMONIC!);
            // the DID can be generated by a different mnemonic than from the account. This is also the prefered option.
            // You could also pass a specific mnemonic, but here we generate a random mnemonic.
            const didMnemonic = mnemonicGenerate(); // for costum, replace here with a string of 12 BIP-39 words
            const fullDid = await generateFullDid(attesterAccount, didMnemonic);

            console.log("\n please, save the mnemonic and URI of your dApp's DID to the .env-file to continue!\n");
            console.log(`DAPP_DID_MNEMONIC=${didMnemonic}`);
            console.log(`DAPP_DID_URI=${fullDid.uri}\n`);
            await Kilt.disconnect();
            break;

        case 5:
            console.log("\ntrouble reading the URI of your dApp's DID\n");
            console.log("getting the URI of the DID corresponding the provided mnemonic");
            await Kilt.connect(WSS_ADDRESS!);
            const { authentication } = generateKeypairs(DAPP_DID_MNEMONIC!);
            const dAppDidUri = Kilt.Did.getFullDidUriFromKey(authentication);
            const resolved = await Kilt.Did.resolve(dAppDidUri);
            if (!resolved?.metadata.canonicalId) {
                console.log("there is no DID-Document on the chain for the given mnemonic. The corresponding Uri would be useless.");
                console.log("Please, provide a mnemonic of registered DID!");
                console.log("Easy way: delete current mnemonic from the .env-file and run this script again");
                await Kilt.disconnect();
                return;
            };
            console.log("\n please, save the URI of your dApp's DID to the .env-file to continue!\n");
            console.log(`DAPP_DID_URI=${dAppDidUri}\n`);
            await Kilt.disconnect();
            break;
        case 6:
            console.log("\ntrouble reading your dApp's Name\n");
            console.log("Please provide a name inside the .env file using this constant name: ");
            console.log(`DAPP_NAME={your name's here}\n`);

            break;
    }

    console.log("If you are still missing some environment values and want the easy way, run this file again.\n");
    console.log("\u001b[0m", "reset output's appareance");
    return;
}
main(); //run the code