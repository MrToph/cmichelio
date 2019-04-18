const BASE_URL = `/.netlify/functions/`

export async function fetchMakerlog() {
  return fetch(`${BASE_URL}stats`, {
    headers: {
      Accept: `application/json`,
      'Content-Type': `application/json`,
    },
  })
}
