import express, { Express, Request, Response } from 'express'

import cors from 'cors'
import bodyParser from 'body-parser'
import * as Kilt from '@kiltprotocol/sdk-js'

import { PORT, WSS_ADDRESS } from './config'
import { generateSessionValues, verifySession } from './session/session'
import { getRequestCredential } from './getRequestCredential/getRequestCredential'
import { postSubmitCredential } from './postSubmitCredential/postSubmitCredential'

const app: Express = express()

// for parsing application/json
app.use(bodyParser.json())
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  cors({
    origin: [
      `http://localhost:${PORT}`,
      `http://127.0.0.1:${PORT}`,
      `http://[::1]:${PORT}`
    ]
  })
)

// Get requests //

app.get('/api', (req: Request, res: Response) => {
  res.status(200).json('Welcome to the API for the KILT Web3 Login')
})

app.get('/api/getRequestCredential', getRequestCredential)

app.get('/api/session/start', generateSessionValues)

// Post Responses //

app.post('/api/postSubmitCredential', postSubmitCredential)

app.post('/api/session/verify', verifySession)

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
})

async function initializeServer() {
  try {
    await Kilt.connect(WSS_ADDRESS)
    console.log(
      `🔗[websocket]: Connected to WebSocket server at ${WSS_ADDRESS}`
    )
  } catch (error) {
    console.error(
      `❌[websocket]: Failed to connect to WebSocket server at ${WSS_ADDRESS}`,
      error
    )
  }
}

initializeServer()
