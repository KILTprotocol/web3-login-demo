import dotenv from 'dotenv';
import * as Kilt from '@kiltprotocol/sdk-js';
import { mnemonicGenerate, mnemonicToMiniSecret } from '@polkadot/util-crypto';
import { generateKeypairs } from '../backend/src/utils/attester/generateKeyPairs';
import { generateAccount } from '../backend/src/utils/attester/generateAccount';
import { generateFullDid } from '../backend/src/utils/attester/generateFullDid';


async function main() {

    console.log("\u001B[38;5;201m", "Making this output purple");

    // try to read the variables from the .env-file:
    dotenv.config();
    const WSS_ADDRESS = process.env.WSS_ADDRESS; // webSocket
    const ORIGIN = process.env.ORIGIN; // domainOrigin
    const DAPP_ACCOUNT_MNEMONIC = process.env.DAPP_ACCOUNT_MNEMONIC; // fundsMnemonic
    const DAPP_ACCOUNT_ADDRESS = process.env.DAPP_ACCOUNT_ADDRESS; // fundsAddress
    const DAPP_DID_MNEMONIC = process.env.DAPP_DID_MNEMONIC; // dAppMnemonic
    const DAPP_DID_URI = process.env.DAPP_DID_URI; // dAppURI

    // decide where you are: 
    let step: number = 0;
    let stairs: (string | undefined)[] = [WSS_ADDRESS, ORIGIN, DAPP_ACCOUNT_MNEMONIC, DAPP_ACCOUNT_ADDRESS, DAPP_DID_MNEMONIC, DAPP_DID_URI];

    for (let index = 0; index < stairs.length; index++) {
        const value = stairs[index];

        if (!value) { // if the variable is still undefined
            step = index;
            console.log(`the ${index}-th enviorment variable is still undefined \n`);
            break; // end this for-loop
        } else if (index === stairs.length - 1) {
            step = stairs.length; // You already climbed up all the stairs
            //throw new Error("It seems like all enviorment variables are already defined.");
            console.log("It seems like all enviorment variables are already defined.");
        }
    }

    // Go through the current step:
    switch (step) {
        case 0: // first assign a websocket of the blockchain you want to interact with:
            console.log("\ntrouble reading the address of the WebSocket\n");
            console.log("please, define a value for WSS_ADDRESS on the .env-file to continue, and then run this file again\n");
            console.log("to connect to the KILT-Test-Blockchain, named Peregrine (recomended), please save the following:\n\n\n",
                'WSS_ADDRESS=wss://peregrine.kilt.io/parachain-public-ws\n\n');
            console.log("In the future, if you wish to interact with the production KILT-Blockchain, named Spiritnet, change the address to a web-socket (public Endpoint) of Spiritnet.",
                "More info under: ", "https://docs.kilt.io/docs/develop/chain/deployments", "\n\n");
            break;

        case 1: // then assing where the dApp is going to be reachable
            console.log("\ntrouble reading the URL-Address of your dApp\n");
            console.log("please, define a value for ORIGIN on the .env-file to continue, and then run this file again\n");
            console.log("first it should only run locally. You can use a custom IP or just the default:\n");
            console.log("Default dApps domain origin: \n",
                'ORIGIN=http://localhost:8080/', "\n\n");
            break;

        case 2: // then we generate an account
            console.log("\ntrouble reading the account's mnemonic of your dApp\n");
            console.log("An account is being generated for your dApp.");
            await Kilt.connect(WSS_ADDRESS!);
            const mnemonic = mnemonicGenerate();
            // you could manually enter a custom mnemonic here instead
            const account = generateAccount(mnemonic);
            console.log('\n please, save mnemonic and address of your dApps account to the .env-file to continue!\n\n');
            console.log(`DAPP_ACCOUNT_MNEMONIC=${mnemonic}`);
            console.log(`DAPP_ACCOUNT_ADDRESS=${account.address}\n\n`);
            console.log('You also need to deposit funds on this account, to be able to create a DID.\n For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/');
            console.log("\nAfterwards run this file again\n");
            await Kilt.disconnect();
            break;

        case 3: // save the account address as well
            console.log("\ntrouble reading the account's address of your dApp\n");
            await Kilt.connect(WSS_ADDRESS!);
            const accounty = generateAccount(DAPP_ACCOUNT_MNEMONIC!);
            console.log('\n please, save the address of your dApps account to the .env-file to continue!\n\n');
            console.log(`DAPP_ACCOUNT_ADDRESS=${accounty.address}\n\n`);
            console.log('You also need to deposit funds on this account, to be able to create a DID.\n For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/');
            console.log("\nAfterwards run this file again\n");
            await Kilt.disconnect();
            break;

        case 4: // then we generate a FullDID with all the key types
            // Load attester account
            console.log("\ntrouble reading the mnemonic of your dApp's DID\n");
            await Kilt.connect(WSS_ADDRESS!);
            console.log("\n\nA decentralized identity (DID) is being generated for your dApp.\n\n");
            const attesterAccount = generateAccount(DAPP_ACCOUNT_MNEMONIC!);
            // the DID can be generated by a different mnemonic than from the account. This is also the prefered option.
            // You could also pass a specific mnemonic, but here we generate a random mnemonic.
            const didMnemonic = mnemonicGenerate();
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
            console.log("\n please, save the URI of your dApp's DID to the .env-file to continue!\n");
            console.log(`DAPP_DID_URI=${dAppDidUri}\n`);
            await Kilt.disconnect();
            break;
        default:
            break;
    }

    console.log("\u001b[0m", "reset output appareance");
}
main(); //run the code