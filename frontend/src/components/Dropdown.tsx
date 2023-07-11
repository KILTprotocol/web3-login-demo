import styles from './Dropdown.module.css'

export interface Props {
  dropdownName: string
  values: Array<{ label: string; index: number }>
  selectedValue: number
  handleOptionChange: any
}

/**
 * Component of a generic dropdown.
 */
export default function Dropdown({
  dropdownName,
  values,
  selectedValue,
  handleOptionChange
}: Props) {
  return (
    <select
      className={styles.button}
      name={dropdownName}
      value={selectedValue}
      onChange={handleOptionChange}
    >
      {values.map(({ label, index }) => (
        <option key={index} value={index}>
          {label}
        </option>
      ))}
    </select>
  )
}
