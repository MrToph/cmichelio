import { useState } from 'react'

export const isClientSide = () =>
  Boolean(
    typeof window !== `undefined` &&
      window.document &&
      window.document.createElement
  )

export const useApi = apiFunc => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(``)
  const [data, setData] = useState(null)

  if (loading && (!data && !error)) {
    apiFunc()
      .then(response => response.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        // eslint-disable-next-line no-console
        console.error(err.message)
        setLoading(false)
      })
  }

  return { loading, error, data }
}
