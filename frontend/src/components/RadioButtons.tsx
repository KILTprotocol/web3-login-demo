import React, { useState } from 'react'

import styles from './RadioButtons.module.css'

interface Props {
  choices: string[]
  wrapperName: string
  onChange: any
}

function RadioButtons({ choices, wrapperName, onChange }: Props) {
  const [selectedValue, setSelectedValue] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSelectedValue(value)
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
