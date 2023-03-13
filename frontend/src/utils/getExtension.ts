import { ApiWindow } from './types'

export const apiWindow = window as Window & ApiWindow

export function getExtensions(): void {
  apiWindow.kilt = apiWindow.kilt || {}

  Object.assign(apiWindow.kilt, {
    meta: { value: { versions: { credentials: '3.0' } } },
    enumerable: false
  })
  apiWindow.addEventListener('kilt-dapp#initialized', getExtensions)
}
