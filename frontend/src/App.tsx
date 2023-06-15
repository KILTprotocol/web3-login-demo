import React, { useEffect, useState } from 'react'

import { watchExtensions, Types } from 'kilt-extension-api'

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
    const stopWatching = watchExtensions((extensions) => {
      setExtensions(extensions)
    })
    return stopWatching
  }, [])

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
          <h2>Extensions</h2>
          <Dropdown
            id="drop"
            name="Select Extension"
            values={extensions.map((ext, i) => ({
              label: ext.name,
              id: i.toString()
            }))}
          />
        </Card>
      </Page.Content>
    </Page>
  )
}
