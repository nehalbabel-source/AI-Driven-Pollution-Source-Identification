/**
 * ForecastChart.jsx — 14-day AQI forecast as an area chart with category colouring.
 */
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'

function categoryColor(category) {
  const map = {
    'Good':      '#10b981',
    'Moderate':  '#84cc16',
    'Poor':      '#f59e0b',
    'Very Poor': '#f97316',
    'Severe':    '#ef4444',
    'Severe+':   '#a855f7',
  }
  return map[category] || '#6366f1'
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const color = categoryColor(d.category)
  return (
    <div className="bg-[#1a1d2e] border border-[#252840] rounded-xl p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-lg" style={{ color }}>{d.forecast_aqi}</p>
      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs"
        style={{ background: color + '22', color }}>
        {d.category}
      </span>
    </div>
  )
}

export default function ForecastChart({ data, tall = false }) {
  if (!data?.length) return null

  const displayData = data.map((d) => ({
    ...d,
    date: d.date?.slice(5), // MM-DD
  }))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">14-Day AQI Forecast</h3>
          <p className="text-xs text-slate-500 mt-0.5">EWMA-based time-series prediction</p>
        </div>
        <span className="text-xs bg-indigo-900/30 border border-indigo-800/40 text-indigo-300 px-2 py-1 rounded-lg">
          AI Forecast
        </span>
      </div>

      <ResponsiveContainer width="100%" height={tall ? 320 : 210}>
        <AreaChart data={displayData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2136" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={35}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={300} stroke="#ef444440" strokeDasharray="4 4" />
          <ReferenceLine y={200} stroke="#f9731640" strokeDasharray="4 4" />
          <ReferenceLine y={100} stroke="#f59e0b40" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="forecast_aqi"
            name="Forecast AQI"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#forecastGrad)"
            dot={(props) => {
              const { cx, cy, payload } = props
              const color = categoryColor(payload.category)
              return <circle key={props.key} cx={cx} cy={cy} r={4} fill={color} stroke="#0f1117" strokeWidth={1.5} />
            }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Day-by-day mini table */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {displayData.map((d) => {
          const color = categoryColor(d.category)
          return (
            <div key={d.date}
              className="text-center p-1.5 rounded-lg"
              style={{ background: color + '15' }}>
              <p className="text-xs text-slate-500">{d.date}</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color }}>{d.forecast_aqi}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
