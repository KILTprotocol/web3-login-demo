generated with https://weidagang.github.io/text-diagram/

```
object Sporran Browser Server
note right of Browser: User visits web3login 
Browser->Sporran: please allow use on this page
Sporran->Browser: User granted access
note right of Browser: User clicks login button
Browser->Server: GET /api/session/setup
Server->Browser: 200 OK\nset-cookie: JWT{challenge}\n{dAppName, dAppEncryptionKeyUri, challenge}
Browser->Sporran: startSession(dAppName, dAppEncryptionKeyUri, challenge)
Sporran->Browser: {encryptionKeyId, encryptedChallenge, nonce} 
Browser->Server: POST /api/session/connect\nCookie: JWT{challenge}\n{encryptionKeyId, encryptedChallenge, nonce}
note left of Server: verify JWT{challenge}\ndecrypt challenge using nonce and encryptionKeyId\nAssert that jwt-challenge and decrypted-challenge match
Server->Browser: 200 OK\nset-cookie:Jwt{encryptionKeyId}
Browser->Server: GET /api/session/loginRequirements\nKiltMsg{request-credential}
Browser->Sporran: KiltMsg{request-credential}
Sporran->Browser: KiltMsg{submit-credential}
Browser->Server: Post /api/session/provideCredential\nKiltMsg{submit-credential}
note left of Server: Verify the credential\nNote the DID inside the credential\nif verification was successful, DID authenticated with provided credentials
Server->Browser: 200 Ok\nset-cookie:JWT{DID,claimHash,"LOGIN COMPLETE"}
```
