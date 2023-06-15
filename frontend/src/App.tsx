import React, { useEffect, useState } from 'react'

import { watchExtensions, Types } from 'kilt-extension-api'
import {
  PubSubSessionV1,
  PubSubSessionV2
} from 'kilt-extension-api/dist/types/types'

import Button from './components/Button'
import Card from './components/Card'
import Logo from './components/Logo'
import Page from './components/Page'
import User from './components/User'
import Dropdown from './components/Dropdown'

import { startExtensionSession } from './startExtensionSession'
import { logIn } from './logIn'
import { logOut } from './logOut'

export default function Home(): JSX.Element {
  const [extensions, setExtensions] = useState<
    Types.InjectedWindowProvider<
      Types.PubSubSessionV1 | Types.PubSubSessionV2
    >[]
  >([])
  const [extensionSession, setExtensionSession] = useState<
    PubSubSessionV1 | PubSubSessionV2 | null
  >(null)
  const [userMail, setUserMail] = useState<string>()

  // Directly inject the extensions that support the KILT protocol
  useEffect(() => {
    const stopWatching = watchExtensions((extensions) => {
      setExtensions(extensions)
    })
    return stopWatching
  }, [])
  const extensionInitialized = typeof (window as any).kilt?.meta !== 'undefined'

  async function startSession() {
    console.log('trying to start the session! ')
    const extSessHelp = await startExtensionSession()
    setExtensionSession(extSessHelp)
  }
  async function testApi() {
    const result = await fetch('/api')
    const message = await result.json()
    console.log(message)
  }

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
    <Page>
      <Page.Header>
        <Logo />
        <User user={undefined} connected={undefined} onClick={undefined} />
      </Page.Header>
      <Page.Content>
        <Card>
          <Button onClick={testApi}>GO TO SECRET PAGE</Button>
        </Card>
        <Card>
          <p>Let's walk trough the login process step by step.</p>
          <h2>1. The Extensions need to be enable</h2>
          <p>
            We do this when the website loads. The code for it is inside
            'index.tsx'.
          </p>
          {extensionInitialized && '✅ Extensions loaded'}
          {!extensionInitialized && '❌ Extensions not loaded'}
          <p>
            You can check this by running 'window.kilt' on your browser's
            console.
          </p>
          <h2>2. Choose the Extension you want to use:</h2>
          <Dropdown
            id="drop"
            name="Select Extension"
            values={extensions.map((ext, i) => ({
              label: ext.name,
              id: i.toString()
            }))}
          />
          <h2>3. Start the Server-Extension-Session</h2>
          <Button onClick={startSession}>
            {extensionSession ? 'disconnect' : 'connect'}
          </Button>
          <h2>4. Login with Credentials</h2>
          <Button onClick={accessManager}>
            {userMail ? 'logout' : 'login'}
          </Button>
        </Card>
      </Page.Content>
    </Page>
  )
}
