import React from 'react'

import styles from './Page.module.css'

interface Props {
  children: React.ReactNode
}

function Page({ children }: Props): JSX.Element {
  return <div className={styles.page}>{children}</div>
}

function PageHeader({ children }: Props): JSX.Element {
  return <header className={styles.header}>{children}</header>
}

function PageContent({ children }: Props): JSX.Element {
  return <section className={styles.content}>{children}</section>
}

function PageSection({ children }: Props): JSX.Element {
  return <section className={styles.section}>{children}</section>
}

Page.Header = PageHeader
Page.Content = PageContent
Page.Section = PageSection

PageHeader.displayName = 'Page.Header'
PageContent.displayName = 'Page.Content'
PageSection.displayName = 'Page.Section'

export default Page
