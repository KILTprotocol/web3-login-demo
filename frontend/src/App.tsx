import React, { useEffect } from 'react'

import Button from './components/Button'
import Card from './components/Card'
import Logo from './components/Logo'
import Page from './components/Page'
import User from './components/User'
import { initializeKiltExtensionAPI } from './utils/initializeKiltExtensionAPI'

export default function Home(): JSX.Element {
  async function testApi() {
    const result = await fetch('/api')
    const message = await result.json()
    console.log(message)
  }

  // Directly inject the extensions that support the KILT protocol
  useEffect(() => {
    initializeKiltExtensionAPI()
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
          <Button onClick={undefined}>GET SECRET MESSAGE</Button>
          <Button onClick={undefined}>CLEAR COOKIES</Button>
        </Card>
      </Page.Content>
    </Page>
  )
}
