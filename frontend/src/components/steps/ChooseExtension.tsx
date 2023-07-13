import React from 'react'

import { Types } from 'kilt-extension-api'

import styles from './Step.module.css'

import Dropdown from '../Dropdown'

interface Props {
  extensions: Types.InjectedWindowProvider<
    Types.PubSubSessionV1 | Types.PubSubSessionV2
  >[]
  chosenOne: number
  chooseExtension: any
}

function ChooseExtension({ extensions, chosenOne, chooseExtension }: Props) {
  const handleChoosing = (event: { target: { value: any } }) => {
    const indexOfChosenExtension = event.target.value
    chooseExtension(indexOfChosenExtension)
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
        selectedValue={chosenOne}
        handleOptionChange={handleChoosing}
      />
    </div>
  )
}

export default ChooseExtension
