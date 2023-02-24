import React from 'react'
import styles from './Page.module.css'

interface Props {
  [x: string]: any
}

function Page({ children }: Props): JSX.Element {
  return <div className={styles.page}>{children}</div>
}

Page.Header = function ({ children }: Props): JSX.Element {
  return <header className={styles.header}>{children}</header>
}

Page.Content = function ({ children }: Props): JSX.Element {
  return <section className={styles.content}>{children}</section>
}

export default Page
