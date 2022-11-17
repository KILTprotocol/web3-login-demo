import Button from './components/Button'
import Logo from './components/Logo'
import Page from './components/Page'
import Card from './components/Card'
import User from './components/User'

export default function Home() {
  return (
    <Page>
      <Page.Header>
        <Logo />
        <User user={undefined} connected={undefined} onClick={undefined} />
      </Page.Header>
      <Page.Content>
        <Card>
          <Button onClick={undefined}>GO TO SECRET PAGE</Button>
          <Button onClick={undefined}>GET SECRET MESSAGE</Button>
          <Button onClick={undefined}>CLEAR COOKIES</Button>
        </Card>
      </Page.Content>
    </Page>
  )
}
