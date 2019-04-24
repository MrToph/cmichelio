import fetch from 'node-fetch'
import get from 'lodash/get'
import { formatDistance } from 'date-fns'
import { URL } from 'url'

const API_KEY = process.env.LASTFM_API_KEY
if (!API_KEY) throw new Error(`No last.fm API key provided`)

// https://www.last.fm/api/show/user.getRecentTracks
const MAKERLOG_BASE_URL = `http://ws.audioscrobbler.com`
const USER = `cmichelio`
const LIMIT = `3`
const url = new URL(`/2.0/`, MAKERLOG_BASE_URL)

const transformResult = result => {
  const now = new Date()
  return result.recenttracks.track
    .map(track => {
      return {
        artist: get(track, `artist.#text`, ``),
        album: get(track, `album.#text`, ``),
        name: get(track, `name`, ``),
        image: get(track, `image.1.#text`, ``),
        playing: Boolean(get(track, `@attr.nowplaying`, false)),
        date: formatDistance(
          new Date(Number.parseInt(get(track, `date.uts`, 0), 10) * 1000),
          now
        ),
      }
    })
    .slice(0, LIMIT) // LIMIT in last.fm api tells how many _finished_ songs to show, but get one more when currently playing a song
}

export default async function getLastfm() {
  url.searchParams.set(`method`, `user.getrecenttracks`)
  url.searchParams.set(`user`, USER)
  url.searchParams.set(`api_key`, API_KEY)
  url.searchParams.set(`limit`, LIMIT)
  url.searchParams.set(`format`, `json`)

  const response = await fetch(url.href, {
    headers: { Accept: `application/json` },
  })
  if (!response.ok) {
    throw new Error(`getLastfm ${response.statusText}`)
  }
  return transformResult(await response.json())
}
