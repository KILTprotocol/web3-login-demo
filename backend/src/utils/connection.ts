import * as Kilt from "@kiltprotocol/sdk-js";
import { cryptoWaitReady } from "@polkadot/util-crypto";


export async function getApi() {
    await cryptoWaitReady();
    // If the API is already set up, return it
    if (Kilt.ConfigService.isSet('api')) return Kilt.ConfigService.get('api');

    // If it is not, connect to it using the Web-Socket Address from the enviorment variable:
    if (!process.env.WSS_ADDRESS) {
        throw new Error("please, define a value for WSS_ADDRESS on .env-file to use this function");
    }
    return Kilt.connect(process.env.WSS_ADDRESS);
}