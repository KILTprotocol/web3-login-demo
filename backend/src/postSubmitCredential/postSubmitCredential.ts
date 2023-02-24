import { NextFunction, Request, Response } from 'express'

export async function postSubmitCredential(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    console.log('Request', JSON.parse(request.body))
    response.send(200)
  } catch (error) {
    console.log('Post Submit Credential Error', error)
    next(error)
  }
}
