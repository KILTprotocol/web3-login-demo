import React, { useEffect, useState } from 'react'

import { initializeKiltExtensionAPI, watchExtensions } from 'kilt-extension-api'
import {
  InjectedWindowProvider,
  PubSubSessionV1,
  PubSubSessionV2
} from 'kilt-extension-api/dist/types/types'

import Button from './components/Button'
import Card from './components/Card'
import Logo from './components/Logo'
import Page from './components/Page'
import User from './components/User'
import Dropdown from './components/Dropdown'

export default function Home(): JSX.Element {
  const [extensions, setExtensions] = useState<
    InjectedWindowProvider<PubSubSessionV1 | PubSubSessionV2>[]
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

  return (
    <Page>
      <Page.Header>
        <Logo />
        <User user={undefined} connected={undefined} onClick={undefined} />
      </Page.Header>
      <Page.Content>
        <Card>
          <Button onClick={testApi}>GO TO SECRET PAGE</Button>
          <Button
            disabled={typeof (window as any).kilt?.meta !== 'undefined'}
            onClick={() =>
              typeof (window as any).kilt?.meta === 'undefined' &&
              initializeKiltExtensionAPI()
            }
          >
            Enable Extensions
          </Button>
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
