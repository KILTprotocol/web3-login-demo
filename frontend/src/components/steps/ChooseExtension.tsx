import React from 'react'

import { Types } from 'kilt-extension-api'

import styles from './Step.module.css'

import Dropdown from '../Dropdown'

interface Props {
  extensions: Types.InjectedWindowProvider<
    Types.PubSubSessionV1 | Types.PubSubSessionV2
  >[]
}

function ChooseExtension({ extensions }: Props) {
  return (
    <div className={styles.step}>
      <h2>2. Choose the Extension you want to use:</h2>
      <Dropdown
        id="drop_list"
        name="Select Extension"
        values={extensions.map((ext, i) => ({
          label: ext.name,
          id: i.toString()
        }))}
      />
    </div>
  )
}

export default ChooseExtension
