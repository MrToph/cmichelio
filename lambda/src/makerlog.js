// example of async handler using async-await
// https://github.com/netlify/netlify-lambda/issues/43#issuecomment-444618311

import { getMakerlog } from './stats/index'

export async function handler() {
  try {
    const makerlogPromise = getMakerlog()
    const makerlog = await makerlogPromise

    return {
      statusCode: 200,
      body: JSON.stringify({ makerlog }),
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }),
    }
  }
}
