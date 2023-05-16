import * as Kilt from '@kiltprotocol/sdk-js'
import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

// Getting necessary environment constants:
import { BACKEND_PORT, WSS_ADDRESS } from './config'

import { startSession } from './session/startSession'
import { verifySession } from './session/verifySession'

import { fetchDidDocument } from './utils/fetchDidDocument'

import { getRequestCredential } from './getRequestCredential/getRequestCredential'
import { postSubmitCredential } from './postSubmitCredential/postSubmitCredential'

const app: Express = express()

// Activating Middleware:

// for parsing application/json
app.use(bodyParser.json())
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// Tell the browser that only these URLs should be allowed to make request to this server.
// If you host the app using a different URL, you need to add it here.
app.use(
  cors({
    origin: [
      `http://localhost:${BACKEND_PORT}`,
      `http://127.0.0.1:${BACKEND_PORT}`,
      `http://[::1]:${BACKEND_PORT}`
    ]
  })
)

// Utility to read cookies. Backing has never been easier.
app.use(cookieParser())

// Print the URL requested
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Trigger: ${req.url}`)
  next()
})

// Setting GET and POST functions

app.get('/api', (req: Request, res: Response) => {
  res.status(200).json('Welcome to the API for the KILT Web3 Login')
})

// manage Session:

// Starts the session from server side.
app.get('/api/session/start', (req, res, next) =>
  startSession(req, res).catch(next)
)
// Process session values from the extension and verify that secure communication is stablish. (compares challenge)
app.post('/api/session/verify', (req, res, next) =>
  verifySession(req, res).catch(next)
)

// Manage Credentials:

app.get('/api/credential/getRequest', (req, res, next) =>
  getRequestCredential(req, res).catch(next)
)
app.post('/api/credential/postSubmit', (req, res, next) =>
  postSubmitCredential(req, res).catch(next)
)

// We need the DID Document of the dApps DID (DAPP_DID_URI) before we can handle login requests.
// We therefore start the server only after the document was fetched.
fetchDidDocument()
  .then((doccy) => {
    app.locals.dappDidDocument = doccy
    // wait for fetched document before server starts listening:
    app.listen(BACKEND_PORT, () => {
      console.log(
        `⚡️[server]: Server is running at http://localhost:${BACKEND_PORT}`
      )
    })
  })
  .catch((error) => {
    console.log(`Could not start server! ${error}`)
  })
  .then(
    // connect with the kilt api
    initializeServer
    // the server will not crash if this fails
  )

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
