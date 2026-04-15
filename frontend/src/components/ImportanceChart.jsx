/**
 * ImportanceChart.jsx — Horizontal bar chart showing RF feature importances.
 * This visualises which pollutants are the primary AQI drivers (source ID).
 */
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts'

const COLORS = {
  'PM2.5': '#6366f1',
  'PM10':  '#06b6d4',
  'NO2':   '#10b981',
  'CO':    '#f59e0b',
  'SO2':   '#f43f5e',
  'O3':    '#a78bfa',
}

const SOURCE_LABELS = {
  'PM2.5': 'Vehicle exhaust, construction dust',
  'PM10':  'Road dust, industrial emissions',
  'NO2':   'Traffic, power plants',
  'CO':    'Incomplete combustion',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#1a1d2e] border border-[#252840] rounded-xl p-3 text-xs shadow-xl max-w-[220px]">
      <p className="text-white font-semibold mb-1">{d.feature}</p>
      <p className="text-slate-400 mb-2">{SOURCE_LABELS[d.feature] || ''}</p>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Importance</span>
        <span className="text-white font-medium">{d.percentage}%</span>
      </div>
    </div>
  )
}

export default function ImportanceChart({ data, tall = false }) {
  if (!data?.length) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Pollution Source Identification</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Random Forest feature importance — pollutant contribution to AQI
        </p>
      </div>

      {/* Horizontal bar chart */}
      <ResponsiveContainer width="100%" height={tall ? 300 : 200}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2136" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]} maxBarSize={32}>
            {data.map((entry) => (
              <Cell
                key={entry.feature}
                fill={COLORS[entry.feature] || '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend / key */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map(({ feature, percentage }) => (
          <div key={feature}
            className="flex items-center gap-2 text-xs rounded-lg px-2 py-1.5"
            style={{ background: (COLORS[feature] || '#6366f1') + '12' }}>
            <span className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: COLORS[feature] || '#6366f1' }} />
            <span className="text-slate-400 truncate">{feature}</span>
            <span className="ml-auto font-semibold"
              style={{ color: COLORS[feature] || '#6366f1' }}>
              {percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* Interpretation note */}
      <p className="mt-3 text-xs text-slate-600 leading-relaxed">
        Higher importance = greater AQI driver. PM2.5 dominates Delhi's AQI,
        primarily from vehicular emissions and crop burning.
      </p>
    </div>
  )
}
