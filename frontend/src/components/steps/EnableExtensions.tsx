import React from 'react'

import styles from './Step.module.css'

export default function EnableExtensions() {
  const kiltExtensionsApiInitialized =
    typeof (window as any).kilt?.meta !== 'undefined'

  return (
    <div className={styles.step}>
      <h2>1. Enabling the Extensions</h2>
      <p>
        This refers to the process that allow extensions to inject themselves.
      </p>
      <p>
        We perform this action when the website is loaded. The relevant code can
        be found in 'index.tsx'.
      </p>
      {kiltExtensionsApiInitialized && '✅ Extensions enabled'}
      {!kiltExtensionsApiInitialized && '❌ Extensions not enabled'}
      <p>
        To verify this, you can execute 'window.kilt' in your browser's console.
      </p>
    </div>
  )
}
