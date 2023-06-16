import React, { useEffect, useState } from 'react'

import { watchExtensions, Types } from 'kilt-extension-api'

import Button from './components/Button'
import Card from './components/Card'
import Logo from './components/Logo'
import Page from './components/Page'
import User from './components/User'

import EnableExtensions from './components/steps/EnableExtensions'
import ChooseExtension from './components/steps/ChooseExtension'
import StartSession from './components/steps/StartSession'
import SummitCredential from './components/steps/SummitCredentials'

export default function Home(): JSX.Element {
  const [extensions, setExtensions] = useState<
    Types.InjectedWindowProvider<
      Types.PubSubSessionV1 | Types.PubSubSessionV2
    >[]
  >([])

  // Directly inject the extensions that support the KILT protocol
  useEffect(() => {
    const stopWatching = watchExtensions((extensions) => {
      setExtensions(extensions)
    })
    // the clean-up:
    return stopWatching
  }, [])

  const [extensionSession, setExtensionSession] = useState<
    Types.PubSubSessionV1 | Types.PubSubSessionV2 | null
  >(null)
  const [userMail, setUserMail] = useState<string>()

  async function testApi() {
    const result = await fetch('/api')
    const message = await result.json()
    console.log(message)
  }

  return (
    <Page>
      <Page.Header>
        <Logo />
        <User userMail={userMail} />
      </Page.Header>
      <Page.Content>
        <Card>
          <Button onClick={testApi}>Test Server API</Button>
        </Card>

        <Card>
          <p>Let's walk trough the login process step by step.</p>

          <EnableExtensions />
          <ChooseExtension extensions={extensions} />
          <StartSession
            extensionSession={extensionSession}
            setExtensionSession={setExtensionSession}
          />
          <SummitCredential
            extensionSession={extensionSession}
            userMail={userMail}
            setUserMail={setUserMail}
          />
          <p>
            All of these Steps encompass the Login with Credentials process.
          </p>
          <p>
            You could trigger all of them with just one button, e.g. "Login".
            <br />
            Here we break them down for an easier understanding of what is
            happening.
            <br />
            The order of the steps is not flexible.
          </p>
        </Card>
      </Page.Content>
    </Page>
  )
}
