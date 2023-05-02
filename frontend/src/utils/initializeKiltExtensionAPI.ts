import { ApiWindow } from './types'

export const apiWindow = window as Window & ApiWindow

/**
 * This Function defines  the 'meta' property for the window.kilt object and dispatches the Event `kilt-dapp#initialized`.
 *
 * The function `Object.defineProperty()` defaults `configurable` to `false`. This implicates that it will throw on attempts to rewrite the property.
 * So, it is important to not call it inside of any React-Component, because they like to re-run code.
 */
export function initializeKiltExtensionAPI() {
  apiWindow.kilt = apiWindow.kilt || {}

  Object.defineProperty(apiWindow.kilt, 'meta', {
    value: {
      versions: {
        credentials: '3.0'
      }
    },
    enumerable: false
  })

  apiWindow.dispatchEvent(new CustomEvent('kilt-dapp#initialized'))
}
