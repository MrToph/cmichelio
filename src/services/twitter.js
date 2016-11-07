import axios from 'axios'

const apiEndPoint = 'https://cmichelio.herokuapp.com/'

export function getLatestTweet (source) {
  return axios.get(apiEndPoint, {
    cancelToken: source.token
  })
  .then(res => res.data)
}
