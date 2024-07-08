generate with https://weidagang.github.io/text-diagram/

```
object Extension Browser Server
note right of Browser: User visits web3login
note right of Browser: User chooses an Extension X \nand clicks on the "Connect" button.
Browser->Extension: please allow use on this page
note right of Extension: Only the "Extension X" pops up, only the first time.
note right of Extension: The Domain Linkage Credentials under\n.well-known/did-configuration.json\nis verified.
Extension->Browser: User granted access
Browser->Server: GET /api/session/start
Server->Browser: 200 OK\nset-cookie: sessionJWT={dAppName, dAppEncryptionKeyUri, challenge}\n{dAppName, dAppEncryptionKeyUri, challenge}
Browser->Extension: startSession(dAppName, dAppEncryptionKeyUri, challenge)
Extension->Browser: {encryptionKeyId, encryptedChallenge, nonce}
Browser->Server: POST /api/session/verify\nCookie: sessionJWT={dAppName, dAppEncryptionKeyUri, challenge}\n{encryptionKeyId, encryptedChallenge, nonce}
note left of Server: Verify sessionJWT.\nDecrypt challenge using nonce and encryptionKeyId\nVerify Extension Session: \n Assert that jwt-challenge (our)\nand decrypted-challenge (theirs) match.
Server->Browser: 200 OK\nset-cookie: sessionJWT={{dAppName, dAppEncryptionKeyUri, challenge},\n{encryptionKeyId, encryptedChallenge, nonce}}
note left of Browser: Server-Extension-Session established ✉️ ⛓️
note right of Browser: User clicks on Login
Browser->Server: GET /api/credential/login/request\nCookie: sessionJWT
note left of Server: The Server is asking for a Credential of a cType from the User.
Server->Browser: 200 OK\nset-cookie: credentialJWT={challengeOnRequest}\nKiltMsg{request-credential}
Browser->Extension: send(KiltMsg{request-credential})
note right of Extension: User approves the request\nand selects credential to share.
Extension->Browser: KiltMsg{submit-credential}
Browser->Server: Post /api/credential/login/submit\nCookie: credentialJWT\nKiltMsg{submit-credential}
note left of Server: Verify the credential.\nNote the DID inside the credential.\nIf verification was successful,\nDID was authenticated with provided credentials.
note left of Server: The login with credential process was completed.\nAn authentication token is given to the user.\n It's all like web2 from here on.
Server->Browser: 200 OK\nset-cookie: accessJWT{authenticationToken}
```
