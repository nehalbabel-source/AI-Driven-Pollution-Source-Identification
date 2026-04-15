/**
 * AQITrendChart.jsx — Multi-line chart of AQI + pollutants over time.
 * Uses Recharts ResponsiveContainer for fluid sizing.
 */
import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'

const SERIES = [
  { key: 'AQI',   name: 'AQI',    color: '#f59e0b', strokeWidth: 2.5 },
  { key: 'PM2.5', name: 'PM2.5',  color: '#6366f1', strokeWidth: 1.5 },
  { key: 'PM10',  name: 'PM10',   color: '#06b6d4', strokeWidth: 1.5 },
  { key: 'NO2',   name: 'NO₂',    color: '#10b981', strokeWidth: 1.5 },
]

const DAY_OPTIONS = [
  { label: '30d',  value: 30  },
  { label: '90d',  value: 90  },
  { label: '180d', value: 180 },
  { label: '365d', value: 365 },
]

// Custom tooltip card
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1d2e] border border-[#252840] rounded-xl p-3 text-xs shadow-xl min-w-[150px]">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-semibold">{Number(p.value).toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AQITrendChart({ data, days, onDaysChange, tall = false }) {
  const [visibleSeries, setVisibleSeries] = useState(
    Object.fromEntries(SERIES.map((s) => [s.key, true]))
  )

  const toggleSeries = (key) =>
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }))

  // Thin out data points for readability
  const displayData = data.slice(-days).map((row) => ({
    ...row,
    date: row.date?.slice(5), // Show MM-DD
  }))

  // Show every Nth label to avoid crowding
  const tickInterval = Math.max(1, Math.floor(displayData.length / 8))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">AQI & Pollutant Trends</h3>
          <p className="text-xs text-slate-500 mt-0.5">Historical time-series</p>
        </div>
        {/* Day range selector */}
        <div className="flex gap-1">
          {DAY_OPTIONS.map(({ label, value }) => (
            <button key={value}
              onClick={() => onDaysChange?.(value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                days === value
                  ? 'bg-accent text-white'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Series toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SERIES.map(({ key, name, color }) => (
          <button key={key}
            onClick={() => toggleSeries(key)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border transition-all ${
              visibleSeries[key]
                ? 'border-transparent text-white'
                : 'border-cardBorder text-slate-600'
            }`}
            style={visibleSeries[key] ? { background: color + '22', borderColor: color + '44' } : {}}
          >
            <span className="w-2 h-2 rounded-full"
              style={{ background: visibleSeries[key] ? color : '#374151' }} />
            {name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={tall ? 340 : 240}>
        <LineChart data={displayData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2136" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* AQI reference bands */}
          <ReferenceLine y={300} stroke="#ef444430" strokeDasharray="4 4" label={{ value: 'Severe', fill: '#ef4444', fontSize: 9, position: 'right' }} />
          <ReferenceLine y={200} stroke="#f9731630" strokeDasharray="4 4" label={{ value: 'Very Poor', fill: '#f97316', fontSize: 9, position: 'right' }} />
          <ReferenceLine y={100} stroke="#f59e0b30" strokeDasharray="4 4" label={{ value: 'Poor', fill: '#f59e0b', fontSize: 9, position: 'right' }} />

          {SERIES.map(({ key, name, color, strokeWidth }) =>
            visibleSeries[key] ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={color}
                strokeWidth={strokeWidth}
                dot={false}
                activeDot={{ r: 4, fill: color }}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
