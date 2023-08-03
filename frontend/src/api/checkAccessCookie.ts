export async function checkAccessCookie() {
  const result = await fetch(`/api/access/checkAccess`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  // status is 204 if no user is logged in yet
  if (!result.ok || result.status === 204) {
    throw new Error(result.statusText)
  }

  const userInfo = await result.text()
  console.log(
    `Users information sent by the server after verifying the users authentication token, from 'accessJWT':`,
    userInfo
  )

  return userInfo
}
