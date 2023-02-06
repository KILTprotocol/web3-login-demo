import { Request, Response } from 'express'

export default async function (request: Request, response: Response) {
  console.log(request, response)
  return response.status(200).send('Working')
}
