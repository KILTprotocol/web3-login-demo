import * as Kilt from '@kiltprotocol/sdk-js'

import { NextFunction, Request, Response } from 'express'

const exampleRequest: Kilt.IRequestCredentialContent = {
  cTypes: [
    {
      cTypeHash:
        '0x5366521b1cf4497cfe5f17663a7387a87bb8f2c4295d7c40f3140e7ee6afc41b',
      trustedAttesters: [
        'did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx' as Kilt.DidUri
      ],
      requiredProperties: ['name']
    }
  ],
  challenge: '9f1ceac971cce4c61505974f411a9db432949531abe10dde'
}

export async function getRequestCredential(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    console.log('Request', JSON.parse(request.body))
    console.log(exampleRequest)
    return response
  } catch (error) {
    console.log('Get Request Credential Error', error)
    next(error)
  }
}
