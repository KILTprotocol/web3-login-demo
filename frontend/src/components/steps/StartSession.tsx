import React from 'react'

import { Types } from 'kilt-extension-api'

import styles from './Step.module.css'

import Button from '../Button'
import { startExtensionSession } from '../../startExtensionSession'

interface Props {
  extensionSession: Types.PubSubSessionV1 | Types.PubSubSessionV2 | null
  setExtensionSession: any
}

function StartSession({ extensionSession, setExtensionSession }: Props) {
  async function startSession() {
    console.log('trying to start the session! ')
    const extSessHelp = await startExtensionSession()
    setExtensionSession(extSessHelp)
  }
  return (
    <div className={styles.step}>
      <h2>3. Start the Server-Extension-Session</h2>
      <Button onClick={startSession}>
        {extensionSession ? 'disconnect' : 'connect'}
      </Button>
    </div>
  )
}

export default StartSession
