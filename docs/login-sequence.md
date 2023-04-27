generated with https://weidagang.github.io/text-diagram/

```
object Extension Browser Server
note right of Browser: User visits web3login 
note right of Browser: User clicks button "login with Extension X"\nHere the user chooses which extension they want to use
Browser->Extension: please allow use on this page
note right of Extension: Only the "Extension X" pops up
Extension->Browser: User granted access
Browser->Server: GET /api/initializeSessionSetup
Server->Browser: 200 OK\nset-cookie: JWT{challenge}\n{dAppName, dAppEncryptionKeyUri, challenge}
Browser->Extension: startSession(dAppName, dAppEncryptionKeyUri, challenge)
Extension->Browser: {encryptionKeyId, encryptedChallenge, nonce} 
Browser->Server: POST /api/finalizeSessionSetup\nCookie: JWT{challenge}\n{encryptionKeyId, encryptedChallenge, nonce}
note left of Server: verify JWT{challenge}\ndecrypt challenge using nonce and encryptionKeyId\nAssert that jwt-challenge and decrypted-challenge match
Server->Browser: 200 OK\nset-cookie:JWT{encryptionKeyId}
Browser->Server: GET /api/loginRequirements\nCookie:JWT{encryptionKeyId}
Server->Browser: 200 Ok\nKiltMsg{request-credential}
Browser->Extension: KiltMsg{request-credential}
note right of Extension: User approves the request\nand selects credential to share
Extension->Browser: KiltMsg{submit-credential}
Browser->Server: Post /api/provideCredential\nKiltMsg{submit-credential}
note left of Server: Verify the credential\nNote the DID inside the credential\nif verification was successful, DID authenticated with provided credentials
Server->Browser: 200 Ok\nset-cookie:JWT{DID,claimHash,"LOGIN COMPLETE"}
```
