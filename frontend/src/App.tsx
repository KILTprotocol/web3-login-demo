import React, { useEffect } from 'react'
import Button from './components/Button'
import Card from './components/Card'
import Logo from './components/Logo'
import Page from './components/Page'
import User from './components/User'
import { getExtensions } from './utils/getExtension'

export default function Home(): JSX.Element {
  async function testApi() {
    const result = await fetch('/api')
    const message = await result.json()
    console.log(message)
  }
  const [counter, setState] = React.useState(0)
  const handleClick = () => {
    setState(counter + 1)
  }

  useEffect(() => {
    getExtensions()
    console.log('are you reading this?', counter)
  }, [counter] )



  return (
    <Page>
      <Page.Header>
        <Logo />
        <User user={undefined} connected={undefined} onClick={undefined} />
      </Page.Header>
      <Page.Content>
      <Card>
      <button onClick={handleClick} >irgendwas</button>
      </Card>
        <Card>
          <Button onClick={testApi}>GO TO SECRET PAGE</Button>
          <Button onClick={undefined}>GET SECRET MESSAGE</Button>
          <Button onClick={undefined}>CLEAR COOKIES</Button>
        </Card>
      </Page.Content>
    </Page>
  )
}
