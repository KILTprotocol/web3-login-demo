import { ApiWindow } from './types'

export const apiWindow = window as Window & ApiWindow

export function getExtensions(): () => void {
  apiWindow.kilt = apiWindow.kilt || {}

  Object.assign(apiWindow.kilt, {
    meta: { versions: { credentials: '3.0' } },
    enumerable: false
  })

  // This is the version recommended on the docs, but it breaks things:
  // link: https://docs.kilt.io/docs/develop/dApp/session/

  // Object.defineProperty(apiWindow.kilt, 'meta', {
  //   value: {
  //     versions: {
  //       credentials: '3.0'
  //     }
  //   },
  //   enumerable: false
  // })

  apiWindow.dispatchEvent(new CustomEvent('kilt-dapp#initialized'))
  apiWindow.addEventListener('kilt-extension#initialized', getExtensions)
  return () =>
    apiWindow.removeEventListener('kilt-extension#initialized', getExtensions)
}
