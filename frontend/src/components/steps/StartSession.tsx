import React from 'react'

import styles from './Step.module.css'

import Button from '../Button'
import { startExtensionSession } from '../../startExtensionSession'

interface Props {
  setExtensionSession: any
}

function StartSession({ setExtensionSession }: Props) {
  async function startSession() {
    console.log('trying to start the session! ')
    const newSession = await startExtensionSession()
    setExtensionSession(newSession)
  }
  return (
    <div className={styles.step}>
      <h2>3. Start the Server-Extension-Session</h2>
      <Button onClick={startSession}>
        connect
        {/* TODO: make a function to end the session => disconnect
        {extensionSession ? 'disconnect' : 'connect'} */}
      </Button>
    </div>
  )
}

export default StartSession
