import React, { useState } from 'react'

import styles from './RefreshButton.module.css'

interface Props {
  action: () => void
}

function RefreshButton({ action }: Props) {
  const [rotation, setRotation] = useState(0)

  const handleRefresh = () => {
    setRotation(rotation - 540)
    action()
  }
  const buttonStyle = {
    transform: `rotate(${rotation}deg)`
  }

  return (
    <button
      className={styles.container}
      style={buttonStyle}
      onClick={handleRefresh}
    >
      <b className={styles.icon}>🔄</b>
    </button>
  )
}
export default RefreshButton
