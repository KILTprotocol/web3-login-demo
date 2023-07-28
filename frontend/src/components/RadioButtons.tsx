import React from 'react'

import styles from './RadioButtons.module.css'

interface Props {
  choices: string[]
  wrapperName: string
  onChange: (value: string) => void
  selectedValue: string | undefined
  disabled: boolean
}

/**
 * Generic Radio Buttons component. Multiple options as rectangular buttons, single selection allowed.
 */
function RadioButtons({
  wrapperName,
  choices,
  onChange,
  selectedValue,
  disabled
}: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    onChange(value)
  }

  return (
    <div title={wrapperName}>
      {choices.map((choice) => (
        <label key={choice} className={styles.radioButton}>
          <input
            type="radio"
            value={choice}
            checked={selectedValue === choice}
            onChange={handleChange}
            disabled={disabled}
          />
          <div
            className={`${styles.radioButtonLabel} ${
              selectedValue === choice ? styles.selected : ''
            }`}
          >
            {choice}
          </div>
        </label>
      ))}
    </div>
  )
}

export default RadioButtons
