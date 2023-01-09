import {
    ApiWindow,
    InjectedWindowProvider,
    PubSubSessionV1,
    PubSubSessionV2,
  } from '../types/types'
  
  const apiWindow = window as Window & ApiWindow
  
  function documentReadyPromise<T>(creator: () => T): Promise<T> {
    return new Promise((resolve): void => {
      if (document.readyState === 'complete') {
        resolve(creator())
      } else {
        window.addEventListener('load', () => resolve(creator()))
      }
    })
  }
  
  export function getExtensions(): Promise<
    Record<string, InjectedWindowProvider<PubSubSessionV1 | PubSubSessionV2>>
  > {
    apiWindow.kilt = apiWindow.kilt || {}
  
    return documentReadyPromise(() => apiWindow.kilt)
  }