export async function inspectAccessCookie() {
  const inspectionResult = await fetch(`/api/access/alreadyLogin`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  // status is 204 if no user is logged in yet
  if (!inspectionResult.ok || inspectionResult.status === 204) {
    throw new Error(inspectionResult.statusText)
  }

  const plainUserInfo = await inspectionResult.text()
  console.log(
    `Users information sent by the server after verifying the users authentication token, from 'accessJWT':`,
    plainUserInfo
  )

  return plainUserInfo
}
