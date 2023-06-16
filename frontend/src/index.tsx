import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeKiltExtensionAPI } from 'kilt-extension-api'

import './index.css'
import App from './App'

initializeKiltExtensionAPI()

/** Extra explanation:
 * The Function `initializeKiltExtensionAPI` defines  the 'meta' property for the window.kilt object and dispatches the Event `kilt-dapp#initialized`.
 *
 * The internal function `Object.defineProperty()` defaults `configurable` to `false`. This implicates that it will throw on attempts to rewrite the property.
 * So, it is important to be careful (or avoid) calling it inside of any React-Component, because they like to re-run code.
 */

// Display the react app:
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
