import {
  ApiWindow,
} from './types';

const apiWindow = window as Window & ApiWindow;

function documentReadyPromise(creator: () => any): Promise<ApiWindow> {
  return new Promise((resolve): void => {
    if (document.readyState === 'complete') {
      resolve(creator());
    } else {
      window.addEventListener('load', () => resolve(creator()));
    }
  });
}

export function getExtensions(): Promise<
  ApiWindow
> {
  apiWindow.kilt = apiWindow.kilt || {};

  return documentReadyPromise(() =>
    Object.assign(apiWindow.kilt,
      {
        meta:
          { value: { versions: { credentials: "3.0" } } },
        enumerable: false
      })
  );


}


