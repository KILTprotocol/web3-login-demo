import React from 'react'

import styles from './Button.module.css'

interface Props {
  children: React.ReactNode
}

export default function Button({ children, ...props }: Props) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  )
}
