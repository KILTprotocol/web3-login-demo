import path from 'path'

import dotenv from 'dotenv'
import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
// import cookieParser from 'cookie-parser'

import {
  sendSessionValues,
  verifySession,
  generateJWT,
  verifySessionJWT
} from './src/session/session'

// Letting the server know where the environment varibles are
const projectRoootDirectory = path.dirname(__dirname)
dotenv.config({ path: `${projectRoootDirectory}/.env` })

const app: Express = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// enable comunication between front and backend
app.use(
  cors({
    origin: [
      `http://localhost:${PORT}`,
      `http://127.0.0.1:${PORT}`,
      `http://[::1]:${PORT}`
    ]
  })
)

// app.use(cookieParser())

app.get('/api', (req: Request, res: Response) => {
  console.log(`'/api' triggered`)
  res.status(200).json('Welcome to the API for the KILT Web3 Login')
})

// using a global array:
app.get('/api/session/start', sendSessionValues)

app.post('/api/session/verify', verifySession)

// using JWTs
app.get('/api/session/startJWT', generateJWT)
app.post('/api/session/verifyJWT', verifySessionJWT)

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
})
