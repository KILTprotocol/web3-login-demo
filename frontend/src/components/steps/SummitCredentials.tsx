import React from 'react'

import { Types } from 'kilt-extension-api'

import styles from './Step.module.css'

import Button from '../Button'

import { logIn } from '../../logIn'
import { logOut } from '../../logOut'

interface Props {
  extensionSession: Types.PubSubSessionV1 | Types.PubSubSessionV2 | null
  userMail: string | undefined
  setUserMail: any
}

function SummitCredential({ extensionSession, userMail, setUserMail }: Props) {
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
    <div className={styles.step}>
      <h2>4. Summit attested Credential</h2>
      <Button disabled={!extensionSession} onClick={accessManager}>
        {userMail ? 'logout' : 'login'}
      </Button>
    </div>
  )
}

export default SummitCredential
