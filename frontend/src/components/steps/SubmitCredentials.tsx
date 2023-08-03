import React from 'react'

import { Types } from 'kilt-extension-api'

import styles from './Step.module.css'

import Button from '../Button'

import { logIn } from '../../api/logIn'
import { logOut } from '../../api/logOut'

interface Props {
  extensionSession: Types.PubSubSessionV1 | Types.PubSubSessionV2 | null
  userMail: string | undefined
  setUserMail: (userMail: string | undefined) => void
  setExtensionSession: (
    injectedExtension: Types.PubSubSessionV1 | Types.PubSubSessionV2 | null
  ) => void
  onError: (message: string) => void
}

function SubmitCredential({
  extensionSession,
  userMail,
  setUserMail,
  setExtensionSession,
  onError
}: Props) {
  async function handleLogin() {
    console.log(
      'Trying to log in. Meaning to ask the extension for a specific Type of Credential - a CType.'
    )
    const verifiedUserInfoThatServerSendsBack = await logIn(extensionSession)

    setUserMail(verifiedUserInfoThatServerSendsBack)
  }

  async function handleLogout() {
    console.log('Trying to log out. Meaning to delete the cookies. ')
    await logOut()
    setUserMail(undefined)
    setExtensionSession(null)
  }
  async function accessManager() {
    try {
      if (!userMail) {
        await handleLogin()
      } else {
        await handleLogout()
      }
    } catch (err) {
      onError(`Error on the 4th Step "Submitting attested Credential": ${err}`)
    }
  }

  return (
    <div className={styles.step}>
      <h2>4. Submit attested Credential</h2>
      <Button disabled={!extensionSession && !userMail} onClick={accessManager}>
        {userMail ? 'logout' : 'login'}
      </Button>
    </div>
  )
}

export default SubmitCredential
