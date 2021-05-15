import React from 'react'
import PropTypes from 'prop-types'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import tailwind from '../../../tailwind.config'

const dataToChart = timelog =>
  timelog.map(t => ({ ...t, hours: t.seconds / (60 * 60) }))

function TooltipFormatter(props) {
  // eslint-disable-next-line react/prop-types
  const p = props.payload[0]
  if (!p) return null

  return <span>{`${(p.payload.seconds / 60).toFixed(0)} minutes`}</span>
}

export function Timelog(props) {
  const { loading, data } = props

  const renderContent = () => {
    if (loading) return <div className="timelog__content pb-4">Loading ...</div>

    if (Array.isArray(data.timelog)) {
      return (
        <div className="timelog__content">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              width={600}
              height={250}
              data={dataToChart(data.timelog)}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="date" tick={{ fill: tailwind.theme.colors.grey }} />
              <YAxis
                tick={{ fill: tailwind.theme.colors.grey }}
                allowDecimals={false}
                unit="h"
              />
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                horizontal={false}
              />
              <Tooltip content={TooltipFormatter} />
              <Legend formatter={() => `hours/day`} />
              <Line
                type="monotone"
                dataKey="hours"
                stroke={tailwind.theme.colors.green[`500`]}
                activeDot={{ r: 8, fill: tailwind.theme.colors.red[`500`] }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )
    }

    return null
  }

  return (
    <div className="timelog">
      <div className="timelog__header">
        <div className="w-8 ml-6 text-xl">📈</div>
        <h3 className="ml-4 flex-1">Time tracked on projects</h3>
      </div>
      {renderContent()}
    </div>
  )
}

Timelog.propTypes = {
  data: PropTypes.shape({
    timelog: PropTypes.array,
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
}
