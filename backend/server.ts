import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import logout from './src/logout/logout'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api', (request: Request, response: Response) => {
  response.status(200).json('Welcome to the API for the KILT Web3 Login')
})

app.get('/api', logout)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
