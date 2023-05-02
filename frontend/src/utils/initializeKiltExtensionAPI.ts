import { ApiWindow } from './types'

export const apiWindow = window as Window & ApiWindow

function handleBeforeUnload(event: Event) {
  event.preventDefault()
  console.log('Done with the Kilt Extensions API initialization')
}

export function initializeKiltExtensionAPI(): () => void {
  apiWindow.kilt = apiWindow.kilt || {}

  // Object.assign(apiWindow.kilt, {
  //   meta: { versions: { credentials: '3.0' } }
  // })

  // Check if 'meta' was defined already:
  const metaDefined = Object.hasOwn(apiWindow.kilt, 'meta')

  console.log(`metaDefined? ${metaDefined}`)

  if (!metaDefined) {
    Object.defineProperty(apiWindow.kilt, 'meta', {
      value: {
        versions: {
          credentials: '3.0'
        }
      },
      enumerable: false
    })
  }

  apiWindow.dispatchEvent(new CustomEvent('kilt-dapp#initialized'))
  apiWindow.addEventListener('kilt-extension#initialized', handleBeforeUnload)
  return () =>
    apiWindow.removeEventListener(
      'kilt-extension#initialized',
      handleBeforeUnload
    )
}
