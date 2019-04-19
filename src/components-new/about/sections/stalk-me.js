import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import { Makerlog } from '../../stats/makerlog'
import { Lastfm } from '../../stats/lastfm'
import { fetchStats } from '../../../api'
import { useApi } from '../../../utils'

function StalkMeSection({ siteMetadata, data, error, loading }) {
  return (
    <React.Fragment>
      <Makerlog
        data={{ makerlog: data && data.makerlog }}
        loading={loading}
        error={error}
      />
      <Lastfm
        data={{ lastfm: data && data.lastfm }}
        loading={loading}
        error={error}
      />
    </React.Fragment>
  )
}

StalkMeSection.propTypes = {
  siteMetadata: PropTypes.shape({
    twitter: PropTypes.string.isRequired,
    steem: PropTypes.string.isRequired,
    medium: PropTypes.string.isRequired,
    github: PropTypes.string.isRequired,
    linkedIn: PropTypes.string.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    makerlog: PropTypes.array.isRequired,
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
}

export default function StalkMeSectionContainer(props) {
  const statsResult = useApi(fetchStats)

  return <StalkMeSection {...statsResult} {...props} />
}
