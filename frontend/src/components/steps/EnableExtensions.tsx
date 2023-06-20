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
      <h2>1. The Extensions need to be Enabled</h2>
      <p>
        By this we mean the setup for extensions to inject themselves being
        done.
      </p>
      <p>
        We do this when the website loads. The code for it is inside
        'index.tsx'.
      </p>
      <div className={styles.refresh_container}>
        {availability && '✅ Extensions enabled'}
        {!availability && '❌ Extensions not enabled'}
        <RefreshButton action={refresh}></RefreshButton>
      </div>
      <p>
        You can check this by running 'window.kilt' on your browser's console.
      </p>
    </div>
  )
}
