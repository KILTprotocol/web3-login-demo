import React, { useState } from 'react'

import styles from './User.module.css'

import { startExtensionSession } from '../startExtensionSession'
import { tryToLogIn } from '../tryToLogIn'

import { PubSubSessionV1, PubSubSessionV2 } from '../utils/types'

import Button from './Button'

interface Props {
  [x: string]: any
}

export default function User({ user, connected }: Props): JSX.Element {
  const [extensionSession, setExtensionSession] = useState<
    PubSubSessionV1 | PubSubSessionV2 | null
  >(null)
  async function startSession() {
    console.log('trying to start the session! ')
    const extSessHelp = await startExtensionSession()
    setExtensionSession(extSessHelp)
  }

  // After startSession(), the Extension-Session-Values should be available for the backend. Done through cookie parser, (but data bank also possible).
  // The frontend still needs the Session-Object to be able to use its methods (functions). That's why we save on a React-State.

  async function login() {
    console.log(
      'Trying to log in. Meaning ask the extension for the specific Type of Credential, a CType.'
    )
    await tryToLogIn(extensionSession)
  }

  return (
    <div>
      <div className={styles.account}>
        <svg
          width="24"
          height="24"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 18V17C7 14.2386 9.23858 12 12 12V12C14.7614 12 17 14.2386 17 17V18"
            stroke="currentColor"
            strokeLinecap="round"
          />
          <path
            d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span className={styles.text} onClick={login}>
          {user || 'not logged in yet'}
        </span>
      </div>
      <Button className={styles.action} onClick={startSession}>
        {!connected ? 'connect' : user ? 'logout' : 'login'}
      </Button>
    </div>
  )
}
