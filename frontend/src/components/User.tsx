import React, { useState } from 'react'

import styles from './User.module.css'

import { startExtensionSession } from '../startExtensionSession'
import { logIn } from '../logIn'
import { logOut } from '../logOut'

import { PubSubSessionV1, PubSubSessionV2 } from '../utils/types'

import Button from './Button'

// TODO!: Define specific Props when their types are settled
interface Props {
  [x: string]: any
}

export default function User({ connected }: Props): JSX.Element {
  const [extensionSession, setExtensionSession] = useState<
    PubSubSessionV1 | PubSubSessionV2 | null
  >(null)
  const [userMail, setUserMail] = useState<string>()
  async function startSession() {
    console.log('trying to start the session! ')
    const extSessHelp = await startExtensionSession()
    setExtensionSession(extSessHelp)
  }

  // After startSession(), the Extension-Session-Values should be available for the backend. Done through cookie parser, (but data bank also possible).
  // The frontend still needs the Session-Object to be able to use its methods (functions). That's why we save on a React-State.

  async function login() {
    console.log(
      'Trying to log in. Meaning to ask the extension for a specific Type of Credential - a CType.'
    )
    const verifiedUserInfoThatServerSendsBack = await logIn(extensionSession)

    setUserMail(verifiedUserInfoThatServerSendsBack)
  }

  async function logout() {
    console.log(
      'Trying to log out. Meaning to delete the credential and session cookies. '
    )
    await logOut()
    setUserMail(undefined)
  }
  function accessManager() {
    if (!userMail) {
      login()
    } else {
      logout()
    }
  }

  return (
    <div>
      <div className={styles.account}>
        <svg
          width="50"
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

        <span className={styles.text}>
          {userMail ? `trusted user: ${userMail}` : 'untrusted individual'}
        </span>
      </div>
      <div className={styles.button_container}>
        <Button className={styles.action} onClick={startSession}>
          {connected ? 'disconnect' : 'connect'}
        </Button>
        <Button className={styles.action} onClick={accessManager}>
          {userMail ? 'logout' : 'login'}
        </Button>
      </div>
    </div>
  )
}
