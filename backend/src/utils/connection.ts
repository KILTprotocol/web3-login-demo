import * as Kilt from '@kiltprotocol/sdk-js'

/**
 * Makes sure you only connect once to the API of the Blockchain. If you are connected, return it.
 * If you are not connected yet, connect through the Web-Socket Address saved on the '.env' file.
 *
 * @returns active ApiPromise
 */
export async function getApi() {
  // If the API is already set up, return it
  //await cryptoWaitReady();

  if (Kilt.ConfigService.isSet('api')) return Kilt.ConfigService.get('api')

  // If it is not, connect to it using the Web-Socket Address from the enviorment variable:
  if (!process.env.WSS_ADDRESS) {
    throw new Error(
      'please, define a value for WSS_ADDRESS on .env-file to use this function'
    )
  }
  await Kilt.connect(process.env.WSS_ADDRESS) // internally it calls cryptoWaitReady()
  return Kilt.ConfigService.get('api')
}
