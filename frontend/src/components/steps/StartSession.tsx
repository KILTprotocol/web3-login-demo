import React from 'react'

import { Types } from 'kilt-extension-api'

import styles from './Step.module.css'

import Button from '../Button'
import { startExtensionSession } from '../../api/startExtensionSession'

interface Props {
  extensionSession: Types.PubSubSessionV1 | Types.PubSubSessionV2 | null
  setExtensionSession: (
    injectedExtension: Types.PubSubSessionV1 | Types.PubSubSessionV2
  ) => void
  chosenExtension: string | undefined
  setChosenExtension: (name: string) => void
  onError: (message: string) => void
}

function StartSession({
  extensionSession,
  setExtensionSession,
  chosenExtension,
  setChosenExtension,
  onError
}: Props) {
  async function startSession() {
    console.log('trying to start the session! ')
    try {
      const { newSession, nameOfUsedExtension } = await startExtensionSession(
        chosenExtension
      )
      setExtensionSession(newSession)
      setChosenExtension(nameOfUsedExtension)
    } catch (error) {
      onError(
        `Error on the 3th Step "Start the Server-Extension-Session": ${error}`
      )
    }
  }
  // After startSession(), the Extension-Session-Values should be available for the backend. Done through cookie parser, (but data bank also possible).
  // The frontend still needs the Session-Object to be able to use its methods (functions). That's why we save on a React-State.

  return (
    <div className={styles.step}>
      <h2>3. Start the Server-Extension-Session</h2>
      <Button disabled={Boolean(extensionSession)} onClick={startSession}>
        connect
      </Button>
    </div>
  )
}

export default StartSession
