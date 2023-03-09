import dotenv from 'dotenv';
import * as Kilt from '@kiltprotocol/sdk-js';
import { mnemonicGenerate, mnemonicToMiniSecret } from '@polkadot/util-crypto';
import { generateKeypairs } from '../backend/src/utils/attester/generateKeyPairs';
import { generateAccount } from '../backend/src/utils/attester/generateAccount';
import { generateFullDid } from '../backend/src/utils/attester/generateFullDid';


// try to read the variables from the .env-file:
dotenv.config();
const {
    // This is the websocket address of the rpc node 
    WSS_ADDRESS,
    // This is the URL domain origin of your website
    ORIGIN,
    // This is the mnemonic of the Kilt account paying for all transactions
    DAPP_ACCOUNT_MNEMONIC,
    // This is the address of the Kilt account paying for all transactions
    DAPP_ACCOUNT_ADDRESS,
    // This is the mnemonic of the Kilt DID that identifies your dApp
    DAPP_DID_MNEMONIC,
    // This is the URI of the Kilt DID that identifies your dApp
    DAPP_DID_URI,
    // This should be a custom name for your dApp
    DAPP_NAME
} = process.env;



async function main() {

    // Making the output purple
    console.log("\u001B[38;5;201m");

    console.log(
        "This is a script for an easy creation of the enviroment variables needed for your dApp's functionality.\n\n",

        'All eviroment variables need to be saved on a file called ".env" that you need to create and save on the project\'s root directory.',
        'It is a standard that all environment variables are name with capitalized letters.',
        'Please, follow the standard.\n\n',

        "Alternatively, you could create some of the environment values otherwise and let this script do the rest for you. Or (for pros) make them all otherwise and don't use this.\n\n"
    );



    // figure out your project's current state: 
    let step: number = 0;
    let stairs: (string | undefined)[] = [WSS_ADDRESS, ORIGIN, DAPP_ACCOUNT_MNEMONIC, DAPP_ACCOUNT_ADDRESS, DAPP_DID_MNEMONIC, DAPP_DID_URI, DAPP_NAME];

    // find the first element in the array "stairs" that it is still undefined. 
    step = stairs.indexOf(undefined);
    // The indexOf() method returns the first index at which a given element can be found in the array, or -1 if it is not present.

    // Go through the current step:
    switch (step) {
        // first assign a websocket of the blockchain you want to interact with:
        case 0:
            imploreWebSocket();
            break;

        // then assign where the dApp is going to be reachable
        case 1:
            imploreDomainOrigin();
            break;

        // then we generate an account
        case 2:
            await spawnAccount();
            break;

        // just in case you did not saved the account address: 
        // save the account address as well
        case 3:
            await getAddress(DAPP_ACCOUNT_MNEMONIC!);
            break;

        // then we generate a FullDID with all the key types
        // and ask you to save the mnemonic and URI
        case 4:
            await spawnDid();
            break;

        // Just in case yu did not save the URI of the DID
        // save the DID's URI as well:
        case 5:
            await getURI(DAPP_DID_MNEMONIC!);
            break;
        // ask you to choose a name for your dApp
        case 6:
            imploreName();
            break;
        // if (step = -1):
        default:
            console.log(`It seems like all enviorment variables are already defined.\n
               >> Take in consideration, that this script does not verify if the environment values already defined are valid. <<\n\n`);
            break;
    }

    console.log("If you are still missing some environment values and want the easy way, run this file again.\n");
    // reset output's appareance:
    console.log("\u001b[0m");
    return;
}
// The JavaScript (ergo also the Typescript) interpreter hoists the entire function declaration to the top of the current scope.
// So the main function can use the following functions wthout problem. 
function imploreWebSocket() {
    console.log('Trouble reading the address of the WebSocket \n\n',

        'Please, define a value for WSS_ADDRESS on the .env-file to continue \n',
        'To connect to the KILT-Test-Blockchain, named Peregrine (recomended), please save the following: \n\n',
        'WSS_ADDRESS=wss://peregrine.kilt.io/parachain-public-ws', '\n\n',

        'In the future, if you wish to interact with the production KILT-Blockchain, named Spiritnet, change the address to a web-socket (public Endpoint) of Spiritnet.',
        'More info under: https://docs.kilt.io/docs/develop/chain/deployments', "\n\n");

}

function imploreDomainOrigin() {
    console.log("\nTrouble reading the URL-Address of your dApp\n",
        "Please, define a value for ORIGIN on the .env-file to continue\n",
        "first it should only run locally. You can use a custom IP or just the default:\n\n",
        "Default dApps domain origin: \n",
        'ORIGIN=http://localhost:8080', "\n\n");
}

async function spawnAccount() {
    console.log("\nTrouble reading the account's mnemonic of your dApp\n",
        "An account is being generated for your dApp.");
    await Kilt.connect(WSS_ADDRESS!);
    // You could also pass a specific mnemonic, but here we generate a random mnemonic.
    const mnemonic = mnemonicGenerate();// for costum, replace here with a string of 12 BIP-39 words
    const account = generateAccount(mnemonic);
    console.log('\n Please, save mnemonic and address of your dApps account to the .env-file to continue!\n\n',
        `DAPP_ACCOUNT_MNEMONIC=${mnemonic}\n`,
        `DAPP_ACCOUNT_ADDRESS=${account.address}\n\n`,
        `You also need to deposit funds on this account, to be able to create a DID.\n`,
        `For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/?${account.address} \n\n`);
    await Kilt.disconnect();
}

async function getAddress(mnemonic: string) {
    console.log("\ntrouble reading the account's address of your dApp\n");
    await Kilt.connect(WSS_ADDRESS!);
    const accounty = generateAccount(mnemonic);
    console.log('\n Please, save the address of your dApps account to the .env-file to continue!\n\n',
        `DAPP_ACCOUNT_ADDRESS=${accounty.address}\n\n`,
        `You also need to deposit funds on this account, to be able to create a DID.\n`,
        `For peregrine-accounts you can use: https://faucet.peregrine.kilt.io/?${accounty.address} \n\n`);
    await Kilt.disconnect();
}

async function spawnDid() {
    console.log("\ntrouble reading the mnemonic of your dApp's DID\n");
    await Kilt.connect(WSS_ADDRESS!);
    console.log("\n\nA decentralized identity (DID) is trying to be generated for your dApp.",
        "This could take some minutes.\n",
        "Make sure you have enough funds! \n\n");
    // Load attester account
    const attesterAccount = generateAccount(DAPP_ACCOUNT_MNEMONIC!);
    // the DID can be generated by a different mnemonic than from the account. This is also the prefered option.
    // You could also pass a specific mnemonic, but here we generate a random mnemonic.
    const didMnemonic = mnemonicGenerate(); // for costum, replace here with a string of 12 BIP-39 words
    const fullDid = await generateFullDid(attesterAccount, didMnemonic);

    console.log("\n Please, save the mnemonic and URI of your dApp's DID to the .env-file to continue!\n",
        `DAPP_DID_MNEMONIC=${didMnemonic}\n`,
        `DAPP_DID_URI=${fullDid.uri}\n`);
    await Kilt.disconnect();
}

async function getURI(mnemonic: string) {
    console.log("\nTrouble reading the URI of your dApp's DID\n",
        "getting the URI of the DID corresponding the provided mnemonic");
    await Kilt.connect(WSS_ADDRESS!);
    const { authentication } = generateKeypairs(mnemonic);
    const dAppDidUri = Kilt.Did.getFullDidUriFromKey(authentication);
    const resolved = await Kilt.Did.resolve(dAppDidUri);
    if (!resolved) {
        console.log("There is no DID-Document on the chain for the given mnemonic. The corresponding Uri would be useless.",
            "Please, provide a mnemonic of registered DID!",
            "Easy way: delete current mnemonic from the .env-file and run this script again");
    } else {
        console.log("\n please, save the URI of your dApp's DID to the .env-file to continue!\n",
            `DAPP_DID_URI=${dAppDidUri}\n`);
    }
    await Kilt.disconnect();
}

function imploreName() {
    console.log("\ntrouble reading your dApp's Name\n",
        "Please provide a name inside the .env file using this constant name: \n",
        `DAPP_NAME={your dApp's name here}\n`);
}

main(); //run the code
