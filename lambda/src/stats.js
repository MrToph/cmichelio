/* eslint-disable no-console */
// example of async handler using async-await
// https://github.com/netlify/netlify-lambda/issues/43#issuecomment-444618311

import { getMakerlog, getLastfm, getTimelog } from './stats/index'

export async function handler() {
  try {
    const promises = {
      makerlog: getMakerlog(),
      lastfm: getLastfm(),
      timelog: getTimelog(),
    }
    const errors = []

    const result = {}
    for (let key of Object.keys(promises)) {
      try {
        result[key] = await promises[key]
      } catch (innerError) {
        console.error(`stats "${key}": ${innerError.message}`) // output to netlify function log
        errors.push(`ERROR "${key}": ${innerError.message}`)
        result[key] = {
          error: innerError.message,
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...result,
        errors,
      }),
    }
  } catch (err) {
    console.error(`stats: ${err.message}`) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }),
    }
  }
}
