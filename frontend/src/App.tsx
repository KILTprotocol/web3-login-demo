import React, { useEffect, useState } from 'react'

import {
  initializeKiltExtensionAPI,
  watchExtensions,
  Types
} from 'kilt-extension-api'

import Button from './components/Button'
import Card from './components/Card'
import Logo from './components/Logo'
import Page from './components/Page'
import User from './components/User'
import Dropdown from './components/Dropdown'

export default function Home(): JSX.Element {
  const [extensions, setExtensions] = useState<
    Types.InjectedWindowProvider<
      Types.PubSubSessionV1 | Types.PubSubSessionV2
    >[]
  >([])
  async function testApi() {
    const result = await fetch('/api')
    const message = await result.json()
    console.log(message)
  }

  // Directly inject the extensions that support the KILT protocol
  useEffect(() => {
    watchExtensions((extensions) => {
      setExtensions(extensions)
    })
  })

  const extensionInitialized = typeof (window as any).kilt?.meta !== 'undefined'

  return (
    <Page>
      <Page.Header>
        <Logo />
        <User user={undefined} connected={undefined} onClick={undefined} />
      </Page.Header>
      <Page.Content>
        <Card>
          <p>Let's walk trough the login process step by step.</p>
          <h2>1. Enable the Extension</h2>
          <p>
            This could happen automatically when the user first clicks login or
            when the website loads
          </p>
          {extensionInitialized && '✅ Extension loaded'}
          <Button
            disabled={extensionInitialized}
            onClick={() => initializeKiltExtensionAPI()}
          >
            Enable Extensions
          </Button>

          <h2>2. Choose your Extension</h2>
          {extensions.length > 0 ? (
            <Dropdown
              id="drop"
              name="Select Extension"
              values={extensions.map((ext, i) => ({
                label: ext.name,
                id: i.toString()
              }))}
            />
          ) : (
            <p>
              Make sure that you have sporran installed an clicked the button
              above
            </p>
          )}

          <h2>3. Login</h2>
          <Button disabled={true} onClick={testApi}>
            Login
          </Button>

          <h2>4. Show Secret Content</h2>
          <Button disabled={true} onClick={testApi}>
            Load secret
          </Button>
        </Card>
      </Page.Content>
    </Page>
  )
}
