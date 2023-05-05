import styles from './Dropdown.module.css'

export interface Props {
  id: string
  name: string
  values: Array<{ label: string; id: string }>
}

export default function Dropdown({ id, name, values }: Props) {
  return (
    <select className={styles.button} name={name} id={id}>
      {values.map(({ label, id: valueId }) => (
        <option key={valueId} value={valueId}>
          {label}
        </option>
      ))}
    </select>
  )
}
