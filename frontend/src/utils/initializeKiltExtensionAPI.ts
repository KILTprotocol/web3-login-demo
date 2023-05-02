import { ApiWindow } from './types'

export const apiWindow = window as Window & ApiWindow

export function initializeKiltExtensionAPI() {
  apiWindow.kilt = apiWindow.kilt || {}

  // Check if 'meta' was defined already:
  let metaDefined = Object.hasOwn(apiWindow.kilt, 'meta')
  console.log(`Is the Property 'meta' of window.kilt defined? ${metaDefined}`)

  Object.defineProperty(apiWindow.kilt, 'meta', {
    value: {
      versions: {
        credentials: '3.0'
      }
    },
    enumerable: false
  })
  metaDefined = Object.hasOwn(apiWindow.kilt, 'meta')
  console.log(`Is the Property 'meta' of window.kilt defined? ${metaDefined}`)

  apiWindow.dispatchEvent(new CustomEvent('kilt-dapp#initialized'))
}
