import * as Kilt from '@kiltprotocol/sdk-js'

/**
 * Makes sure you only connect once to the API of the Blockchain. If you are connected, return it.
 * If you are not connected yet, connect through the Web-Socket Address saved on the '.env' file.
 *
 * @returns active ApiPromise
 */
export async function getApi() {
  // If the API is already set up, return it
  if (Kilt.ConfigService.isSet('api')) {
    return Kilt.ConfigService.get('api')
  }

  // If it is not, connect to it using the Web-Socket Address from the environment variable:
  if (!process.env.WSS_ADDRESS) {
    throw new Error(
      'please, define a value for WSS_ADDRESS on .env-file to use this function'
    )
  }
  // internally Kilt.connect() calls cryptoWaitReady()
  await Kilt.connect(process.env.WSS_ADDRESS)
  return Kilt.ConfigService.get('api')
}
