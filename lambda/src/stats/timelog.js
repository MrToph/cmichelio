import fetch from 'node-fetch'
import { URL } from 'url'
import {
  format,
  subDays,
  differenceInSeconds,
  differenceInDays,
  endOfDay,
  startOfDay,
} from 'date-fns'

const API_KEY = process.env.CLOCKIFY_API_KEY
if (!API_KEY) throw new Error(`No clockify API key provided`)

const BASE_URL = `https://api.clockify.me`
const USER_ID = `5cba0a32f15c98297941569a`
const WORKSPACE_ID = `5cba0a32f15c98297941569b`
const PROJECTS_BLACKLIST = []
const url = new URL(
  `/api/v1/workspaces/${WORKSPACE_ID}/user/${USER_ID}/time-entries`,
  BASE_URL
)

const filterProjects = timeEntries =>
  timeEntries.filter(t => !PROJECTS_BLACKLIST.includes(t.projectId))

const groupByRelativeDate = timeEntries => {
  const now = endOfDay(new Date())
  // index 6 is today, index 5 is today - 1, etc.
  const days = Array.from({ length: 7 }, () => [])
  timeEntries.forEach(t => {
    const startDate = new Date(t.timeInterval.start)
    const difference = differenceInDays(now, startDate)
    const index = days.length - 1 - difference
    if (Array.isArray(days[index])) days[index].push(t)
  })

  return days
}

const aggregateTimeEntriesPerDay = days => {
  const now = new Date()
  return days.map(day => {
    return day.reduce((acc, t) => {
      const { timeInterval } = t
      return (
        acc +
        differenceInSeconds(
          timeInterval.end ? new Date(timeInterval.end) : now,
          new Date(timeInterval.start)
        )
      )
    }, 0)
  })
}

const transformResult = result => {
  const now = new Date()
  const secondsPerDay = aggregateTimeEntriesPerDay(
    groupByRelativeDate(filterProjects(result))
  )
  return secondsPerDay.map((time, index) => ({
    date: format(subDays(now, secondsPerDay.length - 1 - index), `EEE do`),
    seconds: time,
  }))
}

export default async function getTimelog() {
  const startDate = format(
    startOfDay(subDays(new Date(), `6`)),
    `yyyy-MM-dd'T'HH:mm:ssZ`
  )
  url.searchParams.set(`start`, startDate)
  url.searchParams.set(`page-size`, 500)

  const response = await fetch(url.href, {
    headers: {
      Accept: `application/json`,
      [`content-type`]: `application/json`,
      [`X-Api-Key`]: API_KEY,
    },
  })
  if (!response.ok) {
    const errorMessage = await response.text()
    throw new Error(`getTimelog ${response.statusText}: ${errorMessage}`)
  }
  return transformResult(await response.json())
}
