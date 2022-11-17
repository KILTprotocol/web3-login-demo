import styles from './Card.module.css'

interface Props {
  [x: string]: any
}

export default function Card({ children }: Props): JSX.Element {
  return <div className={styles.card}>{children}</div>
}
