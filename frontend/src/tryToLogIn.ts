export async function tryToLogIn() {
  const encryptedCredentialRequest = await fetch(`/api/credential/getRequest`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      accessControlAllowOrigin: '*',
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  if (!encryptedCredentialRequest.ok) {
    throw Error(encryptedCredentialRequest.statusText)
  }

  console.log(await encryptedCredentialRequest.json())
}
