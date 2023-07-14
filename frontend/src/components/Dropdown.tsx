import styles from './Dropdown.module.css'

export interface Props {
  dropdownName: string
  values: Array<{ label: string; index: number }>
  selectedValue: string
  onChange: any
}

/**
 * Component of a generic dropdown.
 */
export default function Dropdown({
  dropdownName,
  values,
  selectedValue,
  onChange
}: Props) {
  return (
    <select
      className={styles.button}
      name={dropdownName}
      value={selectedValue}
      onChange={onChange}
    >
      {values.map(({ label, index }) => (
        <option key={index} value={label}>
          {label}
        </option>
      ))}
    </select>
  )
}
