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
//@ts-ignore
Page.Header.displayName = 'Page.Header'

Page.Content = function ({ children }: Props): JSX.Element {
  return <section className={styles.content}>{children}</section>
}

//@ts-ignore
Page.Content.displayName = 'Page.Content'

export default Page
