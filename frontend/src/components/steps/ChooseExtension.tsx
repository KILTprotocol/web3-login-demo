import React from 'react'

import { Types } from 'kilt-extension-api'

import styles from './Step.module.css'

import Dropdown from '../Dropdown'
import RadioButtons from '../RadioButtons'

interface Props {
  extensions: Types.InjectedWindowProvider<
    Types.PubSubSessionV1 | Types.PubSubSessionV2
  >[]
  chosenExtension: string
  setChosenExtension: any
}

function ChooseExtension({
  extensions,
  chosenExtension,
  setChosenExtension
}: Props) {
  const handleDropdownChoosing = (event: { target: { value: any } }) => {
    const nameOfChosenExtension = event.target.value
    setChosenExtension(nameOfChosenExtension)
    console.log('An extension is being chosen on the Dropdown.')
  }
  const handleChoosing = (value: string) => {
    const nameOfChosenExtension = value
    setChosenExtension(nameOfChosenExtension)
    console.log('An extension is being chosen with the RadioButtons.')
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
        onChange={handleDropdownChoosing}
      />
      <RadioButtons
        wrapperName="List of Extensions to Select from"
        choices={extensions.map((extensionObject) => extensionObject.name)}
        onChange={handleChoosing}
      />
    </div>
  )
}

export default ChooseExtension
