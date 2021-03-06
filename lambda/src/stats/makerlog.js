import fetch from 'node-fetch'
import { format, formatDistance, subDays } from 'date-fns'
import { URL } from 'url'

const MAKERLOG_BASE_URL = `https://api.getmakerlog.com`
const USER_ID = 756
const url = new URL(`/tasks`, MAKERLOG_BASE_URL)

const transformResult = result => {
  const now = new Date()
  return result.results.map(task => {
    return {
      date: formatDistance(new Date(task.updated_at), now),
      description: task.content,
    }
  })
}

export default async function getMakerlog() {
  const startDate = subDays(new Date(), `7`)
  url.searchParams.set(`user`, USER_ID)
  url.searchParams.set(`start_date`, format(startDate, `yyyy-MM-dd`))

  const response = await fetch(url.href, {
    headers: { Accept: `application/json` },
  })
  if (!response.ok) {
    throw new Error(`getMakerlog ${response.statusText}`)
  }
  return transformResult(await response.json())
}
