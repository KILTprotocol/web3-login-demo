import React from 'react'

import { Types } from 'kilt-extension-api'

import styles from './Step.module.css'

import Dropdown from '../Dropdown'

interface Props {
  extensions: Types.InjectedWindowProvider<
    Types.PubSubSessionV1 | Types.PubSubSessionV2
  >[]
  chosenExtension: number
  setChosenExtension: any
}

function ChooseExtension({
  extensions,
  chosenExtension,
  setChosenExtension
}: Props) {
  const handleChoosing = (event: { target: { value: any } }) => {
    const indexOfChosenExtension = event.target.value
    setChosenExtension(indexOfChosenExtension)
    console.log('An extension is being chosen.')
  }

  return (
    <div className={styles.step}>
      <h2>2. Choose the Extension you want to use:</h2>
      <Dropdown
        dropdownName="List of Extensions to Select from"
        values={extensions.map((ext, i) => ({
          label: ext.name,
          index: i
        }))}
        selectedValue={chosenExtension}
        handleOptionChange={handleChoosing}
      />
    </div>
  )
}

export default ChooseExtension
