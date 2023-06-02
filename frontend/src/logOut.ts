export async function logOut() {
  const logoutResult = await fetch(`/api/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  if (!logoutResult.ok) {
    throw new Error(logoutResult.statusText)
  }
}
