import dotenv from 'dotenv';
import path from 'path';
import express, { Express, Request, Response, Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import getSessionValues from './src/session/session';

// Letting the server know where 
const projectRoootDirectory = path.dirname(__dirname);
dotenv.config({ path: `${projectRoootDirectory}/.env` });


const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: 'http://localhost:3000/' }));

console.log(process.env.WSS_ADDRESS);
app.get('/api', (req: Request, res: Response) => {
  console.log('hello');
  res.status(200).json('Welcome to the API for the KILT Web3 Login');
});

app.get('/api/session', getSessionValues);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
