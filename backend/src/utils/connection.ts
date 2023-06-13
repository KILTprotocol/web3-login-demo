import * as Kilt from '@kiltprotocol/sdk-js'

import { WSS_ADDRESS } from '../config'

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

  // internally Kilt.connect() calls cryptoWaitReady()
  await Kilt.connect(WSS_ADDRESS)
  return Kilt.ConfigService.get('api')
}
