import React from 'react'
import PropTypes from 'prop-types'
import './index.css'

export function Lastfm(props) {
  const { loading, data } = props

  const renderListContent = () => {
    if (loading)
      return <li className="lastfm__item justify-center">Loading ...</li>

    if (Array.isArray(data.lastfm)) {
      return data.lastfm.map((song, index) => (
        <li className="lastfm__item" key={index}>
          {song.image ? (
            <img className="w-8 h-8" src={song.image} alt={song.name} />
          ) : <div className="w-8 h-8" /> }
          <span className="flex-1 ml-3">{`${song.artist} - ${song.name}`}</span>
          {song.playing ? <time>now</time> : <time>{`${song.date} ago`}</time>}
        </li>
      ))
    }

    return null
  }

  return (
    <div className="lastfm">
      <div className="lastfm__header">
        <div className="w-8 ml-6 text-xl">🎧</div>
        <h3 className="ml-4 flex-1">Listening to</h3>
      </div>
      <ol className="lastfm__list">{renderListContent()}</ol>
    </div>
  )
}

Lastfm.propTypes = {
  data: PropTypes.shape({
    lastfm: PropTypes.array,
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
}
