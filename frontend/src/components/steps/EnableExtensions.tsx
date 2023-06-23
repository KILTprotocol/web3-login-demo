import React, { useState } from 'react'

import styles from './Step.module.css'

import RefreshButton from '../RefreshButton'

export default function EnableExtensions() {
  const kiltExtensionsApiInitialized =
    typeof (window as any).kilt?.meta !== 'undefined'

  const [availability, setAvailability] = useState(kiltExtensionsApiInitialized)

  function refresh() {
    const kiltExtensionsApiInitialized =
      typeof (window as any).kilt?.meta !== 'undefined'
    setAvailability(kiltExtensionsApiInitialized)
  }

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
      <div className={styles.refresh_container}>
        {availability && '✅ Extensions enabled'}
        {!availability && '❌ Extensions not enabled'}
        <RefreshButton action={refresh}></RefreshButton>
      </div>
      <p>
        To verify this, you can execute 'window.kilt' in your browser's console.
      </p>
    </div>
  )
}
