import express, { Request, Response, Router } from 'express'
import dotenv from 'dotenv'

import { getRequestCredential } from './getRequestCredential/getRequestCredential'
import { postSubmitCredential } from './postSubmitCredential/postSubmitCredential'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const router = Router()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Get requests //

router.get('/api', (req: Request, res: Response) => {
  res.status(200).json('Welcome to the API for the KILT Web3 Login')
})

router.get('/api/getRequestCredential', getRequestCredential)

// Post Responses //

router.post('/api/postSubmitCredential', postSubmitCredential)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
