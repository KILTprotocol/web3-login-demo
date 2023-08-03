export async function triggerLogout() {
  const logoutResponse = await fetch(`/api/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  if (!logoutResponse.ok) {
    throw new Error(logoutResponse.statusText)
  }
  console.log('Successfully logged out.')
}
