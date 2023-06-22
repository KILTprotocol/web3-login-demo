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
  // After startSession(), the Extension-Session-Values should be available for the backend. Done through cookie parser, (but data bank also possible).
  // The frontend still needs the Session-Object to be able to use its methods (functions). That's why we save on a React-State.

  return (
    <div className={styles.step}>
      <h2>3. Start the Server-Extension-Session</h2>
      <Button disabled={extensionSession} onClick={startSession}>
        connect
      </Button>
    </div>
  )
}

export default StartSession
