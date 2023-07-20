import React, { useEffect, useState } from 'react'

import { watchExtensions, Types } from 'kilt-extension-api'

import Card from './components/Card'
import Logo from './components/Logo'
import Page from './components/Page'
import User from './components/User'

import EnableExtensions from './components/steps/EnableExtensions'
import ChooseExtension from './components/steps/ChooseExtension'
import StartSession from './components/steps/StartSession'
import SubmitCredential from './components/steps/SubmitCredentials'

import { inspectAccessCookie } from './inspectAccessCookie'
import Modal from './components/Modal'

export default function Home(): JSX.Element {
  const [extensions, setExtensions] = useState<
    Types.InjectedWindowProvider<
      Types.PubSubSessionV1 | Types.PubSubSessionV2
    >[]
  >([])

  const [extensionSession, setExtensionSession] = useState<
    Types.PubSubSessionV1 | Types.PubSubSessionV2 | null
  >(null)

  const [userMail, setUserMail] = useState<string>()

  // Controls when to pop up a modal with a message to the UI
  const [showOnModal, setShowOnModal] = useState<string | undefined>()

  async function pastChecker() {
    try {
      const oldCookieInfo = await inspectAccessCookie()
      setUserMail(oldCookieInfo)
    } catch (error) {
      console.log('No user logged in yet.')
    }
  }

  useEffect(() => {
    // check if the user already has access granted
    pastChecker()

    // Directly inject the extensions that support the KILT protocol
    const stopWatching = watchExtensions((extensions) => {
      setExtensions(extensions)
    })
    // the clean-up:
    return stopWatching
  }, [])

  return (
    <Page>
      <Page.Header>
        <Logo />
        <User userMail={userMail} />
      </Page.Header>
      <Page.Content>
        <Page.Section>
          <Card>
            <p>Let's walk trough the Login process step by step.</p>

            <EnableExtensions />
            <ChooseExtension extensions={extensions} />
            <StartSession
              extensionSession={extensionSession}
              setExtensionSession={setExtensionSession}
            />
            <SubmitCredential
              extensionSession={extensionSession}
              userMail={userMail}
              setUserMail={setUserMail}
              setExtensionSession={setExtensionSession}
              setShowOnModal={setShowOnModal}
            />
            <p>
              All of these steps encompass the Login with Credentials process.
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
          <Modal
            modalName="Error during the Step by Step Process"
            message={showOnModal}
          />
        </Page.Section>
      </Page.Content>
    </Page>
  )
}
